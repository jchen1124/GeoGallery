import { Router } from "express";
import { redisClient } from "../redis";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const ping = await redisClient.ping();

    return res.json({
      status: "ok",
      uptimeSeconds: Math.round(process.uptime()),
      redis: {
        connected: redisClient.isOpen,
        ready: redisClient.isReady,
        ping,
      },
    });
  } catch (error) {
    console.error("Health check Redis ping failed:", error);

    return res.status(503).json({
      status: "degraded",
      uptimeSeconds: Math.round(process.uptime()),
      redis: {
        connected: redisClient.isOpen,
        ready: redisClient.isReady,
        ping: null,
      },
    });
  }
});

export default router;
