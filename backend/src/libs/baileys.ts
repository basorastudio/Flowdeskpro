/* eslint-disable camelcase */
import { 
  makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import path from "path";
import { rm } from "fs/promises";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
// import SyncUnreadMessagesBaileys from "../services/BaileysServices/SyncUnreadMessagesBaileys";
import Queue from "./Queue";
import AppError from "../errors/AppError";

interface BaileysSession {
  id: number;
  socket?: any;
  qrRetries: number;
  isConnected: boolean;
}

const sessions: BaileysSession[] = [];

// Logger compatible con Baileys
const baileysLogger = {
  level: "info" as const,
  trace: (obj: any, msg?: string) => logger.debug(msg || obj),
  debug: (obj: any, msg?: string) => logger.debug(msg || obj),
  info: (obj: any, msg?: string) => logger.info(msg || obj),
  warn: (obj: any, msg?: string) => logger.warn(msg || obj),
  error: (obj: any, msg?: string) => logger.error(msg || obj),
  fatal: (obj: any, msg?: string) => logger.error(msg || obj),
  child: () => baileysLogger
};

export const apagarPastaSessaoBaileys = async (id: number | string): Promise<void> => {
  const pathRoot = path.resolve(__dirname, "..", "..", ".baileys_auth");
  const pathSession = `${pathRoot}/session-baileys-${id}`;
  try {
    await rm(pathSession, { recursive: true, force: true });
  } catch (error) {
    logger.info(`apagarPastaSessaoBaileys:: ${pathSession}`);
    logger.error(error);
  }
};

export const removeBaileys = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      const session = sessions[sessionIndex];
      if (session.socket) {
        session.socket.end(undefined);
      }
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(`removeBaileys | Error: ${err}`);
  }
};

export const getBaileys = (whatsappId: number): any => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_FOUND", 404);
  }
  return sessions[sessionIndex].socket;
};

export const initBaileys = async (whatsapp: Whatsapp): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = `session-baileys-${whatsapp.id}`;
      const pathRoot = path.resolve(__dirname, "..", "..", ".baileys_auth");
      const sessionPath = `${pathRoot}/${sessionName}`;

      // Verificar si ya existe una sesión
      const existingSessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
      if (existingSessionIndex !== -1) {
        sessions.splice(existingSessionIndex, 1);
      }

      // Crear nueva sesión
      const session: BaileysSession = {
        id: whatsapp.id,
        qrRetries: 0,
        isConnected: false
      };

      sessions.push(session);

      // Configurar autenticación multi-archivo
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      // Obtener versión más reciente de Baileys
      const { version, isLatest } = await fetchLatestBaileysVersion();
      logger.info(`Usando WA v${version.join(".")}, isLatest: ${isLatest}`);

      // Crear socket de WhatsApp
      const socket = makeWASocket({
        version,
        logger: baileysLogger,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, baileysLogger)
        },
        browser: Browsers.macOS("Desktop"),
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        keepAliveIntervalMs: 30000,
        // Configuraciones adicionales para mejorar la conexión
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        emitOwnEvents: true,
        // Configuración para mejor manejo de mensajes
        shouldIgnoreJid: (jid: string) => {
          // Ignorar mensajes de estado
          return jid === "status@broadcast";
        },
        // Configuración de reintento
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 3
      });

      session.socket = socket;

      // Event listeners
      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          session.qrRetries++;
          logger.info(`QR Code generado para WhatsApp ${whatsapp.id}, intento ${session.qrRetries}`);
          
          try {
            // Generar QR code como imagen base64
            const qrImage = await QRCode.toDataURL(qr, {
              errorCorrectionLevel: "M",
              type: "image/png",
              quality: 0.92,
              margin: 1,
              color: {
                dark: "#000000",
                light: "#FFFFFF"
              }
            });

            await whatsapp.update({
              qrcode: qrImage,
              status: "qrcode",
              retries: session.qrRetries
            });

            io.emit(`${whatsapp.tenantId}:whatsappSession`, {
              action: "update",
              session: whatsapp
            });

          } catch (err) {
            logger.error("Error generando QR:", err);
          }

          // Límite de intentos de QR
          if (session.qrRetries > 4) {
            await whatsapp.update({
              status: "DISCONNECTED",
              qrcode: null,
              retries: 0
            });

            io.emit(`${whatsapp.tenantId}:whatsappSession`, {
              action: "update",
              session: whatsapp
            });

            socket.end(undefined);
            removeBaileys(whatsapp.id);
            reject(new Error("Máximo número de intentos de QR alcanzado"));
            return;
          }
        }

        if (connection === "close") {
          const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          
          logger.info(`Conexión cerrada para WhatsApp ${whatsapp.id}, código: ${statusCode}, reconnecting: ${shouldReconnect}`);

          // Actualizar estado según el motivo de desconexión
          if (statusCode === DisconnectReason.loggedOut) {
            await whatsapp.update({
              status: "DISCONNECTED",
              session: "",
              qrcode: null,
              retries: 0
            });

            io.emit(`${whatsapp.tenantId}:whatsappSession`, {
              action: "update",
              session: whatsapp
            });

            removeBaileys(whatsapp.id);
            return;
          }

          if (!shouldReconnect) {
            await whatsapp.update({
              status: "DISCONNECTED",
              qrcode: null,
              retries: 0
            });

            io.emit(`${whatsapp.tenantId}:whatsappSession`, {
              action: "update",
              session: whatsapp
            });

            removeBaileys(whatsapp.id);
            return;
          }

          // Reconectar después de 3 segundos con límite de reintentos
          const currentRetries = whatsapp.retries || 0;
          if (currentRetries < 3) {
            setTimeout(async () => {
              try {
                logger.info(`Reintentando conexión para WhatsApp ${whatsapp.id}, intento ${currentRetries + 1}`);
                await whatsapp.update({ retries: currentRetries + 1 });
                await initBaileys(whatsapp);
              } catch (error) {
                logger.error("Error en reconexión:", error);
              }
            }, 3000);
          } else {
            logger.warn(`Máximo de reintentos alcanzado para WhatsApp ${whatsapp.id}`);
            await whatsapp.update({
              status: "DISCONNECTED",
              qrcode: null,
              retries: 0
            });

            io.emit(`${whatsapp.tenantId}:whatsappSession`, {
              action: "update",
              session: whatsapp
            });

            removeBaileys(whatsapp.id);
          }
        }

        if (connection === "open") {
          session.isConnected = true;
          session.qrRetries = 0;

          logger.info(`WhatsApp ${whatsapp.id} conectado exitosamente!`);

          const wbotUser = socket.user;
          const phoneNumber = wbotUser?.id?.replace(/:\d+/, "") || "";

          await whatsapp.update({
            status: "CONNECTED",
            qrcode: null,
            retries: 0,
            number: phoneNumber,
            phone: wbotUser
          });

          io.emit(`${whatsapp.tenantId}:whatsappSession`, {
            action: "update",
            session: whatsapp
          });

          io.emit(`${whatsapp.tenantId}:whatsappSession`, {
            action: "readySession",
            session: whatsapp
          });

          // Sincronizar mensajes no leídos
          try {
            // await SyncUnreadMessagesBaileys(socket, whatsapp, whatsapp.tenantId);
            logger.info("Sincronización de mensajes diferida para implementación futura");
          } catch (err) {
            logger.error("Error sincronizando mensajes:", err);
          }

          resolve(socket);
        }
      });

      // Guardar credenciales cuando se actualicen
      socket.ev.on("creds.update", saveCreds);

      // Manejar mensajes entrantes
      socket.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "notify" || type === "append") {
          for (const message of messages) {
            // Solo procesar mensajes válidos
            if (message.key && message.key.remoteJid) {
              logger.info(`Nuevo mensaje recibido de ${message.key.remoteJid}: ${message.key.id}`);
              
              await Queue.add("HandleMessageBaileys", {
                whatsappId: whatsapp.id,
                tenantId: whatsapp.tenantId,
                message
              });
            }
          }
        }
      });

      // Manejar actualizaciones de estado de mensajes
      socket.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
          // Solo procesar si hay una actualización de estado
          if (update.key?.id && (update.update?.status !== undefined || update.update?.reactions)) {
            logger.info(`Actualizando estado de mensaje ${update.key.id}`);
            
            await Queue.add("HandleMsgAckBaileys", {
              whatsappId: whatsapp.id,
              tenantId: whatsapp.tenantId,
              messageUpdate: {
                key: update.key,
                status: update.update?.status
              }
            });
          }
        }
      });

      // Manejar mensajes borrados
      socket.ev.on("messages.delete", async (deleteData) => {
        if ('keys' in deleteData) {
          for (const key of deleteData.keys) {
            logger.info(`Mensaje eliminado: ${key.id}`);
            // TODO: Implementar manejo de mensajes eliminados si es necesario
          }
        }
      });

      // Manejar llamadas
      socket.ev.on("call", async (callEvents) => {
        for (const call of callEvents) {
          logger.info(`Llamada recibida de ${call.from}: ${call.id}`);
          // TODO: Implementar manejo de llamadas si es necesario
        }
      });

      // Manejar presencia (online/offline/typing)
      socket.ev.on("presence.update", async ({ id, presences }) => {
        logger.debug(`Actualización de presencia para ${id}:`, presences);
      });

      // Manejar cambios en grupos
      socket.ev.on("groups.update", async (updates) => {
        for (const update of updates) {
          logger.debug(`Actualización de grupo ${update.id}:`, update);
        }
      });

      // Manejar participantes de grupo
      socket.ev.on("group-participants.update", async ({ id, participants, action }) => {
        logger.debug(`Participantes de grupo ${id} - acción ${action}:`, participants);
      });

    } catch (err) {
      logger.error("Error inicializando Baileys:", err);
      reject(err);
    }
  });
};

export const sendMessageBaileys = async (
  whatsappId: number,
  phoneNumber: string,
  message: string,
  mediaPath?: string,
  caption?: string
): Promise<any> => {
  try {
    const socket = getBaileys(whatsappId);
    const jid = phoneNumber.includes("@") ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;

    if (mediaPath) {
      // Enviar imagen con caption
      return await socket.sendMessage(jid, {
        image: { url: mediaPath },
        caption: caption || message
      });
    } else {
      // Enviar mensaje de texto
      return await socket.sendMessage(jid, { text: message });
    }
  } catch (error) {
    logger.error("Error enviando mensaje con Baileys:", error);
    throw error;
  }
};

export const sendButtonsBaileys = async (
  whatsappId: number,
  phoneNumber: string,
  message: string,
  buttons: Array<{ buttonId: string; buttonText: { displayText: string }; type: number }>
): Promise<any> => {
  try {
    const socket = getBaileys(whatsappId);
    const jid = phoneNumber.includes("@") ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;

    return await socket.sendMessage(jid, {
      text: message,
      footer: "Powered by FlowDeskPro",
      buttons,
      headerType: 1
    });
  } catch (error) {
    logger.error("Error enviando botones con Baileys:", error);
    throw error;
  }
};
