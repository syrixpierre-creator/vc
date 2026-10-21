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
  emailProvider: "none" | "resend";
  /** encryption keys for rotation: version -> 64 hex chars; `encryptionKeyVersion` is the one used for new data */
  encryptionKeys: Record<number, string>;
  encryptionKeyVersion: number;
  supportEmail: string;
  port: number;
  trustProxy: boolean;
  webRoot: string;
  alertWebhookUrl?: string;
  syncRatePerSecond: number;
  workerConcurrency: number;
  version: string;
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

  const emailProvider = (get("EMAIL_PROVIDER") || (get("EMAIL_PROVIDER_API_KEY") ? "resend" : "none")) as AppConfig["emailProvider"];
  if (!["none", "resend"].includes(emailProvider)) problems.push("EMAIL_PROVIDER must be none or resend");
  if (emailProvider !== "none" && !get("EMAIL_PROVIDER_API_KEY")) problems.push("EMAIL_PROVIDER_API_KEY is required when EMAIL_PROVIDER is set");
  if (emailProvider !== "none" && !get("EMAIL_FROM")) problems.push("EMAIL_FROM is required when EMAIL_PROVIDER is set");

  const encryptionKeyVersion = Number(get("ENCRYPTION_KEY_VERSION") || "1");
  if (!Number.isInteger(encryptionKeyVersion) || encryptionKeyVersion < 1 || encryptionKeyVersion > 99) problems.push("ENCRYPTION_KEY_VERSION must be an integer between 1 and 99");
  const encryptionKeys: Record<number, string> = {};
  for (const part of get("ENCRYPTION_KEYS_PREVIOUS").split(",").map(x => x.trim()).filter(Boolean)) {
    const m = /^(\d{1,2}):([0-9a-fA-F]{64})$/.exec(part);
    if (!m) { problems.push("ENCRYPTION_KEYS_PREVIOUS must look like 1:<64 hex>,2:<64 hex>"); break; }
    encryptionKeys[Number(m[1])] = m[2]!;
  }
  if (encryptionKey) encryptionKeys[encryptionKeyVersion] = encryptionKey;

  const port = Number(get("PORT") || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) problems.push("PORT must be a TCP port");
  const alertWebhookUrl = get("ALERT_WEBHOOK_URL");
  if (alertWebhookUrl) { try { if (new URL(alertWebhookUrl).protocol !== "https:") problems.push("ALERT_WEBHOOK_URL must use https"); } catch { problems.push("ALERT_WEBHOOK_URL must be a valid URL"); } }
  const syncRatePerSecond = Number(get("SYNC_RATE_PER_SECOND") || "5");
  const workerConcurrency = Number(get("WORKER_CONCURRENCY") || "4");
  if (!(syncRatePerSecond >= 1 && syncRatePerSecond <= 100)) problems.push("SYNC_RATE_PER_SECOND must be between 1 and 100");
  if (!(workerConcurrency >= 1 && workerConcurrency <= 32)) problems.push("WORKER_CONCURRENCY must be between 1 and 32");
  const supportEmail = (get("SUPPORT_EMAIL") || adminEmail).toLowerCase();

  if (problems.length) throw new ConfigError(problems);

  const cfg: AppConfig = {
    nodeEnv, appUrl, databaseUrl, redisUrl, sessionSecret, encryptionKey, adminEmail,
    google: { clientId, clientSecret, redirectUri }, logLevel,
    ads: adsEnabled ? { enabled: true, clientId: adsClientId } : { enabled: false },
    emailProvider, encryptionKeys, encryptionKeyVersion, supportEmail, port,
    trustProxy: (get("TRUST_PROXY") || (prod ? "true" : "false")) === "true",
    webRoot: get("WEB_ROOT") || new URL("../../../web", import.meta.url).pathname,
    syncRatePerSecond, workerConcurrency, version: get("APP_VERSION") || "1.0.0",
    ...(alertWebhookUrl ? { alertWebhookUrl } : {}),
  };
  if (get("EMAIL_FROM")) cfg.emailFrom = get("EMAIL_FROM");
  if (get("EMAIL_PROVIDER_API_KEY")) cfg.emailProviderApiKey = get("EMAIL_PROVIDER_API_KEY");
  return cfg;
}
