import { z } from 'zod';

// Boot-time env validation — fail fast.
export const envSchema = z.object({
  DATABASE_URL: z.string().default('pglite://test'), // PGlite adapter in tests
  JWT_ACCESS_SECRET: z.string().min(32).default('dev_access_secret_0123456789abcdef0123456789abcdef'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev_refresh_secret_0123456789abcdef0123456789abcdef'),
  ACCESS_TOKEN_TTL: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  OTP_PROVIDER: z.enum(['console', 'msg91', 'twilio']).default('console'),
  GEMINI_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  ADMIN_SEED_EMAIL: z.string().default('admin@kai.local'),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (): Env => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  return parsed.data;
};
