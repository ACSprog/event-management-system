import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import pg from "pg";
import type { Config } from "../config.js";
import { CONFIG } from "../tokens.js";

/** Who is making the request. Set by the auth layer; anonymous when signed out. */
export interface RequestContext {
  userId: string | null;
  orgId: string | null;
  platformRole: string | null;
}

export const ANONYMOUS: RequestContext = { userId: null, orgId: null, platformRole: null };

/**
 * Database access. Every unit of work runs in a transaction that first calls
 * app.set_context(user, organisation, platform role), so PostgreSQL's row-level security
 * decides what this request may see or change. The API connects as ems_api_login (a member
 * of ems_api), never as the table owner, so RLS can't be bypassed from here.
 */
@Injectable()
export class DbService implements OnModuleDestroy {
  readonly pool: pg.Pool;

  constructor(@Inject(CONFIG) config: Config) {
    this.pool = config.DATABASE_URL
      ? new pg.Pool({ connectionString: config.DATABASE_URL, max: config.DB_POOL_MAX })
      : new pg.Pool({ host: config.DB_HOST, database: config.DB_NAME, user: config.DB_USER, password: config.DB_PASSWORD, max: config.DB_POOL_MAX });
    // bigint (ngwee) comes back as a string by default; money stays exact as a string in JSON.
    this.pool.on("error", (e) => console.error(JSON.stringify({ level: "error", msg: "db pool error", error: e.message })));
  }

  async withContext<T>(ctx: RequestContext, work: (db: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      await client.query("select app.set_context($1::uuid, $2::uuid, $3::text)", [ctx.userId, ctx.orgId, ctx.platformRole]);
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (e) {
      await client.query("rollback").catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
