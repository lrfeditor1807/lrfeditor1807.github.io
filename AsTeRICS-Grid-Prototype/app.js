// AsTeRICS Grid Prototype — single-file app logic (ES module)
const DEFAULT_BOARD = {
  id: null, title: 'Main board', rows: 3, cols: 4,
  cells: [] // each: {img, label, action: {type, config}}
};

const STORAGE_KEY = 'asterics_grid_v1';
const USERS_KEY = 'asterics_users_v1';
const BOARDS_KEY = 'asterics_boards_v1';
const CURRENT_USER = 'asterics_current_user_v1';

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

const boardSelect = document.getElementById('boardSelect');
const newBoardBtn = document.getElementById('newBoardBtn');
const saveBoardBtn = document.getElementById('saveBoardBtn');
const gridContainer = document.getElementById('gridContainer');
const loginBtn = document.getElementById('loginBtn');
const loginModeSelect = document.getElementById('loginMode');
const settingsBtn = document.getElementById('settingsBtn');
const aboutBtn = document.getElementById('aboutBtn');

newBoardBtn.addEventListener('click', createNewBoard);
saveBoardBtn.addEventListener('click', () => saveBoards() && alert('Saved'));
loginBtn.addEventListener('click', showLogin);
settingsBtn.addEventListener('click', showSettings);
aboutBtn.addEventListener('click', showAbout);

let state = {
  boards: [],
  currentBoardId: null,
  users: [],
  currentUser: null
};

init();

function init(){
  loadFromStorage();
  if (state.boards.length === 0){
    const b = makeBoard(DEFAULT_BOARD.title, DEFAULT_BOARD.rows, DEFAULT_BOARD.cols);
    state.boards.push(b);
    state.currentBoardId = b.id;
  }
  populateBoardSelector();
  renderCurrentBoard();
  startEventDelegation();
}

function loadFromStorage(){
  try {
    const bs = localStorage.getItem(BOARDS_KEY);
    const us = localStorage.getItem(USERS_KEY);
    const cur = localStorage.getItem(CURRENT_USER);
    state.boards = bs ? JSON.parse(bs) : [];
    state.users = us ? JSON.parse(us) : [];
    state.currentUser = cur ? JSON.parse(cur) : null;
    if (!state.currentUser) state.currentUser = { mode: 'offline', name: 'guest' };
  } catch(e){
    console.error('load error', e);
    state = { boards: [], users: [], currentBoardId: null, currentUser: {mode:'offline',name:'guest'} };
  }
}

function saveBoards(){
  localStorage.setItem(BOARDS_KEY, JSON.stringify(state.boards));
  localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
  localStorage.setItem(CURRENT_USER, JSON.stringify(state.currentUser));
  return true;
}

function makeBoard(title='Board', rows=3, cols=4){
  const id = 'b-' + Date.now();
  const cells = Array(rows * cols).fill(0).map(() => ({
    img: null, label: '', action: { type: 'text', config: { text: '' } }
  }));
  return { id, title, rows, cols, cells };
}

function populateBoardSelector(){
  boardSelect.innerHTML = '';
  state.boards.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id; opt.textContent = b.title;
    if (b.id === state.currentBoardId) opt.selected = true;
    boardSelect.appendChild(opt);
  });
  boardSelect.addEventListener('change', () => {
    state.currentBoardId = boardSelect.value;
    renderCurrentBoard();
  });
}

function getCurrentBoard(){
  return state.boards.find(b => b.id === state.currentBoardId) || state.boards[0];
}

function renderCurrentBoard(){
  const board = getCurrentBoard();
  if (!board) return;
  // configure CSS grid
  gridContainer.style.gridTemplateColumns = `repeat(${board.cols}, minmax(120px, 1fr))`;
  gridContainer.style.gridAutoRows = `minmax(120px, auto)`;
  gridContainer.innerHTML = '';
  board.cells.forEach((cell, idx) => {
    const el = renderCell(cell, idx);
    gridContainer.appendChild(el);
  });
  // ensure selector reflects board
  populateBoardSelector();
}

function renderCell(cell, idx){
  const div = document.createElement('div');
  div.className = 'cell';
  div.dataset.index = idx;
  const imgWrap = document.createElement('div');
  imgWrap.className = 'cell-img';
  if (cell.img){
    const img = document.createElement('img');
    img.src = cell.img;
    img.alt = cell.label || '';
    imgWrap.appendChild(img);
  } else {
    imgWrap.innerHTML = '<svg width="64" height="48" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="48" fill="#f1f7ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9bb9e6" font-size="10">Add pictogram</text></svg>';
  }
  const lbl = document.createElement('div');
  lbl.className = 'cell-label';
  lbl.textContent = cell.label || (cell.action?.type || 'empty');
  div.appendChild(imgWrap);
  div.appendChild(lbl);

  div.addEventListener('click', () => openCellEditor(idx));
  div.addEventListener('contextmenu', (e) => { e.preventDefault(); openActionExecute(idx); });
  return div;
}

function openCellEditor(index){
  const board = getCurrentBoard();
  const cell = board.cells[index];
  openModal(`
    <h2>Edit cell</h2>
    <div class="form-row"><label>Label</label><input id="cellLabel" value="${escapeHTML(cell.label||'')}" /></div>
    <div class="form-row"><label>Image URL</label><input id="cellImg" value="${escapeHTML(cell.img||'')}" placeholder="https://..." /></div>
    <div class="form-row"><label>Pictogram helpers</label>
      <div>
        <button id="btnArasaac">Search ARASAAC</button>
        <button id="btnOpenSymbols">Search OpenSymbols</button>
        <button id="btnGoogle">Search Google</button>
      </div>
    </div>
    <div class="form-row"><label>Action</label>
      <select id="actionType">
        <option value="text">Text Cell</option>
        <option value="youtube">YouTube</option>
        <option value="spotify">Spotify</option>
        <option value="embed">Embed URL / iframe</option>
        <option value="scratch">Scratch project</option>
        <option value="camera">Camera capture</option>
        <option value="record">Record Voice</option>
        <option value="matrix">Matrix (open board)</option>
        <option value="navigate">Navigate to another board</option>
        <option value="pictionary">Pictionary (draw)</option>
      </select>
    </div>
    <div id="actionConfig"></div>
    <div class="controls-row">
      <button id="saveCell">Save</button>
      <button id="deleteCell">Delete</button>
      <button id="playCell">Execute action</button>
    </div>
  `);

  document.getElementById('btnArasaac').addEventListener('click', () => {
    window.open('https://www.arasaac.org/buscador_pictogramas.php?idioma=en','_blank');
  });
  document.getElementById('btnOpenSymbols').addEventListener('click', () => {
    window.open('https://opensymbols.org/en/','_blank');
  });
  document.getElementById('btnGoogle').addEventListener('click', () => {
    window.open('https://www.google.com/search?q=pictogram&tbm=isch','_blank');
  });

  const actionType = document.getElementById('actionType');
  actionType.value = cell.action?.type || 'text';
  const actionConfigContainer = document.getElementById('actionConfig');

  function renderActionConfig(){
    const type = actionType.value;
    const cfg = cell.action?.config || {};
    if (type === 'text'){
      actionConfigContainer.innerHTML = `
        <div class="form-row"><label>Text</label><textarea id="cfg_text" rows="3">${escapeHTML(cfg.text||'')}</textarea></div>
        <div class="form-row"><label>Auto speak</label><input id="cfg_speak" type="checkbox" ${cfg.speak ? 'checked' : ''} /></div>
      `;
    } else if (type === 'youtube'){
      actionConfigContainer.innerHTML = `
        <div class="form-row"><label>YouTube URL or ID</label><input id="cfg_youtube" value="${escapeHTML(cfg.youtube||'')}" placeholder="https://www.youtube.com/watch?v=..." /></div>
      `;
    } else if (type === 'spotify'){
      actionConfigContainer.innerHTML = `
        <div class="form-row"><label>Spotify embed URL/URI</label><input id="cfg_spotify" value="${escapeHTML(cfg.spotify||'')}" placeholder="https://open.spotify.com/..." /></div>
      `;
    } else if (type === 'embed'){
      actionConfigContainer.innerHTML = `
        <div class="form-row"><label>Embed URL</label><input id="cfg_embed" value="${escapeHTML(cfg.embed||'')}" placeholder="https://..." /></div>
      `;
    } else if (type === 'scratch'){
      actionConfigContainer.innerHTML = `
        <div class="form-row"><label>Scratch project id or URL</label><input id="cfg_scratch" value="${escapeHTML(cfg.scratch||'')}" placeholder="https://scratch.mit.edu/projects/####/" /></div>
      `;
    } else if (type === 'navigate'){
      actionConfigContainer.innerHTML = `
        <div class="form-row"><label>Target board</label>
          <select id="cfg_targetBoard"></select>
        </div>
      `;
      const sel = document.getElementById('cfg_targetBoard');
      state.boards.forEach(b => {
        const opt = document.createElement('option'); opt.value = b.id; opt.textContent = b.title;
        if (b.id === cfg.target) opt.selected = true;
        sel.appendChild(opt);
      });
    } else if (type === 'record'){
      actionConfigContainer.innerHTML = `<div class="small">When executed, you can record a message which will be saved to the cell for playback.</div>`;
    } else if (type === 'camera'){
      actionConfigContainer.innerHTML = `<div class="small">When executed, camera will start and let you capture an image for the cell.</div>`;
    } else if (type === 'matrix'){
      actionConfigContainer.innerHTML = `<div class="small">Open this board as a large matrix view.</div>`;
    } else if (type === 'pictionary'){
      actionConfigContainer.innerHTML = `<div class="small">Open a drawing canvas (Pictionary). The drawing will be saved as the cell image.</div>`;
    } else {
      actionConfigContainer.innerHTML = `<div class="small">No configuration.</div>`;
    }
  }
  renderActionConfig();
  actionType.addEventListener('change', renderActionConfig);

  document.getElementById('saveCell').addEventListener('click', () => {
    const label = document.getElementById('cellLabel').value.trim();
    const img = document.getElementById('cellImg').value.trim() || null;
    const type = document.getElementById('actionType').value;
    const cfg = {};
    if (type === 'text') { cfg.text = document.getElementById('cfg_text').value; cfg.speak = document.getElementById('cfg_speak').checked; }
    if (type === 'youtube') cfg.youtube = document.getElementById('cfg_youtube').value.trim();
    if (type === 'spotify') cfg.spotify = document.getElementById('cfg_spotify').value.trim();
    if (type === 'embed') cfg.embed = document.getElementById('cfg_embed').value.trim();
    if (type === 'scratch') cfg.scratch = document.getElementById('cfg_scratch').value.trim();
    if (type === 'navigate') cfg.target = document.getElementById('cfg_targetBoard').value;
    // write back
    board.cells[index].label = label;
    board.cells[index].img = img;
    board.cells[index].action = { type, config: cfg };
    saveBoards();
    renderCurrentBoard();
    closeModal();
  });

  document.getElementById('deleteCell').addEventListener('click', () => {
    if (!confirm('Clear this cell?')) return;
    board.cells[index] = { img: null, label: '', action: { type: 'text', config: { text: '' } } };
    saveBoards(); renderCurrentBoard(); closeModal();
  });

  document.getElementById('playCell').addEventListener('click', () => {
    closeModal();
    openActionExecute(index);
  });
}

function openActionExecute(index){
  const board = getCurrentBoard();
  const cell = board.cells[index];
  const act = cell.action || { type: 'text', config: {} };
  const type = act.type;
  if (type === 'text'){
    openModal(`<h2>${escapeHTML(cell.label||'Text')}</h2>
      <div>${escapeHTML(act.config.text || '')}</div>
      <div class="controls-row"><button id="speakBtn">Speak</button></div>
    `);
    document.getElementById('speakBtn').addEventListener('click', () => {
      const t = act.config.text || '';
      speakText(t);
    });
    if (act.config.speak) speakText(act.config.text || '');
  } else if (type === 'youtube'){
    const id = extractYouTubeId(act.config.youtube || '');
    openModal(`<h2>YouTube</h2><div id="ytwrap"><iframe class="embed-frame" src="https://www.youtube.com/embed/${id}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`);
  } else if (type === 'spotify'){
    const url = act.config.spotify || '';
    openModal(`<h2>Spotify</h2><div><iframe class="embed-frame" src="${escapeHTML(spotifyEmbed(url))}" allow="autoplay; encrypted-media"></iframe></div>`);
  } else if (type === 'embed'){
    const url = act.config.embed || '';
    openModal(`<h2>Embed</h2><div><iframe class="embed-frame" src="${escapeHTML(url)}"></iframe></div>`);
  } else if (type === 'scratch'){
    const link = act.config.scratch || '';
    const id = extractScratchId(link);
    const src = id ? `https://scratch.mit.edu/projects/${id}/embed` : link;
    openModal(`<h2>Scratch</h2><iframe class="embed-frame" src="${escapeHTML(src)}" allowfullscreen></iframe>`);
  } else if (type === 'camera'){
    openCameraCapture(index);
  } else if (type === 'record'){
    openVoiceRecorder(index);
  } else if (type === 'matrix'){
    openModal(`<h2>Matrix view</h2><div id="matrixPreview"></div>`);
    // large matrix of this board
    const boardClone = JSON.parse(JSON.stringify(board));
    const wrap = document.getElementById('matrixPreview');
    wrap.style.display = 'grid';
    wrap.style.gridTemplateColumns = `repeat(${boardClone.cols}, 1fr)`;
    wrap.style.gap = '8px';
    boardClone.cells.forEach(c => {
      const d = document.createElement('div');
      d.style.border = '1px solid #ddd'; d.style.padding = '8px'; d.style.borderRadius='6px'; d.style.background='#fff';
      d.innerHTML = `<div style="min-height:60px">${c.img ? `<img src="${escapeHTML(c.img)}" style="max-width:100%;max-height:72px" />` : ''}</div><div class="small">${escapeHTML(c.label||'')}</div>`;
      wrap.appendChild(d);
    });
  } else if (type === 'navigate'){
    const target = act.config.target;
    const b = state.boards.find(x => x.id === target);
    if (b){
      state.currentBoardId = b.id; saveBoards(); renderCurrentBoard();
    } else alert('Target board not found');
  } else if (type === 'pictionary'){
    openPictionary(index);
  } else {
    alert('Action not implemented: ' + type);
  }
}

// simple helpers

function openModal(html){
  modalBody.innerHTML = html;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  modalBody.innerHTML = '';
}

function escapeHTML(s){
  if (!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function extractYouTubeId(url){
  if (!url) return '';
  // basic extraction
  const m = url.match(/[?&]v=([^&]+)/);
  if (m) return m[1];
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return short[1];
  // maybe it's an id already
  return url;
}

function spotifyEmbed(url){
  if (!url) return '';
  // if it's a URI like spotify:track:..., convert
  if (url.startsWith('spotify:')){
    const parts = url.split(':'); if (parts.length >= 3) return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
  }
  // try parse path
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean); // ["track","id"]
    if (parts.length >= 2) return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}`;
  } catch(e){}
  return url;
}

function extractScratchId(url){
  if (!url) return '';
  const m = url.match(/projects\/(\d+)/);
  if (m) return m[1];
  if (/^\d+$/.test(url)) return url;
  return '';
}

// login UI (offline + simulated online)
function showLogin(){
  openModal(`
    <h2>Login</h2>
    <div class="login-form">
      <div class="form-row"><label>Mode</label>
        <select id="loginModeForm"><option value="offline">Offline</option><option value="online">Online (simulated)</option></select>
      </div>
      <div class="form-row"><label>Username</label><input id="loginUser" /></div>
      <div class="form-row"><label>Password</label><input id="loginPass" type="password" /></div>
      <div class="controls-row">
        <button id="btnLoginNow">Login</button>
        <button id="btnRegister">Register (offline)</button>
      </div>
    </div>
  `);
  document.getElementById('loginModeForm').value = loginModeSelect.value;
  document.getElementById('btnLoginNow').addEventListener('click', () => {
    const mode = document.getElementById('loginModeForm').value;
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (!user) return alert('Enter username');
    if (mode === 'offline'){
      const found = state.users.find(u => u.name === user && u.pass === pass);
      if (!found) return alert('Not found — register first');
      state.currentUser = { mode: 'offline', name: user };
      saveBoards(); closeModal(); alert('Logged in (offline) as ' + user);
    } else {
      // simulated online login — just accept any user
      state.currentUser = { mode: 'online', name: user };
      saveBoards(); closeModal(); alert('Simulated online login as ' + user);
    }
  });
  document.getElementById('btnRegister').addEventListener('click', () => {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (!user) return alert('Enter username');
    if (state.users.find(u=>u.name===user)) return alert('User exists');
    state.users.push({ name: user, pass });
    state.currentUser = { mode: 'offline', name: user };
    saveBoards(); closeModal(); alert('Registered & logged in (offline) as ' + user);
  });
}

// settings and about
function showSettings(){
  openModal(`
    <h2>Settings</h2>
    <div class="form-row"><label>Grid columns</label><input id="cfg_cols" type="number" min="1" max="8" value="${getCurrentBoard().cols}" /></div>
    <div class="form-row"><label>Grid rows</label><input id="cfg_rows" type="number" min="1" max="8" value="${getCurrentBoard().rows}" /></div>
    <div class="form-row"><label>Board title</label><input id="cfg_title" value="${escapeHTML(getCurrentBoard().title)}" /></div>
    <div class="controls-row"><button id="applySettings">Apply</button></div>
    <hr/>
    <h3>Boards</h3>
    <div id="boardsList"></div>
  `);
  const bl = document.getElementById('boardsList');
  bl.innerHTML = '';
  state.boards.forEach(b => {
    const d = document.createElement('div'); d.className='small';
    d.innerHTML = `<strong>${escapeHTML(b.title)}</strong> &nbsp;<button data-id="${b.id}" class="delBoard">Delete</button>`;
    bl.appendChild(d);
  });
  document.querySelectorAll('.delBoard').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      if (!confirm('Delete board?')) return;
      state.boards = state.boards.filter(bb => bb.id !== id);
      if (state.currentBoardId === id) state.currentBoardId = state.boards[0]?.id || null;
      saveBoards();
      populateBoardSelector();
      renderCurrentBoard();
      showSettings(); // refresh
    });
  });
  document.getElementById('applySettings').addEventListener('click', () => {
    const rows = parseInt(document.getElementById('cfg_rows').value) || 3;
    const cols = parseInt(document.getElementById('cfg_cols').value) || 4;
    const title = document.getElementById('cfg_title').value || getCurrentBoard().title;
    const b = getCurrentBoard();
    // resize cells preserving existing
    const newCells = Array(rows * cols).fill(0).map((_,i) => b.cells[i] || { img:null, label:'', action:{type:'text'
