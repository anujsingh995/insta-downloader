# Render setup for InstaDown

Use the existing Render service with these values.

## Build command

```text
npm install && npm --prefix frontend install --include=dev && npm --prefix frontend run build
```

## Start command

```text
npm start
```

## Required environment variables

```text
NODE_ENV=production
```

For profile mode:

```text
APIFY_API_TOKEN=your_real_apify_token
APIFY_PROFILE_ACTOR=fetch_cat~instagram-profile-posts-scraper
APIFY_MAX_POSTS=50
```

For the admin dashboard:

```text
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_long_random_admin_password
```

Keep the Apify token and admin password server-side. Do not put either value in frontend code or a public GitHub repository.

## Optional frontend build variables

```text
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_SITE_VERIFICATION=your_search_console_token
VITE_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
VITE_ADSENSE_SLOT_HERO=1234567890
VITE_ADSENSE_SLOT_RESULTS=1234567890
```

Rebuild the frontend after changing `VITE_*` variables.

## Stats persistence

The default stats store writes to `data/stats.json`. On an ephemeral Render filesystem, the file can be lost after a restart or redeploy. For durable server-side stats, attach a persistent disk and set:

```text
STATS_DATA_DIR=/var/data
```

The public download counter starts at 1,000 by design.
