/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { join } from "path";
import { WASocket, proto } from "@whiskeysockets/baileys";
import { Op } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import { sleepRandomTime } from "../../utils/sleepRandomTime";
import Contact from "../../models/Contact";
import fs from "fs";
import mime from "mime-types";

type Session = WASocket & {
  id?: number;
};

const SendMessagesSystemWbot = async (
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  const where = {
    fromMe: true,
    messageId: { [Op.is]: null },
    status: "pending",
    [Op.or]: [
      {
        scheduleDate: {
          [Op.lte]: new Date()
        }
      },
      {
        scheduleDate: { [Op.is]: null }
      }
    ]
  };
  
  const messages = await Message.findAll({
    where,
    include: [
      {
        model: Contact,
        as: "contact",
        where: {
          tenantId,
          number: {
            [Op.notIn]: ["", "null"]
          }
        }
      },
      {
        model: Ticket,
        as: "ticket",
        where: {
          tenantId,
          [Op.or]: {
            status: { [Op.ne]: "closed" },
            isFarewellMessage: true
          },
          channel: "whatsapp",
          whatsappId: wbot.id
        },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "ASC"]]
  });

  for (const message of messages) {
    const { ticket } = message;
    const contactNumber = ticket.contact.number;
    const chatId = `${contactNumber}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

    try {
      let sendedMessage: proto.WebMessageInfo | undefined;

      if (message.mediaType !== "chat" && message.mediaName) {
        // Envío de media
        const customPath = join(__dirname, "..", "..", "..", "public");
        const mediaPath = join(customPath, message.mediaName);
        const mediaBuffer = fs.readFileSync(mediaPath);
        const mimetype = mime.lookup(mediaPath) || 'application/octet-stream';
        
        // Determinar tipo de media basado en mediaType
        if (message.mediaType === "image") {
          sendedMessage = await wbot.sendMessage(chatId, {
            image: mediaBuffer,
            caption: message.body || "",
            mimetype
          });
        } else if (message.mediaType === "video") {
          sendedMessage = await wbot.sendMessage(chatId, {
            video: mediaBuffer,
            caption: message.body || "",
            mimetype
          });
        } else if (message.mediaType === "audio" || message.mediaType === "ptt") {
          sendedMessage = await wbot.sendMessage(chatId, {
            audio: mediaBuffer,
            ptt: true,
            mimetype
          });
        } else {
          // Documentos
          sendedMessage = await wbot.sendMessage(chatId, {
            document: mediaBuffer,
            fileName: message.mediaName,
            mimetype
          });
        }
        
        logger.info("sendMessage media");
      } else {
        // Envío de texto
        const messageOptions: any = {
          text: message.body
        };

        // Agregar mensaje citado si existe
        if (message.quotedMsg) {
          messageOptions.quoted = {
            key: {
              id: message.quotedMsg.messageId,
              fromMe: message.quotedMsg.fromMe,
              remoteJid: chatId
            }
          };
        }

        sendedMessage = await wbot.sendMessage(chatId, messageOptions);
        logger.info("sendMessage text");
      }

      if (sendedMessage?.key?.id) {
        // Actualizar mensaje con el ID generado
        const messageToUpdate = {
          messageId: sendedMessage.key.id,
          status: "sended",
          ack: 1
        };

        await Message.update(
          { ...messageToUpdate },
          { where: { id: message.id } }
        );

        logger.info("Message Update");
      }

      // Delay para procesamiento de la mensagem
      await sleepRandomTime({
        minMilliseconds: Number(process.env.MIN_SLEEP_INTERVAL || 500),
        maxMilliseconds: Number(process.env.MAX_SLEEP_INTERVAL || 2000)
      });

      if (sendedMessage?.key?.id) {
        logger.info("sendMessage", sendedMessage.key.id);
      }
    } catch (error) {
      const idMessage = message.id;
      const ticketId = message.ticket.id;

      if (error.code === "ENOENT") {
        await Message.destroy({
          where: { id: message.id }
        });
      }

      logger.error(
        `Error message is (tenant: ${tenantId} | Ticket: ${ticketId})`
      );
      logger.error(`Error send message (id: ${idMessage})::${error}`);
    }
  }
};

export default SendMessagesSystemWbot;
