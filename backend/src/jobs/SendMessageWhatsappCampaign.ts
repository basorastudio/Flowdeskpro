/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from "path";
import { proto } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import GetTicketWbot from "../helpers/GetTicketWbot";
import CampaignContacts from "../models/CampaignContacts";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import UserMessagesLog from "../models/UserMessagesLog";
import { logger } from "../utils/logger";

export default {
  key: "SendMessageWhatsappCampaign",
  options: {
    delay: 15000,
    attempts: 10,
    removeOnComplete: true,
    // removeOnFail: true,
    backoff: {
      type: "fixed",
      delay: 60000 * 5 // 5 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      const wbot = await GetTicketWbot(data.ticket);
      const chatId = `${data.ticket.contact.number}@${data.ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

      let message;

      if (data.quotedMsg) {
        message = await wbot.sendMessage(
          chatId,
          { text: data.body },
          {
            quoted: {
              key: {
                id: data.quotedMsg.messageId,
                fromMe: data.quotedMsg.fromMe,
                remoteJid: data.quotedMsg.remoteJid || chatId
              },
              message: {
                conversation: data.quotedMsg.body
              }
            }
          }
        );
      } else {
        message = await wbot.sendMessage(chatId, { text: data.body });
      }

      await data.ticket.update({ lastMessage: data.body, answered: true });

      if (data.userId) {
        await UserMessagesLog.create({
          userId: data.userId,
          ticketId: data.ticket.id,
          messageId: message.key.id
        });
      }

      await CampaignContacts.update(
        {
          messageId: message.key.id,
          messageRandom: data.messageRandom,
          body: data.message,
          mediaName: data.mediaName,
          timestamp: message.messageTimestamp,
          jobId: data.jobId
        },
        { where: { id: data.campaignContact.id } }
      );

      return message;
    } catch (error) {
      Sentry.captureException(error);
      logger.error(`Error enviar message campaign: ${error}`);
      throw new Error(error);
    }
  }
};
