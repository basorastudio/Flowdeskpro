import { proto } from "@whiskeysockets/baileys";
import Contact from "../../../models/Contact";
import CreateOrUpdateContactService from "../../ContactServices/CreateOrUpdateContactService";

const VerifyContact = async (
  msgContact: any,
  tenantId: string | number
): Promise<Contact> => {
  let profilePicUrl;
  try {
    // En Baileys, no tenemos acceso directo a getProfilePicUrl desde el contacto
    // Esto se maneja de forma diferente
    profilePicUrl = undefined;
  } catch (error) {
    profilePicUrl = undefined;
  }

  const contactData = {
    name: msgContact.name || msgContact.pushname || msgContact.shortName || msgContact.id || "Unknown",
    number: msgContact.id?.replace(/\D/g, "") || msgContact.number || "0",
    profilePicUrl,
    tenantId,
    pushname: msgContact.pushname || msgContact.name || "Unknown",
    isUser: msgContact.isUser || true,
    isWAContact: msgContact.isWAContact || true,
    isGroup: msgContact.isGroup || false
  };

  const contact = await CreateOrUpdateContactService(contactData);

  return contact;
};

export default VerifyContact;
