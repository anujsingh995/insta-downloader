import './style.css';

const API = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:4000'
  : '';

const SITE_URL = 'https://insta-downloader-ly9s.onrender.com';
const app = document.querySelector('#app');

const ROUTES = {
  '/instagram-video-downloader': {
    title: 'Instagram Video Downloader | InstaDown',
    description: 'Download supported public Instagram videos with InstaDown. Paste a public Instagram URL, preview the media and save it to your device.',
    eyebrow: 'INSTAGRAM VIDEO DOWNLOADER',
    heading: 'Download Instagram videos<br><span>without the hassle.</span>',
  },
  '/instagram-reel-downloader': {
    title: 'Instagram Reel Downloader | InstaDown',
    description: 'Save supported public Instagram Reels with InstaDown. Paste a Reel URL, fetch the media and download it from your browser.',
    eyebrow: 'INSTAGRAM REEL DOWNLOADER',
    heading: 'Download Instagram Reels<br><span>in a few clicks.</span>',
  },
  '/instagram-photo-downloader': {
    title: 'Instagram Photo Downloader | InstaDown',
    description: 'Download supported public Instagram photos with InstaDown. Paste the post URL, preview the image and save it.',
    eyebrow: 'INSTAGRAM PHOTO DOWNLOADER',
    heading: 'Save Instagram photos<br><span>simply and quickly.</span>',
  },
  '/instagram-profile-downloader': {
    title: 'Instagram Profile Downloader | InstaDown',
    description: 'Browse available public Instagram profile information and public posts or Reels with InstaDown.',
    eyebrow: 'INSTAGRAM PROFILE DOWNLOADER',
    heading: 'Browse public Instagram profiles<br><span>and download available media.</span>',
  },
  '/how-to-download-instagram-reels': {
    title: 'How to Download Instagram Reels | InstaDown',
    description: 'Learn how to download supported public Instagram Reels with InstaDown using a simple four-step workflow.',
    eyebrow: 'HOW IT WORKS',
    heading: 'How to download an Instagram Reel<br><span>step by step.</span>',
  },
  '/about': { title: 'About InstaDown | Instagram Downloader', description: 'Learn what InstaDown does, how profile mode works, and how the service handles supported public Instagram media.', eyebrow: 'ABOUT INSTADOWN', heading: 'Simple tools for<br><span>supported public media.</span>' },
  '/faq': {
    title: 'Instagram Downloader FAQ | InstaDown',
    description: 'Read common questions about InstaDown, public Instagram media, profile mode and downloads.',
    eyebrow: 'INSTADOWN FAQ',
    heading: 'Instagram downloader questions<br><span>answered.</span>',
  },
  '/privacy': { title: 'Privacy Policy | InstaDown', description: 'Read the InstaDown privacy policy and learn what information the site stores.', eyebrow: 'PRIVACY', heading: 'Your privacy<br><span>matters here.</span>' },
  '/terms': { title: 'Terms of Use | InstaDown', description: 'Read the InstaDown terms of use for supported public media downloads.', eyebrow: 'TERMS', heading: 'Terms of use<br><span>for InstaDown.</span>' },
  '/dmca': { title: 'DMCA / Copyright | InstaDown', description: 'Read the InstaDown copyright and DMCA process for reporting content.', eyebrow: 'COPYRIGHT', heading: 'Copyright & DMCA<br><span>information.</span>' },
};

const routeConfig = ROUTES[window.location.pathname] || {
  title: 'Instagram Video, Reel & Profile Downloader | InstaDown',
  description: 'InstaDown is a simple Instagram video, Reel, photo and public profile downloader for supported public URLs.',
  eyebrow: 'INSTAGRAM MEDIA DOWNLOADER',
  heading: 'Download Instagram videos<br><span>Reels & profiles.</span>',
};

function applySeo() {
  document.title = routeConfig.title;
  const description = document.querySelector('meta[name="description"]');
  const canonical = document.querySelector('link[rel="canonical"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');

  const path = window.location.pathname === '/' ? '/' : window.location.pathname;
  const url = `${SITE_URL}${path}`;
  if (description) description.setAttribute('content', routeConfig.description);
  if (canonical) canonical.setAttribute('href', url);
  if (ogTitle) ogTitle.setAttribute('content', routeConfig.title);
  if (ogDescription) ogDescription.setAttribute('content', routeConfig.description);
  if (ogUrl) ogUrl.setAttribute('content', url);

  const verification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
  if (verification) {
    let meta = document.querySelector('meta[name=\"google-site-verification\"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      document.head.appendChild(meta);
    }
    meta.content = verification;
  }
}

function applyGoogleAnalytics() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!id || document.querySelector('script[data-instdown-ga]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.instdownGa = 'true';
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, { anonymize_ip: true });
}

function render() {
  if (window.location.pathname === '/admin') {
    renderAdmin();
    return;
  }
  if (['/privacy', '/terms', '/dmca'].includes(window.location.pathname)) {
    renderLegalPage(window.location.pathname);
    return;
  }

  app.innerHTML = `
    <div class="app">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>

      <header>
        <a class="logo" href="/" aria-label="InstaDown home">Insta<span>Down</span></a>
        <button id="installBtn" class="install-btn hidden" type="button">Install App</button>
        <nav class="top-nav" aria-label="Main navigation">
          <a href="/#how-to-download">How to Download</a>
          <a href="/#profile-downloader">Profile</a>
          <a href="/faq">FAQ</a>
          <a href="/about">About</a>
        </nav>
        <a class="status status-link" href="/admin" title="Admin dashboard">
          <span class="dot"></span>Server is Live
        </a>
      </header>

      <main>
        <section class="hero" aria-labelledby="hero-title">
          <p class="eyebrow">${routeConfig.eyebrow}</p>
          <h1 id="hero-title">${routeConfig.heading}</h1>
          <p class="subtitle">${routeConfig.description} No Instagram password or login is requested.</p>

          <div class="search-box">
            <label class="sr-only" for="urlInput">Instagram URL or username</label>
            <input id="urlInput" type="text" inputmode="url" placeholder="Paste a post, Reel, profile URL or @username..." autocomplete="off" />
            <button id="fetchBtn" type="button">Fetch Media</button>
          </div>
          <p class="input-help">Public Instagram URLs only. You can also enter a username such as <strong>@instagram</strong>.</p>
          <div id="recentSearches" class="recent-searches hidden" aria-label="Recent searches"></div>

          <div class="download-counter" aria-live="polite">
            <div class="counter-top"><span class="counter-live-dot"></span><span>PEOPLE ARE DOWNLOADING</span></div>
            <div class="counter-number"><span id="downloadCount">1,000</span></div>
            <div class="counter-label">downloads & counting 🚀</div>
          </div>

          <div class="ad-slot ad-slot-hero" data-ad-slot="hero" aria-label="Advertisement"></div>
          <p id="message" class="message" aria-live="polite"></p>
        </section>

        <section id="results" class="results hidden" aria-live="polite"></section>
        <section id="profileResults" class="profile-results hidden" aria-live="polite"></section>

        <section id="profile-downloader" class="content-section" aria-labelledby="profile-title">
          <div class="section-heading">
            <p class="eyebrow">PROFILE MODE</p>
            <h2 id="profile-title">Instagram profile downloader</h2>
            <p>Paste a public profile link or username to see available profile information and public media. Use filters to focus on Reels, videos or photos.</p>
          </div>
          <div class="profile-feature-grid">
            <article class="info-card"><h3>Profile preview</h3><p>See available username, bio, profile photo and public account statistics.</p></article>
            <article class="info-card"><h3>Media filters</h3><p>Switch between all available items, Reels, videos and photos.</p></article>
            <article class="info-card"><h3>Download all available</h3><p>Queue the loaded public media items and watch the download progress.</p></article>
          </div>
        </section>

        <section class="content-section route-seo" aria-labelledby="route-seo-title">
          <div class="section-heading">
            <p class="eyebrow">${escapeHtml(routeConfig.eyebrow)}</p>
            <h2 id="route-seo-title">${routeSeoHeading(routeConfig.eyebrow)}</h2>
          </div>
          <div class="route-seo-copy">${routeSeoCopy(window.location.pathname)}</div>
        </section>

        <section id="how-to-download" class="content-section" aria-labelledby="how-title">
          <div class="section-heading">
            <p class="eyebrow">SIMPLE STEPS</p>
            <h2 id="how-title">How to download an Instagram video or Reel</h2>
            <p>Four simple steps on your phone, tablet or computer.</p>
          </div>
          <div class="steps-grid">
            <article class="info-card"><span class="step-number">01</span><h3>Copy the link</h3><p>Open a public Instagram post or Reel and copy its link.</p></article>
            <article class="info-card"><span class="step-number">02</span><h3>Paste it</h3><p>Paste the link into the InstaDown input box above.</p></article>
            <article class="info-card"><span class="step-number">03</span><h3>Fetch media</h3><p>Click <strong>Fetch Media</strong> and wait for the supported media to load.</p></article>
            <article class="info-card"><span class="step-number">04</span><h3>Download</h3><p>Preview the result and click <strong>Download</strong> to save it.</p></article>
          </div>
        </section>

        <section class="content-section seo-links" aria-labelledby="tools-title">
          <div class="section-heading"><p class="eyebrow">TOOLS</p><h2 id="tools-title">Explore InstaDown</h2></div>
          <div class="link-grid">
            <a class="link-card" href="/instagram-video-downloader"><strong>Instagram Video Downloader</strong><span>Download supported public videos.</span></a>
            <a class="link-card" href="/instagram-reel-downloader"><strong>Instagram Reel Downloader</strong><span>Save supported public Reels.</span></a>
            <a class="link-card" href="/instagram-photo-downloader"><strong>Instagram Photo Downloader</strong><span>Save supported public images.</span></a>
            <a class="link-card" href="/instagram-profile-downloader"><strong>Instagram Profile Downloader</strong><span>Browse public profile media.</span></a>
            <a class="link-card" href="/how-to-download-instagram-reels"><strong>How to Download Reels</strong><span>Follow the step-by-step guide.</span></a>
            <a class="link-card" href="/faq"><strong>FAQ</strong><span>Find answers to common questions.</span></a>
          </div>
        </section>

        <section class="content-section two-column" aria-labelledby="about-title">
          <div><p class="eyebrow">ABOUT INSTADOWN</p><h2 id="about-title">A simple public-media downloader</h2></div>
          <div class="content-copy"><p>InstaDown is a browser-based tool for fetching supported public Instagram media. Paste a URL, preview what is available and download the media you are authorized to save.</p><p>Instagram may change how public pages and media are delivered. When a URL cannot be processed, the site explains that the content may be private, restricted, deleted or temporarily unavailable.</p></div>
        </section>

        <section class="content-section" aria-labelledby="features-title">
          <div class="section-heading"><p class="eyebrow">FEATURES</p><h2 id="features-title">Useful tools, without the clutter</h2></div>
          <div class="features-grid">
            <article class="info-card"><h3>No Instagram login</h3><p>InstaDown does not ask you for your Instagram password.</p></article>
            <article class="info-card"><h3>Profile mode</h3><p>Browse public profile information and available public media.</p></article>
            <article class="info-card"><h3>Download queue</h3><p>Queue the currently loaded profile media and track progress.</p></article>
            <article class="info-card"><h3>Live counter</h3><p>See the public lifetime download counter update as downloads complete.</p></article>
          </div>
        </section>

        <section class="content-section faq-section" id="faq" aria-labelledby="faq-title">
          <div class="section-heading"><p class="eyebrow">FAQ</p><h2 id="faq-title">Frequently asked questions</h2><p>Useful answers about InstaDown and supported public Instagram media.</p></div>
          <div class="faq-list">
            <details><summary>What is InstaDown?</summary><p>InstaDown is a browser-based tool for fetching and downloading supported public Instagram media.</p></details>
            <details><summary>How do I download an Instagram Reel?</summary><p>Copy a public Reel link, paste it into InstaDown, click Fetch Media and use the Download button.</p></details>
            <details><summary>How does profile mode work?</summary><p>Enter a public profile URL or username. InstaDown requests available public profile information and media, then renders the items returned by the extractor.</p></details>
            <details><summary>Can I download every video from a profile?</summary><p>Download All queues every public media item that was successfully loaded on the page. Private, deleted, restricted or unavailable items cannot be included.</p></details>
            <details><summary>Do I need an Instagram login?</summary><p>No. InstaDown is designed without asking for your Instagram credentials.</p></details>
            <details><summary>Can I download private Instagram posts?</summary><p>No. InstaDown does not bypass private-account or access controls.</p></details>
            <details><summary>Why is my profile not loading?</summary><p>Instagram can restrict logged-out profile access or change its public endpoints. The site also relies on the configured profile scraper for profile mode.</p></details>
            <details><summary>Why isn't my Instagram URL working?</summary><p>Check that the URL is correct and public. Deleted, restricted or temporarily blocked media may not be available.</p></details>
            <details><summary>Where are downloads saved?</summary><p>Your browser normally saves downloaded files to its configured Downloads folder unless you choose another location.</p></details>
            <details><summary>Is InstaDown affiliated with Instagram?</summary><p>No. InstaDown is an independent third-party site and is not an official Instagram service.</p></details>
          </div>
        </section>

        <section class="content-section usage-note" aria-labelledby="usage-title">
          <h2 id="usage-title">Use InstaDown responsibly</h2>
          <p>Only download media you own, have permission to save, or are otherwise authorized to use. Respect creators' rights, privacy and platform rules.</p>
        </section>
      </main>

      <footer>
        <div><strong>InstaDown</strong><span>Built for supported public media.</span></div>
        <nav aria-label="Footer navigation"><a href="/#how-to-download">How to Download</a><a href="/instagram-profile-downloader">Profile</a><a href="/faq">FAQ</a><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/dmca">DMCA</a><a href="/admin">Admin</a></nav>
      </footer>
    </div>
  `;

  bindHome();
  renderRecentSearches();
  applyAds();
  trackEvent('visit');
}

function bindHome() {
  const urlInput = document.querySelector('#urlInput');
  const fetchBtn = document.querySelector('#fetchBtn');
  const message = document.querySelector('#message');
  const results = document.querySelector('#results');
  const profileResults = document.querySelector('#profileResults');
  const downloadCount = document.querySelector('#downloadCount');

  fetchBtn.addEventListener('click', fetchRequestedUrl);
  urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') fetchRequestedUrl();
  });

  async function fetchRequestedUrl() {
    const url = normalizeInputUrl(urlInput.value);
    if (!url) return showMessage('Paste an Instagram URL or username first.', true);
    if (!url.includes('instagram.com')) return showMessage('Please enter a valid Instagram URL.', true);

    const profileMode = isProfileUrl(url);
    fetchBtn.disabled = true;
    fetchBtn.textContent = profileMode ? 'Loading Profile...' : 'Fetching...';
    results.classList.add('hidden');
    profileResults.classList.add('hidden');
    results.innerHTML = '';
    profileResults.innerHTML = '';

    const progress = startProgress(profileMode ? ['Connecting to profile service...', 'Loading public profile...', 'Preparing media grid...'] : ['Checking URL...', 'Fetching supported media...', 'Preparing preview...']);
    try {
      if (profileMode) await fetchProfile(url);
      else await fetchMedia(url);
    } catch (error) {
      console.error(error);
      showMessage(friendlyError(error), true);
    } finally {
      stopProgress(progress);
      fetchBtn.disabled = false;
      fetchBtn.textContent = 'Fetch Media';
    }
  }

  async function fetchMedia(url) {
    const response = await fetch(`${API}/api/media/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await safeJson(response);
    if (!response.ok) throw new Error(data.error || 'Could not fetch media.');
    renderResults(data);
    showMessage(`Found ${data.items.length} media item${data.items.length === 1 ? '' : 's'}.`);
    rememberSearch(url);
  }

  async function fetchProfile(url) {
    const response = await fetch(`${API}/api/media/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, limit: 50 }),
    });
    const data = await safeJson(response);
    if (!response.ok) throw new Error(data.error || 'Could not fetch the profile.');
    renderProfile(data);
    showMessage(data.items.length ? `Profile loaded with ${data.items.length} available public item${data.items.length === 1 ? '' : 's'}.` : 'Profile loaded, but no public media entries were returned.');
    rememberSearch(url);
  }

  function renderResults(data) {
    results.classList.remove('hidden');
    results.innerHTML = `<div class="results-header"><div><p class="eyebrow">MEDIA FOUND</p><h2>${escapeHtml(data.type || 'Media')}</h2></div><span class="count">${data.items.length}</span></div><div class="ad-slot ad-slot-results" data-ad-slot="results" aria-label="Advertisement"></div><div class="media-grid">${data.items.map((item, index) => createMediaCard(item, index)).join('')}</div>`;
    applyAds();
    results.querySelectorAll('[data-download-index]').forEach((button) => button.addEventListener('click', () => downloadOne(data.items[Number(button.dataset.downloadIndex)], button)));
  }

  function createMediaCard(item, index) {
    const isVideo = item.ext === 'mp4';
    return `<article class="media-card"><div class="preview">${isVideo ? `<video src="${escapeAttribute(item.url)}" controls preload="metadata" aria-label="Instagram video preview"></video>` : `<img src="${escapeAttribute(item.url)}" alt="Instagram image preview" loading="lazy" />`}</div><div class="card-info"><div><strong>${isVideo ? 'Video' : 'Image'}</strong><span>${escapeHtml(item.quality || 'Original')}</span></div><button class="download-btn" type="button" data-download-index="${index}">Download</button></div></article>`;
  }

  function renderProfile(data) {
    profileResults.classList.remove('hidden');
    const profile = data.profile || {};
    const avatar = profile.avatar ? `<img src="${escapeAttribute(profile.avatar)}" alt="Profile picture of @${escapeAttribute(profile.username || '')}" loading="lazy" />` : `<div class="profile-avatar-placeholder">@</div>`;
    const initialItems = data.items || [];

    profileResults.innerHTML = `
      <div class="profile-card">
        <div class="profile-avatar">${avatar}</div>
        <div class="profile-main">
          <div class="profile-title-row"><div><p class="eyebrow">INSTAGRAM PROFILE</p><h2>${escapeHtml(profile.fullName || profile.username || 'Profile')}</h2><a class="profile-handle" href="${escapeAttribute(profile.url || '#')}" target="_blank" rel="noopener noreferrer">@${escapeHtml(profile.username || '')}</a></div>${profile.isVerified ? '<span class="verified-badge">VERIFIED</span>' : ''}</div>
          <p class="profile-bio">${escapeHtml(profile.bio || 'Public profile information available from Instagram.')}</p>
          <div class="profile-stats">${profileStat('Followers', profile.followers)}${profileStat('Following', profile.following)}${profileStat('Posts', profile.posts)}${profileStat('Loaded', data.totalReturned)}</div>
        </div>
      </div>
      <div class="profile-toolbar">
        <div><p class="eyebrow">PUBLIC MEDIA</p><h3>Available posts & Reels</h3></div>
        <div class="filter-row" role="group" aria-label="Profile media filters"><button class="filter-btn active" data-filter="all" type="button">All</button><button class="filter-btn" data-filter="reel" type="button">Reels</button><button class="filter-btn" data-filter="video" type="button">Videos</button><button class="filter-btn" data-filter="photo" type="button">Photos</button><button class="download-all-btn" id="downloadAllBtn" type="button">Download All</button></div>
      </div>
      <div id="profileProgress" class="queue-progress hidden"><div class="queue-top"><strong>Download queue</strong><span id="queueStatus">0 / 0</span></div><div class="progress-track"><div id="queueBar" class="progress-bar"></div></div><p id="queueMessage">Preparing…</p></div>
      <div id="profileGrid" class="profile-grid">${initialItems.map((item, index) => createProfileCard(item, index)).join('')}</div>
      <p class="profile-note">${escapeHtml(data.note || '')}</p>
    `;

    let activeFilter = 'all';
    const grid = profileResults.querySelector('#profileGrid');
    const filterButtons = profileResults.querySelectorAll('[data-filter]');
    filterButtons.forEach((button) => button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      updateProfileGrid(initialItems, activeFilter);
    }));
    profileResults.querySelector('#downloadAllBtn').addEventListener('click', () => downloadAll(initialItems));

    function updateProfileGrid(items, filter) {
      const filtered = items.filter(item => filter === 'all' || item.kind === filter);
      grid.innerHTML = filtered.length ? filtered.map((item) => createProfileCard(item, items.indexOf(item))).join('') : `<div class="empty-profile"><h3>Nothing in this filter</h3><p>No loaded public item matched this category.</p></div>`;
      grid.querySelectorAll('[data-profile-download]').forEach((button) => button.addEventListener('click', () => downloadProfileItem(items[Number(button.dataset.profileDownload)], button)));
    }

    profileResults.querySelectorAll('[data-profile-download]').forEach((button) => button.addEventListener('click', () => downloadProfileItem(initialItems[Number(button.dataset.profileDownload)], button)));
    profileResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function profileStat(label, value) {
    return `<div><strong>${escapeHtml(value == null ? '—' : String(value))}</strong><span>${label}</span></div>`;
  }

  function createProfileCard(item, index) {
    const isVideo = item.kind === 'video' || item.kind === 'reel' || item.type === 'video' || item.ext === 'mp4';
    const kindLabel = item.kind === 'reel' ? 'REEL' : isVideo ? 'VIDEO' : 'PHOTO';
    return `<article class="profile-media-card"><div class="profile-media-preview">${item.thumbnail ? `<img src="${escapeAttribute(item.thumbnail)}" alt="Instagram ${kindLabel.toLowerCase()} thumbnail" loading="lazy" />` : `<div class="no-thumb"><span>${kindLabel}</span></div>`}<span class="profile-media-badge">${kindLabel}</span></div><div class="profile-media-info"><strong>${escapeHtml(item.title || 'Instagram post')}</strong><button class="download-btn profile-download-btn" type="button" data-profile-download="${index}">Download</button></div></article>`;
  }

  async function downloadOne(item, button) {
    if (!item?.url) return;
    setButtonLoading(button, 'Preparing...');
    try {
      const direct = item.url;
      const proxyUrl = `${API}/api/media/proxy?url=${encodeURIComponent(direct)}`;
      triggerDownload(proxyUrl, item.filename || `instagram_${Date.now()}.${item.ext || 'mp4'}`);
      showMessage('Download started.');
      setTimeout(loadDownloadCount, 800);
    } catch (error) {
      showMessage(friendlyError(error), true);
    } finally {
      resetButton(button, 'Download');
    }
  }

  async function downloadProfileItem(item, button) {
    if (!item) return;
    setButtonLoading(button, 'Preparing...');
    try {
      let chosen = item.directMediaUrl ? { url: item.directMediaUrl, ext: item.ext || 'mp4' } : null;
      if (!chosen && item.url) {
        const response = await fetch(`${API}/api/media/fetch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url }) });
        const data = await safeJson(response);
        if (!response.ok) throw new Error(data.error || 'Could not prepare this post.');
        chosen = data.items?.find(media => media.ext === 'mp4') || data.items?.[0] || null;
      }
      if (!chosen?.url) throw new Error('No downloadable public media was returned.');
      triggerDownload(`${API}/api/media/proxy?url=${encodeURIComponent(chosen.url)}`, chosen.filename || `instagram_${Date.now()}.${chosen.ext || 'mp4'}`);
      showMessage('Download started.');
      setTimeout(loadDownloadCount, 800);
    } catch (error) {
      showMessage(friendlyError(error), true);
    } finally {
      resetButton(button, 'Download');
    }
  }

  async function downloadAll(items) {
    const queueItems = items.filter(item => item?.url || item?.directMediaUrl);
    if (!queueItems.length) return showMessage('There are no downloadable public items loaded.', true);
    const progress = profileResults.querySelector('#profileProgress');
    const bar = profileResults.querySelector('#queueBar');
    const status = profileResults.querySelector('#queueStatus');
    const queueMessage = profileResults.querySelector('#queueMessage');
    progress.classList.remove('hidden');
    const total = queueItems.length;
    let done = 0;
    for (const item of queueItems) {
      status.textContent = `${done} / ${total}`;
      queueMessage.textContent = `Preparing item ${done + 1} of ${total}...`;
      try {
        let chosen = item.directMediaUrl ? { url: item.directMediaUrl, ext: item.ext || 'mp4' } : null;
        if (!chosen && item.url) {
          const response = await fetch(`${API}/api/media/fetch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url }) });
          const data = await safeJson(response);
          if (response.ok) chosen = data.items?.find(media => media.ext === 'mp4') || data.items?.[0] || null;
        }
        if (chosen?.url) {
          triggerDownload(`${API}/api/media/proxy?url=${encodeURIComponent(chosen.url)}`, chosen.filename || `instagram_${Date.now()}.${chosen.ext || 'mp4'}`);
        }
      } catch (error) {
        console.warn('[download-all]', error);
      }
      done += 1;
      status.textContent = `${done} / ${total}`;
      bar.style.width = `${Math.round((done / total) * 100)}%`;
      await sleep(1200);
    }
    queueMessage.textContent = `Finished ${done} queued item${done === 1 ? '' : 's'}. Your browser may ask permission for multiple downloads.`;
    showMessage('Download queue finished.');
    setTimeout(loadDownloadCount, 800);
  }

  function normalizeInputUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^@?[A-Za-z0-9._]{1,30}$/.test(raw)) return `https://www.instagram.com/${raw.replace(/^@/, '')}/`;
    if (/^instagram\.com\//i.test(raw)) return `https://${raw}`;
    if (/^www\.instagram\.com\//i.test(raw)) return `https://${raw}`;
    return raw;
  }

  function isProfileUrl(rawUrl) {
    try {
      const parsed = new URL(rawUrl.trim());
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      if (host !== 'instagram.com') return false;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length !== 1) return false;
      return !['p','reel','reels','tv','stories','explore','accounts','direct','about','developer','web','emails','legal','privacy','terms'].includes(parts[0].toLowerCase());
    } catch { return false; }
  }

  async function loadDownloadCount() {
    try {
      const response = await fetch(`${API}/api/media/stats`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const nextValue = Number(data.downloads || 0).toLocaleString();
      if (downloadCount.textContent !== nextValue) {
        downloadCount.classList.remove('counter-pop');
        void downloadCount.offsetWidth;
        downloadCount.classList.add('counter-pop');
      }
      downloadCount.textContent = nextValue;
    } catch (_) {}
  }

  window.__instadownRecent = getRecentSearches();
  loadDownloadCount();
  window.__instadownCounterTimer = setInterval(loadDownloadCount, 5000);
}


function routeSeoHeading(eyebrow) {
  const headings = {
    'INSTAGRAM VIDEO DOWNLOADER': 'A focused video downloader for public Instagram URLs',
    'INSTAGRAM REEL DOWNLOADER': 'Save supported public Instagram Reels from your browser',
    'INSTAGRAM PHOTO DOWNLOADER': 'Download supported public Instagram photos with a simple workflow',
    'INSTAGRAM PROFILE DOWNLOADER': 'Browse public profile information and available media',
    'HOW IT WORKS': 'A quick guide from Instagram link to downloaded file',
    'INSTADOWN FAQ': 'Answers about public media, profiles and downloads',
    'ABOUT INSTADOWN': 'What InstaDown is built to do',
    'INSTAGRAM MEDIA DOWNLOADER': 'One place for supported public Instagram media'
  };
  return headings[eyebrow] || headings['INSTAGRAM MEDIA DOWNLOADER'];
}

function routeSeoCopy(pathname) {
  const copy = {
    '/instagram-video-downloader': `
      <p>Use InstaDown when you have a public Instagram video URL. Paste the link above, let the service fetch supported media, preview the result, and start the download from your browser.</p>
      <p>The tool does not ask for your Instagram password. Some posts can still be unavailable because the content is private, deleted, restricted or no longer exposed to the extractor.</p>`,
    '/instagram-reel-downloader': `
      <p>For a public Reel, copy its Instagram link and paste it into InstaDown. The service tries the supported media extractor and shows the available video for preview and download.</p>
      <p>Reel URLs can stop working when Instagram changes how public media is delivered. InstaDown reports those cases instead of pretending unavailable media was downloaded.</p>`,
    '/instagram-photo-downloader': `
      <p>Paste a public Instagram post URL to retrieve supported image media. When an image is available, InstaDown gives you a preview and a download action.</p>
      <p>Carousel posts may expose more than one image. What appears depends on the public media returned by the current extractor.</p>`,
    '/instagram-profile-downloader': `
      <p>Profile mode accepts a public Instagram profile URL or username. When the configured profile scraper returns public data, InstaDown renders the profile picture, username, bio, available account statistics and loaded media.</p>
      <p>Use the All, Reels, Videos and Photos filters to narrow the loaded results. Download All queues the media currently loaded on the page; it does not bypass private or restricted content.</p>`,
    '/how-to-download-instagram-reels': `
      <ol class="seo-steps"><li>Open a public Instagram Reel.</li><li>Copy the Reel link.</li><li>Paste the link into InstaDown.</li><li>Press Fetch Media.</li><li>Preview the returned media and press Download.</li></ol>`,
    '/faq': `
      <p>These FAQs explain the main InstaDown workflow, profile mode, public-only access and common download problems.</p>
      <p>For a quick walkthrough, use the <a href="/how-to-download-instagram-reels">How to Download Reels</a> guide.</p>`,
    '/about': `
      <p>InstaDown is an independent browser-based utility focused on supported public Instagram media. The goal is a simple experience: paste a URL, fetch what is publicly available, and download it.</p>
      <p>Profile mode can use an Apify-backed public profile scraper configured by the site operator. The service does not bypass private-account restrictions.</p>`,
    '/': `
      <p>InstaDown combines a public-media downloader, profile mode, download queue and lightweight site analytics in one browser interface. Use the dedicated tool pages above for more focused information.</p>`
  };
  return copy[pathname] || copy['/'];
}

function renderLegalPage(pathname) {
  const pages = {
    '/privacy': {
      title: 'Privacy Policy',
      body: `<p>InstaDown is a browser-based tool for supported public Instagram media. The site is designed to avoid asking for Instagram passwords.</p><h3>What the built-in analytics stores</h3><p>The optional server analytics stores aggregate event counts and limited technical categories such as device type and country header when a hosting proxy provides one. Raw IP addresses are not stored by this dashboard.</p><h3>Local history</h3><p>Recent searches can be kept in your own browser using local storage. They are not presented as an account history.</p><h3>Third-party services</h3><p>Profile mode can use Apify when the site operator configures an Apify token. Apify may process public profile requests under its own terms and policies.</p>`
    },
    '/terms': {
      title: 'Terms of Use',
      body: `<p>Use InstaDown only for lawful purposes and only download media you own, have permission to save, or are otherwise authorized to use.</p><h3>Public content only</h3><p>Do not use InstaDown to bypass private accounts, access controls or authentication barriers.</p><h3>Availability</h3><p>Instagram may change its public endpoints, media URLs or access rules. InstaDown does not guarantee that every public URL will always be available.</p><h3>Third-party platforms</h3><p>InstaDown is an independent service and is not an official Instagram product.</p>`
    },
    '/dmca': {
      title: 'DMCA & Copyright',
      body: `<p>InstaDown respects copyright. If you believe a page on this service facilitates access to material that infringes your rights, contact the site operator with the URL, identification of the copyrighted work, your contact information and a description of the claimed infringement.</p><h3>Reporting</h3><p>Send a clear copyright notice to the contact address published by the site operator. Include enough information to identify the relevant URL and work.</p><h3>Good-faith use</h3><p>Do not submit false or abusive notices. Users remain responsible for respecting copyright and privacy when using downloaded media.</p>`
    }
  };
  const page = pages[pathname] || pages['/privacy'];
  app.innerHTML = `<div class="app"><header><a class="logo" href="/">Insta<span>Down</span></a><a class="back-link" href="/">← Back to downloader</a></header><main><section class="legal-page content-section"><p class="eyebrow">INSTADOWN</p><h1>${page.title}</h1><div class="legal-copy">${page.body}</div><p class="legal-back"><a href="/">Return to InstaDown</a></p></section></main><footer><div><strong>InstaDown</strong><span>Independent third-party service.</span></div><nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/dmca">DMCA</a></nav></footer></div>`;
}

function renderAdmin() {
  app.innerHTML = `
    <div class="app admin-app"><main class="admin-shell">
      <div class="admin-header"><a class="logo" href="/">Insta<span>Down</span></a><a class="back-link" href="/">← Back to site</a></div>
      <section id="adminRoot"></section>
    </main></div>
  `;
  showAdminLogin();
}

function showAdminLogin() {
  const root = document.querySelector('#adminRoot');
  root.innerHTML = `<section class="admin-login"><p class="eyebrow">PRIVATE DASHBOARD</p><h1>InstaDown <span>Admin</span></h1><p>View downloads, visits, devices, countries and recent activity.</p><form id="adminLoginForm"><input id="adminUser" autocomplete="username" placeholder="Username" required><input id="adminPass" type="password" autocomplete="current-password" placeholder="Password" required><button type="submit" class="primary-btn">Sign in</button></form><p id="adminLoginMessage" class="message"></p></section>`;
  document.querySelector('#adminLoginForm').addEventListener('submit', adminLogin);
}

async function adminLogin(event) {
  event.preventDefault();
  const message = document.querySelector('#adminLoginMessage');
  message.textContent = 'Signing in...';
  try {
    const response = await fetch(`${API}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.querySelector('#adminUser').value, password: document.querySelector('#adminPass').value }) });
    const data = await safeJson(response);
    if (!response.ok) throw new Error(data.error || 'Login failed');
    sessionStorage.setItem('instadown_admin_session', data.token);
    await loadAdminDashboard();
  } catch (error) {
    message.textContent = friendlyError(error);
    message.className = 'message error';
  }
}

async function loadAdminDashboard() {
  const token = sessionStorage.getItem('instadown_admin_session');
  if (!token) return showAdminLogin();
  const response = await fetch(`${API}/api/admin/stats`, { headers: { 'x-admin-session': token }, cache: 'no-store' });
  if (response.status === 401) { sessionStorage.removeItem('instadown_admin_session'); return showAdminLogin(); }
  const data = await safeJson(response);
  renderAdminDashboard(data);
}

function renderAdminDashboard(data) {
  const root = document.querySelector('#adminRoot');
  const maxDay = Math.max(1, ...data.days.map(day => Math.max(day.visits, day.downloads, day.fetches, day.profiles)));
  root.innerHTML = `
    <div class="admin-title-row"><div><p class="eyebrow">PRIVATE DASHBOARD</p><h1>InstaDown <span>Analytics</span></h1><p>Built-in metrics from the site server. No raw IP addresses are stored by this dashboard.</p></div><button id="adminLogout" class="secondary-btn">Log out</button></div>
    <div class="stats-cards">
      ${statCard('Downloads', data.totals.downloads, 'Lifetime counter')}
      ${statCard('Visits', data.totals.visits, 'Tracked page visits')}
      ${statCard('Fetches', data.totals.fetches, 'Media lookups')}
      ${statCard('Profiles', data.totals.profiles, 'Profile lookups')}
    </div>
    <section class="admin-panel"><div class="panel-heading"><div><p class="eyebrow">LAST 14 DAYS</p><h2>Activity</h2></div></div><div class="daily-chart">${data.days.map(day => `<div class="day-bar"><div class="bar-stack"><span title="Visits: ${day.visits}" style="height:${Math.round((day.visits/maxDay)*100)}%"></span><span title="Downloads: ${day.downloads}" style="height:${Math.round((day.downloads/maxDay)*100)}%"></span></div><small>${day.date.slice(5)}</small></div>`).join('')}</div><div class="legend"><span><i class="legend-visits"></i>Visits</span><span><i class="legend-downloads"></i>Downloads</span></div></section>
    <div class="admin-two-col">
      <section class="admin-panel"><div class="panel-heading"><div><p class="eyebrow">AUDIENCE</p><h2>Countries</h2></div></div><div class="metric-list">${data.countries.length ? data.countries.map(row => `<div><strong>${escapeHtml(row.name)}</strong><span>${row.value}</span></div>`).join('') : '<p class="muted">No country headers are available yet.</p>'}</div></section>
      <section class="admin-panel"><div class="panel-heading"><div><p class="eyebrow">DEVICES</p><h2>Devices</h2></div></div><div class="metric-list">${data.devices.length ? data.devices.map(row => `<div><strong>${escapeHtml(row.name)}</strong><span>${row.value}</span></div>`).join('') : '<p class="muted">No device data yet.</p>'}</div></section>
    </div>
    <section class="admin-panel"><div class="panel-heading"><div><p class="eyebrow">RECENT</p><h2>Recent activity</h2></div></div><div class="activity-table">${data.recent.length ? data.recent.map(row => `<div><span class="activity-type">${escapeHtml(row.type)}</span><span>${new Date(row.at).toLocaleString()}</span><span>${escapeHtml(row.country)}</span><span>${escapeHtml(row.device)}</span></div>`).join('') : '<p class="muted">No activity yet.</p>'}</div></section>
  `;
  document.querySelector('#adminLogout').addEventListener('click', adminLogout);
}

function statCard(label, value, note) {
  return `<div class="stat-card"><span>${label}</span><strong>${Number(value || 0).toLocaleString()}</strong><small>${note}</small></div>`;
}

async function adminLogout() {
  const token = sessionStorage.getItem('instadown_admin_session');
  try { await fetch(`${API}/api/admin/logout`, { method: 'POST', headers: { 'x-admin-session': token } }); } catch (_) {}
  sessionStorage.removeItem('instadown_admin_session');
  showAdminLogin();
}

async function trackEvent(type) {
  if (window.location.pathname === '/admin') return;
  if (typeof window.gtag === 'function') window.gtag('event', type, { page_path: window.location.pathname });
  try {
    await fetch(`${API}/api/analytics/track`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, path: window.location.pathname }) });
  } catch (_) {}
}

function applyAds() {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const slots = {
    hero: import.meta.env.VITE_ADSENSE_SLOT_HERO,
    results: import.meta.env.VITE_ADSENSE_SLOT_RESULTS,
  };
  const adSlots = document.querySelectorAll('.ad-slot');
  if (!client) {
    adSlots.forEach(slot => slot.classList.add('ad-hidden'));
    return;
  }
  if (!document.querySelector('script[data-inst-down-ads]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.crossOrigin = 'anonymous';
    script.dataset.instDownAds = 'true';
    document.head.appendChild(script);
  }
  adSlots.forEach((slot) => {
    const slotId = slots[slot.dataset.adSlot];
    if (!slotId) {
      slot.classList.add('ad-hidden');
      return;
    }
    if (slot.dataset.adInitialized) return;
    slot.dataset.adInitialized = 'true';
    slot.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${escapeAttribute(client)}" data-ad-slot="${escapeAttribute(slotId)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
  });
}

function startProgress(messages) {
  let index = 0;
  showMessage(messages[0]);
  const timer = setInterval(() => {
    index = (index + 1) % messages.length;
    showMessage(messages[index]);
  }, 900);
  return timer;
}

function stopProgress(timer) { clearInterval(timer); }
function renderRecentSearches() {
  const box = document.querySelector('#recentSearches');
  if (!box) return;
  const searches = getRecentSearches();
  if (!searches.length) return;
  box.classList.remove('hidden');
  box.innerHTML = `<span>Recent:</span>${searches.slice(0, 5).map((item, index) => `<button type="button" data-recent-index="${index}">${escapeHtml(item.replace('https://www.instagram.com/','@').replace(/\/$/,''))}</button>`).join('')}`;
  box.querySelectorAll('[data-recent-index]').forEach(button => button.addEventListener('click', () => {
    const input = document.querySelector('#urlInput');
    const value = searches[Number(button.dataset.recentIndex)];
    if (input) { input.value = value; input.focus(); }
  }));
}

function showMessage(text, error = false) { const node = document.querySelector('#message'); if (!node) return; node.textContent = text; node.className = error ? 'message error' : 'message'; }
function setButtonLoading(button, text) { if (button) { button.dataset.originalText = button.textContent; button.disabled = true; button.textContent = text; } }
function resetButton(button, text) { if (button) { button.disabled = false; button.textContent = text || button.dataset.originalText || 'Download'; } }
function triggerDownload(url, filename) { const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function friendlyError(error) { const message = String(error?.message || error || 'Something went wrong.'); if (/private|login/i.test(message)) return 'This content is private or requires login. InstaDown only handles supported public media.'; if (/too many|rate limit/i.test(message)) return 'Too many requests right now. Please wait a minute and try again.'; if (/apify|profile/i.test(message)) return `${message} Check that the profile is public and that APIFY_API_TOKEN is configured on the server.`; return message; }
async function safeJson(response) { try { return await response.json(); } catch (_) { return {}; } }
function rememberSearch(value) { const list = getRecentSearches().filter(item => item !== value); list.unshift(value); localStorage.setItem('instadown_recent_searches', JSON.stringify(list.slice(0, 10))); }
function getRecentSearches() { try { const parsed = JSON.parse(localStorage.getItem('instadown_recent_searches') || '[]'); return Array.isArray(parsed) ? parsed : []; } catch (_) { return []; } }
function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
function escapeAttribute(value) { return escapeHtml(value); }

applySeo();
applyGoogleAnalytics();
render();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  const button = document.querySelector('#installBtn');
  if (button) {
    button.classList.remove('hidden');
    button.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(() => null);
      deferredInstallPrompt = null;
      button.classList.add('hidden');
    }, { once: true });
  }
});
