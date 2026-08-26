// Top 1000 Most Viewed Videos — single-file app logic
const API_MAX_PAGE = 50; // YouTube API maxResults per request
const TARGET_COUNT = 1000;

const apiKeyInput = document.getElementById('apiKey');
const regionSelect = document.getElementById('region');
const fetchBtn = document.getElementById('fetchBtn');
const loadDemoBtn = document.getElementById('loadDemoBtn');
const progressRow = document.getElementById('progressRow');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

const grid = document.getElementById('grid');
const stats = document.getElementById('stats');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const pageSizeSelect = document.getElementById('pageSize');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const pagination = document.getElementById('pagination');
const infiniteToggle = document.getElementById('infiniteToggle');
const exportCsvBtn = document.getElementById('exportCsv');

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

let allVideos = []; // full dataset (up to 1000)
let filtered = [];
let currentPage = 1;

function showProgress(show){
  progressRow.hidden = !show;
}
function setProgress(percent, text){
  progressBar.value = percent;
  progressText.textContent = text || progressText.textContent;
}

function formatNumber(n){
  if(n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if(n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if(n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return String(n);
}

function createCard(video){
  const el = document.createElement('article');
  el.className = 'card';
  el.tabIndex = 0;
  el.dataset.videoId = video.id;

  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  const img = document.createElement('img');
  img.alt = video.title;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = video.thumbnail;
  thumb.appendChild(img);

  const body = document.createElement('div');
  body.className = 'card-body';
  const title = document.createElement('h3');
  title.className = 'title';
  title.textContent = video.title;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${video.channel} • ${formatNumber(video.views)} views`;
  const footer = document.createElement('div');
  footer.className = 'card-footer';
  const dateSpan = document.createElement('span');
  dateSpan.textContent = new Date(video.publishedAt).toLocaleDateString();
  const openBtn = document.createElement('button');
  openBtn.className = 'btn';
  openBtn.textContent = 'Open';
  openBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    openModal(video);
  });

  footer.appendChild(dateSpan);
  footer.appendChild(openBtn);

  body.appendChild(title);
  body.appendChild(meta);
  body.appendChild(footer);

  el.appendChild(thumb);
  el.appendChild(body);

  el.addEventListener('click', ()=> openModal(video));
  el.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(video); }
  });

  return el;
}

function renderPage(page=1){
  const pageSize = Number(pageSizeSelect.value);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  currentPage = Math.max(1, Math.min(page, totalPages));

  // if infinite scroll is enabled, show first N items instead
  if(infiniteToggle.checked){
    grid.innerHTML = '';
    const slice = filtered.slice(0, Math.min(total, pageSize * currentPage));
    slice.forEach(v => grid.appendChild(createCard(v)));
    pageInfo.textContent = `Showing ${slice.length} / ${total}`;
    pagination.style.display = 'flex';
    return;
  }

  const start = (currentPage - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);
  grid.innerHTML = '';
  slice.forEach(v => grid.appendChild(createCard(v)));
  pageInfo.textContent = `Page ${currentPage} of ${totalPages} — ${total} videos`;
  pagination.style.display = total <= pageSize ? 'none' : 'flex';
}

function applyFiltersAndSort(){
  const q = (searchInput.value || '').trim().toLowerCase();
  filtered = allVideos.filter(v=>{
    if(!q) return true;
    return v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q);
  });

  const sort = sortSelect.value;
  if(sort === 'views_desc') filtered.sort((a,b)=>b.views - a.views);
  else if(sort === 'views_asc') filtered.sort((a,b)=>a.views - b.views);
  else if(sort === 'date_desc') filtered.sort((a,b)=> new Date(b.publishedAt) - new Date(a.publishedAt));
  else if(sort === 'date_asc') filtered.sort((a,b)=> new Date(a.publishedAt) - new Date(b.publishedAt));
  else if(sort === 'title_asc') filtered.sort((a,b)=> a.title.localeCompare(b.title));
}

function openModal(video){
  modalBody.innerHTML = '';
  const id = video.id;
  // If real video id available, embed YouTube player
  if(video.real){
    const iframe = document.createElement('iframe');
    iframe.width = '100%'; iframe.height = '520';
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    iframe.title = video.title;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    modalBody.appendChild(iframe);
  } else {
    // mock preview
    const img = document.createElement('img');
    img.src = video.thumbnail;
    img.alt = video.title;
    img.style.width = '100%';
    modalBody.appendChild(img);
    const p = document.createElement('p');
    p.textContent = `${video.title} — ${video.channel} — ${formatNumber(video.views)} views`;
    p.style.marginTop = '8px';
    modalBody.appendChild(p);
  }
  modal.setAttribute('aria-hidden', 'false');
}

function closeModalFn(){
  modal.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
}
closeModal.addEventListener('click', closeModalFn);
modal.addEventListener('click', (e)=> { if(e.target === modal) closeModalFn(); });

searchInput.addEventListener('input', ()=> { applyFiltersAndSort(); renderPage(1); });
sortSelect.addEventListener('change', ()=> { applyFiltersAndSort(); renderPage(1); });
pageSizeSelect.addEventListener('change', ()=> renderPage(1));
prevPageBtn.addEventListener('click', ()=> { renderPage(currentPage - 1); });
nextPageBtn.addEventListener('click', ()=> { renderPage(currentPage + 1); });
infiniteToggle.addEventListener('change', ()=> renderPage(1));

exportCsvBtn.addEventListener('click', ()=>{
  const rows = [];
  const pageSize = Number(pageSizeSelect.value);
  if(infiniteToggle.checked){
    filtered.slice(0, pageSize * currentPage).forEach(v => rows.push(v));
  } else {
    const start = (currentPage - 1) * pageSize;
    rows.push(...filtered.slice(start, start + pageSize));
  }
  const csv = toCsv(rows);
  downloadBlob(csv, 'top-visible-videos.csv', 'text/csv');
});

function toCsv(items){
  const header = ['id','title','channel','views','publishedAt','thumbnail'];
  const lines = [header.join(',')];
  items.forEach(i=>{
    const row = [i.id, escapeCsv(i.title), escapeCsv(i.channel), i.views, i.publishedAt, i.thumbnail];
    lines.push(row.join(','));
  });
  return lines.join('\n');
}
function escapeCsv(s){
  return `"${String(s).replace(/"/g,'""')}"`;
}
function downloadBlob(content, filename, type='text/plain'){
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 5000);
}

// ---- Demo data generator (deterministic-ish) ----
function generateDemoTop1000(){
  const out = [];
  // base views: simulate a descending list from ~12B to ~100K
  const max = 12_000_000_000;
  const min = 100_000;
  const step = (max - min) / (TARGET_COUNT - 1);
  for(let i=0;i<TARGET_COUNT;i++){
    const id = 'demo-' + String(i+1).padStart(4,'0');
    const title = `Top Video #${i+1} — Viral Demo Clip`;
    const channel = `Channel ${Math.floor(i/3)+1}`;
    const views = Math.max(min, Math.round(max - i * step - Math.random()*step*0.5));
    const daysAgo = i + Math.floor(Math.random()*3000);
    const publishedAt = new Date(Date.now() - daysAgo * 24*3600*1000).toISOString();
    const thumb = `https://picsum.photos/seed/demo${i+1}/640/360`;
    out.push({ id, title, channel, views, publishedAt, thumbnail: thumb, real: false });
  }
  return out;
}

// ---- YouTube API fetcher ----
async function fetchTopVideosFromYouTube(apiKey, region='US', maxCount=1000){
  // uses: https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=50&regionCode=US&key=API_KEY
  const items = [];
  let pageToken = '';
  let fetched = 0;
  showProgress(true);
  setProgress(0, 'Starting fetch...');
  try{
    while(fetched < maxCount){
      const params = new URLSearchParams({
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode: region,
        maxResults: String(API_MAX_PAGE),
        key: apiKey,
      });
      if(pageToken) params.set('pageToken', pageToken);
      setProgress(Math.round((fetched / maxCount)*100), `Fetching... (${fetched}/${maxCount})`);
      const url = `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`;
      const res = await fetch(url);
      if(!res.ok){
        const txt = await res.text();
        throw new Error(`API error ${res.status}: ${txt}`);
      }
      const data = await res.json();
      if(!data.items || data.items.length === 0) break;
      for(const it of data.items){
        const id = it.id;
        const title = it.snippet?.title || 'Untitled';
        const channel = it.snippet?.channelTitle || 'Unknown';
        const views = it.statistics && it.statistics.viewCount ? Number(it.statistics.viewCount) : 0;
        const publishedAt = it.snippet?.publishedAt || new Date().toISOString();
        const thumbnail = it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.default?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        items.push({ id, title, channel, views, publishedAt, thumbnail, real: true });
        fetched++;
        if(fetched >= maxCount) break;
      }
      pageToken = data.nextPageToken || '';
      if(!pageToken) break;
      // small delay to be polite
      await new Promise(r=>setTimeout(r, 300));
    }
    setProgress(100, `Fetched ${items.length} videos`);
    return items;
  } finally {
    showProgress(false);
  }
}

// ---- UI wiring for fetch/load ----
fetchBtn.addEventListener('click', async ()=>{
  const apiKey = apiKeyInput.value.trim();
  const region = regionSelect.value;
  allVideos = [];
  filtered = [];
  currentPage = 1;
  if(!apiKey){
    alert('No API key provided. Use "Load Demo 1000" to load a mock dataset, or paste a YouTube Data API v3 key to fetch real data.');
    return;
  }
  try{
    showProgress(true);
    setProgress(0, 'Starting API fetch...');
    const vids = await fetchTopVideosFromYouTube(apiKey, region, TARGET_COUNT);
    allVideos = vids;
    applyFiltersAndSort();
    stats.textContent = `Loaded ${allVideos.length} videos (region ${region}).`;
    renderPage(1);
  } catch(err){
    alert('Error fetching from YouTube API: ' + err.message);
  } finally {
    showProgress(false);
  }
});

loadDemoBtn.addEventListener('click', ()=>{
  allVideos = generateDemoTop1000();
  applyFiltersAndSort();
  stats.textContent = `Loaded DEMO ${allVideos.length} videos.`;
  renderPage(1);
});

// initial demo load to show UI
allVideos = generateDemoTop1000();
applyFiltersAndSort();
stats.textContent = `Loaded DEMO ${allVideos.length} videos.`;
renderPage(1);

// keyboard accessibility: ESC closes modal
document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeModalFn(); });
