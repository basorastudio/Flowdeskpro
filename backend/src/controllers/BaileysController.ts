import { Request, Response } from "express";
import { initBaileys, getBaileys, sendMessageBaileys, sendButtonsBaileys, removeBaileys } from "../libs/baileys";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartBaileysSession } from "../services/BaileysServices/StartBaileysSession";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

export const baileysConnect = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  try {
    const whatsapp = await ShowWhatsAppService({
      id: whatsappId,
      tenantId,
      isInternal: true
    });

    if (whatsapp.type !== "baileys") {
      throw new AppError("Esta conexión no es de tipo Baileys", 400);
    }

    // Iniciar la sesión de Baileys
    await StartBaileysSession(whatsapp);

    return res.status(200).json({
      success: true,
      message: "Sesión Baileys iniciada exitosamente",
      whatsapp: {
        id: whatsapp.id,
        name: whatsapp.name,
        status: "OPENING",
        type: whatsapp.type
      }
    });
  } catch (error) {
    logger.error("Error en baileysConnect:", error);
    throw new AppError("Error iniciando conexión Baileys", 500);
  }
};

export const baileysQR = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  try {
    const whatsapp = await ShowWhatsAppService({
      id: whatsappId,
      tenantId,
      isInternal: true
    });

    if (whatsapp.type !== "baileys") {
      throw new AppError("Esta conexión no es de tipo Baileys", 400);
    }

    // Si hay QR disponible, devolverlo
    if (whatsapp.qrcode) {
      return res.status(200).json({
        success: true,
        qr: whatsapp.qrcode,
        status: whatsapp.status,
        message: "Código QR disponible"
      });
    }

    return res.status(200).json({
      success: false,
      message: "No hay código QR disponible",
      status: whatsapp.status
    });
  } catch (error) {
    logger.error("Error en baileysQR:", error);
    throw new AppError("Error obteniendo QR de Baileys", 500);
  }
};

export const baileysStatus = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  try {
    const whatsapp = await ShowWhatsAppService({
      id: whatsappId,
      tenantId,
      isInternal: true
    });

    if (whatsapp.type !== "baileys") {
      throw new AppError("Esta conexión no es de tipo Baileys", 400);
    }

    return res.status(200).json({
      success: true,
      status: whatsapp.status,
      name: whatsapp.name,
      number: whatsapp.number,
      connected: whatsapp.status === "CONNECTED",
      retries: whatsapp.retries || 0
    });
  } catch (error) {
    logger.error("Error en baileysStatus:", error);
    throw new AppError("Error obteniendo estado de Baileys", 500);
  }
};

export const baileysSendMessage = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const { to, message, imageUrl, caption } = req.body;

  try {
    const whatsapp = await ShowWhatsAppService({
      id: whatsappId,
      tenantId,
      isInternal: true
    });

    if (whatsapp.type !== "baileys") {
      throw new AppError("Esta conexión no es de tipo Baileys", 400);
    }

    if (whatsapp.status !== "CONNECTED") {
      throw new AppError("WhatsApp no está conectado", 400);
    }

    if (!to || !message) {
      throw new AppError("Los campos 'to' y 'message' son requeridos", 400);
    }

    const result = await sendMessageBaileys(
      Number(whatsappId),
      to,
      message,
      imageUrl,
      caption
    );

    return res.status(200).json({
      success: true,
      message: "Mensaje enviado exitosamente",
      messageId: result.key.id,
      timestamp: result.messageTimestamp
    });
  } catch (error) {
    logger.error("Error en baileysSendMessage:", error);
    throw new AppError("Error enviando mensaje con Baileys", 500);
  }
};

export const baileysSendImage = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const { to, imageUrl, caption } = req.body;

  try {
    const whatsapp = await ShowWhatsAppService({
      id: whatsappId,
      tenantId,
      isInternal: true
    });

    if (whatsapp.type !== "baileys") {
      throw new AppError("Esta conexión no es de tipo Baileys", 400);
    }

    if (whatsapp.status !== "CONNECTED") {
      throw new AppError("WhatsApp no está conectado", 400);
    }

    if (!to || !imageUrl) {
      throw new AppError("Los campos 'to' e 'imageUrl' son requeridos", 400);
    }

    const result = await sendMessageBaileys(
      Number(whatsappId),
      to,
      caption || "",
      imageUrl,
      caption
    );

    return res.status(200).json({
      success: true,
      message: "Imagen enviada exitosamente",
      messageId: result.key.id,
      timestamp: result.messageTimestamp
    });
  } catch (error) {
    logger.error("Error en baileysSendImage:", error);
    throw new AppError("Error enviando imagen con Baileys", 500);
  }
};

export const baileysSendButtons = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const { to, message, buttons } = req.body;

  try {
    const whatsapp = await ShowWhatsAppService({
      id: whatsappId,
      tenantId,
      isInternal: true
    });

    if (whatsapp.type !== "baileys") {
      throw new AppError("Esta conexión no es de tipo Baileys", 400);
    }

    if (whatsapp.status !== "CONNECTED") {
      throw new AppError("WhatsApp no está conectado", 400);
    }

    if (!to || !message || !buttons) {
      throw new AppError("Los campos 'to', 'message' y 'buttons' son requeridos", 400);
    }

    const result = await sendButtonsBaileys(
      Number(whatsappId),
      to,
      message,
      buttons
    );

    return res.status(200).json({
      success: true,
      message: "Botones enviados exitosamente",
      messageId: result.key.id,
      timestamp: result.messageTimestamp
    });
  } catch (error) {
    logger.error("Error en baileysSendButtons:", error);
    throw new AppError("Error enviando botones con Baileys", 500);
  }
};

export const baileysDisconnect = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  try {
    const whatsapp = await ShowWhatsAppService({
      id: whatsappId,
      tenantId,
      isInternal: true
    });

    if (whatsapp.type !== "baileys") {
      throw new AppError("Esta conexión no es de tipo Baileys", 400);
    }

    // Desconectar la sesión de Baileys
    removeBaileys(Number(whatsappId));

    // Actualizar estado en base de datos
    await whatsapp.update({
      status: "DISCONNECTED",
      qrcode: null,
      retries: 0
    });

    return res.status(200).json({
      success: true,
      message: "Sesión Baileys desconectada exitosamente",
      status: "DISCONNECTED"
    });
  } catch (error) {
    logger.error("Error en baileysDisconnect:", error);
    throw new AppError("Error desconectando Baileys", 500);
  }
};

export const baileysDocs = async (req: Request, res: Response): Promise<Response> => {
  const documentation = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Baileys Plus API - FlowDeskPro</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #25D366; text-align: center; }
            h2 { color: #128C7E; border-bottom: 2px solid #25D366; padding-bottom: 10px; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #25D366; }
            .method { font-weight: bold; color: #dc3545; }
            .url { font-family: monospace; background: #e9ecef; padding: 5px; border-radius: 3px; }
            .params { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 5px 0; }
            code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📱 Baileys Plus API - FlowDeskPro</h1>
            <p>Documentación completa de la API de Baileys Plus integrada en FlowDeskPro.</p>
            
            <h2>🔗 Endpoints Disponibles</h2>
            
            <div class="endpoint">
                <h3><span class="method">POST</span> Conectar WhatsApp</h3>
                <div class="url">/api/baileys/:whatsappId/connect</div>
                <p>Inicia una nueva conexión de WhatsApp con Baileys Plus.</p>
            </div>

            <div class="endpoint">
                <h3><span class="method">GET</span> Obtener Código QR</h3>
                <div class="url">/api/baileys/:whatsappId/qr</div>
                <p>Obtiene el código QR para escanear con WhatsApp.</p>
            </div>

            <div class="endpoint">
                <h3><span class="method">GET</span> Estado de Conexión</h3>
                <div class="url">/api/baileys/:whatsappId/status</div>
                <p>Verifica el estado actual de la conexión de WhatsApp.</p>
            </div>

            <div class="endpoint">
                <h3><span class="method">POST</span> Enviar Mensaje</h3>
                <div class="url">/api/baileys/:whatsappId/send-message</div>
                <div class="params">
                    <strong>Parámetros:</strong><br>
                    <code>to</code>: Número de teléfono (ej: "34123456789")<br>
                    <code>message</code>: Texto del mensaje
                </div>
            </div>

            <div class="endpoint">
                <h3><span class="method">POST</span> Enviar Imagen</h3>
                <div class="url">/api/baileys/:whatsappId/send-image</div>
                <div class="params">
                    <strong>Parámetros:</strong><br>
                    <code>to</code>: Número de teléfono<br>
                    <code>imageUrl</code>: URL de la imagen<br>
                    <code>caption</code>: Texto descriptivo (opcional)
                </div>
            </div>

            <div class="endpoint">
                <h3><span class="method">POST</span> Enviar Botones</h3>
                <div class="url">/api/baileys/:whatsappId/send-buttons</div>
                <div class="params">
                    <strong>Parámetros:</strong><br>
                    <code>to</code>: Número de teléfono<br>
                    <code>message</code>: Texto del mensaje<br>
                    <code>buttons</code>: Array de botones
                </div>
            </div>

            <div class="endpoint">
                <h3><span class="method">POST</span> Desconectar</h3>
                <div class="url">/api/baileys/:whatsappId/disconnect</div>
                <p>Desconecta la sesión de WhatsApp.</p>
            </div>

            <h2>📝 Ejemplo de Uso</h2>
            <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">
// Enviar mensaje
fetch('/api/baileys/1/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '34123456789',
    message: 'Hola desde Baileys Plus!'
  })
})
            </pre>

            <h2>🔧 Estados de Conexión</h2>
            <ul>
                <li><strong>OPENING</strong>: Iniciando conexión</li>
                <li><strong>qrcode</strong>: Esperando escaneo de QR</li>
                <li><strong>CONNECTED</strong>: Conectado y listo</li>
                <li><strong>DISCONNECTED</strong>: Desconectado</li>
            </ul>

            <p style="text-align: center; margin-top: 30px; color: #666;">
                <strong>FlowDeskPro + Baileys Plus</strong><br>
                La mejor integración de WhatsApp para tu negocio
            </p>
        </div>
    </body>
    </html>
  `;

  return res.status(200).send(documentation);
};
