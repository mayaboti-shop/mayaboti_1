# mayaboti — deploy notes

## What was wrong
1. **Cloudflare error**: the deploy command was `npx wrangler deploy`, which is for
   Cloudflare **Workers** (server-side JS), not a static site. Wrangler looked for a
   Worker entry point, found none, and failed.
2. **Every file's name and content were mismatched** in a 12-way shuffle (e.g. the
   file named `cart.html` actually contained JavaScript, the file named `admin.html`
   actually contained the cart page HTML, etc). All files in this folder have been
   renamed/rewritten so the filename matches its actual content.
3. **`config.js` was missing entirely.** It's supposed to define `API_BASE_URL`,
   which `auth.js` depends on for every API call. It's been recreated here with a
   placeholder — **edit it before deploying**:
   ```js
   const API_BASE_URL = "https://api.mayaboti.com";
   ```
   Replace that with your real backend URL.
4. Internal links that pointed to `1st page.html` / `create on.html` (with literal
   spaces) were fixed. The homepage is now `index.html` so Cloudflare Pages can find
   it automatically as the site root.

## File map (old upload → what it actually is)
| Uploaded as | Real content | Fixed filename |
|---|---|---|
| `auth.js` | site CSS | `styl.css` |
| `create_on.html` | homepage | `index.html` |
| `cart.html` | UI behavior JS | `styl.js` |
| `admin.html` | cart page | `cart.html` |
| `chat.html` | admin dashboard page | `admin.html` |
| `login.html` | contact page | `chat.html` |
| `band.html` | sign-in page | `login.html` |
| `categories.html` | brands page | `band.html` |
| `styl.css` | categories/products page | `categories.html` |
| `admin.js` | Auth helper | `auth.js` |
| `1st_page.html` | admin dashboard JS | `admin.js` |
| `config.js` | signup page | `create_on.html` |
| *(missing)* | API config | `config.js` (recreated) |

## Deploying on Cloudflare Pages via GitHub
1. Push this folder's contents to the **root** of your GitHub repo (or a `/public`
   folder — just make sure it matches the "Build output directory" setting below).
2. In the Cloudflare Pages project settings → **Build & deployments**:
   - **Framework preset**: `None`
   - **Build command**: leave empty
   - **Build output directory**: `/` (or `public` if you put files in a subfolder)
   - **Deploy command**: leave empty — do **not** use `npx wrangler deploy`.
     If Cloudflare insists on a deploy command, use `npx wrangler pages deploy .`
3. Save and redeploy. Since these are plain static files, no build step is needed.

## Still worth checking
- `band.html` references `images/loreal.jpg` etc. — those image files don't exist
  yet in this bundle; add them under an `images/` folder or swap in real URLs.
- The homepage slider images are placeholder Unsplash photos — swap for your own
  product photography.
- `auth.js` / `admin.js` / cart & checkout all call a real backend via
  `API_BASE_URL` — none of this will actually log in, add products, or place
  orders until that backend exists and `config.js` points to it.
