import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { DbService } from "../db/db.service.js";

/**
 * GET /health: used by Cloud Run and the deploy pipeline. Checks the database answers and
 * reports how many migrations are applied. Never returns configuration or secrets.
 */
@Controller("health")
export class HealthController {
  constructor(private readonly db: DbService) {}

  @Get()
  async health() {
    try {
      const r = await this.db.pool.query("select count(*)::int as migrations from schema_migrations");
      return { status: "ok", migrations: r.rows[0].migrations, time: new Date().toISOString() };
    } catch {
      throw new HttpException({ status: "error", reason: "database unavailable" }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
