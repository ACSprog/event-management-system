import { Global, Module } from "@nestjs/common";
import { loadConfig } from "./config.js";
import { CONFIG } from "./tokens.js";

/** Makes the checked configuration available everywhere. */
@Global()
@Module({ providers: [{ provide: CONFIG, useFactory: () => loadConfig() }], exports: [CONFIG] })
export class ConfigModule {}
