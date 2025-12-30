# ComplaintAI Deployment Guide

This guide walks you through deploying ComplaintAI from scratch.

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed (for scraper)
- A Supabase account (free tier works)
- A Stripe account
- An Anthropic API key (Claude)
- An OpenAI API key (for embeddings - optional)
- A Vercel account (for hosting - free tier works)

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to **SQL Editor** in the dashboard
4. Copy the contents of `database/schema.sql` and run it
5. Go to **Settings > API** and note down:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`)

## Step 2: Set Up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. In the Dashboard, go to **Developers > API keys**
3. Note down:
   - Publishable key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - Secret key (`STRIPE_SECRET_KEY`)
4. Go to **Developers > Webhooks**
5. Add a webhook endpoint: `https://your-domain.com/api/webhook`
6. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
7. Note down the webhook signing secret (`STRIPE_WEBHOOK_SECRET`)

## Step 3: Get API Keys

### Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Note down the key (`ANTHROPIC_API_KEY`)

### OpenAI (for embeddings - optional)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Note down the key (`OPENAI_API_KEY`)

## Step 4: Configure Environment

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# OpenAI (optional, for embeddings)
OPENAI_API_KEY=sk-xxxxx

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Run the FOS Scraper (Optional but Recommended)

The scraper collects Financial Ombudsman decisions for training data.

```bash
cd scraper

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Test scrape (just a few decisions)
python fos_scraper.py test

# Full scrape (takes several hours)
python fos_scraper.py

# Process the scraped data
python data_processor.py

# Generate embeddings (requires OpenAI key)
python embeddings.py
```

The scraper will:
1. Collect decisions from the FOS website
2. Process and categorise them
3. Generate embeddings for RAG retrieval
4. Save SQL files for importing to Supabase

## Step 6: Import Training Data to Supabase

After running the scraper:

1. Go to Supabase **SQL Editor**
2. Upload and run the files in `scraper/data/embeddings/supabase_import_*.sql`

Or use the Supabase CLI:
```bash
supabase db push
```

## Step 7: Deploy to Vercel

### Option A: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add all environment variables from `.env.local`
4. Deploy

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... repeat for all variables

# Deploy to production
vercel --prod
```

## Step 8: Configure Stripe Webhook

After deploying:

1. Go to Stripe Dashboard > Webhooks
2. Update the endpoint URL to: `https://your-vercel-url.vercel.app/api/webhook`
3. Make sure the webhook signing secret matches your environment variable

## Step 9: Test the Deployment

1. Visit your deployed URL
2. Go through the questionnaire
3. Complete a test payment (use Stripe test mode first)
4. Verify the complaint letter is generated

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Updating the Scraper Data

Run the scraper periodically (monthly) to get new FOS decisions:

```bash
cd scraper
source venv/bin/activate
python fos_scraper.py
python data_processor.py
python embeddings.py
```

Then import the new data to Supabase.

## Monitoring

### Vercel
- View logs in Vercel Dashboard > Deployments > Logs
- Set up alerts for errors

### Stripe
- Monitor payments in Stripe Dashboard
- Set up email notifications for disputes

### Supabase
- View database usage in Supabase Dashboard
- Monitor API calls and storage

## Costs

Estimated monthly costs at £1M ARR (~2,000 orders/month):

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Vercel | 100GB bandwidth | £0 - £20 |
| Supabase | 500MB DB, 2GB bandwidth | £0 - £25 |
| Stripe | 2.9% + 20p per transaction | ~£600-800 |
| Claude API | ~£0.003 per complaint | ~£6 |
| OpenAI Embeddings | One-time ~£50-100 | £0 ongoing |

Total: ~£650-850/month at scale (excluding Stripe fees which are % of revenue)

## Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] Stripe webhook signature is verified
- [ ] Database has Row Level Security enabled
- [ ] HTTPS is enforced
- [ ] Terms of Service clearly state this is not legal advice
- [ ] Personal data is deleted after 30 days

## Troubleshooting

### "Invalid API key" errors
- Check environment variables are set correctly in Vercel
- Redeploy after adding new variables

### Stripe webhook not working
- Check the webhook URL is correct
- Verify the signing secret matches
- Check Vercel function logs for errors

### Complaint generation fails
- Check Claude API key is valid
- Check API usage limits
- Review error logs in Vercel

### Database connection issues
- Verify Supabase URL and keys
- Check if database is paused (free tier pauses after inactivity)

## Support

For issues with this deployment:
1. Check the error logs
2. Review this guide
3. Contact support@complaintai.co.uk
