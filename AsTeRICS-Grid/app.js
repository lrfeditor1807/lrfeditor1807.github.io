// Simple AsTeRICS-style Grid demo app
// Save boards to localStorage; supports cell actions: speak, open board, youtube, spotify, text, record, embed, scratch, camera, pictionary

// Utilities
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const create = (tag, attrs={}) => {
  const el = document.createElement(tag);
  for (const k in attrs) {
    if (k.startsWith('on') && typeof attrs[k] === 'function') el.addEventListener(k.slice(2), attrs[k]);
    else if (k === 'html') el.innerHTML = attrs[k];
    else el.setAttribute(k, attrs[k]);
  }
  return el;
}

// Storage keys
const LS_BOARDS = 'asterics.boards.v1';
const LS_SESSION = 'asterics.session.v1';
const defaultBoards = [
  {
    id: 'arasaac-comm',
    title: 'ARASAAC Communicator',
    cols: 3,
    cells: [
      // Cells: label, img, imgSrc, action, actionValue
      {label:'YO', img: emojiDataURL('🧑'), imgSrc:'emoji', action:'speak', actionValue:'Yo'},
      {label:'QUIERO', img: emojiDataURL('✋'), imgSrc:'emoji', action:'speak', actionValue:'Quiero'},
      {label:'COMER', img: emojiDataURL('🍽️'), imgSrc:'emoji', action:'speak', actionValue:'Comer'},
      {label:'BEBER', img: emojiDataURL('🥤'), imgSrc:'emoji', action:'speak', actionValue:'Beber'},
      {label:'COMPRAR', img: emojiDataURL('💰'), imgSrc:'emoji', action:'speak', actionValue:'Comprar'},
      {label:'ALIMENTOS', img: emojiDataURL('🍱'), imgSrc:'emoji', action:'speak', actionValue:'Alimentos'},
      {label:'MANZANA', img: emojiDataURL('🍎'), imgSrc:'emoji', action:'speak', actionValue:'Manzana'},
      {label:'GALLETAS', img: emojiDataURL('🍪'), imgSrc:'emoji', action:'speak', actionValue:'Galletas'},
      {label:'JUGO', img: emojiDataURL('🧃'), imgSrc:'emoji', action:'speak', actionValue:'Jugo'},
      {label:'LECHE', img: emojiDataURL('🥛'), imgSrc:'emoji', action:'speak', actionValue:'Leche'},
      {label:'AGUA', img: emojiDataURL('💧'), imgSrc:'emoji', action:'speak', actionValue:'Agua'},
      {label:'+', img: emojiDataURL('➕'), imgSrc:'emoji', action:'open_board', actionValue:''}
    ]
  }
];

// Create a small dataURL from emoji to use as placeholder images
function emojiDataURL(emoji, size=128){
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,size,size);
  ctx.font = `${size*0.8}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size/2, size/2+2);
  return canvas.toDataURL();
}

// App state
let boards = loadBoards();
let currentBoardId = boards[0].id;
let session = loadSession();

const gridEl = $('#grid');
const boardTitleEl = $('#board-title');
const boardsUl = $('#boards-ul');
const onlineIndicator = $('#online-indicator');
const modal = $('#modal');
const modalBody = $('#modal-body');
const modalClose = $('#modal-close');
const loginBtn = $('#login-btn');
const settingsBtn = $('#settings-btn');
const aboutBtn = $('#about-btn');

function loadBoards(){
  try{
    const raw = localStorage.getItem(LS_BOARDS);
    if (!raw) {
      localStorage.setItem(LS_BOARDS, JSON.stringify(defaultBoards));
      return JSON.parse(JSON.stringify(defaultBoards));
    }
    return JSON.parse(raw);
  }catch(e){
    console.error('loadBoards error',e);
    return JSON.parse(JSON.stringify(defaultBoards));
  }
}
function saveBoards(){
  localStorage.setItem(LS_BOARDS, JSON.stringify(boards));
}

function loadSession(){
  try{
    const raw = localStorage.getItem(LS_SESSION);
    if (!raw) return {user:null, offline:true};
    return JSON.parse(raw);
  }catch(e){return {user:null, offline:true};}
}
function saveSession(){ localStorage.setItem(LS_SESSION, JSON.stringify(session)); }

// Render list of boards
function renderBoardsList(){
  boardsUl.innerHTML = '';
  for(const b of boards){
    const li = create('li');
    if (b.id === currentBoardId) li.classList.add('active');
    const span = create('span', {html: b.title});
    span.addEventListener('click', ()=>{ currentBoardId = b.id; renderGrid(); renderBoardsList(); });
    const editBtn = create('button', {html:'✎'});
    editBtn.addEventListener('click', ()=>{ openBoardEditor(b); });
    li.appendChild(span); li.appendChild(editBtn);
    boardsUl.appendChild(li);
  }
}

// Render grid
function renderGrid(){
  const board = boards.find(b=>b.id===currentBoardId);
  if(!board) return;
  boardTitleEl.textContent = board.title;
  gridEl.style.gridTemplateColumns = `repeat(${board.cols}, minmax(var(--cell-size),1fr))`;
  gridEl.innerHTML = '';
  board.cells.forEach((cell, idx)=>{
    const c = create('div', {});
    c.className = 'cell';
    c.setAttribute('data-idx', idx);
    c.tabIndex = 0;
    // image
    const img = create('img');
    img.alt = cell.label || '';
    img.src = cell.img || emojiDataURL('❓');
    c.appendChild(img);
    // label
    const label = create('div',{html: cell.label || '', class:'label'});
    c.appendChild(label);
    // sub
    const sub = create('div',{html: cell.action || '', class:'sub'});
    c.appendChild(sub);

    c.addEventListener('click', ()=> onCellActivate(board, cell, idx));
    c.addEventListener('contextmenu', (ev)=>{ ev.preventDefault(); openCellEditor(board, cell, idx); });
    c.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter') onCellActivate(board, cell, idx); if(ev.key==='e') openCellEditor(board, cell, idx); });
    gridEl.appendChild(c);
  });
}

// Cell activation
async function onCellActivate(board, cell, idx){
  const action = cell.action || 'speak';
  const value = cell.actionValue || cell.label || '';
  speak(value);
  setStatus(`Activated: ${cell.label || '(no label)'} — action: ${action}`);
  switch(action){
    case 'speak':
      break;
    case 'open_board':
      if (!value) { setStatus('No board specified in cell'); return; }
      const target = boards.find(b=>b.title===value || b.id===value);
      if (target) { currentBoardId = target.id; renderGrid(); renderBoardsList(); }
      else setStatus('Board not found: '+value);
      break;
    case 'youtube':
      openModal(`<h3>YouTube</h3><iframe width="560" height="315" src="https://www.youtube.com/embed/${value}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
      break;
    case 'spotify':
      // open in new tab
      window.open(value.startsWith('http')?value:`https://open.spotify.com/${value}`, '_blank');
      break;
    case 'text_cell':
      openTextCellModal(value);
      break;
    case 'record_voice':
      openRecordModal(cell, board, idx);
      break;
    case 'embed_url':
      openModal(`<h3>Embed</h3><iframe src="${value}" style="width:100%;height:60vh;border:0"></iframe>`);
      break;
    case 'scratch':
      openModal(`<h3>Scratch Project</h3><iframe src="${value}" style="width:100%;height:60vh;border:0"></iframe>`);
      break;
    case 'camera':
      openCameraModal(cell, board, idx);
      break;
    case 'pictionary':
      openPictionaryModal(cell, board, idx);
      break;
    default:
      console.log('Unknown action', action);
  }
}

// TTS speak
function speak(text){
  if (!text) return;
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// Modals
function openModal(htmlOrNode){
  modalBody.innerHTML = '';
  if (typeof htmlOrNode === 'string') modalBody.innerHTML = htmlOrNode;
  else modalBody.appendChild(htmlOrNode);
  modal.classList.remove('hidden');
}
function closeModal(){ modal.classList.add('hidden'); modalBody.innerHTML=''; }
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (ev)=>{ if(ev.target===modal) closeModal(); });

// Status
function setStatus(s){ $('#status').textContent = s; }

// Board editor
function openBoardEditor(board){
  const div = create('div');
  const titleIn = create('input'); titleIn.value = board.title;
  const colsIn = create('input'); colsIn.type='number'; colsIn.value = board.cols; colsIn.min=1; colsIn.max=6;
  div.appendChild(create('label',{html:'Title:'})); div.appendChild(titleIn);
  div.appendChild(create('label',{html:'Columns:'})); div.appendChild(colsIn);
  const saveBtn = create('button',{html:'Save'});
  saveBtn.addEventListener('click', ()=>{
    board.title = titleIn.value || board.title;
    board.cols = Number(colsIn.value) || board.cols;
    saveBoards(); renderBoardsList(); renderGrid(); closeModal();
  });
  const cancelBtn = create('button',{html:'Cancel'});
  cancelBtn.addEventListener('click', closeModal);
  div.appendChild(create('div',{class:'modal-actions'}));
  div.querySelector('.modal-actions').appendChild(cancelBtn);
  div.querySelector('.modal-actions').appendChild(saveBtn);
  openModal(div);
}

// Cell editor modal (edit or delete cell)
function openCellEditor(board, cell, idx){
  const tpl = $('#cell-edit-template').content.cloneNode(true);
  const lab = tpl.querySelector('#cell-label'); const imgUrl = tpl.querySelector('#cell-image-url');
  const imgSrc = tpl.querySelector('#cell-image-src'); const actionSel = tpl.querySelector('#cell-action');
  const actionVal = tpl.querySelector('#cell-action-value');
  lab.value = cell.label || '';
  imgUrl.value = cell.img || '';
  imgSrc.value = cell.imgSrc || 'custom';
  actionSel.value = cell.action || 'speak';
  actionVal.value = cell.actionValue || '';
  tpl.querySelector('#save-cell-btn').addEventListener('click', ()=>{
    cell.label = lab.value;
    cell.img = imgUrl.value || cell.img;
    cell.imgSrc = imgSrc.value;
    cell.action = actionSel.value;
    cell.actionValue = actionVal.value;
    saveBoards(); renderGrid(); closeModal();
  });
  tpl.querySelector('#delete-cell-btn').addEventListener('click', ()=>{
    board.cells.splice(idx,1);
    saveBoards(); renderGrid(); closeModal();
  });
  openModal(tpl);
}

// New board
$('#new-board-btn').addEventListener('click', ()=>{
  const id = 'board-'+Date.now();
  const b = {id, title:'New board', cols:3, cells:[
    {label:'+', img:emojiDataURL('➕'), imgSrc:'emoji', action:'none'}
  ]};
  boards.push(b); saveBoards(); currentBoardId=b.id; renderBoardsList(); renderGrid();
});

// Matrix (simple alphabet matrix)
$('#matrix-btn').addEventListener('click', ()=>{
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ'.split('');
  const container = create('div');
  container.appendChild(create('h3',{html:'Matrix — tap letters to build text'}) );
  const display = create('div'); display.style.padding='8px'; display.style.border='1px solid #eee'; display.style.minHeight='36px';
  container.appendChild(display);
  const grid = create('div'); grid.style.display='grid'; grid.style.gridTemplateColumns='repeat(7,1fr)'; grid.style.gap='6px'; grid.style.marginTop='8px';
  chars.forEach(ch=>{
    const b = create('button',{html:ch});
    b.addEventListener('click', ()=>{ display.textContent += ch; speak(ch); });
    grid.appendChild(b);
  });
  const speakBtn = create('button',{html:'Speak text'}); speakBtn.addEventListener('click', ()=>speak(display.textContent));
  container.appendChild(grid); container.appendChild(speakBtn);
  openModal(container);
});

// Pictionary button
$('#pictionary-btn').addEventListener('click', ()=> openPictionaryModal());

// Camera button
$('#camera-btn').addEventListener('click', openCameraModal);

// YouTube button: open modal to paste YouTube ID
$('#youtube-btn').addEventListener('click', ()=>{
  const div = create('div');
  div.appendChild(create('h3',{html:'Open YouTube video (paste ID or full url)'}));
  const inp = create('input'); inp.placeholder='e.g. dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  div.appendChild(inp);
  const openBtn = create('button',{html:'Open'});
  openBtn.addEventListener('click', ()=>{
    let v = inp.value.trim();
    const m = v.match(/[?&]v=([^&]+)/);
    if(m) v = m[1];
    else if (v.includes('youtube.com/') && v.includes('embed')) {
      // maybe embed url
    }
    openModal(`<iframe width="560" height="315" src="https://www.youtube.com/embed/${v}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
  });
  div.appendChild(openBtn);
  openModal(div);
});

// Spotify button
$('#spotify-btn').addEventListener('click', ()=>{
  const div = create('div');
  div.appendChild(create('h3',{html:'Open Spotify content (paste track/playlist URL)'}));
  const inp = create('input'); inp.placeholder='e.g. https://open.spotify.com/track/...';
  div.appendChild(inp);
  const go = create('button',{html:'Open in Spotify Web'}); go.addEventListener('click', ()=> window.open(inp.value,'_blank'));
  div.appendChild(go); openModal(div);
});

// Record voice button
$('#record-voice-btn').addEventListener('click', ()=> openRecordModal());

// Embed URL
$('#embed-url-btn').addEventListener('click', ()=>{
  const div = create('div');
  div.appendChild(create('h3',{html:'Embed URL'}));
  const inp = create('input'); inp.placeholder='https://example.com';
  const go = create('button',{html:'Open'});
  go.addEventListener('click', ()=> openModal(`<iframe src="${inp.value}" style="width:100%;height:60vh;border:0"></iframe>`));
  div.appendChild(inp); div.appendChild(go); openModal(div);
});

// Scratch
$('#scratch-btn').addEventListener('click', ()=>{
  const div = create('div'); div.appendChild(create('h3',{html:'Embed Scratch project - paste project embed URL'}));
  const inp = create('input'); inp.placeholder='https://scratch.mit.edu/projects/xxxx/embed';
  const go = create('button',{html:'Open'}); go.addEventListener('click', ()=> openModal(`<iframe src="${inp.value}" style="width:100%;height:60vh;border:0"></iframe>`));
  div.appendChild(inp); div.appendChild(go); openModal(div);
});

// Camera modal
async function openCameraModal(cell=null, board=null, idx=null){
  const div = create('div');
  div.appendChild(create('h3',{html:'Camera — take snapshot'}) );
  const video = create('video'); video.autoplay = true; video.style.maxWidth='100%';
  const snapBtn = create('button',{html:'Take snapshot'});
  const canvas = create('canvas'); canvas.style.display='none'; canvas.width=640; canvas.height=480;
  div.appendChild(video); div.appendChild(snapBtn); div.appendChild(canvas);
  let stream;
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    video.srcObject = stream;
  }catch(e){
    div.appendChild(create('div',{html:'Camera not available: '+e.message}));
  }
  snapBtn.addEventListener('click', ()=>{
    canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
    const data = canvas.toDataURL('image/png');
    // assign to cell if provided, else show
    if (cell && board) {
      cell.img = data; cell.imgSrc='camera';
      saveBoards(); renderGrid(); setStatus('Snapshot saved to cell');
      stopStream(stream); closeModal();
    } else {
      openModal(`<h3>Snapshot</h3><img src="${canvas.toDataURL()}" style="max-width:100%"><p>You can right-click/save the image</p>`);
    }
  });
  openModal(div);
  function stopStream(s){ if(!s) return; s.getTracks().forEach(t=>t.stop()); }
}

// Record voice modal
function openRecordModal(cell=null, board=null, idx=null){
  const div = create('div');
  div.appendChild(create('h3',{html:'Record Voice'}) );
  const recBtn = create('button',{html:'Start Recording'});
  const stopBtn = create('button',{html:'Stop'}); stopBtn.disabled=true;
  const list = create('div');
  div.appendChild(recBtn); div.appendChild(stopBtn); div.appendChild(list);
  let mediaRecorder, chunks=[];
  recBtn.addEventListener('click', async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = ()=>{
        const blob = new Blob(chunks,{type:'audio/webm'});
        const url = URL.createObjectURL(blob);
        const audio = create('audio'); audio.controls=true; audio.src = url;
        const saveBtn = create('button',{html:'Attach to cell'});
        saveBtn.addEventListener('click', ()=>{
          if (cell && board) {
            // store blob as dataURL to cell
            const reader = new FileReader();
            reader.onload = ()=>{ cell.img = reader.result; cell.imgSrc='voice'; cell.label = cell.label || 'Voice'; saveBoards(); renderGrid(); setStatus('Voice attached to cell'); closeModal(); };
            reader.readAsDataURL(blob);
          } else {
            openModal(audio);
          }
        });
        list.innerHTML=''; list.appendChild(audio); list.appendChild(saveBtn);
        chunks=[];
      };
      mediaRecorder.start();
      recBtn.disabled=true; stopBtn.disabled=false;
    }catch(e){ list.textContent='Recording failed: '+e.message; }
  });
  stopBtn.addEventListener('click', ()=>{ if(mediaRecorder && mediaRecorder.state!=='inactive') mediaRecorder.stop(); recBtn.disabled=false; stopBtn.disabled=true; });
  openModal(div);
}

// Pictionary modal (drawing canvas)
function openPictionaryModal(cell=null, board=null, idx=null){
  const div = create('div');
  div.appendChild(create('h3',{html:'Pictionary — draw and save'}) );
  const canvas = create('canvas'); canvas.id='pictionary-canvas'; canvas.width=640; canvas.height=480;
  canvas.style.width='100%'; canvas.style.height='360px';
  const ctx = canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  let drawing=false; let last={x:0,y:0};
  function pos(evt){
    const rect = canvas.getBoundingClientRect();
    const x = (evt.touches?evt.touches[0].clientX:evt.clientX) - rect.left;
    const y = (evt.touches?evt.touches[0].clientY:evt.clientY) - rect.top;
    // scale to canvas res
    const sx = x * (canvas.width / rect.width);
    const sy = y * (canvas.height / rect.height);
    return {x:sx,y:sy};
  }
  canvas.addEventListener('pointerdown',(e)=>{ drawing=true; last = pos(e); });
  canvas.addEventListener('pointermove',(e)=>{ if(!drawing) return; const p=pos(e); ctx.strokeStyle='#111'; ctx.lineWidth=6; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last = p; });
  canvas.addEventListener('pointerup', ()=>drawing=false);
  const saveBtn = create('button',{html:'Save drawing'});
  saveBtn.addEventListener('click', ()=>{
    const data = canvas.toDataURL('image/png');
    if (cell && board) {
      cell.img = data; cell.imgSrc='pictionary'; saveBoards(); renderGrid(); setStatus('Drawing saved to cell'); closeModal();
    } else {
      openModal(`<h3>Your drawing</h3><img src="${data}" style="max-width:100%">`);
    }
  });
  const clearBtn = create('button',{html:'Clear'}); clearBtn.addEventListener('click', ()=>{ ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); });
  div.appendChild(canvas); div.appendChild(clearBtn); div.appendChild(saveBtn);
  openModal(div);
}

// Text cell modal (type and speak)
function openTextCellModal(initial=''){
  const div = create('div');
  div.appendChild(create('h3',{html:'Text Cell — type text and speak'}) );
  const ta = create('textarea'); ta.value = initial; ta.rows=6;
  const speakBtn = create('button',{html:'Speak'});
  speakBtn.addEventListener('click', ()=> speak(ta.value));
  div.appendChild(ta); div.appendChild(speakBtn); openModal(div);
}

// Cell editor helper when activating edit via contextmenu
function openCellEditorByIndex(board, idx){
  const cell = board.cells[idx];
  openCellEditor(board, cell, idx);
}

// Login logic (online/offline)
loginBtn.addEventListener('click', ()=>{
  const div = create('div');
  div.appendChild(create('h3',{html:'Login (online/offline)'}) );
  const userIn = create('input'); userIn.placeholder='username';
  const passIn = create('input'); passIn.type='pa
