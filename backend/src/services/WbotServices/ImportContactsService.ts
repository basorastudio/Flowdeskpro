import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

const ImportContactsService = async (
  tenantId: string | number
): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);
  const wbot = getWbot(defaultWhatsapp.id);
  let phoneContacts;

  try {
    // En Baileys no existe getContacts(), esta funcionalidad no está disponible
    // por seguridad y privacidad. Los contactos se obtienen de los chats existentes
    logger.warn(
      "ImportContactsService: Contact import not available in Baileys for privacy reasons"
    );
    phoneContacts = [];
  } catch (err) {
    logger.error(
      `Could not get whatsapp contacts from phone. Check connection page. | Error: ${err}`
    );
    phoneContacts = [];
  }

  if (phoneContacts && phoneContacts.length > 0) {
    await Promise.all(
      phoneContacts.map(async ({ number, name }) => {
        if (!number) {
          return null;
        }
        if (!name) {
          name = number;
        }

        const numberExists = await Contact.findOne({
          where: { number, tenantId }
        });

        if (numberExists) return null;

        return Contact.create({ number, name, tenantId });
      })
    );
  }
};

export default ImportContactsService;
