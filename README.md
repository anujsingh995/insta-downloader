# InstaDown

InstaDown is a browser-based utility for supported public Instagram media.

## Included

- Public post and Reel media extraction
- Public profile mode with profile information and available media
- Profile filters: All, Reels, Videos, Photos
- Download All queue with progress
- Large live download counter starting at 1,000
- Recent searches stored locally in the browser
- Built-in admin dashboard for tracked server events
- Optional country/device analytics from available proxy headers
- SEO landing pages, FAQ, About, Terms, Privacy and DMCA pages
- robots.txt and sitemap.xml
- PWA manifest and service worker
- Optional Google Analytics 4 and AdSense integrations
- Render-friendly single-server production layout

## Run locally

```powershell
npm install
npm --prefix frontend install
npm start
```

In another terminal:

```powershell
npm --prefix frontend run dev
```

Open `http://localhost:5173/`.

## Profile mode

Profile mode accepts a public profile URL such as `https://www.instagram.com/username/` or a username such as `@username`. The configured Apify actor returns public profile data and available recent public posts/Reels. Instagram can change public access at any time, and private/restricted profiles are not bypassed.

Set:

```text
APIFY_API_TOKEN=...
APIFY_PROFILE_ACTOR=fetch_cat~instagram-profile-posts-scraper
APIFY_MAX_POSTS=50
```

The configured actor documents `profileUrlsOrHandles`, `includePosts`, `includeReels`, `maxPostsPerProfile` and public media URLs. Check the actor documentation for its current limits, pricing and input/output details before increasing limits.

## Admin dashboard

Set secure credentials in the server environment:

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=use-a-long-random-password
```

Then open `/admin`. The dashboard tracks aggregate server events and does not intentionally store raw IP addresses.

## Analytics

The built-in analytics endpoint records visit, media-fetch and profile-fetch events sent by the frontend. Google Analytics 4 is optional; set `VITE_GA_MEASUREMENT_ID` during the frontend build if you want GA4.

## Ads

AdSense support is intentionally opt-in. Set the AdSense client and slot environment variables only when the site is ready for your approved AdSense configuration. Do not use fake publisher or slot IDs.

## Persistence

The default stats store is JSON on disk. On Render's ephemeral filesystem, those values can be lost after a restart/redeploy. For durable storage, mount a persistent disk and set `STATS_DATA_DIR=/var/data`, or replace the stats adapter with a managed database.

## Legal / responsible use

Only download media you own or are authorized to save and use. InstaDown does not bypass private-account restrictions and is not an official Instagram service.

## Render

See [RENDER_SETUP.md](RENDER_SETUP.md) for production build, Apify, admin, analytics, AdSense and stats-persistence configuration.
