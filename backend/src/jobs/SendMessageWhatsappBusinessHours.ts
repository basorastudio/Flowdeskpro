/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from "@sentry/node";
import GetTicketWbot from "../helpers/GetTicketWbot";
import { logger } from "../utils/logger";

export default {
  key: "SendMessageWhatsappBusinessHours",
  options: {
    delay: 6000,
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
      const { ticket, messageData } = data;
      const wbot = await GetTicketWbot(ticket);
      const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

      const message = await wbot.sendMessage(chatId, { text: messageData.body });

      return message;
    } catch (error) {
      Sentry.captureException(error);
      logger.error(`Error sending business hours message: ${error}`);
      throw new Error(error);
    }
  }
};
