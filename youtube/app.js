// YouTube Grid Controller (uses IFrame Player API)
// Save alongside index.html and open index.html in a browser.

// Video list: change/add YouTube IDs and titles as needed.
const VIDEOS = [
  { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
  { id: '3JZ_D3ELwOQ', title: 'Mark Ronson - Uptown Funk ft. Bruno Mars' },
  { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee' },
  { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE' },
  { id: 'hT_nvWreIhg', title: 'Adele - Hello' },
  { id: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody' },
  { id: '60ItHLz5WEA', title: 'Imagine Dragons - Demons' },
  { id: '60G5bIP8s5A', title: 'Sample Video' } // replace or remove as needed
];

const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('status');
const playPauseBtn = document.getElementById('playPause');
let player = null;
let playerReady = false;
let currentIndex = -1;
let currentTile = null;

// Render grid with thumbnails (YouTube thumbnails are available without API key)
function renderGrid() {
  gridEl.innerHTML = '';
  VIDEOS.forEach((v, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = String(i);
    tile.innerHTML = `
      <div class="thumb"><img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="" width="160" height="90" style="display:block; width:160px; height:90px; object-fit:cover;"></div>
      <div class="meta">
        <div class="title">${v.title}</div>
        <div class="subtitle">ID: ${v.id}</div>
      </div>`;
    tile.addEventListener('click', () => {
      playIndex(i, tile);
    });
    gridEl.appendChild(tile);
  });
  logStatus('Grid rendered. Click a tile to play.');
}

// Highlight the playing tile and clear previous
function setPlayingTile(tile) {
  document.querySelectorAll('.tile.playing').forEach(t => t.classList.remove('playing'));
  if (tile) tile.classList.add('playing');
  currentTile = tile || null;
}

// Use the IFrame API: onYouTubeIframeAPIReady is called by the script we loaded in HTML
function onYouTubeIframeAPIReady() {
  // Create a player blank initially; we'll load videos into it later.
  player = new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: '', // start empty
    playerVars: { autoplay: 0, controls: 1, rel: 0 },
    events: {
      onReady: (e) => { playerReady = true; logStatus('YouTube player ready.'); },
      onStateChange: onPlayerStateChange,
      onError: (e) => logStatus('Player error: ' + JSON.stringify(e))
    }
  });
}

// Called when the player state changes (play/pause/end)
function onPlayerStateChange(event) {
  // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
  if (event.data === YT.PlayerState.ENDED) {
    logStatus('Video ended.');
    // auto-next
    next();
  } else if (event.data === YT.PlayerState.PLAYING) {
    playPauseBtn.textContent = 'Pause';
    logStatus('Playing: ' + currentIndexString());
  } else if (event.data === YT.PlayerState.PAUSED) {
    playPauseBtn.textContent = 'Play';
    logStatus('Paused: ' + currentIndexString());
  }
}

// Play a video by index
function playIndex(index, tileEl) {
  if (index < 0 || index >= VIDEOS.length) return;
  currentIndex = index;
  const vid = VIDEOS[index];
  if (!playerReady) {
    // If player isn't ready yet, create or wait
    logStatus('Player not ready yet — will load when ready. Loading placeholder then playing.');
    const waitForReady = setInterval(() => {
      if (playerReady) {
        clearInterval(waitForReady);
        loadAndPlay(vid.id);
      }
    }, 150);
  } else {
    loadAndPlay(vid.id);
  }
  setPlayingTile(tileEl);
}

// Load video in player and play
function loadAndPlay(videoId) {
  if (!player) {
    logStatus('Player object missing.');
    return;
  }
  // loadVideoById will start playing immediately if autoplay works
  try {
    player.loadVideoById({ videoId: videoId, startSeconds: 0 });
    logStatus('Loading video: ' + videoId);
  } catch (e) {
    // fallback: cue and play
    logStatus('loadVideoById failed, trying cueVideoById then play. ' + e);
    player.cueVideoById({ videoId: videoId });
    setTimeout(() => player.playVideo(), 400);
  }
}

// Play/pause toggle
function togglePlayPause() {
  if (!playerReady) return logStatus('Player not ready');
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

// Stop playback
function stop() {
  if (!playerReady) return;
  player.stopVideo();
  setPlayingTile(null);
  currentIndex = -1;
  logStatus('Stopped.');
}

// Go to next track
function next() {
  if (VIDEOS.length === 0) return;
  const nextIndex = (currentIndex + 1) % VIDEOS.length;
  const nextTile = gridEl.querySelector(`.tile[data-index="${nextIndex}"]`);
  playIndex(nextIndex, nextTile);
}

// Go to previous
function prev() {
  if (VIDEOS.length === 0) return;
  const prevIndex = (currentIndex - 1 + VIDEOS.length) % VIDEOS.length;
  const prevTile = gridEl.querySelector(`.tile[data-index="${prevIndex}"]`);
  playIndex(prevIndex, prevTile);
}

function currentIndexString() {
  if (currentIndex === -1) return '(none)';
  const v = VIDEOS[currentIndex];
  return `${currentIndex}: ${v.title} (${v.id})`;
}

function logStatus(text) {
  const time = new Date().toLocaleTimeString();
  statusEl.textContent = `[${time}] ${text}\n` + statusEl.textContent;
}

// Hook buttons
document.getElementById('playPause').addEventListener('click', togglePlayPause);
document.getElementById('stop').addEventListener('click', stop);
document.getElementById('next').addEventListener('click', next);
document.getElementById('prev').addEventListener('click', prev);
document.getElementById('refreshList').addEventListener('click', () => { renderGrid(); logStatus('List refreshed.'); });

// Keyboard shortcuts: Space toggles play/pause, ArrowRight next, ArrowLeft prev
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); togglePlayPause(); }
  if (e.code === 'ArrowRight') next();
  if (e.code === 'ArrowLeft') prev();
});

// Initialize UI
renderGrid();

// Note: onYouTubeIframeAPIReady must be global; the IFrame API will call it when ready.
// We declared it above implicitly by naming the function in the global scope (function name is defined in this file).
// If bundling or using modules, expose it on window: window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
