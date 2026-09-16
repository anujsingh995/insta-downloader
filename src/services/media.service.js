const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');
const {
  detectType,
  buildFilename,
  isValidHttpUrl
} = require('../utils/helpers');

const youtubedl = require('youtube-dl-exec');

const BROWSER_HEADERS = {
  'User-Agent': config.USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

// ============================================================
// MAIN EXTRACTION
// ============================================================

async function extractMedia(postUrl) {
  console.log('[extractor] Starting:', postUrl);

  try {
    const items = await extractWithYtDlp(postUrl);

    console.log(`[extractor] yt-dlp returned ${items.length} media items`);

    if (items.length > 0) {
      return {
        type: detectType(postUrl, items),
        items
      };
    }
  } catch (err) {
    console.warn('[extractor] yt-dlp failed:', cleanError(err));
  }

  // Fallback
  try {
    console.log('[extractor] Trying HTML fallback...');

    const html = await fetchPage(postUrl);

    let items = extractFromSharedData(html);

    if (!items.length) {
      items = extractFromMetaTags(html);
    }

    if (items.length) {
      return {
        type: detectType(postUrl, items),
        items
      };
    }
  } catch (err) {
    console.warn('[extractor] HTML fallback failed:', cleanError(err));
  }

  const error = new Error(
    'Could not extract public media from this Instagram URL. ' +
    'The post may be private, deleted, age/login restricted, or temporarily blocked by Instagram.'
  );

  error.statusCode = 422;
  throw error;
}

// ============================================================
// YT-DLP
// ============================================================

async function extractWithYtDlp(postUrl) {
  console.log('[yt-dlp] Extracting:', postUrl);

  const info = await youtubedl(postUrl, {
    dumpSingleJson: true,
    noWarnings: true,
    noCallHome: true,
    skipDownload: true,


    // Important for Instagram
    format: 'best[ext=mp4]/best',

    // Don't download the actual file
    simulate: true,

    // More reliable browser identity
    userAgent: config.USER_AGENT
  }, {
    timeout: config.FETCH_TIMEOUT_MS
  });

  if (!info) {
    throw new Error('yt-dlp returned no information');
  }

  console.log('[yt-dlp] ID:', info.id);
  console.log('[yt-dlp] Title:', info.title);
  console.log('[yt-dlp] Direct URL:', Boolean(info.url));

  const entries = [];

  if (Array.isArray(info.entries) && info.entries.length) {
    for (const entry of info.entries) {
      if (entry) entries.push(entry);
    }
  } else {
    entries.push(info);
  }

  const items = [];
  const seen = new Set();

  for (const entry of entries) {
    // Main media URL
    if (isValidHttpUrl(entry.url) && !seen.has(entry.url)) {
      const media = normaliseYtDlpEntry(entry);

      if (media) {
        seen.add(media.url);
        items.push(media);
      }
    }

    // Thumbnail
    if (
      entry.thumbnail &&
      isValidHttpUrl(entry.thumbnail) &&
      !seen.has(entry.thumbnail)
    ) {
      seen.add(entry.thumbnail);

      items.push({
        url: entry.thumbnail,
        quality: 'thumbnail',
        ext: 'jpg',
        filename: buildFilename('jpg', items.length + 1)
      });
    }
  }

  return items;
}

function normaliseYtDlpEntry(entry) {
  const url = entry?.url;

  if (!isValidHttpUrl(url)) {
    return null;
  }

  const isVideo =
    (entry?.vcodec && entry.vcodec !== 'none') ||
    entry?.ext === 'mp4' ||
    entry?.mime_type?.startsWith('video/');

  const ext = isVideo
    ? 'mp4'
    : String(entry?.ext || 'jpg')
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase() || 'jpg';

  const width = entry?.width;
  const height = entry?.height;

  const quality =
    width && height
      ? `${width}x${height}`
      : isVideo
        ? 'video'
        : 'original';

  return {
    url,
    quality,
    ext,
    filename: buildFilename(ext)
  };
}

// ============================================================
// HTML FALLBACK
// ============================================================

async function fetchPage(url) {
  const response = await axios.get(url, {
    headers: BROWSER_HEADERS,
    timeout: config.FETCH_TIMEOUT_MS,
    maxRedirects: 5,
    validateStatus: status => status >= 200 && status < 400
  });

  return response.data;
}

function extractFromSharedData(html) {
  const sharedDataMatch = html.match(
    /window\._sharedData\s*=\s*(\{.+?\});<\/script>/s
  );

  if (sharedDataMatch) {
    try {
      const data = JSON.parse(sharedDataMatch[1]);

      const post =
        data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;

      if (post) {
        return parseGraphQLMedia(post);
      }
    } catch (_) {}
  }

  const additionalMatch = html.match(
    /__additionalDataLoaded\s*\(\s*['"].*?['"]\s*,\s*(\{.+?\})\s*\)\s*;/s
  );

  if (additionalMatch) {
    try {
      const data = JSON.parse(additionalMatch[1]);

      const post = data?.graphql?.shortcode_media;

      if (post) {
        return parseGraphQLMedia(post);
      }
    } catch (_) {}
  }

  return [];
}

function parseGraphQLMedia(node) {
  const items = [];

  if (node?.__typename === 'GraphVideo' && node.video_url) {
    items.push({
      url: node.video_url,
      quality: `${node.dimensions?.width || '?'}x${node.dimensions?.height || '?'}`,
      ext: 'mp4',
      filename: buildFilename('mp4')
    });
  }

  else if (node?.__typename === 'GraphSidecar') {
    const edges =
      node.edge_sidecar_to_children?.edges || [];

    edges.forEach((edge, index) => {
      const child = edge.node;

      if (child?.__typename === 'GraphVideo' && child.video_url) {
        items.push({
          url: child.video_url,
          quality: `${child.dimensions?.width || '?'}x${child.dimensions?.height || '?'}`,
          ext: 'mp4',
          filename: buildFilename('mp4', index + 1)
        });
      }

      else if (child?.display_url) {
        items.push({
          url: child.display_url,
          quality: `${child.dimensions?.width || '?'}x${child.dimensions?.height || '?'}`,
          ext: 'jpg',
          filename: buildFilename('jpg', index + 1)
        });
      }
    });
  }

  else if (node?.display_url) {
    items.push({
      url: node.display_url,
      quality: `${node.dimensions?.width || '?'}x${node.dimensions?.height || '?'}`,
      ext: 'jpg',
      filename: buildFilename('jpg')
    });
  }

  return items;
}

function extractFromMetaTags(html) {
  const items = [];
  const $ = cheerio.load(html);

  const videoUrl =
    $('meta[property="og:video"]').attr('content') ||
    $('meta[property="og:video:secure_url"]').attr('content');

  const imageUrl =
    $('meta[property="og:image"]').attr('content');

  if (videoUrl && isValidHttpUrl(videoUrl)) {
    items.push({
      url: videoUrl,
      quality: 'SD',
      ext: 'mp4',
      filename: buildFilename('mp4')
    });
  }

  if (imageUrl && isValidHttpUrl(imageUrl)) {
    items.push({
      url: imageUrl,
      quality: videoUrl ? 'thumbnail' : 'original',
      ext: 'jpg',
      filename: buildFilename('jpg')
    });
  }

  return items;
}

// ============================================================
// PROXY
// ============================================================

function isAllowedMediaHost(rawUrl) {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();

    return (
      host === 'cdninstagram.com' ||
      host.endsWith('.cdninstagram.com') ||
      host === 'instagram.com' ||
      host.endsWith('.instagram.com') ||
      host === 'fbcdn.net' ||
      host.endsWith('.fbcdn.net') ||
      host === 'facebook.com' ||
      host.endsWith('.facebook.com')
    );
  } catch {
    return false;
  }
}

async function streamMedia(mediaUrl, res) {
  if (
    !isValidHttpUrl(mediaUrl) ||
    !isAllowedMediaHost(mediaUrl)
  ) {
    const error = new Error(
      'Media URL is not an allowed Instagram media host.'
    );

    error.statusCode = 400;
    throw error;
  }

  const response = await axios.get(mediaUrl, {
    headers: {
      ...BROWSER_HEADERS,
      Referer: 'https://www.instagram.com/'
    },
    responseType: 'stream',
    timeout: config.FETCH_TIMEOUT_MS,
    maxRedirects: 5,
    maxContentLength: config.MAX_PROXY_BYTES
  });

  const contentType =
    response.headers['content-type'] ||
    'application/octet-stream';

  const ext =
    contentType.includes('video')
      ? 'mp4'
      : 'jpg';

  res.setHeader('Content-Type', contentType);

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="instagram.${ext}"`
  );

  if (response.headers['content-length']) {
    res.setHeader(
      'Content-Length',
      response.headers['content-length']
    );
  }

  response.data.on('error', err => {
    console.error('[proxy] Stream error:', err.message);

    if (!res.headersSent) {
      res.status(502).json({
        error: 'Media stream failed.'
      });
    } else {
      res.destroy(err);
    }
  });

  response.data.pipe(res);
}

// ============================================================
// ERROR CLEANER
// ============================================================

function cleanError(err) {
  return (
    err?.stderr ||
    err?.shortMessage ||
    err?.message ||
    String(err)
  );
}

module.exports = {
  extractMedia,
  streamMedia
};