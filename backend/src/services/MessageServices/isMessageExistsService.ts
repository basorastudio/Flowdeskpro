import { proto } from "@whiskeysockets/baileys";
import Message from "../../models/Message";

const isMessageExistsService = async (
  msg: proto.IWebMessageInfo,
  tenantId: string | number
): Promise<Message | null> => {
  if (!msg.key.id) return null;
  
  const message = await Message.findOne({
    where: {
      messageId: msg.key.id,
      tenantId
    }
  });

  return message;
};

export default isMessageExistsService;
