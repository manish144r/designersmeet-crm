// Composition root. Reads DATA_PROVIDER + QUEUE_PROVIDER from env and wires up
// the appropriate concrete implementations.
import { config } from "./config.js";
import { logger } from "./logger.js";
import { buildDataverseRepos } from "./repositories/dataverse/index.js";
import { buildInMemoryRepos } from "./repositories/memory/index.js";
import { ensureSchema } from "./repositories/sqlserver/db.js";
import { buildSqlServerRepos } from "./repositories/sqlserver/index.js";
import type { Repositories } from "./repositories/interfaces.js";
import { seedInMemory } from "./seed.js";
import { seedComprehensive } from "./seedComprehensive.js";
import { AzureServiceBusQueueService } from "./queue/azureServiceBusQueue.js";
import { InMemoryQueueService } from "./queue/inMemoryQueue.js";
import { SupabaseQueueService } from "./queue/supabaseQueue.js";
import type { IQueueService } from "./queue/IQueueService.js";
import { LinkedInPoster } from "./integrations/social/linkedInPoster.js";
import { FacebookPoster } from "./integrations/social/facebookPoster.js";
import { InstagramPoster } from "./integrations/social/instagramPoster.js";
import type { ISocialPoster } from "./integrations/social/ISocialPoster.js";
import type { SocialPlatform } from "@dm/shared";

class Container {
  private _repos: Repositories | null = null;
  private _queue: IQueueService | null = null;
  private _social: Map<SocialPlatform, ISocialPoster> = new Map();

  async init(): Promise<void> {
    // 1. Repositories
    switch (config.DATA_PROVIDER) {
      case "dataverse":
        this._repos = buildDataverseRepos();
        break;
      case "sqlserver":
        await ensureSchema();
        this._repos = buildSqlServerRepos();
        break;
      case "memory":
      default:
        this._repos = buildInMemoryRepos();
        seedInMemory();
        seedComprehensive();
        break;
    }
    logger.info({ provider: config.DATA_PROVIDER }, "Repositories wired");

    // 2. Queue
    // Fix #5: Warn about in-memory queue data loss risk in production.
    let effectiveQueueProvider = config.QUEUE_PROVIDER;
    if (effectiveQueueProvider === "memory" && config.NODE_ENV === "production") {
      if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY) {
        logger.warn("QUEUE_PROVIDER=memory in production. Auto-upgrading to Supabase queue to prevent data loss.");
        effectiveQueueProvider = "supabase";
      } else {
        logger.warn(
          "QUEUE_PROVIDER=memory in production — pending messages WILL BE LOST on restart. " +
          "Set QUEUE_PROVIDER=supabase or azure-service-bus for persistence.",
        );
      }
    }

    switch (effectiveQueueProvider) {
      case "azure-service-bus":
        this._queue = new AzureServiceBusQueueService(this._repos.queueLog);
        break;
      case "supabase":
        this._queue = new SupabaseQueueService(this._repos.queueLog);
        break;
      case "memory":
      default:
        this._queue = new InMemoryQueueService(this._repos.queueLog);
        break;
    }
    logger.info({ provider: effectiveQueueProvider }, "Queue wired");

    // 3. Social posters
    this._social.set("linkedin", new LinkedInPoster());
    this._social.set("facebook", new FacebookPoster());
    this._social.set("instagram", new InstagramPoster());
  }

  get repos(): Repositories {
    if (!this._repos) throw new Error("Container not initialised");
    return this._repos;
  }

  get queue(): IQueueService {
    if (!this._queue) throw new Error("Container not initialised");
    return this._queue;
  }

  socialPoster(platform: SocialPlatform): ISocialPoster {
    const poster = this._social.get(platform);
    if (!poster) throw new Error(`No poster registered for platform ${platform}`);
    return poster;
  }
}

export const container = new Container();
