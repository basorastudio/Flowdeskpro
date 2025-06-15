import { proto } from "@whiskeysockets/baileys";

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key && msg.key.remoteJid) {
    return !msg.key.remoteJid.endsWith("@broadcast");
  }
  return false;
};

export default isValidMsg;
