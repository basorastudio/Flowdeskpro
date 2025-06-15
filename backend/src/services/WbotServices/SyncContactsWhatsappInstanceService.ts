import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";

const SyncContactsWhatsappInstanceService = async (
  tenantId: number
): Promise<void> => {
  let contacts: any[] = [];

  const wbot = getWbot(tenantId);

  try {
    // En Baileys, no existe getContacts() por razones de privacidad
    // Los contactos se obtienen de los chats existentes
    console.warn("SyncContactsWhatsappInstanceService: getContacts() not available in Baileys");
    contacts = [];
  } catch (error) {
    console.error("Error syncing contacts:", error);
    contacts = [];
  }

  if (contacts.length) {
    await Promise.all(
      contacts.map(async (contact: any) => {
        if (contact.number && contact.name) {
          const contactData = {
            name: contact.name,
            number: contact.number,
            tenantId,
            pushname: contact.pushname || contact.name,
            isUser: contact.isUser || false,
            isWAContact: contact.isWAContact || true,
            isGroup: contact.isGroup || false
          };

          return CreateOrUpdateContactService(contactData);
        }
        return null;
      })
    );
  }
};

export default SyncContactsWhatsappInstanceService;
