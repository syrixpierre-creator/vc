"""End-to-end check in a real browser against the local demo server (in-memory data, fake Google sign-in).
Run:  python3 e2e/run.py      (needs `pip install playwright` + `playwright install chromium`, and Node 22+)"""
import subprocess, time, sys, os, tempfile, urllib.request, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PORT = 3100
BASE = f"http://localhost:{PORT}"
SHOTS = ROOT / "screenshots"; SHOTS.mkdir(exist_ok=True)
results = []

def check(name, cond, detail=""):
    results.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))

srv = subprocess.Popen(["node", "server/src/dev.ts"], cwd=ROOT, env={**os.environ, "PORT": str(PORT)}, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
try:
    for _ in range(50):
        try:
            urllib.request.urlopen(f"{BASE}/healthz", timeout=1); break
        except Exception: time.sleep(0.2)
    else:
        print(srv.stdout.read().decode()); sys.exit("server did not start")

    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 1280, "height": 860}, accept_downloads=True, locale="en-US")
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        # network errors we provoke on purpose (duplicate contact -> 409, signed-out page -> 401) are not bugs
        EXPECTED = ("status of 409", "status of 401")
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" and not any(x in m.text for x in EXPECTED) else None)
        dialogs = []
        page.on("dialog", lambda d: (dialogs.append(d.message), d.dismiss()))

        # unauthenticated visitors are sent to sign-in, not shown an empty app
        anon = b.new_context().new_page()
        anon.goto(f"{BASE}/app/"); anon.wait_for_url("**/dev/login**", timeout=5000)
        check("anonymous /app/ redirects to sign-in", "/dev/login" in anon.url)
        anon.context.close()

        # landing -> sign in -> app
        page.goto(f"{BASE}/?nointro")
        page.click("a.gbtn")
        page.wait_for_url("**/dev/login**")
        page.fill("input[name=email]", "demo@example.com"); page.fill("input[name=name]", "Demo User")
        page.click("button")
        page.wait_for_url("**/app/**")
        page.wait_for_selector("h1")
        check("sign-in lands in the app with the user's name", "Demo User" in page.inner_text("h1"), page.inner_text("h1"))
        urllib.request.urlopen(f"{BASE}/dev/seed?email=demo@example.com")
        page.reload(); page.wait_for_selector(".kpi")
        page.screenshot(path=str(SHOTS / "20-app-overview.png"))
        check("overview shows demo wallet ($17.00)", "$17.00" in page.inner_text("main"))

        # contacts: add, duplicate, search, XSS, edit, delete
        page.goto(f"{BASE}/app/#/contacts"); page.wait_for_selector("text=No contacts yet")
        def add(name, phone):
            page.click("text=Add contact >> nth=0")
            page.fill("dialog input[name=fullName]", name); page.fill("dialog input[name=phone]", phone)
            page.click("dialog button[type=submit]")
        add("Amina Moreau", "+33 6 12 34 56 78"); page.wait_for_selector("td:has-text('Amina Moreau')")
        check("contact added and listed", "+33612345678" in page.inner_text("tbody"))
        add("Dup", "+33612345678"); page.wait_for_selector(".form-err:has-text('already have')")
        check("duplicate number shows a clear error", True)
        page.click("dialog button:has-text('Cancel')")
        add("<img src=x onerror=window.__xss=1>", "+33699999999"); page.wait_for_selector("td:has-text('<img')")
        check("stored markup is shown as text, never executed", page.evaluate("window.__xss") is None and page.locator("tbody img").count() == 0)
        page.fill("input[type=search]", "amina"); page.wait_for_timeout(500)
        check("search filters the list", page.locator("tbody tr").count() == 1)
        page.fill("input[type=search]", ""); page.wait_for_timeout(500)
        page.click("tr:has-text('Amina') button:visible:has-text('Edit')"); page.fill("dialog input[name=organization]", "Syrix"); page.click("dialog button[type=submit]")
        page.wait_for_selector("td:has-text('Syrix')"); check("contact edited", True)

        # import with preview (1 new, 1 duplicate, 1 invalid), then export
        vcf = "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Joao Silva\r\nTEL:+5511912345678\r\nEND:VCARD\r\nBEGIN:VCARD\r\nVERSION:3.0\r\nFN:Amina Again\r\nTEL:+33612345678\r\nEND:VCARD\r\nBEGIN:VCARD\r\nVERSION:3.0\r\nTEL:+33611111111\r\nEND:VCARD\r\n"
        f = tempfile.NamedTemporaryFile("w", suffix=".vcf", delete=False, encoding="utf-8"); f.write(vcf); f.close()
        page.set_input_files("input[type=file]", f.name)
        page.wait_for_selector("dialog h3:has-text('Import preview')")
        stats = page.inner_text("dialog")
        page.screenshot(path=str(SHOTS / "21-app-import-preview.png"))
        check("import preview counts: 1 to import, 1 duplicate, 1 invalid", "To import\n1" in stats and "Duplicates (skipped)\n1" in stats and "Invalid records\n1" in stats, stats)
        page.click("dialog button:has-text('Import 1 contacts')"); page.wait_for_selector("td:has-text('Joao Silva')")
        check("confirmed import adds only the new contact", page.locator("tbody tr").count() == 3)
        with page.expect_download() as dl:
            page.click("button:has-text('Export VCF')")
        text = pathlib.Path(dl.value.path()).read_text(encoding="utf-8")
        check("export downloads a valid VCF with my contacts", "BEGIN:VCARD" in text and "Joao Silva" in text and "VERSION:3.0" in text)
        page.screenshot(path=str(SHOTS / "22-app-contacts.png"))

        page.click("tr:has-text('Joao') button:visible:has-text('Delete')"); page.wait_for_selector("dialog:has-text('Delete this contact?')")
        page.click("dialog button.btn-danger"); page.wait_for_function("document.querySelectorAll('tbody tr').length === 2")
        check("delete asks for confirmation then removes", True)


        # ---- Google Contacts sync (fake Google + the same worker code as production) ----
        def remote():
            return __import__("json").loads(urllib.request.urlopen(f"{BASE}/dev/google-contacts?email=demo@example.com").read())
        def wait_for(pred, secs=8):
            end = time.time() + secs
            while time.time() < end:
                if pred(): return True
                time.sleep(0.2)
            return False
        page.goto(f"{BASE}/app/#/sync"); page.wait_for_selector("#connect")
        check("sync page starts as 'Not connected'", page.inner_text("#connStatus") == "Not connected")
        # granular consent: Contacts permission unticked on Google's screen
        page.click("#connect"); page.wait_for_url("**/dev/login**")
        page.fill("input[name=email]", "someone.else@example.com"); page.click("button")
        page.wait_for_selector("#toast div")
        check("a different Google account is refused with a clear message", "same Google account" in page.inner_text("#toast") and page.inner_text("#connStatus") == "Not connected", page.inner_text("#toast"))
        page.click("#connect"); page.wait_for_url("**/dev/login**"); page.fill("input[name=email]", "demo@example.com")
        check("consent screen asks for Contacts access explicitly", "see, edit and create your Google contacts" in page.inner_text("body"))
        page.uncheck("input[name=allow_contacts]"); page.click("button")
        page.wait_for_selector("#toast div")
        check("unticking the Contacts permission connects nothing and explains why", "not granted" in page.inner_text("#toast") and page.inner_text("#connStatus") == "Not connected", page.inner_text("#toast"))
        page.click("#connect"); page.wait_for_url("**/dev/login**"); page.fill("input[name=email]", "demo@example.com"); page.click("button")
        page.wait_for_selector("#syncNow")
        check("connecting shows 'Connected'", page.inner_text("#connStatus") == "Connected")
        page.screenshot(path=str(SHOTS / "29-app-sync-connected.png"))
        check("contacts saved before connecting are NOT sent automatically", remote() == [])
        page.click("#syncNow"); page.wait_for_selector("#toast div:has-text('contacts queued')")
        check("Sync now sends the backlog to Google", wait_for(lambda: len(remote()) == 2), str(remote()))
        page.wait_for_function("(() => { const e = document.querySelector('.kpis .kpi:nth-child(1) .v'); return !!e && e.textContent === '2'; })()", timeout=10000)
        check("sync page counts show 2 synced", True)

        # a new contact is sent automatically, once
        page.goto(f"{BASE}/app/#/contacts"); page.wait_for_selector("th")
        page.click("text=Add contact >> nth=0"); page.fill("dialog input[name=fullName]", "Auto Synced"); page.fill("dialog input[name=phone]", "+33600000001"); page.click("dialog button[type=submit]")
        page.wait_for_selector("tr:has-text('Auto Synced')")
        check("new contact reaches Google automatically", wait_for(lambda: sum(1 for x in remote() if x["name"] == "Auto Synced") == 1))
        page.reload(); page.wait_for_selector("tr:has-text('Auto Synced') [data-sync=synced]")
        check("contact row shows 'Synced'", True)
        page.screenshot(path=str(SHOTS / "30-app-contacts-synced.png"))
        time.sleep(1.8)
        check("it was sent exactly once", sum(1 for x in remote() if x["name"] == "Auto Synced") == 1)

        # pause / resume
        page.goto(f"{BASE}/app/#/sync"); page.wait_for_selector("#paused"); page.check("#paused"); page.wait_for_function("(() => { const e = document.querySelector('#syncNow'); return !!e && e.disabled; })()")
        page.goto(f"{BASE}/app/#/contacts"); page.wait_for_selector("th")
        page.click("text=Add contact >> nth=0"); page.fill("dialog input[name=fullName]", "Held Back"); page.fill("dialog input[name=phone]", "+33600000002"); page.click("dialog button[type=submit]")
        page.wait_for_selector("tr:has-text('Held Back')"); time.sleep(2)
        check("paused: nothing is sent", not any(x["name"] == "Held Back" for x in remote()))
        page.goto(f"{BASE}/app/#/sync"); page.wait_for_selector("#paused"); page.uncheck("#paused")
        check("resumed: the waiting contact is sent", wait_for(lambda: any(x["name"] == "Held Back" for x in remote())))

        # the user revokes access in their Google account
        urllib.request.urlopen(f"{BASE}/dev/revoke?email=demo@example.com")
        page.goto(f"{BASE}/app/#/contacts"); page.wait_for_selector("th")
        page.click("text=Add contact >> nth=0"); page.fill("dialog input[name=fullName]", "After Revoke"); page.fill("dialog input[name=phone]", "+33600000003"); page.click("dialog button[type=submit]")
        page.wait_for_selector("tr:has-text('After Revoke')")
        page.goto(f"{BASE}/app/#/sync"); page.wait_for_selector("#connStatus")
        check("revoked access is detected and the user is asked to reconnect", wait_for(lambda: (page.reload(), page.wait_for_selector("#connStatus"), "Reconnect" in page.inner_text("#connStatus"))[2]))
        page.screenshot(path=str(SHOTS / "31-app-sync-revoked.png"))
        check("nothing was sent while revoked", not any(x["name"] == "After Revoke" for x in remote()))
        page.click("#connect"); page.wait_for_url("**/dev/login**"); page.fill("input[name=email]", "demo@example.com"); page.click("button"); page.wait_for_selector("#syncNow")
        page.click("#syncNow"); page.wait_for_selector("#toast div:has-text('queued')")
        check("after reconnecting, Sync now delivers the stuck contact", wait_for(lambda: any(x["name"] == "After Revoke" for x in remote())))

        # disconnect keeps everything local
        before = page.evaluate("fetch('/api/contacts?limit=1').then(r => r.json()).then(j => j.total)")
        page.reload(); page.wait_for_selector("#disconnect"); page.click("#disconnect"); page.wait_for_selector("dialog:has-text('Disconnect Google Contacts?')")
        page.click("#confirmDisconnect"); page.wait_for_selector("#connect")
        after = page.evaluate("fetch('/api/contacts?limit=1').then(r => r.json()).then(j => j.total)")
        check("disconnect leaves local contacts untouched", before == after and before >= 4, f"{before} -> {after}")
        check("disconnect leaves Google's copies untouched", len(remote()) >= 4)
        check("status is 'Not connected' again", page.inner_text("#connStatus") == "Not connected")

        # wallet, referrals, challenges
        page.goto(f"{BASE}/app/#/wallet"); page.wait_for_selector(".kpis")
        check("withdraw stays disabled until a payout method exists", page.locator("#withdraw").is_disabled())
        page.fill("input[name=details]", "demo.secret@paypal.example"); page.click("form button:has-text('Add')")
        page.wait_for_selector("td:has-text('d••••@paypal.example')")
        check("payout method is shown masked only", "demo.secret" not in page.inner_text("main"))
        page.wait_for_function("(() => { const e = document.querySelector('#withdraw'); return !!e && !e.disabled; })()")
        page.click("#withdraw"); page.wait_for_selector("span.pill-s:has-text('Payment in progress')")
        page.screenshot(path=str(SHOTS / "23-app-wallet.png"))
        check("withdrawal request is created and shows 'Payment in progress'", "$17.00" in page.inner_text("main"))
        page.wait_for_function("(() => { const e = document.querySelector('#withdraw'); return !!e && e.disabled; })()")
        check("a second request cannot be made while one is open", True)

        page.goto(f"{BASE}/app/#/referrals"); page.wait_for_selector("input[readonly]")
        link = page.input_value("input[readonly]")
        check("referral link has a code", "/register?ref=" in link, link)
        page.goto(f"{BASE}/app/#/challenges"); page.wait_for_selector(".ch-card")
        check("three seeded challenges are listed", page.locator(".ch-card").count() == 3)
        page.click(".ch-card:has-text('Contact Organizer') >> text=Join"); page.wait_for_selector(".ch-card:has-text('Contact Organizer') button:has-text('Claim reward')")
        page.screenshot(path=str(SHOTS / "24-app-challenges.png"))
        check("joining an already-accomplished challenge works and offers the reward", page.locator(".ch-card:has-text('Contact Organizer') >> text=Join").count() == 0)
        xp_before = page.evaluate("fetch('/api/me/progress').then(r => r.json()).then(j => j.xp)")
        page.click(".ch-card:has-text('Contact Organizer') button:has-text('Claim reward')"); page.wait_for_selector("#toast div:has-text('Reward claimed')")
        xp_after = page.evaluate("fetch('/api/me/progress').then(r => r.json()).then(j => j.xp)")
        check("claiming the reward adds XP exactly once", xp_after - xp_before == 200, f"{xp_before} -> {xp_after}")
        page.wait_for_selector(".ch-card:has-text('Contact Organizer') .pill-s:has-text('Reward delivered')")
        check("a claimed challenge cannot be claimed again", page.locator(".ch-card:has-text('Contact Organizer') button:has-text('Claim reward')").count() == 0)

        # settings: one phone per account, language switching and RTL
        page.goto(f"{BASE}/app/#/settings"); page.wait_for_selector("input[type=tel]")
        page.fill("input[type=tel]", "+33 7 00 00 00 01"); page.click("label:has-text('Your phone number') button")
        page.wait_for_selector("small:has-text('+33 •• •• •• 01')")
        check("account phone saved and shown masked", "7000000" not in page.inner_text("main"))
        page.select_option("select[aria-label=Language]", "fr"); page.wait_for_selector("h1:has-text('Réglages')")
        check("French UI", page.evaluate("document.documentElement.lang") == "fr")
        page.select_option("select", "ar"); page.wait_for_selector("h1:has-text('الإعدادات')")
        check("Arabic switches the page to RTL", page.evaluate("document.documentElement.dir") == "rtl")
        page.screenshot(path=str(SHOTS / "25-app-settings-arabic.png"))
        page.goto(f"{BASE}/app/#/contacts"); page.wait_for_selector("th")
        page.screenshot(path=str(SHOTS / "26-app-contacts-arabic.png"))
        check("Arabic contacts table renders", "الاسم" in page.inner_text("thead"))
        page.goto(f"{BASE}/app/#/settings"); page.wait_for_selector("select")
        page.select_option("select", "en"); page.wait_for_selector("h1:has-text('Settings')")

        # mobile layout
        m = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2).new_page()
        m.goto(f"{BASE}/api/auth/google/start?next=%2Fapp%2F"); m.fill("input[name=email]", "demo@example.com"); m.click("button")
        m.wait_for_url("**/app/**"); m.wait_for_selector(".kpi"); m.screenshot(path=str(SHOTS / "27-app-overview-mobile.png"))
        m.goto(f"{BASE}/app/#/contacts"); m.wait_for_selector("tbody tr"); m.screenshot(path=str(SHOTS / "28-app-contacts-mobile.png"))
        overflow = m.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
        check("no horizontal page overflow on a phone", not overflow)
        check("phone: edit/delete are visible without scrolling sideways", m.locator("tr button:visible:has-text('Edit')").first.is_visible() and m.evaluate("(() => { const b = document.querySelector('tr button:not([hidden])'); const r = [...document.querySelectorAll('tr button')].find(x => x.offsetParent).getBoundingClientRect(); return r.right <= window.innerWidth && r.left >= 0; })()"))
        names = m.evaluate("[...document.querySelectorAll('#side a[href^=\"#/\"]')].map(a => a.getAttribute('aria-label'))")
        check("bottom navigation links have accessible names", all(names) and len(names) == 7, str(names))

        # sign out
        page.goto(f"{BASE}/app/#/settings"); page.wait_for_selector("button:has-text('Sign out')")
        page.click("button:has-text('Sign out')"); page.wait_for_url(f"{BASE}/")
        page.goto(f"{BASE}/app/"); page.wait_for_url("**/dev/login**")
        check("after sign-out the app asks to sign in again", True)

        check("no browser console errors or exceptions", not errors, "; ".join(errors[:3]))
        check("no JS dialogs (alert/confirm) were triggered", not dialogs)
        b.close()
finally:
    srv.terminate()
    try: srv.wait(5)
    except Exception: srv.kill()

failed = [n for n, ok in results if not ok]
print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
sys.exit(1 if failed else 0)
