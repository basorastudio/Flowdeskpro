// Definiciones de tipos para whatsapp-web.js
declare module "whatsapp-web.js" {
  export interface Contact {
    id: {
      _serialized: string;
      user: string;
    };
    name?: string;
    pushname?: string;
    shortName?: string;
    number?: string;
    isUser?: boolean;
    isWAContact?: boolean;
    isGroup?: boolean;
    isBusiness?: boolean;
    isEnterprise?: boolean;
    isMe?: boolean;
    isMyContact?: boolean;
    getProfilePicUrl?(): Promise<string>;
  }

  export interface Location {
    latitude: number;
    longitude: number;
    description?: string;
    options?: string;
  }

  export interface Message {
    id: {
      id: string;
      _serialized: string;
    };
    timestamp: number;
    from: string;
    to: string;
    fromMe: boolean;
    body: string;
    type: string;
    location?: Location;
    hasMedia: boolean;
    hasQuotedMsg?: boolean;
    downloadMedia(): Promise<MessageMedia>;
    getChat(): Promise<Chat>;
    getContact(): Promise<Contact>;
    getQuotedMessage(): Promise<Message>;
    delete(everyone?: boolean): Promise<void>;
    edit(newBody: string): Promise<void>;
  }

  export class MessageMedia {
    static fromFilePath(filePath: string): MessageMedia;
    mimetype: string;
    data: string;
    filename?: string;
  }

  export interface Chat {
    id: {
      _serialized: string;
      user: string;
    };
    name: string;
    isGroup: boolean;
    unreadCount: number;
    fetchMessages(options?: { limit?: number }): Promise<Message[]>;
    getContact(): Promise<Contact>;
  }

  export interface Call {
    id: string;
    from: string;
    timestamp: number;
    reject(): Promise<void>;
  }

  export interface Buttons {
    // Define properties as needed
  }

  export interface List {
    // Define properties as needed
  }

  export enum MessageAck {
    ACK_ERROR = -1,
    ACK_PENDING = 0,
    ACK_SERVER = 1,
    ACK_DEVICE = 2,
    ACK_READ = 3,
    ACK_PLAYED = 4
  }

  export class LocalAuth {
    constructor(options?: { clientId?: string });
  }

  export interface DefaultOptions {
    userAgent: string;
  }

  export const DefaultOptions: DefaultOptions;

  export class Client {
    constructor(options?: {
      authStrategy?: LocalAuth;
      puppeteer?: any;
      userAgent?: string;
      takeoverOnConflict?: boolean;
      webVersion?: string;
      webVersionCache?: any;
      qrMaxRetries?: number;
    });
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    getState(): Promise<string>;
    logout(): Promise<void>;
    getNumberId(number: string): Promise<{ _serialized: string; user: string }>;
    getContactById(id: string): Promise<Contact>;
    sendMessage(chatId: string, content: string | MessageMedia, options?: any): Promise<Message>;
    sendSeen(chatId: string): Promise<void>;
    getContacts(): Promise<Contact[]>;
    getChats(): Promise<Chat[]>;
    getChatById(id: string): Promise<Chat>;
    getProfilePicUrl(contactId: string): Promise<string>;
    getWWebVersion(): Promise<string>;
    sendPresenceAvailable(): void;
    pupBrowser?: any;
    info?: any;
    on(event: string, callback: (...args: any[]) => void): void;
  }
}
