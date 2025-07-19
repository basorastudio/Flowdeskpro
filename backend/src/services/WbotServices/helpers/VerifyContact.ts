import { Contact as WbotContact } from "whatsapp-web.js";
import Contact from "../../../models/Contact";
import CreateOrUpdateContactService from "../../ContactServices/CreateOrUpdateContactService";

// Interface flexible para diferentes tipos de contacto
interface ContactInfo {
  id: {
    _serialized?: string;
    user: string;
  };
  name?: string;
  pushname?: string;
  shortName?: string;
  number: string;
  isUser?: boolean;
  isWAContact?: boolean;
  isGroup?: boolean;
}

const VerifyContact = async (
  msgContact: WbotContact | ContactInfo,
  tenantId: string | number
): Promise<Contact> => {
  let profilePicUrl;
  try {
    // Verificar si es un objeto WbotContact con métodos
    if ('getProfilePicUrl' in msgContact && typeof msgContact.getProfilePicUrl === 'function') {
      profilePicUrl = await msgContact.getProfilePicUrl();
    } else {
      profilePicUrl = undefined;
    }
  } catch (error) {
    profilePicUrl = undefined;
  }

  const contactData = {
    name:
      msgContact.name ||
      msgContact.pushname ||
      ('shortName' in msgContact ? msgContact.shortName : undefined) ||
      msgContact.id.user,
    number: msgContact.number || msgContact.id.user,
    profilePicUrl,
    tenantId,
    pushname: msgContact.pushname || "",
    isUser: msgContact.isUser || false,
    isWAContact: msgContact.isWAContact || true,
    isGroup: msgContact.isGroup || false
  };

  const contact = await CreateOrUpdateContactService(contactData);

  return contact;
};

export default VerifyContact;
