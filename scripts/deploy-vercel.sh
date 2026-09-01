# ─── FuckYouPayMe Vercel Deploy Script ───────────────────────────────────────
# Run: bash scripts/deploy-vercel.sh
# Requires: VERCEL_TOKEN set in environment or ~/.vercel token cached

echo "=== FuckYouPayMe — Vercel Deploy ==="

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

# Check for token
if [ -z "$VERCEL_TOKEN" ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  DEPLOY INSTRUCTIONS (2 minutes)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Your code is on GitHub at:"
  echo "  https://github.com/BitFlexFinTech/FuckYouPayMe"
  echo ""
  echo "  To deploy to Vercel:"
  echo ""
  echo "  1. Go to https://vercel.com/import"
  echo "  2. Select 'BitFlexFinTech/FuckYouPayMe'"
  echo "  3. Click 'Deploy'"
  echo ""
  echo "  Then set these environment variables in Vercel dashboard:"
  echo "  - DATABASE_URL=postgresql://..."
  echo "  - NEXTAUTH_SECRET=<random string>"
  echo "  - NEXTAUTH_URL=https://fuckyoupayme.online"
  echo "  - STRIPE_SECRET_KEY=sk_live_..."
  echo "  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_..."
  echo "  - STRIPE_WEBHOOK_SECRET=whsec_..."
  echo "  - RESEND_API_KEY=re_..."
  echo "  - PLATFORM_FEE_PERCENT=2.5"
  echo "  - NEXT_PUBLIC_APP_URL=https://fuckyoupayme.online"
  echo "  - CRON_SECRET=<random string>"
  echo ""
  echo "  Then add your domain:"
  echo "  Settings → Domains → fuckyoupayme.online"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
fi

echo "Deploying with Vercel token..."
vercel --token "$VERCEL_TOKEN" --prod --yes

echo ""
echo "=== Done! ==="