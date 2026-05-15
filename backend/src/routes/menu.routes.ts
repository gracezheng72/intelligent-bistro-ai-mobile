import { Router } from "express";
import { getMenuItems } from "../services/menuService.js";

export const menuRouter = Router();

menuRouter.get("/", (_req, res) => {
  res.json({ items: getMenuItems() });
});
