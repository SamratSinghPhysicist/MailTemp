import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import axios from "axios";

const MAIL_TM_API = "https://api.mail.tm";

export function registerRoutes(app: Express) {
  // Create temporary email
  app.post("/api/email", async (req, res) => {
    try {
      // 1. Create account on mail.tm
      const { data: domainsResponse } = await axios.get(`${MAIL_TM_API}/domains`);
      const domain = domainsResponse['hydra:member'][0].domain;

      const randomString = Math.random().toString(36).substring(7);
      const email = `${randomString}@${domain}`;
      const password = Math.random().toString(36).substring(7);

      console.log("Creating account with:", { email, password });

      const accountResponse = await axios.post(`${MAIL_TM_API}/accounts`, {
        address: email,
        password
      });

      console.log("Account created:", accountResponse.data);

      // 2. Get auth token
      const { data: auth } = await axios.post(`${MAIL_TM_API}/token`, {
        address: email,
        password
      });

      if (!auth.token) {
        console.error("No token in auth response:", auth);
        return res.status(500).json({ message: "Failed to get auth token" });
      }

      // 3. Save to storage
      const tempEmail = await storage.createTempEmail({
        address: email,
        password,
        token: auth.token
      });

      // Return only necessary fields for API consumers
      res.json({
        id: tempEmail.id,
        address: tempEmail.address,
        createdAt: tempEmail.createdAt
      });
    } catch (error: any) {
      console.error("Email creation error:", error.response?.data || error.message);
      res.status(500).json({ 
        message: "Failed to create email",
        details: error.response?.data?.message || error.message
      });
    }
  });

  // Get messages for a specific email
  app.get("/api/email/:id/messages", async (req, res) => {
    try {
      const emailId = parseInt(req.params.id);
      if (isNaN(emailId)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }

      const email = await storage.getTempEmail(emailId);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }

      const { data } = await axios.get(`${MAIL_TM_API}/messages`, {
        headers: { Authorization: `Bearer ${email.token}` }
      });

      const messages = await Promise.all(
        data['hydra:member'].map(async (msg: any) => {
          // Get detailed message content
          const { data: fullMessage } = await axios.get(`${MAIL_TM_API}/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${email.token}` }
          });

          const message = {
            id: 0, // This will be set by storage
            emailId: email.id,
            from: msg.from.address,
            subject: msg.subject,
            content: fullMessage.html || fullMessage.text || '',
            rawData: fullMessage,
            createdAt: new Date(msg.createdAt)
          };
          return storage.saveMessage(message);
        })
      );

      // Return messages in documented format
      res.json(messages.map(msg => ({
        id: msg.id,
        emailId: msg.emailId,
        from: msg.from,
        subject: msg.subject,
        content: msg.content,
        createdAt: msg.createdAt
      })));
    } catch (error: any) {
      console.error("Message fetch error:", error.response?.data || error.message);
      res.status(500).json({ 
        message: "Failed to fetch messages",
        details: error.response?.data?.message || error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}