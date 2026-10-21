import { h, icon, t, tOr } from "/js/core.js";

export function pageHead(title, sub, actions = []) {
  return h("div", { class: "page-head" }, h("div", {}, h("h1", {}, title), sub ? h("p", { class: "sub" }, sub) : null), actions.length ? h("div", { class: "actions" }, actions) : null);
}
export function kpi(label, value, { sub, iconName, accent = false, id } = {}) {
  return h("div", { class: `kpi${accent ? " accent" : ""}`, id }, h("div", { class: "k-label" }, iconName ? icon(iconName) : null, label), h("div", { class: "k-value" }, value), sub ? h("div", { class: "k-sub" }, sub) : null);
}
export function section(title, right) { return h("h2", { class: "section-title" }, h("span", {}, title), right ?? null); }
export function card(title, body, { sub, right, cls = "" } = {}) {
  return h("section", { class: `card ${cls}`.trim() }, title ? h("div", { class: "card-head" }, h("div", {}, h("h2", {}, title), sub ? h("div", { class: "sub" }, sub) : null), right ?? null) : null, body);
}

const TONE = {
  sync: { synced: "ok", pending: "warn", paused: "warn", failed: "bad", conflict: "bad", local_only: "" },
  conn: { connected: "ok", not_connected: "", revoked: "bad", refresh_failed: "bad", reconnect_requested: "warn" },
  payout: { pending: "warn", in_progress: "blue", action_required: "warn", paid: "ok", failed: "bad", rejected: "bad" },
  claim: { pending: "warn", in_progress: "blue", completed: "ok", failed: "bad", action_required: "warn", rejected: "bad" },
  challenge: { upcoming: "", active: "blue", completed: "ok", reward_pending: "warn", reward_in_progress: "blue", reward_delivered: "ok", expired: "", rejected: "bad" },
  referral: { pending: "warn", qualified: "ok", under_review: "blue", disqualified: "bad" },
  ticket: { open: "blue", pending: "warn", closed: "" },
};
/** A badge for a state of one of the state machines (translated label `status.<state>` or `<kind>.<state>`). */
export function statusBadge(kind, state) {
  const label = tOr(`${kind}St.${state}`, tOr(`status.${state}`, state));
  return h("span", { class: `badge ${TONE[kind]?.[state] ?? ""}`, "data-state": state }, h("span", { class: "dot" }), label);
}
export const diffBadge = d => h("span", { class: `diff-badge diff-${d}` }, t(`diff.${d}`));
export function labelChip(l) { return h("span", { class: `label-chip c-${l.color}` }, l.name); }
export function methodMark(kind) { return h("span", { class: `mk ${kind}`, "aria-hidden": "true" }, kind === "paypal" ? "PP" : kind === "pix" ? "PIX" : "BP"); }
export const methodName = kind => t(`method.${kind}`);
export function backLink(href, text) { return h("a", { class: "btn btn-ghost btn-sm", href }, icon("chevron-left", "flip"), text); }
