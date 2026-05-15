import "dotenv/config";
import express from "express";
import cors from "cors";
import { menuRouter } from "./routes/menu.routes.js";
import { aiRouter } from "./routes/ai.routes.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "intelligent-bistro-backend" });
});

app.use("/api/menu", menuRouter);
app.use("/api/ai", aiRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Intelligent Bistro backend running on http://localhost:${port}`);
});
