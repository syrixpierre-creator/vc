/* SYRIX VCF ads loader. Off unless the server enables ads AND the visitor consents.
   Never runs on pages marked data-no-ads (app, admin). Never receives contact data. Builds DOM nodes only (no innerHTML). */
(async () => {
  if (document.body.hasAttribute("data-no-ads")) return;
  const slots = [...document.querySelectorAll(".ad-slot")];
  if (!slots.length) return;
  let cfg = { ads: { enabled: false } };
  try { const r = await fetch("/api/public-config", { credentials: "omit" }); if (r.ok) cfg = await r.json(); } catch { /* offline: no ads */ }
  if (!cfg.ads || !cfg.ads.enabled) return; // slots stay hidden

  const lang = ["en", "fr", "pt", "es", "ar"].includes(document.documentElement.lang) ? document.documentElement.lang : "en";
  let dict = {};
  try { dict = (await import(`/js/i18n/${lang}.js`)).default; } catch { /* English text below */ }
  const t = (k, en) => dict[k] ?? en;
  const KEY = "ads_consent";
  const consent = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };

  function load() {
    if (consent() !== "granted") return;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cfg.ads.clientId)}`;
    document.head.append(s);
    for (const slot of slots) {
      const ins = el("ins", "adsbygoogle");
      ins.style.display = "block";
      ins.dataset.adClient = cfg.ads.clientId;
      ins.dataset.adFormat = "auto";
      slot.querySelector(".ad-body").replaceChildren(ins);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }

  slots.forEach(s => { s.hidden = false; });
  if (consent() !== null) return load();
  const box = el("div", "consent");
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", t("site.ad.choices", "Advertising choices"));
  const p = el("p");
  p.append(el("b", "", t("site.ad.consentH", "Ads help keep SYRIX VCF free.")), " ", t("site.ad.consentP", "They never use your contacts. You can say no and keep every feature."));
  const row = el("div");
  for (const [v, cls, k, en] of [["denied", "btn btn-sm", "site.ad.no", "No thanks"], ["granted", "btn btn-sm btn-primary", "site.ad.yes", "Allow ads"]]) {
    const b = el("button", cls, t(k, en));
    b.type = "button";
    b.addEventListener("click", () => { try { localStorage.setItem(KEY, v); } catch { /* private mode: ask again next time */ } box.remove(); load(); });
    row.append(b);
  }
  box.append(p, row);
  document.body.append(box);
})();
