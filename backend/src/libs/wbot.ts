/* eslint-disable camelcase */
import * as Sentry from "@sentry/node";
import makeWASocket, {
  WASocket,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  WAMessageKey,
  jidNormalizedUser,
  WAMessageUpdate,
  MessageUpsertType,
  proto
} from "@whiskeysockets/baileys";
import { Op } from "sequelize";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger";
import authState from "../helpers/authState";
import { Boom } from "@hapi/boom";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import NodeCache from 'node-cache';

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

const msgRetryCounterCache = new NodeCache({
  stdTTL: 600,
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

const msgCache = new NodeCache({
  stdTTL: 60,
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

type Session = WASocket & {
  id?: number;
};

const sessions: Session[] = [];
const retriesQrCodeMap = new Map<number, number>();

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout();
      }
      sessions[sessionIndex].ws.close();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { version, isLatest } = await fetchLatestBaileysVersion();
      logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

      const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
      
      if (sessionIndex !== -1) {
        sessions[sessionIndex].ws.close();
        sessions.splice(sessionIndex, 1);
      }

      let retriesQrCode = 0;
      let wsocket: Session;
      const { state, saveState } = await authState(whatsapp);

      wsocket = makeWASocket({
        version,
        logger: loggerBaileys,
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.ubuntu("FlowDeskPro"),
        generateHighQualityLinkPreview: true,
        msgRetryCounterCache,
        getMessage: async (key: proto.IMessageKey) => {
          if (key.id) {
            const cached = msgCache.get(key.id);
            if (cached) return cached as proto.IMessage;
          }
          return undefined;
        }
      });

      wsocket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        logger.info(
          `Socket ${whatsapp.name} Connection Update ${whatsapp.id} - ${connection || ""} - ${
            lastDisconnect?.error?.message || ""
          }`
        );

        if (connection === "close") {
          const disconnect = (lastDisconnect?.error as Boom)?.output?.statusCode;

          if (disconnect === 403) {
            await whatsapp.update({ status: "PENDING", session: "", qrcode: "" });
            removeWbot(whatsapp.id, false);
            await DeleteBaileysService(whatsapp.id);
            
            const io = getIO();
            io.emit(`${whatsapp.tenantId}:whatsappSession`, {
              action: "update",
              session: whatsapp
            });
          }

          if (disconnect !== DisconnectReason.loggedOut) {
            removeWbot(whatsapp.id, false);
            setTimeout(() => StartWhatsAppSession(whatsapp), 2000);
          } else {
            await whatsapp.update({ status: "PENDING", session: "", qrcode: "" });
            await DeleteBaileysService(whatsapp.id);
            removeWbot(whatsapp.id, false);
          }
        }

        if (connection === "open") {
          await whatsapp.update({
            status: "CONNECTED",
            qrcode: "",
            retries: 0,
            number: wsocket.user?.id.replace(/:\d+/, "")
          });

          logger.info(`Session ${whatsapp.name} Connected`);

          const io = getIO();
          io.emit(`${whatsapp.tenantId}:whatsappSession`, {
            action: "update",
            session: whatsapp
          });

          const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
          if (sessionIndex === -1) {
            wsocket.id = whatsapp.id;
            sessions.push(wsocket);
          }

          resolve(wsocket);
        }

        if (qr !== undefined) {
          if (retriesQrCode > 5) {
            await whatsapp.update({
              status: "DISCONNECTED",
              qrcode: ""
            });

            const io = getIO();
            io.emit(`${whatsapp.tenantId}:whatsappSession`, {
              action: "update",
              session: whatsapp
            });
            return;
          }

          retriesQrCode += 1;
          await whatsapp.update({ qrcode: qr, status: "qrcode", retries: retriesQrCode });

          const io = getIO();
          io.emit(`${whatsapp.tenantId}:whatsappSession`, {
            action: "update",
            session: whatsapp
          });
        }
      });

      wsocket.ev.on("creds.update", saveState);

    } catch (error) {
      logger.error(error);
      reject(error);
    }
  });
};

// Mantener función para compatibilidad con llamadas existentes
export const apagarPastaSessao = async (id: number | string): Promise<void> => {
  // En Baileys no necesitamos eliminar carpetas de sesión
  logger.info(`apagarPastaSessao called for session ${id} - Not needed with Baileys`);
};
