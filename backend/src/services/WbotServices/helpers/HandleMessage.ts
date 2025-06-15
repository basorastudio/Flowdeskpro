import { proto } from "@whiskeysockets/baileys";
import Contact from "../../../models/Contact";
import Ticket from "../../../models/Ticket";
import CreateOrUpdateContactService from "../../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../../TicketServices/FindOrCreateTicketService";
import VerifyQuotedMessage from "./VerifyQuotedMessage";
import VerifyMediaMessage from "./VerifyMediaMessage";
import VerifyMessage from "./VerifyMessage";

type Session = any;

const HandleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  if (!msg.key.remoteJid) return;

  let msgContact: any;
  let msgGroupContact: Contact | undefined;

  const isGroup = msg.key.remoteJid?.endsWith("@g.us") || false;

  if (isGroup) {
    // En Baileys, no tenemos getContactById
    // Tenemos que construir el contacto manualmente
    msgContact = {
      id: msg.key.participant,
      name: msg.key.participant?.replace(/\D/g, "") || "Unknown"
    };

    if (msg.key.remoteJid) {
      msgGroupContact = {
        id: msg.key.remoteJid,
        name: msg.key.remoteJid.replace(/\D/g, "") || "Unknown Group"
      } as any;
    }
  } else {
    msgContact = {
      id: msg.key.remoteJid,
      name: msg.key.remoteJid.replace(/\D/g, "") || "Unknown"
    };
  }

  const contactData = {
    name: msgContact.name || msgContact.id?.replace(/\D/g, "") || "Unknown",
    number: msgContact.id?.replace(/\D/g, "") || "0",
    isGroup: false,
    tenantId,
    pushname: msgContact.name || "Unknown",
    isUser: true,
    isWAContact: true
  };

  const contact = await CreateOrUpdateContactService(contactData);

  let groupContact: Contact | undefined;

  if (isGroup && msgGroupContact) {
    const groupData = {
      name: msgGroupContact.name || String(msgGroupContact.id || "").replace(/\D/g, "") || "Unknown Group",
      number: String(msgGroupContact.id || "").replace(/\D/g, "") || "0",
      isGroup: true,
      tenantId,
      pushname: msgGroupContact.name || "Unknown Group",
      isUser: false,
      isWAContact: true
    };

    groupContact = await CreateOrUpdateContactService(groupData);
  }

  const ticket = await FindOrCreateTicketService({
    contact,
    whatsappId: wbot.id!,
    unreadMessages: 1,
    tenantId,
    groupContact,
    msg,
    channel: "whatsapp"
  });

  if (msg.message && ticket) {
    await VerifyMessage(msg, ticket, contact);
  }
};

export default HandleMessage;
