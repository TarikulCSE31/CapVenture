# 💼 CapVenture — Business Investment & Profit Ledger

A modern, responsive, and private web application tailored for individuals and business owners investing capital with partners, contractors, or borrowers. It tracks capital disbursement, principal repayments, profit distributions, and running balances without conflating return of principal with profit earnings.

---

## 🌟 Key Features

1. **Clear Financial Accounting Logic**:
   - **💸 Capital Out / Investment**: Money given to partner (increases active principal owed).
   - **↩️ Principal Returned**: Money repaid by partner (reduces principal balance, never inflated as profit).
   - **📈 Profit Payout**: Return on capital (increases realized profit & ROI %, principal balance remains unchanged).
   - **🔄 Reinvested**: Profit earned is rolled directly back into active principal.

2. **Executive Financial Health Cards**:
   - **Active Capital Out**: Net outstanding principal currently in the partner's hands.
   - **Total Profit Realized**: Cumulative profit payouts with instant ROI % calculations.
   - **Net Cash Flow & Break-Even Tracker**: Tells you exactly how much money is needed until you've recovered 100% of your capital, or celebrates when you're in the pure profit zone!
   - **Capital Recovery % Progress Bar**.

3. **Interactive Visual Analytics**:
   - **Cumulative Performance Area Chart**: Active principal vs cumulative profit over time.
   - **Monthly Flow Bar Chart**: Capital invested vs. returned vs. profit payout by month.
   - **Average Monthly Profit & Turnover velocity**.

4. **Detailed Ledger & Auditing**:
   - Running principal and running profit columns calculated chronologically.
   - Search by description, reference ID, amount, or partner name.
   - Category filter pills (All, Capital Out, Principal Back, Profit, Reinvested).
   - Instant CSV export for Excel / Google Sheets.

5. **Official Statement of Account**:
   - Formats a settlement report ready to print or save as PDF (`window.print()`).
   - Includes summary header, itemized debits/credits, running balance, and signature blocks to send to your partner via WhatsApp or email.

6. **Multi-Partner & Multi-Currency**:
   - Track separate partners or view your entire portfolio together.
   - Switch currencies anytime: USD (`$`), BDT (`৳`), EUR (`€`), GBP (`£`), INR (`₹`), AED, SAR, etc.

7. **Zero-Cost Hosting Architecture**:
   - Deploy globally for \$0 forever on **Vercel**, **Netlify**, or **Cloudflare Pages**.
   - Dual storage engine: Works out of the box with offline/local browser storage, plus full JSON export/import backup and optional free **Supabase** PostgreSQL cloud sync.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18 or v20+)
- npm

### Installation
```bash
# 1. Clone or navigate to the directory
cd "c:\Users\BS716\Documents\FunProject\Business Investment"

# 2. Start local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🌐 Deploying Anywhere for Free (Zero Cost)

### Option 1: Vercel (Recommended — Takes 1 Minute)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/business-investment-tracker.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **"Add New Project"** and select your repository.
4. Vercel will auto-detect Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. In under a minute, you have a free live HTTPS URL (e.g. `https://my-investment-ledger.vercel.app`) accessible from your smartphone and computer.

### Option 2: Cloudflare Pages or Netlify
- In Netlify or Cloudflare Pages, link your GitHub repository.
- Build command: `npm run build`
- Publish directory: `dist`
- Enjoy unlimited bandwidth, free automated SSL certificates, and global edge CDN caching.

---

## ☁️ Optional Free Cloud Sync (Supabase)

If you want automatic real-time cloud synchronization between your laptop and phone without relying on manual JSON backups:
1. Create a free project at [supabase.com](https://supabase.com) (500 MB PostgreSQL database free forever).
2. Go to the **SQL Editor** in your Supabase dashboard and run the schema provided in the app's **Settings > Supabase Cloud Sync** tab.
3. Paste your **Project URL** and **Anon Key** into the app's Settings modal.
4. All your records will sync across devices automatically!

---

## 📁 Backup & Export
- **JSON Backup**: Click **Settings > Download JSON Backup** to save an encrypted snapshot of all partners, transactions, and settings.
- **CSV Export**: Click **Export CSV** on the Ledger tab to download clean tabular spreadsheets for accounting.
- **PDF Statement**: Go to **Statement of Account** and click **Print / Save PDF**.
