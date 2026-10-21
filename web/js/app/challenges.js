import { h, icon, t, api, act, num, money, date, ago, toast, progressBar, empty } from "/js/core.js";
import { pageHead, statusBadge, diffBadge } from "/js/app/ui.js";

/* Monthly challenges: server-computed progress, join, claim (winner cap and budget enforced by the server), terms, share card. */
export default async function challenges() {
  const view = h("div", {});
  const state = { filter: "active", diff: "" };
  let items = [];
  async function load() { items = (await api("/api/challenges")).items; draw(); }
  const rewardText = c => c.rewardType === "cash" ? money(c.rewardCents) : c.rewardType === "xp" || c.rewardType === "vip" ? `${num(c.rewardXp ?? 0)} XP` : t(`reward.${c.rewardType}`);
  function draw() {
    const now = Date.now();
    const shown = items.filter(c => (!state.diff || c.difficulty === state.diff) && (state.filter === "all" || (state.filter === "mine" ? c.joined : state.filter === "active" ? c.status !== "expired" && c.endsAt > now && c.startsAt <= now : c.startsAt > now)));
    const seg = h("div", { class: "seg", role: "group", "aria-label": t("ch.filter") }, ["active", "mine", "upcoming", "all"].map(f => h("button", { type: "button", "aria-pressed": String(state.filter === f), onclick: () => { state.filter = f; draw(); } }, t(`ch.f.${f}`))));
    const diffSel = h("select", { class: "select select-sm", style: { width: "auto" }, "aria-label": t("ch.difficulty"), onchange: e => { state.diff = e.target.value; draw(); } },
      h("option", { value: "" }, t("ch.allTiers")), ["advanced", "expert", "elite", "legendary"].map(d => h("option", { value: d, selected: d === state.diff }, t(`diff.${d}`))));
    view.replaceChildren(
      pageHead(t("nav.challenges"), t("ch.sub"), [h("a", { class: "btn", href: "#/progress" }, icon("crown"), t("ch.progressLink")), h("a", { class: "btn", href: "/legal/challenge-rules", target: "_blank", rel: "noopener" }, icon("scroll"), t("ch.rules"))]),
      h("div", { class: "toolbar" }, seg, diffSel),
      shown.length ? h("div", { class: "ch-grid" }, shown.map(cardFor)) : h("div", { class: "table-wrap" }, empty("target", t("ch.none"), t("ch.noneP"))));
  }
  function cardFor(c) {
    const ended = c.endsAt <= Date.now();
    const canJoin = !c.joined && !ended && c.startsAt <= Date.now();
    const canClaim = c.joined && !c.claimed && c.status === "completed";
    const action = canJoin ? h("button", { class: "btn btn-primary btn-sm", type: "button", onclick: e => act(async () => { await api(`/api/challenges/${c.id}/join`, { method: "POST", body: {} }); toast(t("ch.joined")); await load(); }, { btn: e.currentTarget }) }, icon("plus"), t("ch.join"))
      : canClaim ? h("button", { class: "btn btn-brand btn-sm", type: "button", onclick: e => act(async () => { const r = await api(`/api/challenges/${c.id}/claim`, { method: "POST", body: {} }); toast(t(r.status === "reward_pending" ? "ch.claimPending" : "ch.claimed")); await load(); }, { btn: e.currentTarget }) }, icon("gift"), t("ch.claim"))
      : c.joined && c.status === "completed" || c.claimed ? h("a", { class: "btn btn-sm", href: `/api/share/card.svg?kind=challenge&challenge=${c.id}`, download: `syrix-${c.slug}.svg` }, icon("share"), t("ch.share")) : null;
    return h("article", { class: `ch-card diff-${c.difficulty}` },
      h("div", { class: "row between" }, diffBadge(c.difficulty), statusBadge("challenge", c.status)),
      h("h3", {}, c.title), h("p", { class: "desc" }, c.description),
      c.joined ? h("div", { class: "stack" }, h("div", { class: "row between small" }, h("span", { class: "muted" }, t(`metric.${c.metric}`)), h("b", { class: "num" }, `${num(c.progress)} / ${num(c.threshold)}`)), progressBar(c.progress, c.threshold, c.status === "completed" || c.claimed ? "ok" : ""))
        : h("div", { class: "row small muted" }, icon("target", "i-sm"), t("ch.goal", { n: c.threshold, metric: t(`metric.${c.metric}`) })),
      h("div", { class: "ch-meta" },
        h("span", {}, icon("gift"), rewardText(c)),
        h("span", {}, icon("calendar"), ended ? t("ch.endedOn", { date: date(c.endsAt) }) : c.startsAt > Date.now() ? t("ch.startsOn", { date: date(c.startsAt) }) : t("ch.ends", { when: ago(c.endsAt) })),
        c.maxWinners ? h("span", {}, icon("trophy"), t("ch.winners", { n: c.winners, max: c.maxWinners })) : null,
        h("span", {}, icon("users"), t("ch.participants", { n: c.participants })),
        c.reviewRequired ? h("span", {}, icon("shield"), t("ch.reviewed")) : null),
      h("details", { class: "small" }, h("summary", { class: "muted" }, t("ch.terms")), h("p", { class: "muted mt-1" }, c.terms),
        c.eligibility?.minAccountAgeDays || c.eligibility?.minLevel ? h("p", { class: "xs faint mt-1" }, [c.eligibility.minAccountAgeDays ? t("ch.eligAge", { n: c.eligibility.minAccountAgeDays }) : null, c.eligibility.minLevel ? t("ch.eligLevel", { n: c.eligibility.minLevel }) : null].filter(Boolean).join(" · ")) : null,
        h("p", { class: "xs faint mt-1" }, t("ch.claimBy", { date: date(c.claimDeadline) }))),
      action ? h("div", { class: "row end" }, action) : null);
  }
  await load();
  return view;
}
