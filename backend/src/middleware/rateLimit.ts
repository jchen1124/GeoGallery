import { rateLimit } from "express-rate-limit";
import type { Request, Response } from "express";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../redis";

const createRedisStore = (prefix: string) => 
  new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  });

const readPositiveInteger = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const geocodeLimit = readPositiveInteger(process.env.GEOCODE_RATE_LIMIT, 60);
const geocodeWindowMs =
  readPositiveInteger(process.env.GEOCODE_RATE_LIMIT_WINDOW_SECONDS, 60) * 1000;
const uploadLimit = readPositiveInteger(process.env.UPLOAD_RATE_LIMIT, 10);
const uploadWindowMs =
  readPositiveInteger(process.env.UPLOAD_RATE_LIMIT_WINDOW_SECONDS, 60 * 60) *
  1000;

const sendRateLimitResponse =
  (routeName: string, message: string) => (req: Request, res: Response) => {
    console.warn(`${routeName} rate limit exceeded`, {
      ip: req.ip,
      xForwardedFor: req.get("x-forwarded-for"),
      rateLimit: (req as any).rateLimit,
    });

    return res.status(429).json({ error: message });
  };

// 60 requests per minute for geocoding requests by default.
export const geocodeRateLimiter = rateLimit({
  windowMs: geocodeWindowMs,
  limit: geocodeLimit,
  identifier: "geocode",
  standardHeaders: "draft-8",
  // For logging purposes, store the rate limit info in the request object.
  requestPropertyName: "rateLimit",
  legacyHeaders: false,
  handler: sendRateLimitResponse(
    "Geocode",
    "Too many geocoding requests. Please try again soon.",
  ),
  store: createRedisStore("rate-limit:geocode:"),
});

// 10 requests per hour for upload requests by default.
export const uploadRateLimiter = rateLimit({
  windowMs: uploadWindowMs,
  limit: uploadLimit,
  identifier: "uploads",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: sendRateLimitResponse(
    "Upload",
    "Too many uploads. Please try again later.",
  ),
  store: createRedisStore("rate-limit:uploads:"),
});
