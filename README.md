# AutoPoster Pipeline

Internal tool to scrape job listings, generate AI content, publish to InternHack, and post to LinkedIn & Telegram.

## Tech Stack

- **Next.js 16** (App Router, Server Actions)
- **TypeScript**
- **PostgreSQL** + **Prisma 7**
- **Tailwind CSS** + **Shadcn UI**
- **Gemini API** (AI extraction, content generation, SVG poster)
- **Playwright** + **Cheerio** (web scraping)
- **Telegram Bot API**

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers (for scraping JS-heavy sites)

```bash
npx playwright install chromium
```

### 3. Set up PostgreSQL

Make sure you have PostgreSQL running locally. Create a database:

```sql
CREATE DATABASE autoposter;
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/apikey)

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Add Job URL** - Paste any job listing URL (LinkedIn, Internshala, Wellfound, Naukri, YC, company career pages)
2. **Auto-scrape** - The app detects static vs dynamic pages and extracts content using Cheerio or Playwright
3. **AI Extraction** - Gemini structures the raw text into company, role, salary, location, tags, etc.
4. **Review & Edit** - Edit all fields, add/remove tags, preview the JSON payload
5. **Publish to InternHack** - Send structured data to InternHack API, get back the InternHack URL
6. **Generate Content** - AI generates a simplified summary, LinkedIn post with InternHack CTA, and an SVG poster
7. **Post to Telegram** - Send the generated content to your Telegram channel via bot API

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats and recent jobs |
| `/jobs/new` | Add a new job URL |
| `/jobs/[id]` | Review and edit scraped job data |
| `/jobs/[id]/content` | Generated content (summary, LinkedIn post, poster) |
| `/settings` | Configure Telegram bot token and channel |
| `/history` | All processed jobs |

## Project Structure

```
src/
  app/            # Next.js App Router pages
  components/     # React components (forms, cards, sidebar)
  actions/        # Server actions (jobs, telegram)
  services/       # Business logic (scraper, AI, InternHack, Telegram)
  types/          # Zod schemas and TypeScript types
  lib/            # Prisma client, utilities
  generated/      # Prisma generated client (gitignored)
prisma/
  schema.prisma   # Database schema
```

## Deployment

- **Vercel** - Works out of the box (set env vars in Vercel dashboard). Note: Playwright requires a custom Vercel function setup or external scraping service for production.
- **Railway / Render** - Deploy with Docker, include Playwright in the Dockerfile.
- **Self-hosted** - Run with `npm run build && npm start` behind Nginx/Caddy.

For production, consider replacing Playwright scraping with a cloud-based scraping API to avoid browser binary issues.
