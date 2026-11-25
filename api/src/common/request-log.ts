import type { NextFunction, Request, Response } from "express";

/** One structured log line per request: method, path (no query string), status, duration. No personal data. */
export function requestLog(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    if (req.path === "/health") return;
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(JSON.stringify({ level: "info", method: req.method, path: req.path, status: res.statusCode, ms: Math.round(ms) }));
  });
  next();
}
