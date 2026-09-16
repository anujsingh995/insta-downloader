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
      <div class="logo">Insta<span>Down</span></div>
      <div class="status">
        <span class="dot"></span>
        Backend Online
      </div>
    </header>

    <main>
      <section class="hero">
        <p class="eyebrow">INSTAGRAM MEDIA DOWNLOADER</p>
        <h1>Save your favorite<br><span>Instagram moments.</span></h1>
        <p class="subtitle">
          Paste a public Instagram post, reel, or media URL
          and download it directly.
        </p>

        <div class="search-box">
          <input
            id="urlInput"
            type="text"
            placeholder="Paste Instagram URL here..."
            autocomplete="off"
          />
          <button id="fetchBtn">Fetch Media</button>
        </div>

        <p id="message" class="message"></p>
      </section>

      <section id="results" class="results hidden"></section>
    </main>

    <footer>
      <span>InstaDown</span>
      <span>Built for public media</span>
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
               ></video>`
            : `<img
                 src="${escapeAttribute(item.url)}"
                 alt="Instagram media"
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