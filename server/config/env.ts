import "dotenv/config";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT) || 5555,
  mongoUri: required("MONGO_URI"),
  // Fallback keeps local dev working before a secret is configured.
  sessionSecret: process.env.SESSION_SECRET || "dev-only-insecure-secret",
};
