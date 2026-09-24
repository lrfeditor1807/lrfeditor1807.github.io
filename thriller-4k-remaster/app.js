const TIME_ZONE = 'America/Santiago';
const START_MINUTES = 20 * 60;
const END_MINUTES = 7 * 60 + 15;

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
});

function minutesInSantiago(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

function isNightWindow(minutes) {
  return minutes >= START_MINUTES || minutes <= END_MINUTES;
}

function updateClock() {
  const now = new Date();
  const active = isNightWindow(minutesInSantiago(now));
  document.querySelector('#local-time').textContent = timeFormatter.format(now);
  document.querySelector('#local-date').textContent = dateFormatter.format(now);
  document.querySelector('#window-status').textContent = active ? 'Night window is active' : 'Night window is closed';
  document.querySelector('.status-dot').style.background = active ? 'var(--green)' : 'var(--red)';
  document.querySelector('.status-dot').style.boxShadow = `0 0 14px ${active ? 'var(--green)' : 'var(--red)'}`;
}

updateClock();
setInterval(updateClock, 1000);
