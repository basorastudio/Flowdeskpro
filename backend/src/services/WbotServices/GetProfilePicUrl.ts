import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

const GetProfilePicUrl = async (
  number: string,
  tenantId: string | number
): Promise<string> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);
    const wbot = getWbot(defaultWhatsapp.id);
    
    const profilePicUrl = await wbot.profilePictureUrl(`${number}@s.whatsapp.net`, "image");
    
    return profilePicUrl || `${process.env.FRONTEND_URL}/nopicture.png`;
  } catch (error) {
    logger.error(`GetProfilePicUrl - ${error}`);
    return `${process.env.FRONTEND_URL}/nopicture.png`;
  }
};

export default GetProfilePicUrl;
