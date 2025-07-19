import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as BaileysController from "../controllers/BaileysController";

const baileysRoutes = Router();

// Rutas para API de Baileys Plus
baileysRoutes.post(
  "/baileys/:whatsappId/connect",
  isAuth,
  BaileysController.baileysConnect
);

baileysRoutes.get(
  "/baileys/:whatsappId/qr",
  isAuth,
  BaileysController.baileysQR
);

baileysRoutes.get(
  "/baileys/:whatsappId/status",
  isAuth,
  BaileysController.baileysStatus
);

baileysRoutes.post(
  "/baileys/:whatsappId/send-message",
  isAuth,
  BaileysController.baileysSendMessage
);

baileysRoutes.post(
  "/baileys/:whatsappId/send-image",
  isAuth,
  BaileysController.baileysSendImage
);

baileysRoutes.post(
  "/baileys/:whatsappId/send-buttons",
  isAuth,
  BaileysController.baileysSendButtons
);

baileysRoutes.post(
  "/baileys/:whatsappId/disconnect",
  isAuth,
  BaileysController.baileysDisconnect
);

baileysRoutes.post(
  "/baileys/:whatsappId/import-contacts",
  isAuth,
  BaileysController.baileysImportContacts
);

baileysRoutes.get(
  "/baileys/:whatsappId/test-contacts",
  isAuth,
  BaileysController.baileysTestContacts
);

baileysRoutes.get(
  "/baileys/docs",
  BaileysController.baileysDocs
);

export default baileysRoutes;
