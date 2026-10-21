/* SYRIX VCF ads loader. Off unless the server says so AND the visitor consented.
   Never runs on pages marked data-no-ads (admin, contacts, wallet, payouts). Never receives contact data. */
(async () => {
  if (document.body.hasAttribute('data-no-ads')) return;
  const slots = [...document.querySelectorAll('.ad-slot')];
  if (!slots.length) return;
  const preview = new URLSearchParams(location.search).has('adspreview'); // design preview only
  let cfg = { ads: { enabled: false } };
  try { const r = await fetch('/api/public-config', { credentials: 'omit' }); if (r.ok) cfg = await r.json(); } catch (_) {}
  if (!cfg.ads.enabled && !preview) return; // slots stay hidden

  const KEY = 'ads_consent';
  const consent = () => localStorage.getItem(KEY);
  const show = () => slots.forEach(s => { s.hidden = false; });

  function load() {
    if (!cfg.ads.enabled || consent() !== 'granted') return;
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(cfg.ads.clientId);
    document.head.appendChild(s);
    slots.forEach(slot => {
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.dataset.adClient = cfg.ads.clientId;
      ins.dataset.adFormat = 'auto';
      slot.querySelector('.ad-body').replaceChildren(ins);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  show();
  if (consent() === null) {
    const b = document.createElement('div');
    b.className = 'consent';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Advertising choices');
    b.innerHTML = '<p><b>Ads help keep SYRIX VCF running.</b> They never use your contacts. You can say no and keep every feature.</p>' +
      '<div><button class="btn btn-sm" data-c="denied">No thanks</button><button class="btn btn-sm btn-primary" data-c="granted">Allow ads</button></div>';
    b.addEventListener('click', e => {
      const v = e.target && e.target.dataset && e.target.dataset.c;
      if (!v) return;
      localStorage.setItem(KEY, v);
      b.remove();
      load();
    });
    document.body.appendChild(b);
  } else load();
})();
