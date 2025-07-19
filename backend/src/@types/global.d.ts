declare namespace NodeJS {
  interface Global {
    _loopDb: any;
    rabbitWhatsapp: any;
  }
}

// Extender interfaces de whatsapp-web.js para compatibilidad
declare module "whatsapp-web.js" {
  interface Location {
    options?: string;
  }
}
