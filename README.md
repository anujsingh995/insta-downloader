# Instagram Media Backend

Express API for extracting media from public Instagram post/reel/story URLs.

## Requirements

- Node.js 18+
- Internet access
- Python 3.9+ is recommended because the current `youtube-dl-exec` package can use Python during its yt-dlp installation/check process.

## Windows setup

```powershell
cd insta-downloader
npm install
Copy-Item .env.example .env
npm run dev
```

Expected:

```text
[server] Running on port 4000 (development)
```

Health check:

```powershell
curl http://localhost:4000/health
```

Test extraction:

```powershell
curl.exe -X POST http://localhost:4000/api/media/fetch `
  -H "Content-Type: application/json" `
  -d "{\"url\":\"https://www.instagram.com/p/YOUR_POST_ID/\"}"
```

The API returns:

```json
{
  "source": "fresh",
  "type": "reel",
  "items": [
    {
      "url": "https://...",
      "quality": "1080x1920",
      "ext": "mp4",
      "filename": "instagram_....mp4"
    }
  ]
}
```

### Download through the backend

URL-encode an item URL and call:

```text
GET /api/media/proxy?url=<encoded-media-url>
```

The proxy only permits Instagram/Facebook media hosts to avoid turning the endpoint into an open SSRF proxy.

## Important

This works only for content that the extractor can access publicly. Instagram may require login, rate-limit requests, or change its anti-bot behavior. Do not use it to bypass private-account access.

The project uses `yt-dlp` as the primary extractor because scraping Instagram's HTML/embedded JSON is brittle and changes over time.
