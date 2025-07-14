import Baileys from "../../models/Baileys";
import BaileysChats from "../../models/BaileysChats";

const DeleteBaileysService = async (whatsappId: number): Promise<void> => {
  await Baileys.destroy({
    where: { whatsappId }
  });

  await BaileysChats.destroy({
    where: { whatsappId }
  });
};

export default DeleteBaileysService;