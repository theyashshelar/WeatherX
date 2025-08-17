const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const daysInput = document.getElementById('daysInput');

const emptyState = document.getElementById('emptyState');
const skeleton = document.getElementById('skeleton');
const results = document.getElementById('results');

const toast = document.getElementById('toast');

const locEl = document.getElementById('loc');
const condEl = document.getElementById('cond');
const tempEl = document.getElementById('temp');
const emojiEl = document.getElementById('condEmoji');
const metaLine = document.getElementById('metaLine');
const forecastRow = document.getElementById('forecastRow');

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 2200);
}

function setView(state){ // 'empty' | 'loading' | 'ready'
  emptyState.classList.toggle('hidden', state !== 'empty');
  skeleton.classList.toggle('hidden', state !== 'loading');
  results.classList.toggle('hidden', state !== 'ready');
}

function clampDays(n){
  const v = Number(n);
  if(Number.isNaN(v)) return 3;
  return Math.min(7, Math.max(1, v));
}

const themeMap = [
  { key: /thunder|storm|lightning/i, theme: 'theme-thunder', emoji: '⛈️' },
  { key: /rain|drizzle|shower/i,     theme: 'theme-rain',    emoji: '🌧️' },
  { key: /cloud|overcast/i,          theme: 'theme-cloudy',  emoji: '☁️'  },
  { key: /mist|fog|haze/i,           theme: 'theme-mist',    emoji: '🌫️'  },
  { key: /clear/i,                   theme: 'theme-night',   emoji: '🌙'  }, // if night “Clear”
  { key: /sun|bright|hot/i,          theme: 'theme-sunny',   emoji: '☀️'  }
];

function applyTheme(conditionText){
  const body = document.body;
  let applied = 'theme-sunny', emoji = '☀️';
  for(const t of themeMap){
    if(t.key.test(conditionText)){
      applied = t.theme; emoji = t.emoji; break;
    }
  }
  // default if nothing matched
  if(!applied) { applied = 'theme-sunny'; emoji = '☀️'; }
  // remove previous theme classes
  body.className = applied;
  emojiEl.textContent = emoji;
}

function animateNumber(el, to, duration=700){
  const from = 0;
  const start = performance.now();
  function frame(now){
    const p = Math.min(1, (now - start) / duration);
    el.textContent = (from + (to - from) * p).toFixed(1).replace(/\.0$/,'');
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function fmtDate(iso){
  // 2025-08-17 -> 17 Aug 2025
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m-1), d);
  return dt.toLocaleDateString(undefined, { day:'2-digit', month:'short', year:'numeric' });
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const city = cityInput.value.trim();
  const days = clampDays(daysInput.value.trim());

  if(!city){ showToast('Please enter a city'); return; }

  setView('loading');

  try{
    const url = `http://localhost:8080/weather/forecast?city=${encodeURIComponent(city)}&days=${days}`;
    const res = await fetch(url, { headers:{ 'Accept':'application/json' } });
    if(!res.ok) throw new Error(`API Error ${res.status}`);
    const data = await res.json();

    const { weatherResponse, dayTemp } = data;

    // Theme by condition
    applyTheme(weatherResponse.condition || '');

    // Fill current card
    locEl.textContent = `${weatherResponse.city}, ${weatherResponse.country}`;
    condEl.textContent = weatherResponse.condition;
    animateNumber(tempEl, Number(weatherResponse.temperature) || 0);

    metaLine.innerHTML = `
      <span class="kicker">Region:</span> ${weatherResponse.region}
      &nbsp;•&nbsp;
      <span class="kicker">Days:</span> ${dayTemp.length}
    `;

    // Forecast cards
    forecastRow.innerHTML = '';
    dayTemp.forEach((d, i)=>{
      const card = document.createElement('div');
      card.className = 'fore-card';
      card.style.animation = `fadeIn .45s ${i*80}ms both`;
      card.innerHTML = `
        <div class="fore-date">${fmtDate(d.date)}</div>
        <div class="fore-temps">
          <div>Min: <b>${d.minTemp.toFixed ? d.minTemp.toFixed(1) : d.minTemp}</b>°C</div>
          <div>Avg: <b>${d.avgTemp.toFixed ? d.avgTemp.toFixed(1) : d.avgTemp}</b>°C</div>
          <div>Max: <b>${d.maxTemp.toFixed ? d.maxTemp.toFixed(1) : d.maxTemp}</b>°C</div>
        </div>
      `;
      forecastRow.appendChild(card);
    });

    setView('ready');
  }catch(err){
    console.error(err);
    setView('empty');
    showToast('Failed to fetch weather. Check API & inputs.');
  }
});

// Start in empty state (no default city)
setView('empty');
