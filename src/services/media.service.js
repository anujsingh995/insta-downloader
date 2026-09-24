// ============================================================
// services/media.service.js
// Robust public-Instagram media extraction.
//
// Primary extractor: yt-dlp (via youtube-dl-exec), because the
// Instagram HTML/JSON layout changes frequently.
// Fallback: the older HTML/OpenGraph parser kept below.
// ============================================================

const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');
const { detectType, buildFilename, isValidHttpUrl } = require('../utils/helpers');
const youtubedl = require('youtube-dl-exec');

const BROWSER_HEADERS = {
  'User-Agent': config.USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
};

async function extractMedia(postUrl) {
  // Instagram changes its server-rendered HTML regularly.
  // yt-dlp has a maintained extractor and is the primary path.
  try {
    const items = await extractWithYtDlp(postUrl);
    if (items.length) {
      return { type: detectType(postUrl, items), items };
    }
  } catch (err) {
    console.warn('[extractor] yt-dlp:', cleanError(err));
  }

  // Keep a lightweight fallback for pages where OpenGraph is exposed.
  try {
    const html = await fetchPage(postUrl);
    let items = extractFromSharedData(html);
    if (!items.length) items = extractFromMetaTags(html);
    if (items.length) return { type: detectType(postUrl, items), items };
  } catch (err) {
    console.warn('[extractor] HTML fallback:', cleanError(err));
  }

  const error = new Error(
    'Could not extract public media from this Instagram URL. ' +
    'The post may be private, deleted, age/login restricted, or temporarily blocked by Instagram.'
  );
  error.statusCode = 422;
  throw error;
}

// ------------------------------------------------------------
// Primary extractor
// ------------------------------------------------------------
async function extractWithYtDlp(postUrl) {
  const info = await youtubedl(postUrl, {
    dumpSingleJson: true,
    noWarnings: true,
    noCallHome: true,
    noCheckCertificates: true,
    skipDownload: true,
    noPlaylist: false,
  }, {
    timeout: config.FETCH_TIMEOUT_MS,
  });

  const entries = [];
  if (Array.isArray(info?.entries) && info.entries.length) {
    entries.push(...info.entries.filter(Boolean));
  } else if (info) {
    entries.push(info);
  }

  const items = [];
  const seen = new Set();

  for (const entry of entries) {
    const media = normaliseYtDlpEntry(entry);
    if (media && !seen.has(media.url)) {
      seen.add(media.url);
      items.push(media);
    }

    // Some extractors expose a thumbnail separately.
    if (entry?.thumbnail && !seen.has(entry.thumbnail)) {
      seen.add(entry.thumbnail);
      items.push({
        url: entry.thumbnail,
        quality: 'thumbnail',
        ext: 'jpg',
        filename: buildFilename('jpg', items.length + 1),
      });
    }
  }

  return items;
}

function normaliseYtDlpEntry(entry) {
  const url = entry?.url;
  if (!isValidHttpUrl(url)) return null;

  const isVideo =
    entry?.vcodec && entry.vcodec !== 'none' ||
    entry?.ext === 'mp4' ||
    entry?.mime_type?.startsWith('video/');

  const ext = isVideo ? 'mp4' : (entry?.ext || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
  const width = entry?.width;
  const height = entry?.height;
  const quality = width && height ? `${width}x${height}` : (isVideo ? 'video' : 'original');

  return {
    url,
    quality,
    ext,
    filename: buildFilename(ext),
  };
}

// ------------------------------------------------------------
// HTML fallback
// ------------------------------------------------------------
async function fetchPage(url) {
  try {
    const response = await axios.get(url, {
      headers: BROWSER_HEADERS,
      timeout: config.FETCH_TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });
    return response.data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) {
      const e = new Error('Post not found (404). It may have been deleted.');
      e.statusCode = 404;
      throw e;
    }
    if (status === 401 || status === 403) {
      const e = new Error('This post is private or requires login.');
      e.statusCode = 403;
      throw e;
    }
    throw new Error(`Failed to reach Instagram: ${err.message}`);
  }
}

function extractFromSharedData(html) {
  const items = [];

  const sharedDataMatch = html.match(/window\._sharedData\s*=\s*(\{.+?\});<\/script>/s);
  if (sharedDataMatch) {
    try {
      const data = JSON.parse(sharedDataMatch[1]);
      const post = data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
      if (post) return parseGraphQLMedia(post);
    } catch (_) {}
  }

  const additionalMatch = html.match(
    /__additionalDataLoaded\s*\(\s*['"].*?['"]\s*,\s*(\{.+?\})\s*\)\s*;/s
  );
  if (additionalMatch) {
    try {
      const data = JSON.parse(additionalMatch[1]);
      const post = data?.graphql?.shortcode_media;
      if (post) return parseGraphQLMedia(post);
    } catch (_) {}
  }

  return items;
}

function parseGraphQLMedia(node) {
  const items = [];
  const typename = node?.__typename;

  if (typename === 'GraphVideo' && node.video_url) {
    items.push({
      url: node.video_url,
      quality: `${node.dimensions?.width || '?'}x${node.dimensions?.height || '?'}`,
      ext: 'mp4',
      filename: buildFilename('mp4'),
    });
  } else if (typename === 'GraphSidecar') {
    const edges = node.edge_sidecar_to_children?.edges || [];
    edges.forEach((edge, idx) => {
      const child = edge.node;
      if (child?.__typename === 'GraphVideo' && child.video_url) {
        items.push({
          url: child.video_url,
          quality: `${child.dimensions?.width || '?'}x${child.dimensions?.height || '?'}`,
          ext: 'mp4',
          filename: buildFilename('mp4', idx + 1),
        });
      } else if (child?.display_url) {
        items.push({
          url: child.display_url,
          quality: `${child.dimensions?.width || '?'}x${child.dimensions?.height || '?'}`,
          ext: 'jpg',
          filename: buildFilename('jpg', idx + 1),
        });
      }
    });
  } else if (node?.display_url) {
    items.push({
      url: node.display_url,
      quality: `${node.dimensions?.width || '?'}x${node.dimensions?.height || '?'}`,
      ext: 'jpg',
      filename: buildFilename('jpg'),
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

  const imageUrl = $('meta[property="og:image"]').attr('content');

  if (videoUrl && isValidHttpUrl(videoUrl)) {
    items.push({
      url: videoUrl,
      quality: 'SD',
      ext: 'mp4',
      filename: buildFilename('mp4'),
    });
  }

  if (imageUrl && isValidHttpUrl(imageUrl)) {
    items.push({
      url: imageUrl,
      quality: videoUrl ? 'thumbnail' : 'original',
      ext: 'jpg',
      filename: buildFilename('jpg'),
    });
  }

  return items;
}

// ------------------------------------------------------------
// Proxy
// ------------------------------------------------------------
// Only proxy known Instagram/Facebook CDN hosts. This prevents
// the endpoint from becoming an open SSRF proxy.
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
  if (!isValidHttpUrl(mediaUrl) || !isAllowedMediaHost(mediaUrl)) {
    const error = new Error('Media URL is not an allowed Instagram media host.');
    error.statusCode = 400;
    throw error;
  }

  const response = await axios.get(mediaUrl, {
    headers: {
      ...BROWSER_HEADERS,
      Referer: 'https://www.instagram.com/',
    },
    responseType: 'stream',
    timeout: config.FETCH_TIMEOUT_MS,
    maxRedirects: 5,
    maxContentLength: config.MAX_PROXY_BYTES,
  });

  const contentType = response.headers['content-type'] || 'application/octet-stream';
  const ext = contentType.includes('video') ? 'mp4' : 'jpg';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="instagram.${ext}"`);

  if (response.headers['content-length']) {
    res.setHeader('Content-Length', response.headers['content-length']);
  }

  response.data.on('error', (err) => {
    console.error('[proxy] Stream error:', err.message);
    if (!res.headersSent) res.status(502).json({ error: 'Media stream failed.' });
    else res.destroy(err);
  });

  response.data.pipe(res);
}

function cleanError(err) {
  return err?.stderr || err?.shortMessage || err?.message || String(err);
}


// ------------------------------------------------------------
// Profile extraction
// ------------------------------------------------------------
async function extractProfile(profileUrl, username, limit = 36) {
  const requestedLimit = Math.min(Math.max(Number(limit) || 36, 1), 200);
  const safeLimit = Math.min(requestedLimit, config.APIFY_MAX_POSTS || requestedLimit);

  if (config.APIFY_API_TOKEN) {
    try {
      const result = await extractProfileWithApify(profileUrl, username, safeLimit);
      if (result?.items?.length || result?.profile) {
        return result;
      }
    } catch (err) {
      console.warn('[profile] Apify:', cleanError(err));
    }
  }

  let html = null;
  try {
    html = await fetchPage(profileUrl);
  } catch (err) {
    console.warn('[profile] page fetch:', cleanError(err));
  }

  const profile = html
    ? parseProfileMetadata(html, username, profileUrl)
    : {
        username,
        fullName: username,
        bio: '',
        avatar: null,
        followers: null,
        following: null,
        posts: null,
        isVerified: false,
        url: profileUrl,
      };

  let items = [];

  if (html) {
    items = extractProfileEntriesFromHtml(html, safeLimit);
  }

  if (!items.length) {
    try {
      items = await extractProfileWithYtDlp(profileUrl, safeLimit);
    } catch (err) {
      console.warn('[profile] yt-dlp:', cleanError(err));
    }
  }

  return {
    type: 'profile',
    profile,
    items,
    totalReturned: items.length,
    totalAvailable: profile.posts,
    hasMore: false,
    cursor: null,
    limit: safeLimit,
    note: items.length
      ? 'These public entries were exposed by the available extractor. Each item can be opened and downloaded individually.'
      : config.APIFY_API_TOKEN
        ? 'Instagram did not expose public profile entries to the available extractors.'
        : 'Profile fetching needs an APIFY_API_TOKEN in the server environment because Instagram currently restricts many logged-out profile endpoints. Individual post and Reel downloads can still use the normal extractor.',
  };
}

async function extractProfileWithApify(profileUrl, username, limit) {
  const endpoint = `https://api.apify.com/v2/acts/${config.APIFY_PROFILE_ACTOR}/run-sync-get-dataset-items`;

  const response = await axios.post(endpoint, {
    profileUrlsOrHandles: [profileUrl],
    maxProfiles: 1,
    includePosts: true,
    includeReels: true,
    maxPostsPerProfile: limit,
    maxDirectUrls: 0,
    proxyConfiguration: { useApifyProxy: true },
  }, {
    params: { token: config.APIFY_API_TOKEN },
    headers: { 'Content-Type': 'application/json' },
    timeout: Math.max(config.FETCH_TIMEOUT_MS, 120000),
    validateStatus: status => status >= 200 && status < 500,
  });

  if (response.status < 200 || response.status >= 300) {
    const detail = response.data?.errorMessage || response.data?.error || `HTTP ${response.status}`;
    throw new Error(`Apify profile scraper failed: ${detail}`);
  }

  const records = Array.isArray(response.data) ? response.data : [];
  const profileRow = records.find(row => row && row.type === 'profile') || records.find(row => row?.profileUrl === profileUrl && !row?.postUrl);
  const mediaRows = records.filter(row => row && row.postUrl);

  const profile = {
    username: profileRow?.username || mediaRows[0]?.username || username,
    fullName: profileRow?.fullName || mediaRows[0]?.fullName || mediaRows[0]?.authorFullName || username,
    bio: profileRow?.biography || profileRow?.bio || mediaRows[0]?.biography || '',
    avatar: profileRow?.profilePicUrl || mediaRows[0]?.profilePicUrl || mediaRows[0]?.authorProfilePicUrl || null,
    followers: profileRow?.followersCount ?? mediaRows[0]?.followersCount ?? null,
    following: profileRow?.followingCount ?? mediaRows[0]?.followingCount ?? null,
    posts: profileRow?.postsCount ?? mediaRows[0]?.postsCount ?? null,
    isVerified: Boolean(profileRow?.isVerified ?? mediaRows[0]?.isVerified),
    url: profileUrl,
    isPrivate: Boolean(profileRow?.isPrivate ?? mediaRows[0]?.isPrivate),
  };

  const items = normalizeApifyMedia(mediaRows, safePositiveInt(limit, 1));

  if (profile.isPrivate) {
    return {
      type: 'profile',
      profile,
      items: [],
      totalReturned: 0,
      totalAvailable: profile.posts,
      hasMore: false,
      cursor: null,
      limit,
      note: 'This Instagram profile is private. InstaDown does not bypass private-account restrictions.',
    };
  }

  return {
    type: 'profile',
    profile,
    items,
    totalReturned: items.length,
    totalAvailable: profile.posts,
    hasMore: false,
    cursor: null,
    limit,
    note: items.length
      ? `Loaded ${items.length} public profile media item${items.length === 1 ? '' : 's'} through the profile scraper. Direct video URLs are used when Instagram exposes them.`
      : 'The profile scraper returned the profile but no public media items. Try again later or use a direct public post/Reel URL.',
  };
}

function normalizeApifyMedia(rows, limit) {
  const items = [];
  const seen = new Set();

  for (const row of rows) {
    const postUrl = row.postUrl || row.input;
    if (!isInstagramPostUrl(postUrl)) continue;

    const assets = [];

    if (Array.isArray(row.mediaAssets) && row.mediaAssets.length) {
      for (const asset of row.mediaAssets) {
        if (isValidHttpUrl(asset?.url)) {
          assets.push({
            url: asset.url,
            type: String(asset.type || '').toLowerCase(),
            thumbnail: asset.thumbnailUrl || row.thumbnailUrl,
          });
        }
      }
    }

    if (!assets.length && isValidHttpUrl(row.videoUrl)) {
      assets.push({ url: row.videoUrl, type: 'video', thumbnail: row.thumbnailUrl });
    }

    if (!assets.length && Array.isArray(row.videoUrls)) {
      for (const url of row.videoUrls) {
        if (isValidHttpUrl(url)) assets.push({ url, type: 'video', thumbnail: row.thumbnailUrl });
      }
    }

    if (!assets.length && Array.isArray(row.mediaUrls)) {
      for (const url of row.mediaUrls) {
        if (isValidHttpUrl(url)) assets.push({ url, type: String(row.type || '').toLowerCase(), thumbnail: row.thumbnailUrl });
      }
    }

    if (!assets.length) {
      const image = row.highestResolutionImageUrl || row.thumbnailUrl || row.imageUrls?.[0];
      if (isValidHttpUrl(image)) assets.push({ url: image, type: 'image', thumbnail: image });
    }

    for (let assetIndex = 0; assetIndex < assets.length && items.length < limit; assetIndex += 1) {
      const asset = assets[assetIndex];
      const directMediaUrl = isAllowedMediaHost(asset.url) ? asset.url : null;
      const isReel = /\/reel(?:s)?\//i.test(postUrl);
      const isVideo = asset.type.includes('video') || /\.mp4(?:[?#]|$)/i.test(asset.url);
      const key = `${postUrl}|${directMediaUrl || asset.url}`;
      if (seen.has(key)) continue;
      seen.add(key);

      items.push({
        id: `${row.shortCode || row.shortcode || shortcodeFromUrl(postUrl) || items.length + 1}-${assetIndex + 1}`,
        url: postUrl,
        directMediaUrl,
        thumbnail: isValidHttpUrl(asset.thumbnail) ? asset.thumbnail : null,
        title: row.caption?.slice(0, 100) || 'Instagram post',
        type: isVideo ? 'video' : 'post',
        kind: isReel ? 'reel' : isVideo ? 'video' : 'photo',
        ext: isVideo ? 'mp4' : 'jpg',
        timestamp: row.timestamp || row.takenAt || null,
      });
    }

    if (items.length >= limit) break;
  }

  return items;
}

function safePositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

async function extractProfileWithInstagramApi(username, limit) {
  const endpoints = [
    'https://www.instagram.com/api/v1/users/web_profile_info/',
    'https://i.instagram.com/api/v1/users/web_profile_info/',
  ];

  const headers = {
    'User-Agent': config.USER_AGENT,
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'X-IG-App-ID': '936619743392459',
    'X-ASBD-ID': '129477',
    'X-IG-WWW-Claim': '0',
    'Referer': `https://www.instagram.com/${encodeURIComponent(username)}/`,
    'Origin': 'https://www.instagram.com',
  };

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, {
        params: { username },
        headers,
        timeout: config.FETCH_TIMEOUT_MS,
        validateStatus: status => status >= 200 && status < 500,
      });

      if (response.status < 200 || response.status >= 300) {
        console.warn(`[profile] API ${response.status} from ${endpoint}`);
        continue;
      }

      const payload = response.data;
      const user = payload?.data?.user || payload?.user || null;
      if (!user) continue;

      const timeline = user.edge_owner_to_timeline_media || {};
      const edges = Array.isArray(timeline.edges) ? timeline.edges : [];

      const items = [];
      const seen = new Set();

      for (const edge of edges.slice(0, limit)) {
        const node = edge?.node;
        if (!node) continue;

        const shortcode = node.shortcode || node.code;
        if (!shortcode || seen.has(shortcode)) continue;
        seen.add(shortcode);

        const postUrl = `https://www.instagram.com/p/${shortcode}/`;
        const thumbnail =
          node.display_url ||
          node.thumbnail_src ||
          node.thumbnail_url ||
          null;

        items.push({
          id: String(shortcode),
          url: postUrl,
          directMediaUrl: null,
          thumbnail: isValidHttpUrl(thumbnail) ? thumbnail : null,
          title: node.edge_media_to_caption?.edges?.[0]?.node?.text?.slice(0, 100) || 'Instagram post',
          type: node.is_video ? 'video' : 'post',
          ext: node.is_video ? 'mp4' : null,
          timestamp: node.taken_at_timestamp || null,
        });
      }

      return {
        profile: {
          username: user.username || username,
          fullName: user.full_name || user.username || username,
          bio: user.biography || '',
          avatar: user.hd_profile_pic_url_info?.url || user.profile_pic_url_hd || user.profile_pic_url || null,
          followers: user.edge_followed_by?.count ?? null,
          following: user.edge_follow?.count ?? null,
          posts: user.edge_owner_to_timeline_media?.count ?? null,
          isVerified: Boolean(user.is_verified),
        },
        items,
        pageInfo: timeline.page_info || null,
      };
    } catch (err) {
      console.warn(`[profile] API request failed for ${endpoint}:`, cleanError(err));
    }
  }

  return null;
}

async function extractProfileWithYtDlp(profileUrl, limit) {
  const info = await youtubedl(profileUrl, {
    dumpSingleJson: true,
    flatPlaylist: true,
    playlistEnd: limit,
    noWarnings: true,
    noCallHome: true,
    noCheckCertificates: true,
    skipDownload: true,
    ignoreErrors: true,
  }, {
    timeout: config.FETCH_TIMEOUT_MS,
  });

  const entries = Array.isArray(info?.entries)
    ? info.entries.filter(Boolean)
    : [];

  const items = [];
  const seen = new Set();

  for (const entry of entries) {
    const postUrl = entry?.webpage_url || entry?.original_url || entry?.url;
    const directUrl = isValidHttpUrl(entry?.url) && isAllowedMediaHost(entry.url)
      ? entry.url
      : null;

    const instagramPost = isInstagramPostUrl(postUrl);
    if (!instagramPost && !directUrl) continue;

    const id = entry?.id || shortcodeFromUrl(postUrl) || `${items.length + 1}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const thumbnail =
      (isValidHttpUrl(entry?.thumbnail) && entry.thumbnail) ||
      (Array.isArray(entry?.thumbnails) && isValidHttpUrl(entry.thumbnails[0]?.url)
        ? entry.thumbnails[0].url
        : null);

    const looksVideo =
      entry?.vcodec && entry.vcodec !== 'none' ||
      entry?.ext === 'mp4' ||
      entry?.duration != null;
    const kind = /\/reel(?:s)?\//i.test(postUrl || '') ? 'reel' : looksVideo ? 'video' : 'photo';

    items.push({
      id: String(id),
      url: instagramPost ? postUrl : null,
      directMediaUrl: directUrl,
      thumbnail,
      title: entry?.title || entry?.description || 'Instagram post',
      type: looksVideo ? 'video' : 'post',
      kind,
      ext: looksVideo ? 'mp4' : null,
      timestamp: entry?.timestamp || null,
    });

    if (items.length >= limit) break;
  }

  return items;
}

function parseProfileMetadata(html, username, profileUrl) {
  const $ = cheerio.load(html);

  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const avatar = $('meta[property="og:image"]').attr('content') || null;

  const titleMatch = ogTitle.match(/^(.+?)(?:\s*\(@?([^\)]+)\))?\s*(?:•|on Instagram|Instagram)?$/i);
  const fullName = titleMatch?.[1]?.trim() || username;

  const stats = parseProfileStats(description);
  const bio = cleanProfileDescription(description, stats);

  let jsonLdProfile = null;
  $('script[type="application/ld+json"]').each((_, node) => {
    try {
      const parsed = JSON.parse($(node).contents().text());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const found = candidates.find(item =>
        item && (item['@type'] === 'Person' || item['@type'] === 'ProfilePage')
      );
      if (found) jsonLdProfile = found;
    } catch (_) {}
  });

  return {
    username,
    fullName: jsonLdProfile?.name || fullName,
    bio: jsonLdProfile?.description || bio,
    avatar: jsonLdProfile?.image?.url || jsonLdProfile?.image || avatar,
    followers: stats.followers,
    following: stats.following,
    posts: stats.posts,
    isVerified: /verified/i.test(description),
    url: profileUrl,
  };
}

function parseProfileStats(description) {
  const value = (pattern) => {
    const match = description.match(pattern);
    return match ? match[1] : null;
  };

  return {
    followers: value(/([\d,.]+(?:\s*[KMB])?)\s*Followers?/i),
    following: value(/([\d,.]+(?:\s*[KMB])?)\s*Following/i),
    posts: value(/([\d,.]+(?:\s*[KMB])?)\s*Posts?/i),
  };
}

function cleanProfileDescription(description, stats) {
  let text = description || '';

  [stats.followers, stats.following, stats.posts].forEach((value) => {
    if (value) {
      text = text.replace(new RegExp(`${escapeRegExp(value)}\\s*(Followers?|Following|Posts?)`, 'ig'), '');
    }
  });

  return text
    .replace(/[|•]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function extractProfileEntriesFromHtml(html, limit) {
  const items = [];
  const seen = new Set();

  const shortcodePattern = /"shortcode"\s*:\s*"([A-Za-z0-9_-]+)"/g;
  let match;

  while ((match = shortcodePattern.exec(html)) && items.length < limit) {
    const shortcode = match[1];
    const nearby = html.slice(match.index, match.index + 4000);
    const imageMatch = nearby.match(/"(?:display_url|thumbnail_src)"\s*:\s*"([^"\n]+)"/);
    const videoMatch = nearby.match(/"is_video"\s*:\s*(true|false)/);
    const thumbnail = decodeEscapedUrl(imageMatch?.[1] || '');
    if (seen.has(shortcode)) continue;
    seen.add(shortcode);

    const isVideo = videoMatch?.[1] === 'true';

    items.push({
      id: shortcode,
      url: `https://www.instagram.com/p/${shortcode}/`,
      directMediaUrl: null,
      thumbnail: isValidHttpUrl(thumbnail) ? thumbnail : null,
      title: 'Instagram post',
      type: isVideo ? 'video' : 'post',
      ext: isVideo ? 'mp4' : null,
      timestamp: null,
    });
  }

  return items;
}

function isInstagramPostUrl(value) {
  if (!value || typeof value !== 'string') return false;
  return /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?$/i.test(value);
}

function shortcodeFromUrl(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  return match?.[1] || null;
}

function decodeEscapedUrl(value) {
  return String(value || '').replaceAll('\\/', '/').replaceAll('\\u0026', '&');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { extractMedia, extractProfile, streamMedia };
