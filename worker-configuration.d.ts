interface Env {
  DB: D1Database;
  SESSION_SECRET: string;
  ADMIN_EXPORT_SECRET?: string;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
      ctx: ExecutionContext;
      caches: CacheStorage;
    };
  }
}
