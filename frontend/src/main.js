import './style.css';

const API =
  ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:4000'
    : '';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app">
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>

    <header>
      <a class="logo" href="/" aria-label="InstaDown home">Insta<span>Down</span></a>
      <nav class="top-nav" aria-label="Main navigation">
        <a href="#how-to-download">How to Download</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div class="status">
        <span class="dot"></span>
        Backend Online
      </div>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <p class="eyebrow">INSTAGRAM MEDIA DOWNLOADER</p>
        <h1 id="hero-title">Download Instagram videos<br><span>and Reels easily.</span></h1>
        <p class="subtitle">
          Paste a public Instagram post, Reel, or media URL and download supported media
          directly to your device. No Instagram login is required.
        </p>

        <div class="search-box">
          <label class="sr-only" for="urlInput">Instagram URL</label>
          <input
            id="urlInput"
            type="url"
            inputmode="url"
            placeholder="Paste Instagram URL here..."
            autocomplete="off"
            aria-describedby="url-help"
          />
          <button id="fetchBtn" type="button">Fetch Media</button>
        </div>
        <p id="url-help" class="input-help">Use a public Instagram URL that you are allowed to access and download.</p>
        <p id="message" class="message" aria-live="polite"></p>
      </section>

      <section id="results" class="results hidden" aria-live="polite"></section>

      <section id="how-to-download" class="content-section" aria-labelledby="how-title">
        <div class="section-heading">
          <p class="eyebrow">SIMPLE STEPS</p>
          <h2 id="how-title">How to download an Instagram video or Reel</h2>
          <p>Use InstaDown in a few simple steps on your phone, tablet or computer.</p>
        </div>

        <div class="steps-grid">
          <article class="info-card">
            <span class="step-number">01</span>
            <h3>Copy the Instagram URL</h3>
            <p>Open the public Instagram post or Reel you want to save and copy its link.</p>
          </article>
          <article class="info-card">
            <span class="step-number">02</span>
            <h3>Paste the link</h3>
            <p>Paste the Instagram URL into the InstaDown input box above.</p>
          </article>
          <article class="info-card">
            <span class="step-number">03</span>
            <h3>Fetch the media</h3>
            <p>Click <strong>Fetch Media</strong> and wait while InstaDown retrieves the supported media.</p>
          </article>
          <article class="info-card">
            <span class="step-number">04</span>
            <h3>Download</h3>
            <p>Preview the available media and click <strong>Download</strong> to save the file.</p>
          </article>
        </div>
      </section>

      <section class="content-section two-column" aria-labelledby="about-title">
        <div>
          <p class="eyebrow">ABOUT INSTADOWN</p>
          <h2 id="about-title">A simple Instagram media downloader</h2>
        </div>
        <div class="content-copy">
          <p>
            InstaDown is a browser-based tool designed to make saving supported public
            Instagram media straightforward. Paste a public Instagram URL, fetch the
            available media, preview it, and download it.
          </p>
          <p>
            InstaDown does not ask you to enter your Instagram password or sign in to
            Instagram. Only download content you have permission to save and use.
          </p>
        </div>
      </section>

      <section class="content-section" aria-labelledby="features-title">
        <div class="section-heading">
          <p class="eyebrow">WHY INSTADOWN</p>
          <h2 id="features-title">Fast and straightforward</h2>
        </div>
        <div class="features-grid">
          <article class="info-card">
            <h3>No Instagram login</h3>
            <p>You can use the downloader without entering your Instagram credentials.</p>
          </article>
          <article class="info-card">
            <h3>Browser based</h3>
            <p>No separate downloader application is required. Use InstaDown from a modern browser.</p>
          </article>
          <article class="info-card">
            <h3>Preview before saving</h3>
            <p>Preview supported media before choosing the download button.</p>
          </article>
          <article class="info-card">
            <h3>Simple workflow</h3>
            <p>Copy the URL, paste it, fetch the media and download the result.</p>
          </article>
        </div>
      </section>

      <section id="faq" class="content-section faq-section" aria-labelledby="faq-title">
        <div class="section-heading">
          <p class="eyebrow">FAQ</p>
          <h2 id="faq-title">Frequently asked questions</h2>
          <p>Answers to common questions about using InstaDown.</p>
        </div>

        <div class="faq-list">
          <details>
            <summary>What is InstaDown?</summary>
            <p>InstaDown is a web-based tool for fetching and downloading supported media from public Instagram URLs.</p>
          </details>
          <details>
            <summary>How do I download an Instagram Reel?</summary>
            <p>Copy the link to a public Instagram Reel, paste it into InstaDown, click Fetch Media, preview the result and click Download.</p>
          </details>
          <details>
            <summary>Can I download Instagram videos?</summary>
            <p>InstaDown can retrieve supported public Instagram video media when the supplied URL can be processed by the service.</p>
          </details>
          <details>
            <summary>Can I download Instagram photos?</summary>
            <p>Supported public image media may be available when InstaDown successfully processes the Instagram URL.</p>
          </details>
          <details>
            <summary>Do I need an Instagram login?</summary>
            <p>No. InstaDown is designed to work without asking you for your Instagram username or password.</p>
          </details>
          <details>
            <summary>Can I download private Instagram posts?</summary>
            <p>No. InstaDown is intended for supported public media. Do not attempt to bypass privacy controls or access restrictions.</p>
          </details>
          <details>
            <summary>Is InstaDown free to use?</summary>
            <p>There is currently no charge shown for using the downloader. Availability and service limits may change.</p>
          </details>
          <details>
            <summary>Why is my Instagram URL not working?</summary>
            <p>Make sure the URL is a valid public Instagram link. Some posts, accounts, media types, deleted content, or Instagram changes may not be supported.</p>
          </details>
          <details>
            <summary>Where is my downloaded file saved?</summary>
            <p>Your browser normally saves downloaded files to its configured Downloads folder unless you choose another location.</p>
          </details>
          <details>
            <summary>Is InstaDown affiliated with Instagram?</summary>
            <p>No. InstaDown is an independent third-party website and is not presented as an official Instagram service.</p>
          </details>
        </div>
      </section>

      <section class="content-section usage-note" aria-labelledby="usage-title">
        <h2 id="usage-title">Use InstaDown responsibly</h2>
        <p>
          Only download media that you own, have permission to download, or are otherwise
          authorized to use. Respect creators' copyrights, privacy, and Instagram's terms.
          InstaDown is not a tool for bypassing private-account restrictions.
        </p>
      </section>
    </main>

    <footer>
      <div>
        <strong>InstaDown</strong>
        <span>Built for supported public media.</span>
      </div>
      <nav aria-label="Footer navigation">
        <a href="#how-to-download">How to Download</a>
        <a href="#faq">FAQ</a>
      </nav>
    </footer>
  </div>
`;

const urlInput = document.querySelector('#urlInput');
const fetchBtn = document.querySelector('#fetchBtn');
const message = document.querySelector('#message');
const results = document.querySelector('#results');

fetchBtn.addEventListener('click', fetchMedia);

urlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    fetchMedia();
  }
});

async function fetchMedia() {
  const url = urlInput.value.trim();

  if (!url) {
    showMessage('Paste an Instagram URL first.', true);
    return;
  }

  if (!url.includes('instagram.com')) {
    showMessage('Please enter a valid Instagram URL.', true);
    return;
  }

  fetchBtn.disabled = true;
  fetchBtn.textContent = 'Fetching...';
  results.classList.add('hidden');
  results.innerHTML = '';
  showMessage('Getting your media...');

  try {
    const response = await fetch(`${API}/api/media/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Could not fetch media.');
    }

    renderResults(data);

    showMessage(
      `Found ${data.items.length} media item${data.items.length === 1 ? '' : 's'}.`
    );
  } catch (error) {
    console.error(error);
    showMessage(error.message || 'Something went wrong.', true);
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = 'Fetch Media';
  }
}

function renderResults(data) {
  results.classList.remove('hidden');

  results.innerHTML = `
    <div class="results-header">
      <div>
        <p class="eyebrow">MEDIA FOUND</p>
        <h2>${escapeHtml(data.type || 'Media')}</h2>
      </div>
      <span class="count">${data.items.length}</span>
    </div>

    <div class="media-grid">
      ${data.items.map((item, index) => createMediaCard(item, index)).join('')}
    </div>
  `;
}

function createMediaCard(item, index) {
  const isVideo = item.ext === 'mp4';
  const proxyUrl =
    `${API}/api/media/proxy?url=${encodeURIComponent(item.url)}`;

  return `
    <article class="media-card">
      <div class="preview">
        ${
          isVideo
            ? `<video
                 src="${escapeAttribute(item.url)}"
                 controls
                 preload="metadata"
                 aria-label="Instagram video preview"
               ></video>`
            : `<img
                 src="${escapeAttribute(item.url)}"
                 alt="Instagram image preview"
                 loading="lazy"
               />`
        }
      </div>

      <div class="card-info">
        <div>
          <strong>${isVideo ? 'Video' : 'Image'}</strong>
          <span>${escapeHtml(item.quality || 'Original')}</span>
        </div>

        <a
          class="download-btn"
          href="${escapeAttribute(proxyUrl)}"
          download="${escapeAttribute(item.filename || `instagram_${index + 1}.${item.ext}`)}"
        >
          Download
        </a>
      </div>
    </article>
  `;
}

function showMessage(text, error = false) {
  message.textContent = text;
  message.className = error
    ? 'message error'
    : 'message';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
