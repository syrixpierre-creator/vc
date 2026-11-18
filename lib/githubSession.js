/**
 * QUEEN AKUMA — GitHub Session Manager (v2.9.2)
 * Ported from QUEEN-AKUMA-Mini lib/githubSession.js — same idea, cleaned up:
 *   WhatsApp session (creds.json) GitHub repo me save/restore hoti hai,
 *   taaki Render/Railway/Heroku jaise hosts par restart ke baad bhi
 *   dobara pair na karna pade (wahan files delete ho jati hain).
 *
 * Layout (Mishu jaisa): users/<number>/creds.json
 *
 * SECURITY — Mishu ki file me token HARDCODED tha. Yahan aisa NAHI hai:
 *   Token sirf env var se aata hai (GITHUB_TOKEN). Kabhi file me mat likho,
 *   kabhi share mat karo, kabhi commit mat karo.
 *   Repo HAMESHA PRIVATE rakho — creds.json = poora WhatsApp access.
 *   Token ko GitHub par `repo` scope do (classic PAT) ya fine-grained
 *   token me Contents: Read & Write do.
 *
 * Env vars:
 *   GITHUB_TOKEN  — GitHub personal access token (repo scope)
 *   GITHUB_REPO   — "owner/repo" jaise ton-user/QUEEN-AKUMA-SESSIONS (PRIVATE repo)
 *   GITHUB_BRANCH — default "main"
 */
'use strict';

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getConfig() {
  return {
    token: process.env.GITHUB_TOKEN || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

function isConfigured() {
  const c = getConfig();
  return !!(c.token && c.repo && c.repo.includes('/'));
}

function sessionPath(number) {
  const num = String(number || process.env.PAIRING_NUMBER || global.PAIRING_NUMBER || '554488138425').replace(/[^0-9]/g, '');
  return `users/${num}/creds.json`;
}

function localCredsPath() {
  return path.join(__dirname, '..', 'session', 'creds.json');
}

function githubApi() {
  const c = getConfig();
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `token ${c.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    timeout: 20000,
  });
}

async function getGitHubFile(filePath) {
  const c = getConfig();
  try {
    const res = await githubApi().get(`/repos/${c.repo}/contents/${filePath}`, { params: { ref: c.branch } });
    if (res.data && res.data.content) {
      return JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
    }
    return null;
  } catch (e) {
    if (e.response && e.response.status === 404) return null;
    console.error('[GitHub] Get file error:', (e.response && e.response.data && e.response.data.message) || e.message);
    return null;
  }
}

async function saveGitHubFile(filePath, data, message) {
  const c = getConfig();
  try {
    let sha = null;
    try {
      const res = await githubApi().get(`/repos/${c.repo}/contents/${filePath}`, { params: { ref: c.branch } });
      sha = res.data.sha;
    } catch (_) { /* naya file — SHA nahi chahiye */ }
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const payload = { message: message || `Update ${filePath}`, content, branch: c.branch };
    if (sha) payload.sha = sha;
    const res = await githubApi().put(`/repos/${c.repo}/contents/${filePath}`, payload);
    if (res.status === 200 || res.status === 201) {
      console.log(`[GitHub] ✅ File saved: ${filePath}`);
      return res.data;
    }
    return null;
  } catch (e) {
    console.error('[GitHub] Save file error:', (e.response && e.response.data && e.response.data.message) || e.message);
    return null;
  }
}

async function deleteGitHubFile(filePath, message) {
  const c = getConfig();
  try {
    const res = await githubApi().get(`/repos/${c.repo}/contents/${filePath}`, { params: { ref: c.branch } });
    if (!res.data || !res.data.sha) return false;
    await githubApi().delete(`/repos/${c.repo}/contents/${filePath}`, {
      data: { message: message || `Delete ${filePath}`, sha: res.data.sha, branch: c.branch },
    });
    console.log(`[GitHub] ✅ File deleted: ${filePath}`);
    return true;
  } catch (e) {
    if (e.response && e.response.status === 404) return true;
    console.error('[GitHub] Delete file error:', (e.response && e.response.data && e.response.data.message) || e.message);
    return false;
  }
}

// ---- Session functions (Mishu ke naam, wahi kaam) ----

async function saveSessionToGitHub(number, creds) {
  if (!isConfigured()) return false;
  try {
    const result = await saveGitHubFile(sessionPath(number), creds, `Update session for ${number || ''}`);
    if (result) { console.log(`[GitHub] 💾 Session saved for ${number || 'owner'}`); return true; }
    return false;
  } catch (e) {
    console.error('[GitHub] Save session error:', e.message);
    return false;
  }
}

async function getSessionFromGitHub(number) {
  if (!isConfigured()) return null;
  try {
    const data = await getGitHubFile(sessionPath(number));
    if (data) console.log(`[GitHub] 📥 Session loaded for ${number || 'owner'}`);
    return data;
  } catch (e) {
    console.error('[GitHub] Get session error:', e.message);
    return null;
  }
}

async function deleteSessionFromGitHub(number) {
  if (!isConfigured()) return false;
  return deleteGitHubFile(sessionPath(number), `Delete session for ${number || ''}`);
}

// ---- QUEEN AKUMA helpers: local file <-> GitHub ----

// Local ./session/creds.json padh ke GitHub par save karo.
async function saveCurrentSession(number) {
  if (!isConfigured()) return { ok: false, error: 'GitHub session set nahi hai — GITHUB_TOKEN aur GITHUB_REPO env var set karo.' };
  const p = localCredsPath();
  if (!fs.existsSync(p)) return { ok: false, error: 'Local session nahi mili — bot abhi paired nahi hai.' };
  let creds;
  try { creds = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return { ok: false, error: 'Session file kharab hai.' }; }
  const ok = await saveSessionToGitHub(number, creds);
  return ok
    ? { ok: true, path: sessionPath(number), repo: getConfig().repo }
    : { ok: false, error: 'GitHub par save nahi hua — token/repo check karo.' };
}

// GitHub se download karke local ./session/creds.json likho (restart ke baad chalega).
async function restoreSessionToLocal(number) {
  if (!isConfigured()) return { ok: false, error: 'GitHub session set nahi hai — GITHUB_TOKEN aur GITHUB_REPO env var set karo.' };
  const creds = await getSessionFromGitHub(number);
  if (!creds) return { ok: false, error: 'GitHub par session nahi mili — pehle .ghsave se save karo.' };
  try {
    fs.mkdirSync(path.dirname(localCredsPath()), { recursive: true });
    fs.writeFileSync(localCredsPath(), JSON.stringify(creds, null, 2));
    return { ok: true, path: sessionPath(number), repo: getConfig().repo };
  } catch (e) {
    return { ok: false, error: 'Local save fail: ' + e.message };
  }
}

// ---- Auto-save: creds.update par call hota hai (debounced, 10s) ----
let saveTimer = null;
let lastHash = '';
function scheduleAutoSave(number) {
  if (!isConfigured()) return;
  if (saveTimer) return; // pehle se ek save wait kar raha hai
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try {
      const p = localCredsPath();
      if (!fs.existsSync(p)) return;
      const raw = fs.readFileSync(p, 'utf8');
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      if (hash === lastHash) return; // kuch badla nahi — API call mat karo
      lastHash = hash;
      await saveSessionToGitHub(number, JSON.parse(raw));
    } catch (_) { /* auto-save kabhi bot ko crash nahi karega */ }
  }, 10000);
}

module.exports = {
  isConfigured, getConfig, sessionPath,
  getGitHubFile, saveGitHubFile, deleteGitHubFile,
  saveSessionToGitHub, getSessionFromGitHub, deleteSessionFromGitHub,
  saveCurrentSession, restoreSessionToLocal, scheduleAutoSave,
};
