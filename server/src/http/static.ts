import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname, sep, resolve } from "node:path";
import { gzipSync, brotliCompressSync, constants as Z } from "node:zlib";
import { createHash } from "node:crypto";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};
const COMPRESSIBLE = new Set([".html", ".css", ".js", ".svg", ".json", ".txt", ".xml", ".webmanifest"]);

/**
 * Strict policy for every page: no inline script, no inline style attribute, no third-party code,
 * nothing can frame the site. Google profile pictures are the only external images.
 * (When ads are enabled, the provider's domains are added here and nowhere else.)
 */
function pageCsp(ads: { enabled: boolean } | undefined, https: boolean): string {
  const adHosts = ads?.enabled ? " https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com" : "";
  return [
    "default-src 'self'", `script-src 'self'${adHosts}`, "style-src 'self'", `img-src 'self' data: https://lh3.googleusercontent.com${adHosts}`, "font-src 'self'",
    `connect-src 'self'${adHosts}`, `frame-src ${adHosts ? adHosts.trim() : "'none'"}`, "frame-ancestors 'none'", "base-uri 'none'", "form-action 'self'", "object-src 'none'", ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

interface Cached { body: Buffer; gz?: Buffer; br?: Buffer; etag: string; mtime: number; type: string }

export function createStatic(o: { root: string; appUrl: string; ads?: { enabled: boolean } }) {
  const root = resolve(o.root);
  const csp = pageCsp(o.ads, o.appUrl.startsWith("https:"));
  const cache = new Map<string, Cached>();
  const appUrl = o.appUrl.replace(/\/$/, "");

  /** /app and /admin are single-page apps; everything else maps to a file (directories to index.html). */
  function mapPath(path: string): string | null {
    let p: string;
    try { p = decodeURIComponent(path); } catch { return null; }
    if (p.includes("\0")) return null;
    if (p === "/app" || p === "/admin") return null; // redirected below
    if (p.startsWith("/app/")) p = /\.\w+$/.test(p) ? p : "/app/index.html";
    if (p.startsWith("/admin/")) p = /\.\w+$/.test(p) ? p : "/admin/index.html";
    if (p.endsWith("/")) p += "index.html";
    if (!extname(p)) p += ".html"; // /privacy -> privacy.html
    const rel = normalize(p).replace(/^([/\\])+/, "");
    const file = join(root, rel);
    if (!file.startsWith(root + sep)) return null; // path traversal
    if (rel.split(sep).some(seg => seg.startsWith("."))) return null; // no dotfiles
    return file;
  }

  async function load(file: string): Promise<Cached | null> {
    const st = await stat(file).catch(() => null);
    if (!st || !st.isFile()) return null;
    const hit = cache.get(file);
    if (hit && hit.mtime === st.mtimeMs) return hit;
    let body = await readFile(file);
    const ext = extname(file);
    if (ext === ".html" || ext === ".xml" || ext === ".txt") body = Buffer.from(body.toString("utf8").replaceAll("%APP_URL%", appUrl)); // canonical / Open Graph URLs
    const c: Cached = { body, etag: `"${createHash("sha256").update(body).digest("base64url").slice(0, 22)}"`, mtime: st.mtimeMs, type: TYPES[ext] ?? "application/octet-stream" };
    if (COMPRESSIBLE.has(ext) && body.length > 1024) { c.gz = gzipSync(body, { level: 9 }); c.br = brotliCompressSync(body, { params: { [Z.BROTLI_PARAM_QUALITY]: 10 } }); }
    cache.set(file, c);
    return c;
  }

  function headers(res: ServerResponse, ext: string, c: Cached) {
    res.setHeader("Content-Type", c.type);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("ETag", c.etag);
    res.setHeader("Vary", "Accept-Encoding");
    if (ext === ".html") {
      res.setHeader("Content-Security-Policy", csp);
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cache-Control", "no-cache");
    } else res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
  }

  return {
    /** Returns false when the path is not a static file (the caller answers 404 / API). */
    async serve(req: IncomingMessage, res: ServerResponse, path: string): Promise<boolean> {
      if (req.method !== "GET" && req.method !== "HEAD") return false;
      if (path === "/app" || path === "/admin") { res.statusCode = 308; res.setHeader("Location", `${path}/`); res.end(); return true; }
      if (path === "/sitemap.xml" || path === "/robots.txt") return serveGenerated(res, path);
      const file = mapPath(path);
      if (!file) return false;
      let c = await load(file);
      let status = 200;
      if (!c) { // a friendly 404 page for browsers
        if (!(req.headers.accept ?? "").includes("text/html")) return false;
        c = await load(join(root, "404.html"));
        if (!c) return false;
        status = 404;
      }
      const ext = status === 404 ? ".html" : extname(file);
      headers(res, ext, c);
      if (status === 200 && req.headers["if-none-match"] === c.etag) { res.statusCode = 304; res.end(); return true; }
      const ae = String(req.headers["accept-encoding"] ?? "");
      let body = c.body;
      if (c.br && /\bbr\b/.test(ae)) { body = c.br; res.setHeader("Content-Encoding", "br"); }
      else if (c.gz && /\bgzip\b/.test(ae)) { body = c.gz; res.setHeader("Content-Encoding", "gzip"); }
      res.statusCode = status;
      res.setHeader("Content-Length", body.length);
      res.end(req.method === "HEAD" ? undefined : body);
      return true;
    },
  };

  function serveGenerated(res: ServerResponse, path: string): boolean {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (path === "/robots.txt") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(`User-agent: *\nAllow: /\nDisallow: /app/\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${appUrl}/sitemap.xml\n`);
      return true;
    }
    const pages = ["/", "/support", "/legal/terms", "/legal/privacy", "/legal/reward-rules", "/legal/challenge-rules"];
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${appUrl}${p}</loc></url>`).join("\n")}\n</urlset>\n`);
    return true;
  }
}
