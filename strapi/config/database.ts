import { parse } from "pg-connection-string"

export default ({ env }) => {
  const url = env("DATABASE_URL")

  if (url) {
    const cfg = parse(url)
    return {
      connection: {
        client: "postgres",
        connection: {
          host: cfg.host,
          port: cfg.port ? Number(cfg.port) : 5432,
          database: cfg.database,
          user: cfg.user,
          password: cfg.password,
          ssl: env.bool("DATABASE_SSL", false)
            ? { rejectUnauthorized: env.bool("DATABASE_SSL_REJECT_UNAUTHORIZED", false) }
            : false,
          schema: env("DATABASE_SCHEMA", "public"),
        },
        pool: { min: env.int("DATABASE_POOL_MIN", 2), max: env.int("DATABASE_POOL_MAX", 10) },
        acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
      },
    }
  }

  return {
    connection: {
      client: "postgres",
      connection: {
        host: env("DATABASE_HOST", "127.0.0.1"),
        port: env.int("DATABASE_PORT", 5432),
        database: env("DATABASE_NAME", "strapi_easewear"),
        user: env("DATABASE_USERNAME", "postgres"),
        password: env("DATABASE_PASSWORD", "postgres"),
        ssl: env.bool("DATABASE_SSL", false),
        schema: env("DATABASE_SCHEMA", "public"),
      },
      pool: { min: env.int("DATABASE_POOL_MIN", 2), max: env.int("DATABASE_POOL_MAX", 10) },
    },
  }
}
