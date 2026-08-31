// Demo client-side app.js
// - Enforces password length 8-12
// - Stores demo emails, events, contacts into localStorage
// - Placeholder OAuth flows for providers (Gmail/Outlook/iCloud) — DO NOT use for real credentials
// - Registers service worker for offline caching

const qs = sel => document.querySelector(sel);

// Basic elements
const loginScreen = qs('#login-screen');
const mainScreen = qs('#main-screen');
const loginForm = qs('#login-form');
const emailInput = qs('#email');
const passwordInput = qs('#password');
const offlineBtn = qs('#offline-btn');
const loginBtn = qs('#login-btn');
const networkStatus = qs('#network-status');
const onlineDot = qs('#online-dot');
const onlineText = qs('#online-text');

const welcome = qs('#welcome');
const logoutBtn = qs('#logout');

const tabs = Array.from(document.querySelectorAll('.tab'));
const tabPanels = {
  email: qs('#tab-email'),
  calendar: qs('#tab-calendar'),
  contacts: qs('#tab-contacts')
};

// Email elements
const composeTo = qs('#compose-to'), composeSubject = qs('#compose-subject'), composeBody = qs('#compose-body'), sendEmailBtn = qs('#send-email');
const emailList = qs('#email-list');

// Calendar elements
const eventTitle = qs('#event-title'), eventDate = qs('#event-date'), addEventBtn = qs('#add-event'), eventList = qs('#event-list');

// Contacts elements
const contactName = qs('#contact-name'), contactEmail = qs('#contact-email'), addContactBtn = qs('#add-contact'), contactList = qs('#contact-list');

// Downloads (placeholders)
const apkLink = qs('#apk-link'), ipaLink = qs('#ipa-link');

// small helpers for storage
const STORAGE_KEY = 'demo-mail-v1';
function loadState(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {emails:[],events:[],contacts:[]};
  }catch(e){ return {emails:[],events:[],contacts:[]};}
}
function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
let state = loadState();

// show online/offline
function updateNetworkUI(){
  const online = navigator.onLine;
  onlineDot.style.background = online ? 'limegreen' : 'gray';
  onlineText.textContent = online ? 'Online' : 'Offline';
  networkStatus.textContent = `Browser: ${navigator.userAgent}`;
}
window.addEventListener('online', updateNetworkUI);
window.addEventListener('offline', updateNetworkUI);
updateNetworkUI();

// simple tabbing
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(tt => tt.classList.remove('active'));
  t.classList.add('active');
  Object.values(tabPanels).forEach(p => p.classList.add('hidden'));
  tabPanels[t.dataset.tab].classList.remove('hidden');
}));

// validation: password 8-12 enforced by minlength/maxlength and extra JS check
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const pw = passwordInput.value;
  if(!email){ alert('Enter email'); return; }
  if(pw.length < 8 || pw.length > 12){ alert('Password must be between 8 and 12 characters'); return; }
  // Demo: accept login (do not send credentials anywhere)
  showMainScreen(email);
});

// offline-only entry
offlineBtn.addEventListener('click', () => {
  showMainScreen('offline-user@example.com');
});

function showMainScreen(userEmail){
  loginScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  welcome.textContent = `Welcome, ${userEmail}`;
  renderAll();
}

// Logout resets UI (but not stored data)
logoutBtn.addEventListener('click', () => {
  mainScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  emailInput.value = '';
  passwordInput.value = '';
});

// Email operations
sendEmailBtn.addEventListener('click', () => {
  const to = composeTo.value.trim();
  const subject = composeSubject.value.trim();
  const body = composeBody.value.trim();
  if(!to){ alert('Enter recipient email'); return; }
  const msg = {id:Date.now(), to, subject, body, receivedAt: new Date().toISOString()};
  state.emails.unshift(msg);
  saveState(state);
  composeTo.value = composeSubject.value = composeBody.value = '';
  renderEmails();
});

function renderEmails(){
  emailList.innerHTML = '';
  if(state.emails.length===0){ emailList.innerHTML = '<li class="card">No messages</li>'; return; }
  for(const m of state.emails){
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `<strong>${escapeHTML(m.subject || '(no subject)')}</strong>
      <div class="muted">To: ${escapeHTML(m.to)} • ${new Date(m.receivedAt).toLocaleString()}</div>
      <div>${escapeHTML(m.body)}</div>
      <button data-id="${m.id}" class="del-email">Delete</button>`;
    emailList.appendChild(li);
  }
}
emailList.addEventListener('click', e => {
  if(e.target.classList.contains('del-email')){
    const id = Number(e.target.dataset.id);
    state.emails = state.emails.filter(x => x.id !== id);
    saveState(state);
    renderEmails();
  }
});

// Calendar operations
addEventBtn.addEventListener('click', () => {
  const title = eventTitle.value.trim();
  const date = eventDate.value;
  if(!title || !date){ alert('Provide title and date'); return; }
  const ev = {id:Date.now(), title, date};
  state.events.push(ev);
  saveState(state);
  eventTitle.value=''; eventDate.value='';
  renderEvents();
});
function renderEvents(){
  eventList.innerHTML = '';
  if(state.events.length===0){ eventList.innerHTML = '<li class="card">No events</li>'; return; }
  for(const ev of state.events){
    const li = document.createElement('li');
    li.className='card';
    li.innerHTML = `<strong>${escapeHTML(ev.title)}</strong><div>${escapeHTML(ev.date)}</div>
      <button data-id="${ev.id}" class="del-event">Delete</button>`;
    eventList.appendChild(li);
  }
}
eventList.addEventListener('click', e => {
  if(e.target.classList.contains('del-event')){
    const id = Number(e.target.dataset.id);
    state.events = state.events.filter(x => x.id !== id);
    saveState(state);
    renderEvents();
  }
});

// Contacts operations
addContactBtn.addEventListener('click', () => {
  const name = contactName.value.trim();
  const email = contactEmail.value.trim();
  if(!name || !email){ alert('Provide name and email'); return; }
  state.contacts.push({id:Date.now(), name, email});
  saveState(state);
  contactName.value=''; contactEmail.value='';
  renderContacts();
});
function renderContacts(){
  contactList.innerHTML = '';
  if(state.contacts.length===0){ contactList.innerHTML = '<li class="card">No contacts</li>'; return; }
  for(const c of state.contacts){
    const li = document.createElement('li');
    li.className='card';
    li.innerHTML = `<strong>${escapeHTML(c.name)}</strong><div>${escapeHTML(c.email)}</div>
      <button data-id="${c.id}" class="del-contact">Delete</button>`;
    contactList.appendChild(li);
  }
}
contactList.addEventListener('click', e => {
  if(e.target.classList.contains('del-contact')){
    const id = Number(e.target.dataset.id);
    state.contacts = state.contacts.filter(x => x.id !== id);
    saveState(state);
    renderContacts();
  }
});

// render all
function renderAll(){
  renderEmails(); renderEvents(); renderContacts();
}

// placeholder OAuth button behavior
qs('#gmail').addEventListener('click', () => {
  // In a real app: redirect to Google's OAuth endpoint with client_id, redirect_uri, scope...
  // Here we open a placeholder page explaining the next steps.
  window.open('https://example.com/oauth-placeholder?provider=gmail','_blank');
});
qs('#outlook').addEventListener('click', () => { window.open('https://example.com/oauth-placeholder?provider=outlook','_blank'); });
qs('#icloud').addEventListener('click', () => { window.open('https://example.com/oauth-placeholder?provider=icloud','_blank'); });

// placeholder downloads
apkLink.href = '#'; ipaLink.href = '#';

// service worker registration (for offline capability)
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service-worker.js').then(()=>console.log('SW registered')).catch(()=>console.log('SW reg failed'));
}

// utility: simple escaping
function escapeHTML(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

// initial render if user previously used app
if(localStorage.getItem('demo-mail-logged-in')) {
  // Optionally auto-show main — commented out: require explicit login
  // showMainScreen('previous-user');
    }
