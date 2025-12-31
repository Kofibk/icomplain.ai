# iComplain - Vercel Deployment Guide

## Quick Deploy (3 Steps)

### 1. Upload to GitHub
```bash
# Unzip and initialize git
unzip icomplain-fintech-v3.zip
cd icomplain
git init
git add .
git commit -m "Initial commit - iComplain v3"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/icomplain.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `icomplain` repo
4. Click "Import"

### 3. Add Environment Variable
In project settings, add:
```
ANTHROPIC_API_KEY = sk-ant-api03-xxxxx
```

**That's it!** Vercel will build and deploy automatically.

---

## Alternative: CLI Deploy

```bash
cd icomplain
npm install
npx vercel --prod
# Follow prompts, add ANTHROPIC_API_KEY when asked
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for letter generation |
| `STRIPE_SECRET_KEY` | No | For payments (not yet implemented) |
| `STRIPE_PUBLISHABLE_KEY` | No | For payments (not yet implemented) |

---

## Build Verification

The project builds successfully:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (7/7)

Route (app)                    Size     First Load JS
○ /                            3.73 kB  98.2 kB
○ /questionnaire               7.02 kB  111 kB
○ /review                      3.63 kB  108 kB
ƒ /api/generate-letter         0 B      0 B
```

---

## What's Included

- **Clean fintech design** - Dark theme inspired by Monzo/Revolut/Starling
- **5 complaint types** - Car finance, credit cards, fraud, loans, Section 75
- **Predictive success calculator** - Real-time success rate based on FOS patterns
- **Evidence scoring** - Shows impact of each evidence type
- **AI letter generation** - Uses Claude API with optimized prompts
- **Mobile responsive** - Works on all devices

---

## Post-Deploy Checklist

1. ✅ Verify homepage loads at your-domain.vercel.app
2. ✅ Test questionnaire flow with "Car finance" option
3. ✅ Add your Anthropic API key in Vercel project settings
4. ✅ Test letter generation (requires API key)
5. ✅ Set up custom domain (optional)

---

## Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., icomplain.co.uk)
3. Update DNS at your registrar:
   - CNAME: `@` → `cname.vercel-dns.com`
   - Or A record: `@` → `76.76.21.21`

---

## Support

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Edge runtime compatible
- No database required (sessionStorage)

Built and tested: Dec 31, 2025
