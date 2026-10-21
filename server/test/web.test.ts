import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, copyFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const web = new URL("../../web/", import.meta.url).pathname;
const files: string[] = [];
(function walk(d: string) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith(".js")) files.push(p); } })(join(web, "js"));
files.push(join(web, "ads.js"));

test("every browser module parses (a syntax error would blank a whole page)", () => {
  const dir = mkdtempSync(join(tmpdir(), "syrix-webcheck-"));
  const bad: string[] = [];
  for (const f of files) {
    const copy = join(dir, "m.mjs"); // checked as an ES module, like the browser loads it
    copyFileSync(f, copy);
    const r = spawnSync(process.execPath, ["--check", copy], { encoding: "utf8" });
    if (r.status !== 0) bad.push(`${f.slice(web.length)}: ${r.stderr.split("\n").find(l => l.includes("Error")) ?? r.stderr}`);
  }
  assert.ok(files.length > 25, `found ${files.length} modules`);
  assert.deepEqual(bad, []);
});
