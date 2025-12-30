# 🚀 QUICKSTART: Launch Today

This is your same-day launch checklist. Follow these steps in order.

**Total time: ~2-3 hours**

---

## Step 1: Create Accounts (15 mins)

Create free accounts on these services:

| Service | URL | What You Need |
|---------|-----|---------------|
| Supabase | [supabase.com](https://supabase.com) | Database |
| Stripe | [stripe.com](https://stripe.com) | Payments |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) | AI (Claude) |
| Vercel | [vercel.com](https://vercel.com) | Hosting |

---

## Step 2: Set Up Supabase (10 mins)

1. Create a new project in Supabase
2. Wait for it to initialize (~2 mins)
3. Go to **SQL Editor**
4. Copy everything from `database/schema.sql`
5. Paste and click **Run**
6. Go to **Settings → API**
7. Copy these values (you'll need them):
   - Project URL
   - `anon` public key
   - `service_role` secret key

---

## Step 3: Set Up Stripe (10 mins)

1. Complete Stripe account setup
2. Go to **Developers → API Keys**
3. Copy:
   - Publishable key
   - Secret key
4. Go to **Developers → Webhooks**
5. Click **Add endpoint**
6. URL: `https://your-app.vercel.app/api/webhook` (update after deploy)
7. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
8. Copy the **Signing secret**

---

## Step 4: Get Anthropic Key (5 mins)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Copy it

---

## Step 5: Deploy to Vercel (15 mins)

### Option A: Deploy via GitHub (Recommended)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add environment variables (from steps 2-4):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

5. Click **Deploy**

### Option B: Deploy via CLI

```bash
npm i -g vercel
vercel login
vercel
# Follow prompts, add env vars when asked
vercel --prod
```

---

## Step 6: Update Stripe Webhook (5 mins)

1. Go back to Stripe Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-actual-vercel-url.vercel.app/api/webhook`
4. Save

---

## Step 7: Test Everything (15 mins)

1. Visit your live URL
2. Click "Start Your Complaint"
3. Select PCP / Motor Finance
4. Fill out the questionnaire with test data
5. On payment, use Stripe test card: `4242 4242 4242 4242`
6. Verify you receive a complaint letter

---

## Step 8: Go Live with Stripe (10 mins)

1. In Stripe, switch from Test to Live mode
2. Get your live API keys
3. Update in Vercel:
   - `STRIPE_SECRET_KEY` → live key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → live key
4. Add a live webhook endpoint with the same URL
5. Update `STRIPE_WEBHOOK_SECRET` with the live signing secret
6. Redeploy on Vercel

---

## ✅ You're Live!

Your tool is now accepting real payments.

### Post-Launch Checklist

- [ ] Send yourself a test order with real payment
- [ ] Set up Google Analytics (optional)
- [ ] Set up Stripe email notifications
- [ ] Connect a custom domain (optional)
- [ ] Set up support email: support@yourdomain.com

---

## Running the FOS Scraper (Optional - Do Later)

This improves AI quality but isn't required for launch:

```bash
cd scraper
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python fos_scraper.py test  # Test first
python fos_scraper.py       # Full scrape (takes hours)
```

---

## Troubleshooting

### "Payment failed" error
→ Check Stripe keys are correct and match mode (test vs live)

### "Failed to generate complaint"
→ Check Anthropic API key is valid and has credits

### Webhook not working
→ Verify webhook URL matches your Vercel deployment exactly

### Database errors
→ Check Supabase keys, ensure schema was run

---

## Need Help?

1. Check `docs/DEPLOYMENT.md` for detailed instructions
2. Review Vercel function logs for errors
3. Check Stripe Dashboard for payment issues

Good luck! 🎉
