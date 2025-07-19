import { getBaileys, getBaileysContacts } from "../../libs/baileys";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";

const ImportContactsBaileysService = async (
  tenantId: string | number,
  whatsappId?: number
): Promise<void> => {
  try {
    let whatsappInstance: Whatsapp | null = null;

    if (whatsappId) {
      // Si se especifica un whatsappId, usar esa instancia específica
      whatsappInstance = await Whatsapp.findOne({
        where: { id: whatsappId, tenantId, type: "baileys", status: "CONNECTED" }
      });
    } else {
      // Buscar la primera instancia de Baileys conectada para este tenant
      whatsappInstance = await Whatsapp.findOne({
        where: { tenantId, type: "baileys", status: "CONNECTED" }
      });
    }

    if (!whatsappInstance) {
      logger.error(`No hay instancias de Baileys conectadas para importar contactos. Tenant: ${tenantId}, WhatsappId: ${whatsappId}`);
      throw new Error("No hay instancias de Baileys conectadas para importar contactos");
    }

    logger.info(`Iniciando importación de contactos desde Baileys para tenant ${tenantId}, WhatsApp ID: ${whatsappInstance.id}`);

    const socket = getBaileys(whatsappInstance.id);

    if (!socket) {
      logger.error(`No se pudo obtener la instancia de socket de Baileys para WhatsApp ID: ${whatsappInstance.id}`);
      throw new Error("No se pudo obtener la instancia de socket de Baileys");
    }

    let contacts: any[] = [];
    let contactsFound = 0;

    try {
      // Usar la función específica para obtener contactos de Baileys
      logger.info("Obteniendo contactos desde Baileys...");
      contacts = await getBaileysContacts(whatsappInstance.id);
      contactsFound = contacts.length;
      
      logger.info(`✅ Se obtuvieron ${contactsFound} contactos desde Baileys`);

      if (contactsFound === 0) {
        logger.warn("No se encontraron contactos en la instancia de Baileys");
        throw new Error("No se encontraron contactos en la instancia de Baileys");
      }

    } catch (err) {
      logger.error(`❌ Error obteniendo contactos de Baileys: ${err.message}`);
      throw new Error(`Error obteniendo contactos de Baileys: ${err.message}`);
    }

    if (contactsFound > 0) {
      logger.info(`Procesando ${contactsFound} contactos de Baileys`);

      const processedContacts = await Promise.all(
        contacts.map(async (contact: any) => {
          try {
            // Extraer número limpio
            let number = contact.number || "";
            if (contact.id && !number) {
              number = contact.id.split("@")[0];
            }

            // Validar que sea un contacto válido
            if (!number || 
                number.includes("-") || // Excluir grupos
                number.includes("status") || // Excluir estados
                number.includes("broadcast") || // Excluir listas de difusión
                number.length < 8 || // Números muy cortos
                number.length > 15) { // Números muy largos
              return null;
            }

            // Usar el nombre del contacto o el número como nombre
            let name = contact.name || number;
            
            // Limpiar el nombre de caracteres especiales
            if (name) {
              name = name.replace(/'/g, "''").replace(/[^\w\s]/gi, '').trim();
              if (!name || name.length === 0) {
                name = number;
              }
            } else {
              name = number;
            }

            // Verificar si el contacto ya existe
            const existingContact = await Contact.findOne({
              where: { number, tenantId }
            });

            if (existingContact) {
              logger.debug(`Contacto ${number} ya existe, omitiendo`);
              return null; // Ya existe, no crear duplicado
            }

            logger.debug(`Creando contacto: ${name} - ${number}`);
            
            // Crear el contacto
            return await Contact.create({ 
              number, 
              name, 
              tenantId: tenantId.toString()
            });

          } catch (contactErr) {
            logger.error(`Error procesando contacto individual: ${contactErr}`);
            return null;
          }
        })
      );

      const successfulContacts = processedContacts.filter(contact => contact !== null);
      logger.info(`✅ Se importaron ${successfulContacts.length} contactos nuevos desde Baileys`);

      if (successfulContacts.length === 0) {
        logger.warn("No se importaron contactos nuevos. Todos los contactos ya existían o hubo errores.");
      }

    } else {
      logger.warn("No se encontraron contactos para importar desde Baileys");
      throw new Error("No se encontraron contactos para importar desde Baileys");
    }

  } catch (error) {
    logger.error(`❌ Error en ImportContactsBaileysService: ${error.message}`);
    throw error;
  }
};

export default ImportContactsBaileysService;
