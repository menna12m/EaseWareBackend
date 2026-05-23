import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    disable: process.env.DISABLE_ADMIN === "true",
  },
  modules: [
    {
      resolve: "./src/modules/review",
    },
    {
      resolve: "./src/modules/wishlist",
    },
    {
      resolve: "./src/modules/algolia",
      options: {
        appId: process.env.ALGOLIA_APP_ID,
        adminKey: process.env.ALGOLIA_ADMIN_KEY,
        indexName: "easewear_products",
      },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: { url: process.env.REDIS_URL },
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          // Paymob is only registered when credentials are present so that
          // local dev (with blank env vars) doesn't trip validateOptions.
          ...(process.env.PAYMOB_API_KEY && process.env.PAYMOB_INTEGRATION_ID
            ? [
                {
                  resolve: "./src/modules/paymob",
                  id: "paymob",
                  options: {
                    apiKey: process.env.PAYMOB_API_KEY,
                    integrationId: process.env.PAYMOB_INTEGRATION_ID,
                    iframeId: process.env.PAYMOB_IFRAME_ID,
                  },
                },
              ]
            : []),
        ],
      },
    },
  ],
})
