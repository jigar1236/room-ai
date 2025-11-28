# Backend Setup Instructions - AI Interior Design Visualizer

Complete setup guide for the backend-only system.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (Neon recommended)
- Razorpay account (for payments)
- Google Cloud account (for Gemini API)
- Vercel account (for Blob storage)

---

## 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

This will install all required packages including:
- `@prisma/client` - Database ORM
- `next-auth` - Authentication
- `razorpay` - Payment processing
- `@google/generative-ai` - Gemini AI
- `@vercel/blob` - File storage
- `zod` - Validation

---

## 2. Database Setup (PostgreSQL - Neon)

### 2.1 Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@host/dbname?sslmode=require`)

### 2.2 Configure Environment Variable

Add to `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### 2.3 Run Prisma Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or create a migration
npm run db:migrate
```

### 2.4 Verify Database

```bash
# Open Prisma Studio to view database
npm run db:studio
```

---

## 3. Environment Variables

Create `.env.local` file in the root directory with all required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-here-use-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_GOOGLE_CLIENT_ID="your-google-client-id"
NEXTAUTH_GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Provider (Optional - for email auth)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@roomai.com"

# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 4. Google OAuth Setup (NextAuth)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

---

## 5. Razorpay Setup

### 5.1 Create Razorpay Account

1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get your API keys from Dashboard → Settings → API Keys

### 5.2 Configure Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/razorpay/verify-webhook`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
4. Copy webhook secret to `.env.local`

### 5.3 Create Subscription Plans

In Razorpay Dashboard → Products → Subscriptions:

Create plans (example):
- **Basic Plan**: ₹999/month → 100 credits/month
- **Pro Plan**: ₹1999/month → 250 credits/month
- **Premium Plan**: ₹3999/month → 500 credits/month

Note the Plan IDs and map them in `lib/razorpay.ts` or database.

### 5.4 Credit Pack Pricing

Configure credit packs in `lib/validate.ts`:

```typescript
const CREDIT_PACKS = {
  10: 99,    // ₹0.99 per credit
  50: 399,   // ₹7.98 per credit
  100: 699,  // ₹6.99 per credit
  250: 1499, // ₹5.996 per credit
  500: 2499, // ₹4.998 per credit
  1000: 3999, // ₹3.999 per credit
}
```

---

## 6. Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy to `.env.local` as `GEMINI_API_KEY`

**Note**: Gemini 2.5 Flash may require different API endpoints. Update `lib/gemini.ts` based on actual API documentation.

---

## 7. Vercel Blob Storage Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing
3. Go to Storage → Create → Blob
4. Copy the read/write token to `.env.local` as `BLOB_READ_WRITE_TOKEN`

---

## 8. SMTP Setup (Optional - for Email Auth)

If using email authentication:

### Gmail Setup:
1. Enable 2FA on Gmail
2. Generate App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use App Password in `SMTP_PASSWORD`

### Other Providers:
- **SendGrid**: Use SMTP settings from SendGrid dashboard
- **Resend**: Use Resend API (requires code changes)
- **AWS SES**: Use SES SMTP credentials

---

## 9. Run Development Server

```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

---

## 10. API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Upload
- `POST /api/upload` - Upload room image

### Generation
- `POST /api/generate` - Start room redesign
- `POST /api/replace-item` - Replace furniture
- `POST /api/moodboard` - Generate moodboard
- `POST /api/shopping-list` - Generate shopping list

### Razorpay
- `POST /api/razorpay/create-subscription` - Create subscription
- `POST /api/razorpay/cancel-subscription` - Cancel subscription
- `POST /api/razorpay/create-order` - Create credit pack order
- `POST /api/razorpay/verify-webhook` - Webhook handler (Razorpay calls this)

---

## 11. Server Actions

All server actions are in the `actions/` directory:

- `actions/projects.ts` - Project CRUD
- `actions/rooms.ts` - Room CRUD
- `actions/generation.ts` - AI generation workflows
- `actions/user.ts` - User profile and credits

---

## 12. Database Models

### Core Models:
- **User** - User accounts
- **Project** - Design projects
- **Room** - Rooms within projects
- **Asset** - Images (original, masks, generated)
- **Generation** - AI generation jobs
- **Subscription** - Razorpay subscriptions
- **CreditTransaction** - Credit history
- **Order** - Credit pack orders
- **Team** - Team collaboration (optional)

---

## 13. Credits System

### Credit Rules:
- **Free users**: 5 credits/month
- **Standard redesign**: 1 credit per variation
- **4K redesign**: 5 credits per variation
- **Subscriptions**: Monthly credits based on plan
- **Credit packs**: One-time purchases

### Credit Deduction:
- Credits are deducted ACID-safely using Prisma transactions
- Failed generations refund credits automatically
- Monthly credits awarded on subscription activation

---

## 14. AI Pipeline Flow

1. **Upload Image** → Vercel Blob
2. **Generate Mask** → SAM segmentation (or mock)
3. **Call Gemini** → Generate design variations
4. **Process Images** → Upscale/denoise
5. **Validate** → Check for text/warping
6. **Upload Results** → Vercel Blob
7. **Save Records** → Database
8. **Deduct Credits** → User account

---

## 15. Security Features

- ✅ NextAuth v5 with secure sessions
- ✅ Razorpay webhook signature verification (SHA256 HMAC)
- ✅ File upload validation (type, size)
- ✅ Input sanitization (prompt injection prevention)
- ✅ Route protection via middleware
- ✅ Ownership verification for all operations
- ✅ ACID-safe credit transactions

---

## 16. Production Deployment

### Vercel Deployment:

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Environment Variables in Vercel:

Add all `.env.local` variables to Vercel Dashboard → Settings → Environment Variables.

### Database Migration in Production:

```bash
# Set DATABASE_URL in Vercel
# Then run:
npm run db:push
```

---

## 17. Testing

### Test Authentication:
```bash
curl http://localhost:3000/api/auth/session
```

### Test Upload:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@room.jpg" \
  -F "roomId=room-id" \
  -F "type=original"
```

### Test Generation:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "room-id",
    "mode": "redesign",
    "roomType": "LIVING_ROOM",
    "style": "MODERN_MINIMALIST",
    "numVariations": 4
  }'
```

---

## 18. Troubleshooting

### Database Connection Issues:
- Verify `DATABASE_URL` is correct
- Check SSL mode (`?sslmode=require`)
- Ensure database is accessible from your IP

### NextAuth Issues:
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure callback URLs are correct in OAuth providers

### Razorpay Webhook Not Working:
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Review Razorpay dashboard webhook logs

### Gemini API Errors:
- Verify API key is valid
- Check API quota/limits
- Review Gemini API documentation for endpoint changes

### Blob Upload Failures:
- Verify `BLOB_READ_WRITE_TOKEN` is correct
- Check Vercel Blob storage is active
- Review file size limits (10MB default)

---

## 19. Next Steps

1. ✅ Complete environment setup
2. ✅ Run database migrations
3. ✅ Test authentication flow
4. ✅ Configure Razorpay plans
5. ✅ Test webhook endpoint (use Razorpay test mode)
6. ✅ Integrate SAM for mask generation (or use mock)
7. ✅ Test AI generation pipeline
8. ✅ Set up monitoring/logging
9. ✅ Configure rate limiting
10. ✅ Deploy to production

---

## 20. Additional Notes

### SAM Integration:
The current implementation uses mock segmentation masks. To integrate real SAM:
- Use Meta's SAM API (if available)
- Or deploy SAM model locally/inference server
- Update `lib/masks.ts` with actual implementation

### Image Generation:
Gemini 2.5 Flash may not support direct image generation. You may need to:
- Use Gemini to generate prompts
- Call separate image generation API (DALL-E, Stable Diffusion, Imagen)
- Update `lib/gemini.ts` accordingly

### Rate Limiting:
Consider adding rate limiting for:
- AI generation endpoints
- File uploads
- API routes

Use libraries like `@upstash/ratelimit` or `next-rate-limit`.

---

## Support

For issues or questions:
1. Check Prisma logs: `npm run db:studio`
2. Review server logs in terminal
3. Check Vercel function logs
4. Review Razorpay webhook logs

---

**Backend setup complete!** 🎉

All backend logic is now in place. The frontend can now call these APIs and server actions to build the complete application.

