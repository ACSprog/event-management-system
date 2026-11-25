import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { loadConfig } from "./config.js";
import { AllExceptionsFilter } from "./common/errors.js";
import { requestLog } from "./common/request-log.js";

/**
 * EMS backend. Runs on Cloud Run behind the website, which forwards /api/* here.
 * Security: Helmet headers, no CORS (the website is the only caller, same origin), rate
 * limiting, JSON body limit, errors without internal details, structured logs without
 * personal data.
 */
async function bootstrap() {
  const config = loadConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ["error", "warn"], bodyParser: false });
  app.set("trust proxy", true);       // Cloud Run and the website proxy set X-Forwarded-For
  app.disable("x-powered-by");
  app.use(helmet());
  app.useBodyParser("json", { limit: "100kb" });
  app.use(requestLog);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();
  await app.listen(config.PORT, "0.0.0.0");
  // Nothing from the environment is logged: it also holds secrets.
  console.log(JSON.stringify({ level: "info", msg: "api started" }));
}

bootstrap().catch((e) => {
  console.error(JSON.stringify({ level: "error", msg: "api failed to start", error: (e as Error).message }));
  process.exit(1);
});
