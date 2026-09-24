# Haat: QA Practice Storefront

**Haat** is a small but realistic e-commerce web app, a hand-made Indian crafts bazaar, built for **manual QA training**. It looks and works like a real shop: login with captcha and lockout, product search, filters and sort, basket with coupons, GST and shipping, checkout, and order history. It also contains **intentionally seeded defects** for trainees to find, report and classify.

- Pure **HTML + CSS + vanilla JavaScript**. No frameworks, no npm, no build step, no backend.
- Data is stored in the browser (`localStorage` / `sessionStorage`).
- Responsive: desktop, tablet and mobile.
- Works by opening `index.html` directly, or from **GitHub Pages**.

---

## Project structure

```
/index.html                 → redirects to login
/login.html                 → login, captcha, remember me, forgot password
/products.html              → catalogue: search, category, sort, quick view
/cart.html                  → basket, quantities, coupons, totals
/checkout.html              → delivery form, payment, order confirmation
/orders.html                → order history
/css/style.css
/js/auth.js                 → storage helpers, users, login, session, header
/js/captcha.js              → canvas captcha
/js/products.js             → catalogue data and listing page
/js/cart.js                 → basket, pricing engine and coupons
/js/checkout.js             → checkout validation and order placement
/js/orders.js               → order history page
/docs/REQUIREMENT_DOCUMENT.md       → give to trainees
/docs/TEST_DATA.md                  → give to trainees
/docs/BUG_DOCUMENT_ANSWER_KEY.md    → TRAINER ONLY (keep private)
/README.md
```

---

## Run locally

**Option 1: double-click.** Open `index.html` in Chrome, Edge or Firefox. It redirects to the login page.

**Option 2: local web server** (closer to how GitHub Pages serves it):

```bash
# Python 3
cd haat
python -m http.server 8080
# open http://localhost:8080
```

```bash
# or Node, if installed
npx serve .
```

Log in with a demo account from `docs/TEST_DATA.md`, e.g. `asha@haat.in` / `Asha@1234`.

**Reset the app** at any time: DevTools → Application → Storage → *Clear site data*, or run `localStorage.clear(); sessionStorage.clear()` in the Console.

---

## Deploy on GitHub Pages (step by step)

1. **Remove the answer key first.** Move `docs/BUG_DOCUMENT_ANSWER_KEY.md` out of the folder. The included `.gitignore` already excludes it, but check before you commit.
2. Create a new repository on GitHub, e.g. `haat-qa`. It must be **Public** for GitHub Pages on a free account.
3. Upload the files:
   - **Using the website:** *Add file → Upload files*, drag in everything *inside* the `haat` folder (so `index.html` is at the repository root), then *Commit changes*.
   - **Using git:**
     ```bash
     cd haat
     git init
     git add .
     git status            # confirm BUG_DOCUMENT_ANSWER_KEY.md is NOT listed
     git commit -m "Haat QA practice storefront"
     git branch -M main
     git remote add origin https://github.com/<your-user>/haat-qa.git
     git push -u origin main
     ```
4. In the repository go to **Settings → Pages**.
5. Under *Build and deployment* choose **Source: Deploy from a branch**, **Branch: `main`**, **Folder: `/ (root)`**, then **Save**.
6. Wait 1 to 2 minutes and refresh the Pages settings screen. The site URL appears at the top: `https://<your-user>.github.io/haat-qa/`.
7. Open the URL. You should land on the login page. All links and assets use relative paths, so the app works under the repository sub-path without changes.

To update the site later, commit and push again. Pages redeploys automatically.

---

## ⚠️ Keep the answer key private

`docs/BUG_DOCUMENT_ANSWER_KEY.md` lists every seeded defect with its location in the code. **Do not push it to the public repository** that hosts the app. Keep it in a separate *private* repository, a shared drive, or print it for the trainer. The provided `.gitignore` excludes it by default.

Give trainees only:
- the site URL,
- `docs/REQUIREMENT_DOCUMENT.md`,
- `docs/TEST_DATA.md`.

---

## Suggested session plan (2 to 3 hours)

1. **Read** the requirement document (20 min) and write test scenarios.
2. **Explore** the app in pairs with the test data (60 to 90 min).
3. **Report** defects in a bug template: ID, title, steps, data, expected, actual, severity, priority, requirement ID, screenshot, device and browser.
4. **Review** against the answer key and discuss severity vs priority.

Encourage trainees to test on a phone as well as a desktop (or use DevTools device mode). Several defects appear only on small screens, with the keyboard, or after a page refresh.
