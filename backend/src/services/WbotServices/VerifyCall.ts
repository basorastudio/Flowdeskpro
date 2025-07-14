import { proto } from "@whiskeysockets/baileys";
import { logger } from "../../utils/logger";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";
import Tenant from "../../models/Tenant";
import VerifyContact from "./helpers/VerifyContact";
import CreateMessageSystemService from "../MessageServices/CreateMessageSystemService";
import SendMessagesSystemWbot from "./SendMessagesSystemWbot";

interface Session {
  id?: number;
}

const VerifyCall = async (call: any, wbot: Session): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      const messageDefault =
        "As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto.";
      let settings;

      try {
        const query = `
          select s."key", s.value, w."tenantId" from "Whatsapps" w
          inner join "Tenants" t on w."tenantId" = t.id
          inner join "Settings" s on t.id = s."tenantId"
          where w.id = '${wbot.id}'
          and s."key" in ('rejectCalls', 'callRejectMessage')
        `;
        settings = await Setting.sequelize?.query(query);
        if (settings?.length) {
          // eslint-disable-next-line prefer-destructuring
          settings = settings[0];
        }

        const rejectCalls =
          settings.find(s => s.key === "rejectCalls")?.value === "enabled" ||
          false;

        const callRejectMessage =
          settings.find(s => s.key === "callRejectMessage")?.value ||
          messageDefault;

        const tenantId = settings.find(s => s.key === "rejectCalls")?.tenantId;

        if (!rejectCalls) {
          resolve();
          return;
        }

        // En Baileys, el manejo de llamadas es diferente
        // No tenemos access directo a call.reject() ni call.from
        console.warn("Call handling in Baileys has limited functionality");

        if (!call.from) {
          resolve();
          return;
        }

        // Crear contacto simulado para la llamada
        const callContact = {
          id: call.from,
          name: call.from
        };

        const contact = await VerifyContact(callContact, tenantId);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: wbot.id!,
          unreadMessages: 1,
          tenantId,
          channel: "whatsapp"
        });

        // create message for call
        await CreateMessageSystemService({
          msg: {
            body: callRejectMessage,
            fromMe: true,
            read: true,
            sendType: "bot"
          },
          tenantId: ticket.tenantId,
          ticket,
          sendType: "call",
          status: "pending"
        });

        resolve();
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    })();
  });
};

export default VerifyCall;
