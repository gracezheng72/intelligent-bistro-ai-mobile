import { Router } from "express";
import { parseOrderIntent } from "../services/aiParserService.js";
import { ParseOrderRequest } from "../types/ai.js";

export const aiRouter = Router();

aiRouter.post("/parse-order", async (req, res, next) => {
  try {
    const body = req.body as ParseOrderRequest;
    if (!body.message || typeof body.message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }
    const result = await parseOrderIntent(body.message, body.cart ?? []);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});
