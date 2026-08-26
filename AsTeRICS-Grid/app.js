// AsTeRICS Grid — Demo app.js
// Main features:
// - Grid of cells with actions
// - Pictogram picker with tabs (ARASAAC, OpenSymbols, Google Search helper)
// - Action handlers: Matrix (keyboard), YouTube, Spotify, Text (TTS), Record Voice, Embed URL, Scratch, Camera capture, Navigate board, Pictionary
// - Login (offline/localStorage) with optional "online" endpoint
// - Settings/About modals
// Notes:
// - Replace demo pictogram URLs or wire real ARASAAC/OpenSymbols APIs per comments below.
// - Persistent storage via localStorage: 'asterics_boards', 'asterics_user', 'asterics_settings'

/* ---------------------------
   Utilities & state
   --------------------------- */
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

let STATE = {
  boards: [], // array of boards {id,title,cells:[]}
  currentBoardId: null,
  user: null,
  settings: {
    gridSize: 12,
    arasaacTemplate: "https://static.arasaac.org/pictograms/{id}/{id}.png",
    openSymbolsTemplate: "https://cdn.opensymbols.org/{id}.png",
    onlineAuthEndpoint: "" // set to real server endpoint if available
  }
};

const STORAGE_KEYS = {
  BOARDS: "asterics_boards",
  USER: "asterics_user",
  SETTINGS: "asterics_settings"
};

function uid(prefix="id"){
  return prefix + "_" + Math.random().toString(36).slice(2,9);
}

/* ---------------------------
   Persistence
   --------------------------- */
function loadState(){
  const b = localStorage.getItem(STORAGE_KEYS.BOARDS);
  const u = localStorage.getItem(STORAGE_KEYS.USER);
  const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if(b) try { STATE.boards = JSON.parse(b); } catch(e){ STATE.boards = [] }
  if(u) try { STATE.user = JSON.parse(u); } catch(e){ STATE.user = null }
  if(s) try { STATE.settings = Object.assign(STATE.settings, JSON.parse(s)); } catch(e){}
  if(STATE.boards.length===0){
    // create demo board
    const demo = {
      id: uid("board"),
      title: "Home",
      cols: 4,
      cells: [
        { id: uid("c"), label:"Hello", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Iconic_image.svg/240px-Iconic_image.svg.png", action:{type:"text", payload:"Hello!"} },
        { id: uid("c"), label:"YouTube", img:"https://upload.wikimedia.org/wikipedia/commons/9/98/YouTube_Logo_2017.svg", action:{type:"youtube", payload:"dQw4w9WgXcQ"} },
        { id: uid("c"), label:"Camera", img:"https://upload.wikimedia.org/wikipedia/commons/3/3d/Camera_icon.svg", action:{type:"camera"} },
        { id: uid("c"), label:"Draw", img:"https://upload.wikimedia.org/wikipedia/commons/2/29/Draw_icon.svg", action:{type:"pictionary"} }
      ]
    };
    STATE.boards.push(demo);
  }
  STATE.currentBoardId = STATE.boards[0].id;
}

function saveState(){
  localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(STATE.boards));
  if(STATE.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(STATE.user));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(STATE.settings));
}

/* ---------------------------
   UI helpers
   --------------------------- */
const modal = qs("#modal");
const modalBody = qs("#modal-body");
const modalClose = qs("#modal-close");
modalClose.addEventListener("click", ()=> closeModal());
function openModal(contentHtml){
  modalBody.innerHTML = contentHtml;
  modal.classList.remove("hidden");
}
function closeModal(){
  modal.classList.add("hidden");
  modalBody.innerHTML = "";
}

/* ---------------------------
   Rendering the grid
   --------------------------- */
function getCurrentBoard(){
  return STATE.boards.find(b=>b.id===STATE.currentBoardId);
}

function renderBoardList(){
  const sel = qs("#board-selector");
  sel.innerHTML = "";
  STATE.boards.forEach(b=>{
    const opt = document.createElement("option");
    opt.value = b.id; opt.textContent = b.title;
    sel.appendChild(opt);
  });
  sel.value = STATE.currentBoardId;
  sel.addEventListener("change", e=>{
    STATE.currentBoardId = e.target.value;
    renderGrid();
  });
}

function renderGrid(){
  const grid = qs("#grid");
  grid.innerHTML = "";
  const board = getCurrentBoard();
  if(!board) return;
  // adjust grid columns
  const cols = board.cols || 4;
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(var(--cell-size),1fr))`;

  board.cells.forEach(cell=>{
    const node = document.createElement("div");
    node.className = "cell";
    node.dataset.id = cell.id;
    node.innerHTML = `
      <div class="cell-actions">
        <button data-action="edit" class="small">✎</button>
        <button data-action="delete" class="small">🗑</button>
      </div>
      <img class="cell-img" src="${cell.img || ''}" alt="${cell.label||''}">
      <div class="cell-label">${cell.label||''}</div>
    `;
    node.addEventListener("click", (ev)=>{
      if(ev.target.dataset.action === "edit"){
        openEditCell(cell);
        ev.stopPropagation(); return;
      }
      if(ev.target.dataset.action === "delete"){
        if(confirm("Delete this cell?")) {
          deleteCell(cell.id);
        }
        ev.stopPropagation(); return;
      }
      // execute action
      executeAction(cell.action, cell);
    });
    grid.appendChild(node);
  });
}

/* ---------------------------
   Cell CRUD
   --------------------------- */
function addCell(){
  const board = getCurrentBoard();
  const newCell = { id: uid("c"), label:"New", img:"", action:{type:"text", payload:""} };
  board.cells.push(newCell);
  saveState(); renderGrid();
  openEditCell(newCell);
}

function deleteCell(cellId){
  const board = getCurrentBoard();
  board.cells = board.cells.filter(c=>c.id !== cellId);
  saveState(); renderGrid();
}

function openEditCell(cell){
  // build modal UI for editing cell
  openModal(`
    <h2>Edit cell</h2>
    <div class="form-row">
      <label style="width:80px">Label</label>
      <input id="cell-label" class="input" value="${escapeHtml(cell.label||'')}" />
    </div>
    <div class="form-row">
      <label style="width:80px">Image</label>
      <input id="cell-img" class="input" value="${escapeHtml(cell.img||'')}" />
      <button id="btn-pick-pict" class="small">Pick</button>
    </div>
    <div class="form-row">
      <label style="width:80px">Action</label>
      <select id="cell-action-type" class="input">
        <option value="text">Text (speak)</option>
        <option value="youtube">YouTube</option>
        <option value="spotify">Spotify (open)</option>
        <option value="matrix">Matrix (keyboard)</option>
        <option value="record">Record Voice</option>
        <option value="embed">Embed URL</option>
        <option value="scratch">Scratch Project</option>
        <option value="camera">Camera</option>
        <option value="navigate">Navigate Board</option>
        <option value="pictionary">Pictionary</option>
      </select>
    </div>
    <div id="action-config"></div>
    <div class="controls-row">
      <button id="save-cell" class="primary">Save</button>
      <button id="cancel-cell" class="small">Cancel</button>
    </div>
    <div class="footer-note">Pictogram sources: ARASAAC, OpenSymbols, or paste image URL. For real ARASAAC/OpenSymbols API usage, see Settings.</div>
  `);
  // populate
  qs("#cell-action-type").value = cell.action?.type || "text";
  renderActionConfig(cell.action);
  qs("#btn-pick-pict").addEventListener("click", ()=>{
    openPictogramPicker(cell);
  });
  qs("#save-cell").addEventListener("click", ()=>{
    cell.label = qs("#cell-label").value;
    cell.img = qs("#cell-img").value;
    const type = qs("#cell-action-type").value;
    const payload = getActionPayloadFromForm(type);
    cell.action = { type, payload };
    saveState(); renderGrid(); closeModal();
  });
  qs("#cancel-cell").addEventListener("click", ()=> closeModal());
  qs("#cell-action-type").addEventListener("change", (e)=> renderActionConfigForType(e.target.value));
  function renderActionConfigForType(type){
    const action = cell.action || {type:"text",payload:""};
    renderActionConfig(action);
  }
}

function renderActionConfig(action){
  const cfg = qs("#action-config");
  const type = action.type || "text";
  if(type === "text"){
    cfg.innerHTML = `
      <div class="form-row"><label style="width:120px">Text to speak</label><input id="action-text" class="input" value="${escapeHtml(action.payload || '')}" /></div>
    `;
  } else if(type === "youtube"){
    cfg.innerHTML = `
      <div class="form-row"><label style="width:120px">YouTube video id</label><input id="action-yid" class="input" value="${escapeHtml(action.payload || '')}" placeholder="e.g. dQw4w9WgXcQ" /></div>
    `;
  } else if(type === "spotify"){
    cfg.innerHTML = `<div class="form-row"><label style="width:120px">Search / URL</label><input id="action-spotify" class="input" value="${escapeHtml(action.payload || '')}" placeholder="track or playlist name or URL" /></div>`;
  } else if(type === "embed"){
    cfg.innerHTML = `<div class="form-row"><label style="width:120px">URL to embed</label><input id="action-embed" class="input" value="${escapeHtml(action.payload || '')}" placeholder="https://..." /></div>`;
  } else if(type === "scratch"){
    cfg.innerHTML = `<div class="form-row"><label style="width:120px">Scratch project id</label><input id="action-scratch" class="input" value="${escapeHtml(action.payload || '')}" placeholder="e.g. 123456789" /></div>`;
  } else if(type === "navigate"){
    // list boards
    const options = STATE.boards.map(b=>`<option value="${b.id}" ${b.id===action.payload?'selected':''}>${escapeHtml(b.title)}</option>`).join("");
    cfg.innerHTML = `<div class="form-row"><label style="width:120px">Target board</label><select id="action-target" class="input">${options}</select></div>`;
  } else { cfg.innerHTML = `<div class="form-row">No configuration required for this action.</div>`; }
}

function getActionPayloadFromForm(type){
  if(type === "text") return qs("#action-text").value;
  if(type === "youtube") return qs("#action-yid").value;
  if(type === "spotify") return qs("#action-spotify").value;
  if(type === "embed") return qs("#action-embed").value;
  if(type === "scratch") return qs("#action-scratch").value;
  if(type === "navigate") return qs("#action-target").value;
  return "";
}

/* ---------------------------
   Pictogram picker (ARASAAC/OpenSymbols/Google helper)
   --------------------------- */
function openPictogramPicker(cell){
  // A tabbed interface that allows:
  // - ARASAAC: user can enter an ID or word to fetch (instructions given)
  // - OpenSymbols: similar
  // - Google: open image search in new tab, user can paste URL
  openModal(`
    <h2>Pick pictogram</h2>
    <div class="tabbar">
      <button class="tab active" data-tab="arasaac">ARASAAC</button>
      <button class="tab" data-tab="opensymbols">OpenSymbols</button>
      <button class="tab" data-tab="google">Google Image</button>
    </div>
    <div id="tab-body">
      <!-- arasaac -->
      <div data-panel="arasaac">
        <div class="form-row"><input id="arasaac-query" class="input" placeholder="Enter ARASAAC pictogram id or keyword (e.g. '2190' or 'comer')" /></div>
        <div class="form-row"><button id="btn-arasaac-search" class="small">Fetch</button> <span class="footer-note">Note: you may need to configure ARASAAC template in Settings to match your API/CORS setup.</span></div>
        <div id="arasaac-results" class="pictogram-grid"></div>
      </div>
      <div data-panel="opensymbols" style="display:none">
        <div class="form-row"><input id="opensymbols-query" class="input" placeholder="Enter OpenSymbols id or keyword" /></div>
        <div class="form-row"><button id="btn-opensymbols-search" class="small">Fetch</button></div>
        <div id="opensymbols-results" class="pictogram-grid"></div>
      </div>
      <div data-panel="google" style="display:none">
        <div class="form-row"><input id="google-query" class="input" placeholder="Search Google Images (opens new tab)" /></div>
        <div class="form-row"><button id="btn-google-search" class="small">Open Google Images</button></div>
        <div class="form-row"><label style="width:120px">Or paste image URL</label><input id="google-paste" class="input" placeholder="https://..." /></div>
      </div>
    </div>
    <div class="controls-row"><button id="pick-ok" class="primary">Use selected</button> <button id="pick-cancel" class="small">Cancel</button></div>
    <div class="footer-note">Demo results include placeholder images. To integrate ARASAAC/OpenSymbols programmatically, see Settings: configure templates and optionally a server proxy to avoid CORS issues. Always attribute sources per their licenses (ARASAAC, OpenSymbols).</div>
  `);

  // Tab switching
  qsa(".tab").forEach(t=> t.addEventListener("click", e=>{
    qsa(".tab").forEach(x=>x.classList.remove("active"));
    e.target.classList.add("active");
    const tab = e.target.dataset.tab;
    qsa("[data-panel]").forEach(p=> p.style.display = p.dataset.panel === tab ? "block" : "none");
  }));

  // ARASAAC demo: try to load image using pattern (user can enter id)
  qs("#btn-arasaac-search").addEventListener("click", async ()=>{
    const q = qs("#arasaac-query").value.trim();
    const container = qs("#arasaac-results");
    container.innerHTML = "";
    if(!q) return;
    // If q is numeric, treat as id demo; else it's a keyword — we show demo placeholders
    const tmpl = STATE.settings.arasaacTemplate || "";
    if(/^\d+$/.test(q) && tmpl.includes("{id}")){
      // build URL by replacing {id}
      const url = tmpl.replaceAll("{id}", q);
      // create item
      const item = pictogramItem(url, `ARASAAC ${q}`);
      container.appendChild(item);
    } else {
      // keyword: show a few craft demo images (replace with API fetch when wiring a real API)
      ["apple","eat","drink"].forEach((k,i)=>{
        const u = `https://via.placeholder.com/128.png?text=${encodeURIComponent(k)}`;
        const itm = pictogramItem(u, k);
        container.appendChild(itm);
      });
    }
  });

  qs("#btn-opensymbols-search").addEventListener("click", ()=>{
    const q = qs("#opensymbols-query").value.trim();
    const container = qs("#opensymbols-results");
    container.innerHTML = "";
    const tmpl = STATE.settings.openSymbolsTemplate || "";
    if(/^\d+$/.test(q) && tmpl.includes("{id}")){
      const url = tmpl.replaceAll("{id}", q);
      container.appendChild(pictogramItem(url, `OpenSymbols ${q}`));
    } else {
      // demo placeholders
      ["dog","cat","house"].forEach(k=>{
        const u = `https://via.placeholder.com/128.png?text=${encodeURIComponent(k)}`;
        container.appendChild(pictogramItem(u, k));
      });
    }
  });

  qs("#btn-google-search").addEventListener("click", ()=>{
    const q = qs("#google-query").value.trim();
    if(!q) return alert("Enter a search term");
    // Opens Google Images in a new tab. The user can copy an image URL and paste below.
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;
    window.open(url, "_blank");
  });

  // select image via click
  let selectedImg = null;
  function pictogramItem(url, title){
    const el = document.createElement("div");
    el.className = "pictogram-item";
    el.innerHTML = `<img src="${url}" alt="${escapeHtml(title)}" />`;
    el.addEventListener("click", ()=> {
      qsa(".pictogram-item").forEach(x=>x.classList.remove("selected"));
      el.classList.add("selected");
      selectedImg = url;
    });
    return el;
  }

  qs("#pick-ok").addEventListener("click", ()=>{
    if(!selectedImg){
      // allow pasting URL from Google
      const pasted = qs("#google-paste").value.trim();
      if(pasted){
        selectedImg = pasted;
      } else {
        return alert("Choose or paste an image URL");
      }
    }
    // set into form
    qs("#cell-img").value = selectedImg;
    closeModal();
  });
  qs("#pick-cancel").addEventListener("click", ()=> closeModal());
}

/* ---------------------------
   Action execution
   --------------------------- */
async function executeAction(action = {}, cell = {}){
  if(!action || !action.type) return;
  try{
    switch(action.type){
      case "text":
        speak(action.payload || cell.label || ""); break;
      case "youtube":
        openYouTube(action.payload); break;
      case "spotify":
        openSpotify(action.payload); break;
      case "matrix":
        openMatrixKeyboard(); break;
      case "record":
        openRecorder(); break;
      case "embed":
        openEmbed(action.payload); break;
      case "scratch":
        openScratch(action.payload); break;
      case "camera":
        openCameraCapture(); break;
      case "navigate":
        navigateToBoard(action.payload); break;
      case "pictionary":
        openPictionary(); break;
      default:
        console.warn("Unknown action", action);
    }
  } catch(e){
    console.error(e); alert("Action error: " + e.message);
  }
}

/* Actions implementations */
function speak(text){
  if(!text) return;
  const u = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function openYouTube(videoId){
  if(!videoId) return alert("No YouTube id configured.");
  // open embed modal with iframe
  openModal(`<h2>YouTube</h2><div style="aspect-ratio:16/9"><iframe src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}" frameborder="0" allow="autoplay; encrypted-media" style="width:100%;height:100%"></iframe></div>`);
}

function openSpotify(query){
  if(!query) return alert("No Spotify query configured.");
  const url = query.startsWith("http") ? query : `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  window.open(url, "_blank");
}

function openMatrixKeyboard(){
  openModal(`<h2>Matrix keyboard</h2>
    <textarea id="matrix-input" rows="4" style="width:100%;"></textarea>
    <div class="controls-row"><button id="matrix-speak" class="primary">Speak</button><button id="matrix-close" class="small">Close</button></div>
  `);
  qs("#matrix-speak").addEventListener("click", ()=>{
    speak(qs("#matrix-input").value);
  });
  qs("#matrix-close").addEventListener("click", ()=> closeModal());
}

function openRecorder(){
  openModal(`<h2>Record Voice</h2><div id="rec-status">Click record to start</div>
    <div class="controls-row"><button id="rec-start" class="primary">Record</button><button id="rec-stop" class="small">Stop</button><button id="rec-play" class="small">Play</button></div>
    <audio id="rec-audio" controls style="width:100%;margin-top:8px"></audio>
  `);
  let mediaRecorder, chunks = [];
  const recStatus = qs("#rec-status");
  const audioEl = qs("#rec-audio");
  qs("#rec-start").addEventListener("click", async ()=>{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];
    mediaRecorder.ondataavailable = e=> chunks.push(e.data);
    mediaRecorder.onstop = ()=> {
      const blob = new Blob(chunks, {type:'audio/webm'});
      audioEl.src = URL.createObjectURL(blob);
      recStatus.textContent = "Recording stopped — play or save.";
    };
    mediaRecorder.start();
    recStatus.textContent = "Recording…";
  });
  qs("#rec-stop").addEventListener("click", ()=>{
    if(mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  });
  qs("#rec-play").addEventListener("click", ()=> audioEl.play());
}

function openEmbed(url){
  if(!url) return alert("Embed URL required");
  // basic safety: only allow http/https
  if(!/^https?:\/\//i.test(url)) return alert("Only http/https URLs allowed for embeds in demo.");
  openModal(`<h2>Embed</h2><div style="aspect-ratio:16/9"><iframe src="${escapeHtml(url)}" frameborder="0" style="width:100%;height:100%"></iframe></div>`);
}

function openScratch(projectId){
  if(!projectId) return alert("Scratch project id required");
  const url = `https://scratch.mit.edu/projects/${encodeU
