<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Centro de Herramientas - Google en Español</title>

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">

  <style>
    :root{
      --bg:#f5f7fb;
      --card:#ffffff;
      --accent:#1a73e8;
      --muted:#6b7280;
      --success:#16a34a;
    }
    html,body{height:100%;margin:0;font-family:'Roboto', 'Open Sans', sans-serif;background:var(--bg);color:#111}
    header{background:linear-gradient(90deg,#1a73e8,#3aa0ff);color:#fff;padding:18px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
    header h1{margin:0;font-size:1.15rem;font-weight:600}
    header p{margin:0;opacity:.9;font-size:.9rem}
    .container{max-width:1150px;margin:20px auto;padding:0 16px}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
    @media (max-width:1000px){.grid{grid-template-columns:repeat(2,1fr)}}
    @media (max-width:700px){.grid{grid-template-columns:1fr}}
    .card{background:var(--card);padding:14px;border-radius:10px;box-shadow:0 1px 6px rgba(15,23,42,.06)}
    .card h2{margin:0 0 8px 0;font-size:1rem}
    label{display:block;font-size:.85rem;margin:8px 0 4px;color:var(--muted)}
    button,select,input[type="range"]{font-family:inherit}
    .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
    .small{font-size:.9rem;padding:.4rem .6rem;border-radius:6px;border:1px solid #e6e9ef;background:#fff}
    .muted{color:var(--muted);font-size:.9rem}
    .links a{display:inline-block;margin-right:8px;padding:6px 8px;background:#f1f5f9;border-radius:6px;text-decoration:none;color:#0f172a;font-weight:600;font-size:.85rem}
    /* Connect-3 board */
    .board{display:grid;gap:6px;background:#0b1220;padding:8px;border-radius:8px}
    .cell{width:48px;height:48px;border-radius:6px;background:#0f1724;display:flex;align-items:center;justify-content:center;cursor:pointer}
    .tile{width:84%;height:84%;border-radius:50%}
    /* Drawing canvas */
    .canvas-wrap{border:1px dashed #d1d5db;padding:8px;border-radius:8px}
    footer{max-width:1150px;margin:18px auto 40px;padding:0 16px;color:var(--muted);font-size:.9rem}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Centro de Herramientas — en Español</h1>
      <p>Juegos, dictado, texto→voz, cámara, editor básico, conversores y más. Compatible con Chrome y Firefox.</p>
    </div>
    <div style="margin-left:auto" class="muted">Fuentes: Roboto, Open Sans</div>
  </header>

  <main class="container">
    <div class="grid">

      <!-- Búsqueda Google -->
      <section class="card">
        <h2>Búsqueda en Google</h2>
        <label for="searchQuery">Buscar:</label>
        <div class="row">
          <input id="searchQuery" class="small" type="search" placeholder="Buscar en Google..." style="flex:1" />
          <select id="searchType" class="small">
            <option value="web">Web</option>
            <option value="images">Imágenes</option>
            <option value="videos">Videos</option>
            <option value="news">Noticias</option>
            <option value="maps">Mapas</option>
          </select>
          <button id="btnSearch" class="small" style="background:var(--accent);color:#fff;border:none">Buscar</button>
        </div>
        <p class="muted">Sugerencia: puedes elegir Imágenes, Videos, Noticias o Mapas.</p>
      </section>

      <!-- Dictado -->
      <section class="card">
        <h2>Dictado (voz → texto)</h2>
        <div class="muted" id="recStatus">Estado: listo</div>
        <div style="margin-top:8px" class="row">
          <button id="startRec" class="small">Iniciar dictado</button>
          <button id="stopRec" class="small" disabled>Detener</button>
          <button id="clearRec" class="small">Limpiar</button>
        </div>
        <label for="transcript">Texto transcrito:</label>
        <textarea id="transcript" rows="6" style="width:100%;padding:8px;border-radius:6px;border:1px solid #e6e9ef"></textarea>
        <p class="muted">Nota: el dictado en Firefox puede no estar disponible; Chrome soporta webkitSpeechRecognition.</p>
      </section>

      <!-- Texto a Voz -->
      <section class="card">
        <h2>Texto → Voz (TTS)</h2>
        <label for="ttsText">Texto:</label>
        <textarea id="ttsText" rows="4" style="width:100%;padding:8px;border-radius:6px;border:1px solid #e6e9ef">Hola, bienvenido al Centro de Herramientas.</textarea>
        <label for="voiceSelect">Voz:</label>
        <select id="voiceSelect" class="small" style="width:100%"></select>
        <div style="margin-top:8px" class="row">
          <label class="muted">Velocidad</label>
          <input id="rate" type="range" min="0.5" max="2" step="0.1" value="1">
          <label class="muted">Tono</label>
          <input id="pitch" type="range" min="0" max="2" step="0.1" value="1">
        </div>
        <div style="margin-top:8px" class="row">
          <button id="speakBtn" class="small" style="background:var(--accent);color:#fff;border:none">Reproducir</button>
          <button id="cancelSpeak" class="small">Detener</button>
        </div>
      </section>

      <!-- Cámara / Fotos / Video recording -->
      <section class="card">
        <h2>Cámara y grabaciones</h2>
        <div>
          <video id="camPreview" autoplay playsinline style="width:100%;border-radius:8px;background:#000;height:200px;object-fit:cover"></video>
        </div>
        <div class="row" style="margin-top:8px">
          <button id="startCam" class="small">Iniciar cámara</button>
          <button id="takePhoto" class="small" disabled>Tomar foto</button>
          <button id="startRecord" class="small">Grabar vídeo</button>
          <button id="stopRecord" class="small" disabled>Detener grabación</button>
          <button id="startAudio" class="small">Grabar audio</button>
          <button id="stopAudio" class="small" disabled>Detener audio</button>
        </div>
        <label>Última captura:</label>
        <div class="row" id="captures" style="margin-top:8px"></div>
        <p class="muted">Puedes capturar fotos desde la cámara, grabar vídeo (MediaRecorder) y grabar audio. Guarda las capturas con el botón de descarga que aparece.</p>
      </section>

      <!-- Editor vídeo simple / capturar fotograma -->
      <section class="card">
        <h2>Editor básico de vídeo</h2>
        <label for="videoFile">Cargar vídeo:</label>
        <input id="videoFile" type="file" accept="video/*" class="small" />
        <video id="playVideo" controls style="width:100%;margin-top:8px;border-radius:6px;background:#000"></video>
        <div class="row" style="margin-top:8px">
          <label class="muted">Seg inicio</label>
          <input id="trimStart" type="number" class="small" min="0" value="0" style="width:80px">
          <label class="muted">Seg fin</label>
          <input id="trimEnd" type="number" class="small" min="0" value="5" style="width:80px">
          <button id="captureFrame" class="small">Extraer fotograma</button>
        </div>
        <p class="muted">Extrae fotogramas del vídeo como imagen. Edición avanzada y exportes sin librerías adicionales están fuera del alcance de un simple demo cliente (pero aquí tienes herramientas básicas para recortar/extraer fotogramas y ajustar audio).</p>
      </section>

      <!-- Conversor de imágenes -->
      <section class="card">
        <h2>Conversión de imágenes</h2>
        <label for="imgFiles">Subir imágenes:</label>
        <input id="imgFiles" type="file" accept="image/*" multiple class="small" />
        <label for="imgFormat">Formato de salida:</label>
        <select id="imgFormat" class="small">
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/webp">WEBP (si el navegador soporta)</option>
        </select>
        <div id="converted" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"></div>
      </section>

      <!-- Lienzo para dibujar -->
      <section class="card">
        <h2>Dibujo digital</h2>
        <div class="canvas-wrap">
          <canvas id="drawCanvas" width="640" height="360" style="touch-action:none;background:#fff;width:100%;height:auto;border-radius:6px"></canvas>
        </div>
        <div class="row" style="margin-top:8px">
          <label class="muted">Color</label>
          <input id="drawColor" type="color" value="#111827">
          <label class="muted">Grosor</label>
          <input id="drawSize" type="range" min="1" max="40" value="4">
          <button id="clearCanvas" class="small">Limpiar</button>
          <button id="saveCanvas" class="small">Guardar</button>
        </div>
      </section>

      <!-- Stop motion / captura de frames -->
      <section class="card">
        <h2>Stop motion (captura de frames)</h2>
        <div class="muted">Usa la cámara para capturar una secuencia de fotogramas; luego puedes reproducirla como animación.</div>
        <div style="margin-top:8px" class="row">
          <button id="addFrame" class="small">Añadir frame desde cámara</button>
          <button id="playFrames" class="small">Reproducir secuencia</button>
          <button id="clearFrames" class="small">Borrar secuencia</button>
        </div>
        <div id="framesPreview" style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"></div>
      </section>

      <!-- Juego Conecta-3 -->
      <section class="card">
        <h2>Juego: Conecta 3 (demo)</h2>
        <div class="muted">Haz clic en una columna para soltar una ficha. Se eliminan alineaciones de 3 o más.</div>
        <div id="gameWrap" style="margin-top:10px">
          <div id="gameBoard" class="board" style="grid-template-columns:repeat(6,48px);grid-template-rows:repeat(6,48px)"></div>
          <div style="margin-top:8px" class="row">
            <button id="resetGame" class="small">Reiniciar</button>
            <div class="muted" style="margin-left:auto">Puntuación: <span id="score">0</span></div>
          </div>
        </div>
      </section>

      <!-- Recursos y enlaces -->
      <section class="card">
        <h2>Recursos y enlaces</h2>
        <div class="links">
          <a href="https://www.duolingo.com" target="_blank" rel="noopener">Duolingo</a>
          <a href="https://www.khanacademy.org" target="_blank" rel="noopener">Khan Academy</a>
          <a href="https://www.uber.com" target="_blank" rel="noopener">Uber</a>
          <a href="https://open.spotify.com" target="_blank" rel="noopener">Spotify</a>
          <a href="https://www.google.com/" target="_blank" rel="noopener">Google</a>
        </div>
        <p class="muted" style="margin-top:8px">Enlaces adicionales: billar, ajedrez, ludo, Monopoly o títulos concretos deben buscarse en tiendas de juegos; aquí incluimos herramientas web.</p>
      </section>

    </div>
  </main>

  <footer>
    Hecho con HTML5, JavaScript y APIs Web (SpeechSynthesis, MediaRecorder, getUserMedia). Algunas funciones (dictado, webp, grabación) dependen del navegador y permisos.
  </footer>

  <script>
  // ---------------------------
  // Utilidades: búsqueda Google
  // ---------------------------
  const btnSearch = document.getElementById('btnSearch');
  btnSearch.addEventListener('click', () => {
    const q = encodeURIComponent(document.getElementById('searchQuery').value.trim());
    const type = document.getElementById('searchType').value;
    if (!q) { alert('Introduce algo para buscar'); return; }
    let url = 'https://www.google.com/search?q=' + q;
    if (type === 'images') url += '&tbm=isch';
    if (type === 'videos') url += '&tbm=vid';
    if (type === 'news') url += '&tbm=nws';
    if (type === 'maps') url = 'https://www.google.com/maps/search/?api=1&query=' + q;
    window.open(url, '_blank');
  });

  // ---------------------------
  // Dictado (SpeechRecognition)
  // ---------------------------
  const transcriptEl = document.getElementById('transcript');
  const startRec = document.getElementById('startRec');
  const stopRec = document.getElementById('stopRec');
  const clearRec = document.getElementById('clearRec');
  const recStatus = document.getElementById('recStatus');
  let recognizer, recognizing=false;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  if (!SpeechRecognition) {
    recStatus.textContent = 'Estado: Dictado no disponible en este navegador.';
    startRec.disabled = true;
  } else {
    recognizer = new SpeechRecognition();
    recognizer.lang = 'es-ES';
    recognizer.interimResults = true;
    recognizer.continuous = true;
    recognizer.onstart = () => { recognizing=true; recStatus.textContent='Estado: escuchando...'; startRec.disabled=true; stopRec.disabled=false; }
    recognizer.onend = () => { recognizing=false; recStatus.textContent='Estado: detenido'; startRec.disabled=false; stopRec.disabled=true; }
    recognizer.onerror = (e) => { console.error(e); recStatus.textContent = 'Error: '+(e.error || e.message); }
    recognizer.onresult = (ev) => {
      let final = '';
      for (let i=0;i<ev.results.length;i++){
        final += ev.results[i][0].transcript;
      }
      transcriptEl.value = final;
    }
  }
  startRec.addEventListener('click', ()=>{ if(recognizer) recognizer.start(); });
  stopRec.addEventListener('click', ()=>{ if(recognizer) recognizer.stop(); });
  clearRec.addEventListener('click', ()=>{ transcriptEl.value=''; });

  // ---------------------------
  // Texto a Voz (SpeechSynthesis)
  // ---------------------------
  const voiceSelect = document.getElementById('voiceSelect');
  const speakBtn = document.getElementById('speakBtn');
  const cancelSpeak = document.getElementById('cancelSpeak');
  const ttsText = document.getElementById('ttsText');
  const rateEl = document.getElementById('rate');
  const pitchEl = document.getElementById('pitch');

  function loadVoices(){
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach(v=>{
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = v.name + ' — ' + v.lang + (v.default ? ' (default)':'');
      voiceSelect.appendChild(opt);
    });
  }
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  speakBtn.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) { alert('Texto a voz no soportado.'); return; }
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(ttsText.value || 'Hola');
    const selected = voiceSelect.value;
    if (selected) {
      const v = speechSynthesis.getVoices().find(x=>x.name===selected);
      if (v) utter.voice = v;
    }
    utter.rate = parseFloat(rateEl.value);
    utter.pitch = parseFloat(pitchEl.value);
    speechSynthesis.speak(utter);
  });
  cancelSpeak.addEventListener('click', ()=>speechSynthesis.cancel());

  // ---------------------------
  // Cámara y MediaRecorder (foto, vídeo, audio)
  // ---------------------------
  const camPreview = document.getElementById('camPreview');
  const startCamBtn = document.getElementById('startCam');
  const takePhotoBtn = document.getElementById('takePhoto');
  const startRecordBtn = document.getElementById('startRecord');
  const stopRecordBtn = document.getElementById('stopRecord');
  const startAudioBtn = document.getElementById('startAudio');
  const stopAudioBtn = document.getElementById('stopAudio');
  const captures = document.getElementById('captures');

  let localStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let audioRecorder = null;
  let recordedAudio = [];

  async function startCamera(){
    try {
      localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      camPreview.srcObject = localStream;
      takePhotoBtn.disabled = false;
    } catch (e) {
      alert('No se pudo acceder a la cámara: ' + e.message);
    }
  }
  startCamBtn.addEventListener('click', startCamera);

  takePhotoBtn.addEventListener('click', () => {
    const video = camPreview;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 360;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video,0,0,w,h);
    const data = canvas.toDataURL('image/png');
    const img = document.createElement('img'); img.src=data; img.style.width='120px'; img.style.height='80px'; img.style.objectFit='cover'; img.style.borderRadius='6px';
    const a = document.createElement('a'); a.href = data; a.download = 'foto.png'; a.textContent='Descargar'; a.style.display='block'; a.className='small';
    const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.gap='6px';
    wrapper.appendChild(img); wrapper.appendChild(a);
    captures.prepend(wrapper);
  });

  startRecordBtn.addEventListener('click', () => {
    if (!localStream) { alert('Inicia la cámara primero'); return; }
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(localStream, {mimeType: 'video/webm;codecs=vp8,opus'});
    mediaRecorder.ondataavailable = (e)=>{ if(e.data.size) recordedChunks.push(e.data); };
    mediaRecorder.onstop = ()=>{
      const blob = new Blob(recordedChunks, {type:'video/webm'});
      const url = URL.createObjectURL(blob);
      const vid = document.createElement('video');
      vid.controls = true; vid.src = url; vid.style.width='180px'; vid.style.borderRadius='6px';
      const a = document.createElement('a'); a.href = url; a.download = 'grabacion.webm'; a.textContent='Descargar vídeo'; a.className='small';
      const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.gap='6px';
      wrapper.appendChild(vid); wrapper.appendChild(a);
      captures.prepend(wrapper);
    };
    mediaRecorder.start();
    startRecordBtn.disabled = true; stopRecordBtn.disabled = false;
  });

  stopRecordBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    startRecordBtn.disabled = false; stopRecordBtn.disabled = true;
  });

  // Audio-only recording
  startAudioBtn.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      recordedAudio = [];
      audioRecorder = new MediaRecorder(stream);
      audioRecorder.ondataavailable = (e)=>{ if(e.data.size) recordedAudio.push(e.data); };
      audioRecorder.onstop = ()=>{
        const blob = new Blob(recordedAudio,{type:'audio/webm'});
        const url = URL.createObjectURL(blob);
        const audio = document.createElement('audio'); audio.controls=true; audio.src=url; audio.style.width='180px';
        const a = document.createElement('a'); a.href = url; a.download = 'audio.webm'; a.textContent='Descargar audio'; a.className='small';
        const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.gap='6px';
        wrapper.appendChild(audio); wrapper.appendChild(a);
        captures.prepend(wrapper);
      };
      audioRecorder.start();
      startAudioBtn.disabled=true; stopAudioBtn.disabled=false;
    } catch (e) {
      alert('No se puede grabar audio: '+e.message);
    }
  });
  stopAudioBtn.addEventListener('click', ()=>{ if(audioRecorder) audioRecorder.stop(); startAudioBtn.disabled=false; stopAudioBtn.disabled=true; });

  // ---------------------------
  // Editor de vídeo: extraer fotograma
  // ---------------------------
  const videoFile = document.getElementById('videoFile');
  const playVideo = document.getElementById('playVideo');
  const captureFrameBtn = document.getElementById('playVideo');
  const captureFrameBtn = document.getElementById('captureFrame');
  const trimStart = document.getElementById('trimStart');
  const trimEnd = document.getElementById('trimEnd');

  videoFile.addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    playVideo.src = url;
    playVideo.onloadedmetadata = () => {
      trimEnd.value = Math.floor(playVideo.duration);
    };
  });

  captureFrameBtn.addEventListener('click', () => {
    if (!playVideo.src) { alert('Carga un video primero'); return; }
    const s = Number(trimStart.value) || 0;
    playVideo.currentTime = s;
    playVideo.pause();
    const canvas = document.createElement('canvas');
    canvas.width = playVideo.videoWidth || 640;
    canvas.height = playVideo.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    // wait a bit for currentTime seek to render
    setTimeout(()=>{
      ctx.drawImage(playVideo,0,0,canvas.width,canvas.height);
      const data = canvas.toDataURL('image/png');
      const img = document.createElement('img'); img.src=data; img.style.width='140px'; img.style.borderRadius='6px';
      const a = document.createElement('a'); a.href = data; a.download = 'frame.png'; a.textContent='Descargar fotograma'; a.className='small';
      const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.gap='6px';
      wrapper.appendChild(img); wrapper.appendChild(a);
      captures.prepend(wrapper);
    }, 300);
  });

  // ---------------------------
  // Conversor de imágenes (canvas)
  // ---------------------------
  const imgFiles = document.getElementById('imgFiles');
  const imgFormat = document.getElementById('imgFormat');
  const converted = document.getElementById('converted');

  imgFiles.addEventListener('change', (ev)=>{
    converted.innerHTML = '';
    const files = Array.from(ev.target.files).slice(0,10);
    files.forEach(file=>{
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0);
          const outType = imgFormat.value || 'image/png';
          const data = canvas.toDataURL(outType, 0.92);
          const thumb = document.createElement('img'); thumb.src = data; thumb.style.width='120px'; thumb.style.height='80px'; thumb.style.objectFit='cover'; thumb.style.borderRadius='6px';
          const a = document.createElement('a'); a.href = data; a.download = ('convertido.' + (outType.split('/')[1]||'png')); a.textContent = 'Descargar'; a.className='small';
          const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.flexDirection='column'; wrapper.style.gap='6px';
          wrapper.appendChild(thumb); wrapper.appendChild(a);
          converted.appendChild(wrapper);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  });

  // ---------------------------
  // Dibujo canvas
  // ---------------------------
  const drawCanvas = document.getElementById('drawCanvas');
  const ctx = drawCanvas.getContext('2d');
  let drawing=false, lastX=0, lastY=0;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = '#111827';

  function resizeCanvasToDisplay(){
    const rect = drawCanvas.getBoundingClientRect();
    // keep backing size reasonably large for quality
    const scale = window.devicePixelRatio || 1;
    drawCanvas.width = Math.floor(rect.width * scale);
    drawCanvas.height = Math.floor(rect.height * scale);
    ctx.scale(scale, scale);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  }
  // initialize
  // call after a short timeout so CSS layout applied on mobile
  setTimeout(() => {
    // set display size to 640x360 in CSS
    drawCanvas.style.height = (drawCanvas.width * 0.5625) + 'px';
    // We won't scale further to avoid complexities; use default size
  }, 100);

  function getXY(e){
    const rect = drawCanvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) e = e.touches[0];
    return {x: e.clientX - rect.left, y: e.clientY - rect.top};
  }
  drawCanvas.addEventListener('pointerdown', (e)=>{
    drawing=true;
    const p = getXY(e);
    lastX = p.x; lastY = p.y;
  });
  drawCanvas.addEventListener('pointermove', (e)=>{
    if (!drawing) return;
    const p = getXY(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  });
  ['pointerup','pointercancel','pointerout'].forEach(ev => drawCanvas.addEventListener(ev, ()=>drawing=false));
  document.getElementById('drawColor').addEventListener('input',(e)=>ctx.strokeStyle=e.target.value);
  document.getElementById('drawSize').addEventListener('input',(e)=>ctx.lineWidth = e.target.value);
  document.getElementById('clearCanvas').addEventListener('click', ()=>{ ctx.clearRect(0,0,drawCanvas.width,drawCanvas.height); });
  document.getElementById('saveCanvas').addEventListener('click', ()=>{
    const data = drawCanvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = data; a.download = 'dibujo.png'; a.click();
  });

  // ---------------------------
  // Stop motion frames handling
  // ---------------------------
  const addFrameBtn = document.getElementById('addFrame');
  const playFramesBtn = document.getElementById('playFrames');
  const clearFramesBtn = document.getElementById('clearFrames');
  const framesPreview = document.getElementById('framesPreview');
  let frames = [];

  addFrameBtn.addEventListener('click', () => {
    if (!localStream) { alert('Inicia la cámara primero'); return; }
    const video = camPreview;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 360;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(video,0,0,w,h);
    const data = canvas.toDataURL('image/png');
    frames.push(data);
    const img = document.createElement('img'); img.src = data; img.style.width='100px'; img.style.borderRadius='6px';
    framesPreview.appendChild(img);
  });

  playFramesBtn.addEventListener('click', () => {
    if (frames.length === 0) return alert('No hay frames capturados');
    const w = 320, h = 180;
    const anim = document.createElement('img'); anim.style.width = w+'px'; anim.style.height = h+'px'; anim.style.borderRadius='6px';
    framesPreview.prepend(anim);
    let i=0;
    const iv = setInterval(()=>{ anim.src = frames[i]; i=(i+1)%frames.length; }, 200);
    setTimeout(()=>{ clearInterval(iv); anim.remove(); }, Math.min(10000, frames.length * 200 * 4));
  });

  clearFramesBtn.addEventListener('click', ()=>{ frames=[]; framesPreview.innerHTML=''; });

  // ---------------------------
  // Juego Conecta-3 (6x6)
  // ---------------------------
  const boardEl = document.getElementById('gameBoard');
  const resetGameBtn = document.getElementById('resetGame');
  const scoreEl = document.getElementById('score');
  const COLS = 6, ROWS = 6;
  const colors = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
  let board=[], score=0;

  function initBoard(){
    board = Array.from({length:ROWS}, ()=>Array(COLS).fill(null));
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${COLS},48px)`;
    boardEl.style.gridTemplateRows = `repeat(${ROWS},48px)`;
    for (let r=0;r<ROWS;r++){
      for (let c=0;c<COLS;c++){
        const cell = document.createElement('div'); cell.className='cell'; cell.dataset.r=r; cell.dataset.c=c;
        cell.addEventListener('click', ()=>dropInColumn(c));
        boardEl.appendChild(cell);
      }
    }
    score = 0; scoreEl.textContent = score;
    renderBoard();
  }
  function renderBoard(){
    const cells = boardEl.querySelectorAll('.cell');
    cells.forEach(el=>{
      const r=Number(el.dataset.r), c=Number(el.dataset.c);
      el.innerHTML = '';
      const val = board[r][c];
      if (val !== null){
        const tile = document.createElement('div'); tile.className='tile'; tile.style.background = val;
        el.appendChild(tile);
      }
    });
  }
  function dropInColumn(col){
    // drop to lowest available
    for (let r=ROWS-1;r>=0;r--){
      if (!board[r][col]){
        board[r][col] = colors[Math.floor(Math.random()*colors.length)];
        break;
      }
    }
    collapseBoard();
    let removed = removeMatches();
    if (removed>0) { score += removed; }
    collapseBoard();
    renderBoard();
    scoreEl.textContent = score;
  }
  function collapseBoard(){
    // gravity: for each column, pull down
    for (let c=0;c<COLS;c++){
      let stack = [];
      for (let r=ROWS-1;r>=0;r--){
        if (board[r][c]) stack.push(board[r][c]);
      }
      for (let r=ROWS-1;r>=0;r--){
        board[r][c] = stack.shift() || null;
      }
    }
  }
  function removeMatches(){
    const toRemove = Array.from({length:ROWS}, ()=>Array(COLS).fill(false));
    let count=0;
    // check directions: horizontal, vertical, diag1, diag2
    function markChain(cells){
      if (cells.length>=3){
        cells.forEach(([r,c])=>toRemove[r][c]=true);
      }
    }
    // horizontal
    for (let r=0;r<ROWS;r++){
      let run=[]; let last=null;
      for (let c=0;c<COLS;c++){
        const v = board[r][c];
        if (v && v===last){ run.push([r,c]); } else { markChain(run); run = v ? [[r,c]]:[]; last=v; }
      }
      markChain(run);
    }
    // vertical
    for (let c=0;c<COLS;c++){
      let run=[]; let last=null;
      for (let r=0;r<ROWS;r++){
        const v = board[r][c];
        if (v && v===last){ run.push([r,c]); } else { markChain(run); run = v ? [[r,c]]:[]; last=v; }
      }
      markChain(run);
    }
    // diag down-right
    for (let k=-(ROWS-1); k<=COLS-1; k++){
      let run=[]; let last=null;
      for (let r=0;r<ROWS;r++){
        const c = r + k;
        if (c<0||c>=COLS) continue;
        const v = board[r][c];
        if (v && v===last){ run.push([r,c]); } else { markChain(run); run = v ? [[r,c]]:[]; last=v; }
      }
      markChain(run);
    }
    // diag up-right
    for (let k=0; k<ROWS+COLS; k++){
      let run=[]; let last=null;
      for (let r=0;r<ROWS;r++){
        const c = k - r;
        if (c<0||c>=COLS) continue;
        const v = board[r][c];
        if (v && v===last){ run.push([r,c]); } else { markChain(run); run = v ? [[r,c]]:[]; last=v; }
      }
      markChain(run);
    }
    // remove
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) if (toRemove[r][c]) { board[r][c]=null; count++; }
    return count;
  }

  resetGameBtn.addEventListener('click', initBoard);
  initBoard();

  // ---------------------------
  // Fin script
  // ---------------------------
  </script>
</body>
</html>
