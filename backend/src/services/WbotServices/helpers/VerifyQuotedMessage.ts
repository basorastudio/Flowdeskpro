import { proto } from "@whiskeysockets/baileys";
import Message from "../../../models/Message";

const VerifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg.message?.extendedTextMessage?.contextInfo?.stanzaId) {
    return null;
  }

  try {
    const quotedMsg = await Message.findOne({
      where: { messageId: msg.message.extendedTextMessage.contextInfo.stanzaId }
    });

    return quotedMsg;
  } catch (err) {
    return null;
  }
};

export default VerifyQuotedMessage;
