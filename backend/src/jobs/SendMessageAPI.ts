/* eslint-disable @typescript-eslint/no-explicit-any */
import { proto } from "@whiskeysockets/baileys";
import fs from "fs";
import { v4 as uuid } from "uuid";
import axios from "axios";
import mime from "mime-types";
import { join } from "path";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import UpsertMessageAPIService from "../services/ApiMessageService/UpsertMessageAPIService";
import Queue from "../libs/Queue";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import AppError from "../errors/AppError";
import VerifyContact from "../services/WbotServices/helpers/VerifyContact";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CreateMessageSystemService from "../services/MessageServices/CreateMessageSystemService";

export default {
  key: "SendMessageAPI",
  options: {
    delay: 6000,
    attempts: 50,
    removeOnComplete: true,
    removeOnFail: false,
    backoff: {
      type: "fixed",
      delay: 60000 * 3 // 3 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      const { sessionId, tenantId } = data;
      const wbot = getWbot(sessionId);

      if (!wbot) {
        throw new Error("Wbot not found");
      }

      const chatId = `${data.number}@s.whatsapp.net`;

      let message: proto.WebMessageInfo | undefined;

      if (data.mediaUrl) {
        // Envío de media
        let mediaBuffer: Buffer;
        let filename: string;
        let mimetype: string;

        if (data.mediaUrl.startsWith('http')) {
          const response = await axios.get(data.mediaUrl, { responseType: 'arraybuffer' });
          mediaBuffer = Buffer.from(response.data);
          mimetype = response.headers['content-type'] || 'application/octet-stream';
          filename = data.mediaName || `media_${uuid()}.${mime.extension(mimetype)}`;
        } else {
          const mediaPath = join(process.cwd(), 'public', data.mediaUrl);
          mediaBuffer = fs.readFileSync(mediaPath);
          mimetype = mime.lookup(mediaPath) || 'application/octet-stream';
          filename = data.mediaName || data.mediaUrl.split('/').pop();
        }

        // Determinar tipo de media y enviar
        if (mimetype.startsWith('image/')) {
          message = await wbot.sendMessage(chatId, {
            image: mediaBuffer,
            caption: data.body || '',
            mimetype
          });
        } else if (mimetype.startsWith('video/')) {
          message = await wbot.sendMessage(chatId, {
            video: mediaBuffer,
            caption: data.body || '',
            mimetype
          });
        } else if (mimetype.startsWith('audio/')) {
          message = await wbot.sendMessage(chatId, {
            audio: mediaBuffer,
            mimetype,
            ptt: true
          });
        } else {
          message = await wbot.sendMessage(chatId, {
            document: mediaBuffer,
            fileName: filename,
            mimetype
          });
        }
      } else {
        // Envío de texto simple
        message = await wbot.sendMessage(chatId, {
          text: data.body
        });
      }

      if (message?.key?.id) {
        const messageData = {
          messageId: message.key.id,
          body: data.body,
          ack: 1,
          number: data.number,
          mediaName: data.mediaName,
          mediaUrl: data.mediaUrl,
          timestamp: Date.now(),
          externalKey: data.externalKey,
          messageWA: message,
          apiConfig: data.apiConfig,
          sessionId,
          tenantId
        };

        await UpsertMessageAPIService(messageData);

        logger.info(`Message API sent successfully: ${message.key.id}`);
      }

    } catch (error) {
      logger.error(`Error in SendMessageAPI job: ${error.message}`);
      throw error;
    }
  }
};
