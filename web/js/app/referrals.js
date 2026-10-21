import { h, icon, t, api, num, money, date, copyText, toast, progressBar, empty } from "/js/core.js";
import { pageHead, kpi, card, statusBadge } from "/js/app/ui.js";

/* Referral link and sharing, the 500-referral cash reward, milestones, referred people (initial only), the published rules. */
export default async function referrals() {
  const [r, list] = await Promise.all([api("/api/referrals/me"), api("/api/referrals/list")]);
  const shareText = t("ref.shareText");
  const linkIn = h("input", { class: "input ltr", readonly: true, value: r.link, "aria-label": t("ref.yourLink"), onfocus: e => e.target.select() });
  const copy = h("button", { class: "btn btn-primary", type: "button", onclick: async () => { if (await copyText(r.link)) toast(t("ref.copied")); } }, icon("copy"), t("common.copy"));
  const share = [
    h("a", { class: "btn btn-sm", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${r.link}`)}`, target: "_blank", rel: "noopener noreferrer" }, icon("chat-bubble"), "WhatsApp"),
    h("a", { class: "btn btn-sm", href: `https://t.me/share/url?url=${encodeURIComponent(r.link)}&text=${encodeURIComponent(shareText)}`, target: "_blank", rel: "noopener noreferrer" }, icon("send"), "Telegram"),
    h("a", { class: "btn btn-sm", href: `mailto:?subject=${encodeURIComponent("SYRIX VCF")}&body=${encodeURIComponent(`${shareText}\n${r.link}`)}` }, icon("mail"), t("ref.email")),
    navigator.share ? h("button", { class: "btn btn-sm", type: "button", onclick: () => navigator.share({ title: "SYRIX VCF", text: shareText, url: r.link }).catch(() => undefined) }, icon("share"), t("ref.more")) : null,
    h("a", { class: "btn btn-sm", href: "/api/share/card.svg?kind=referrals&ref=1", download: "syrix-referrals.svg" }, icon("download"), t("ref.card")),
  ];
  const cash = r.cashReward;
  const cashCard = cash ? card(t("ref.cashTitle", { amount: money(cash.cents) }), h("div", { class: "stack" },
    h("div", { class: "row between" }, h("span", { class: "big-num" }, money(cash.cents)), cash.payout ? statusBadge("payout", cash.payout.status) : cash.claim ? statusBadge("claim", cash.claim.status) : h("span", { class: "badge" }, t("ref.inProgress"))),
    progressBar(cash.progress, cash.threshold, "gold"),
    h("div", { class: "row between small" }, h("span", { class: "muted" }, t("ref.milestoneProgress")), h("b", { class: "num" }, `${num(cash.progress)} / ${num(cash.threshold)}`)),
    cash.payout ? h("div", { class: "callout ok" }, icon("wallet"), h("div", { class: "small" }, t(`ref.payout.${cash.payout.status}`, { hint: cash.payout.maskedHint, date: date(cash.payout.paidAt ?? cash.payout.createdAt) }), " ", h("a", { href: "#/wallet" }, t("ref.seeWallet"))))
      : cash.claim?.status === "in_progress" ? h("div", { class: "callout" }, icon("info"), h("div", { class: "small" }, t("ref.addMethod"), " ", h("a", { href: "#/wallet" }, t("ref.seeWallet"))))
      : cash.claim?.status === "action_required" ? h("div", { class: "callout warn" }, icon("clock"), h("span", { class: "small" }, t("ref.review")))
      : h("p", { class: "small muted" }, t("ref.cashHint", { n: Math.max(0, cash.threshold - cash.progress) }))), { cls: "milestone-card" }) : null;

  const milestones = card(t("ref.milestones"), h("div", { class: "milestones" }, r.milestones.map(m => h("div", { class: `ms${m.reachedAt ? " done" : ""}${m.cashCents ? " cash" : ""}` },
    h("span", { class: "ms-dot" }, m.reachedAt ? icon("check") : num(m.threshold)),
    h("div", {}, h("b", { class: "small" }, t("ref.msN", { n: m.threshold })), h("div", { class: "xs muted" }, [m.cashCents ? money(m.cashCents) : null, m.badge ? t("ref.badge") : null, m.xp ? `+${num(m.xp)} XP` : null].filter(Boolean).join(" · "))),
    m.reachedAt ? h("span", { class: "badge ok" }, date(m.reachedAt)) : h("span", { class: "xs faint num" }, `${num(Math.min(r.counts.qualified, m.threshold))}/${num(m.threshold)}`)))));

  const people = card(t("ref.people"), list.items.length ? h("div", { class: "table-scroll" }, h("table", { class: "table table-cards" },
    h("thead", {}, h("tr", {}, h("th", {}, t("ref.member")), h("th", {}, t("ref.joined")), h("th", {}, t("ref.status")))),
    h("tbody", {}, list.items.map(x => h("tr", {}, h("td", {}, h("span", { class: "avatar sm" }, x.member)), h("td", { "data-label": t("ref.joined") }, date(x.createdAt)),
      h("td", { "data-label": t("ref.status") }, statusBadge("referral", x.status), x.reason ? h("div", { class: "xs faint" }, x.reason.split(",").map(k => t(`refReason.${k}`)).join(", ")) : null))))))
    : empty("users", t("ref.noneYet"), t("ref.noneYetP")), { sub: t("ref.privacy") });

  const rules = card(t("ref.rules"), h("ul", { class: "stack small muted" },
    h("li", {}, t("ref.rule1")), h("li", {}, t("ref.rule2", { h: r.rules.waitingPeriodHours })), h("li", {}, t("ref.rule3", { n: r.rules.maxSignupsPerNetworkPerDay })), h("li", {}, t("ref.rule4")),
    h("li", {}, h("a", { href: "/legal/reward-rules", target: "_blank", rel: "noopener" }, t("ref.fullRules")))));

  return h("div", {},
    pageHead(t("nav.referrals"), t("ref.sub")),
    r.restricted ? h("div", { class: "callout warn mb-2" }, icon("lock"), h("span", { class: "small" }, t("ref.restricted"))) : null,
    card(t("ref.yourLink"), h("div", { class: "stack" }, h("div", { class: "ref-link" }, linkIn, copy), h("div", { class: "share-row" }, share)), { sub: t("ref.linkSub") }),
    h("div", { class: "kpis mt-2" }, kpi(t("ref.qualified"), num(r.counts.qualified), { iconName: "check-circle", accent: true }), kpi(t("ref.pending"), num(r.counts.pending), { iconName: "clock" }),
      kpi(t("ref.review"), num(r.counts.under_review), { iconName: "shield" }), kpi(t("ref.disq"), num(r.counts.disqualified), { iconName: "x-circle" }), kpi(t("ref.clicks"), num(r.clicks), { iconName: "link", sub: t("ref.clicksSub") })),
    h("div", { class: "dash-grid" }, h("div", { class: "stack-lg" }, people), h("div", { class: "stack-lg" }, cashCard, milestones, rules)));
}
