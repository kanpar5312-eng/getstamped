"use server";

import { promises as fs } from "fs";
import path from "path";
import { ALLOWED, type EnvStatus } from "@/lib/dev-env-config";

/**
 * DEV-ONLY env manager actions.
 *
 * Reads + writes .env.local at the project root. Hard-gated to development:
 * any call from a production build throws. Even when development, only the
 * keys listed in ALLOWED can be written — typoed names are rejected so we
 * never leak random user input into the env file.
 *
 * The key value never returns from the server — only a masked preview
 * ("…abc4") and a "present/absent" flag.
 */

const ENV_PATH = path.join(process.cwd(), ".env.local");

function devOnly() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("This endpoint is only available in development.");
  }
}

async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(ENV_PATH, "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      if (!line || /^\s*#/.test(line)) continue;
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[m[1]] = val;
    }
    return out;
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw e;
  }
}

async function writeEnvFile(map: Record<string, string>) {
  let raw = "";
  try {
    raw = await fs.readFile(ENV_PATH, "utf8");
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  const lines = raw.split(/\r?\n/);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const line of lines) {
    if (!line) { out.push(line); continue; }
    if (/^\s*#/.test(line)) { out.push(line); continue; }
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) { out.push(line); continue; }
    const key = m[1];
    if (key in map) {
      const v = map[key];
      out.push(`${key}=${needsQuotes(v) ? JSON.stringify(v) : v}`);
      seen.add(key);
    } else {
      out.push(line);
    }
  }
  for (const [k, v] of Object.entries(map)) {
    if (!seen.has(k)) {
      out.push(`${k}=${needsQuotes(v) ? JSON.stringify(v) : v}`);
    }
  }
  let joined = out.join("\n");
  if (!joined.endsWith("\n")) joined += "\n";
  await fs.writeFile(ENV_PATH, joined, { mode: 0o600 });
}

function needsQuotes(v: string): boolean {
  return /\s|"|'|#|=/.test(v);
}

function mask(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "…" + value.slice(-2);
  return "…" + value.slice(-4);
}

export async function readEnvStatus(): Promise<EnvStatus[]> {
  devOnly();
  const env = await readEnvFile();
  return ALLOWED.map((a) => {
    const value = env[a.key] ?? "";
    return {
      key: a.key,
      label: a.label,
      hint: a.hint,
      secret: a.secret,
      pattern: a.pattern,
      present: Boolean(value),
      masked: a.secret ? (value ? mask(value) : "") : value,
    };
  });
}

export async function saveEnvKey(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  devOnly();
  const rawKey = formData.get("key");
  const rawValue = formData.get("value");

  if (typeof rawKey !== "string" || typeof rawValue !== "string") {
    return { ok: false, error: "Invalid form payload." };
  }

  const allowed = ALLOWED.find((a) => a.key === rawKey);
  if (!allowed) return { ok: false, error: "That key is not on the allowlist." };

  const value = rawValue.trim();
  if (!value) return { ok: false, error: "Value is empty." };

  if (allowed.pattern) {
    const re = new RegExp(allowed.pattern);
    if (!re.test(value)) {
      return { ok: false, error: `Value doesn't match expected format for ${allowed.label}.` };
    }
  }

  const existing = await readEnvFile();
  existing[rawKey] = value;
  await writeEnvFile(existing);
  return { ok: true };
}

export async function clearEnvKey(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  devOnly();
  const rawKey = formData.get("key");
  if (typeof rawKey !== "string") return { ok: false, error: "Invalid payload." };
  const allowed = ALLOWED.find((a) => a.key === rawKey);
  if (!allowed) return { ok: false, error: "Not on allowlist." };

  const existing = await readEnvFile();
  delete existing[rawKey];
  await writeEnvFile(existing);
  return { ok: true };
}
