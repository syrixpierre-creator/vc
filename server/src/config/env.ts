export interface AppConfig {
  nodeEnv: "development" | "test" | "production";
  appUrl: string;
  databaseUrl: string;
  redisUrl: string;
  sessionSecret: string;
  /** 32 bytes, hex encoded (64 chars) */
  encryptionKey: string;
  adminEmail: string;
  google: { clientId: string; clientSecret: string; redirectUri: string };
  emailFrom?: string;
  emailProviderApiKey?: string;
  logLevel: "debug" | "info" | "warn" | "error";
  /** ads are off unless explicitly enabled with a provider client id */
  ads: { enabled: boolean; clientId?: string };
}

export class ConfigError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`Invalid configuration:\n- ${problems.join("\n- ")}`);
    this.problems = problems;
  }
}

type Env = Record<string, string | undefined>;

/** Validates required settings at startup. Error messages name the variable, never its value. */
export function loadConfig(env: Env = process.env): AppConfig {
  const problems: string[] = [];
  const get = (k: string) => (env[k] ?? "").trim();
  const need = (k: string) => { const v = get(k); if (!v) problems.push(`${k} is required`); return v; };

  const nodeEnv = (get("NODE_ENV") || "development") as AppConfig["nodeEnv"];
  if (!["development", "test", "production"].includes(nodeEnv)) problems.push("NODE_ENV must be development, test or production");
  const prod = nodeEnv === "production";

  const appUrl = need("APP_URL");
  if (appUrl) {
    try {
      const u = new URL(appUrl);
      if (prod && u.protocol !== "https:") problems.push("APP_URL must use https in production");
    } catch { problems.push("APP_URL must be a valid URL"); }
  }

  const databaseUrl = need("DATABASE_URL");
  if (databaseUrl && !/^postgres(ql)?:\/\//.test(databaseUrl)) problems.push("DATABASE_URL must be a PostgreSQL URL");
  const redisUrl = need("REDIS_URL");
  if (redisUrl && !/^rediss?:\/\//.test(redisUrl)) problems.push("REDIS_URL must be a Redis URL");

  const sessionSecret = need("SESSION_SECRET");
  if (sessionSecret && sessionSecret.length < 32) problems.push("SESSION_SECRET must be at least 32 characters");
  const encryptionKey = need("ENCRYPTION_KEY");
  if (encryptionKey && !/^[0-9a-fA-F]{64}$/.test(encryptionKey)) problems.push("ENCRYPTION_KEY must be 64 hex characters (32 bytes)");

  const adminEmail = need("ADMIN_EMAIL").toLowerCase();
  if (adminEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) problems.push("ADMIN_EMAIL must be an email address");

  const clientId = need("GOOGLE_CLIENT_ID");
  const clientSecret = need("GOOGLE_CLIENT_SECRET");
  const redirectUri = need("GOOGLE_REDIRECT_URI");
  if (redirectUri) {
    try { if (prod && new URL(redirectUri).protocol !== "https:") problems.push("GOOGLE_REDIRECT_URI must use https in production"); }
    catch { problems.push("GOOGLE_REDIRECT_URI must be a valid URL"); }
  }

  const logLevel = (get("LOG_LEVEL") || "info") as AppConfig["logLevel"];
  if (!["debug", "info", "warn", "error"].includes(logLevel)) problems.push("LOG_LEVEL must be debug, info, warn or error");

  const adsEnabled = get("ADS_ENABLED").toLowerCase() === "true";
  const adsClientId = get("ADS_CLIENT_ID");
  if (adsEnabled && !adsClientId) problems.push("ADS_CLIENT_ID is required when ADS_ENABLED=true");

  if (problems.length) throw new ConfigError(problems);

  const cfg: AppConfig = {
    nodeEnv, appUrl, databaseUrl, redisUrl, sessionSecret, encryptionKey, adminEmail,
    google: { clientId, clientSecret, redirectUri }, logLevel,
    ads: adsEnabled ? { enabled: true, clientId: adsClientId } : { enabled: false },
  };
  if (get("EMAIL_FROM")) cfg.emailFrom = get("EMAIL_FROM");
  if (get("EMAIL_PROVIDER_API_KEY")) cfg.emailProviderApiKey = get("EMAIL_PROVIDER_API_KEY");
  return cfg;
}
