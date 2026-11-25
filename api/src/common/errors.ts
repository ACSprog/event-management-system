import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";

/**
 * Turns errors into safe JSON. Expected errors (4xx) keep their message. Anything else is
 * logged with a reference and returned as a generic 500, so database errors, stack traces
 * and table names never reach the browser. Database rule violations (raised by triggers)
 * become 409 or 403 with a short reason.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<Request>();
    if (err instanceof HttpException) {
      const body = err.getResponse();
      return res.status(err.getStatus()).json(typeof body === "string" ? { message: body } : body);
    }
    const pgCode = (err as { code?: string }).code;
    if (pgCode === "42501") return res.status(HttpStatus.FORBIDDEN).json({ message: "Not allowed" });
    if (pgCode === "23505") return res.status(HttpStatus.CONFLICT).json({ message: "Already exists" });
    if (pgCode === "P0001" || pgCode === "23514") {
      // Business rule from the database (e.g. "Ticket type is sold out"); safe, written for users.
      return res.status(HttpStatus.CONFLICT).json({ message: (err as Error).message.slice(0, 200) });
    }
    const ref = Math.random().toString(36).slice(2, 10);
    console.error(JSON.stringify({ level: "error", ref, path: req.path, error: (err as Error).message }));
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", ref });
  }
}
