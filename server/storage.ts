import { type TempEmail, type Message, type InsertTempEmail } from "@shared/schema";

export interface IStorage {
  createTempEmail(email: InsertTempEmail): Promise<TempEmail>;
  getTempEmail(id: number): Promise<TempEmail | undefined>;
  getTempEmailByAddress(address: string): Promise<TempEmail | undefined>;
  saveMessage(message: Message): Promise<Message>;
  getMessages(emailId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private tempEmails: Map<number, TempEmail>;
  private messages: Map<number, Message>;
  private currentEmailId: number;
  private currentMessageId: number;

  constructor() {
    this.tempEmails = new Map();
    this.messages = new Map();
    this.currentEmailId = 1;
    this.currentMessageId = 1;
  }

  async createTempEmail(email: InsertTempEmail): Promise<TempEmail> {
    const id = this.currentEmailId++;
    const tempEmail: TempEmail = {
      ...email,
      id,
      createdAt: new Date()
    };
    this.tempEmails.set(id, tempEmail);
    return tempEmail;
  }

  async getTempEmail(id: number): Promise<TempEmail | undefined> {
    return this.tempEmails.get(id);
  }

  async getTempEmailByAddress(address: string): Promise<TempEmail | undefined> {
    return Array.from(this.tempEmails.values()).find(
      (email) => email.address === address
    );
  }

  async saveMessage(message: Message): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage = { ...message, id };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessages(emailId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.emailId === emailId
    );
  }
}

export const storage = new MemStorage();
