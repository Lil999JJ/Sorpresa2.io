// Main script: carga lyrics.json, muestra las líneas y sincroniza.
// Si hay timestamps (time en segundos) se usan, si no, se distribuyen equitativamente.
const audio = document.getElementById('audio');
const lyricsEl = document.getElementById('lyrics');
let lines = []; // {time, orig, es}

async function loadLyrics(){
  try{
    const resp = await fetch('lyrics.json');
    if(!resp.ok) throw new Error('No lyrics.json');
    const data = await resp.json();
    lines = data;
  }catch(e){
    // default placeholder lines (no copyright lyrics)
    lines = [
  { "time": 25.1, "orig": "Todo cambió" },
  { "time": 28, "orig": "Cuando te vi, oh, oh, oh" },
  { "time": 33, "orig": "De blanco y negro a color" },
  { "time": 36, "orig": "Me convertí" },
  { "time": 39.80, "orig": "Y fue tan fácil" },
  { "time": 42.80, "orig": "Quererte tanto" },
  { "time": 45.60, "orig": "Algo que no imaginaba" },
  { "time": 50, "orig": "Fue entregarte mi amor" },
  { "time": 53, "orig": "Con una mirada" },
  { "time": 55.90, "orig": "Oh, no, no, no, no" },
  { "time": 58.60, "orig": "Todo tembló" },
  { "time": 62, "orig": "Dentro de mí" },
  { "time": 66.80, "orig": "El universo escribió" },
  { "time": 69.2, "orig": "Que fueras para mí " },
  { "time": 73.75, "orig": "Y fue tan fácil" },
  { "time": 76, "orig": "Quererte tanto" },
  { "time": 78.50, "orig": "Algo que no imaginaba" },
  { "time": 83.50, "orig": "Fue perderme en tu amor" },
  { "time": 85.97, "orig": "Simplemente pasó" },
  { "time": 88, "orig": "Y todo tuyo ya soy" },
  { "time": 91, "orig": "Antes que pase más" },
  { "time": 93, "orig": "Tiempo contigo amor" },
  { "time": 95, "orig": "Tengo que decir que eres el amor de mi vida" },
  { "time": 99, "orig": "Antes que te ame más" },
  { "time": 101, "orig": "Escucha por favor" },
  { "time": 104, "orig": "Déjame decir que todo te di" },
  { "time": 108, "orig": "Y no hay cómo explicar" },
  { "time": 110, "orig": "Pero, menos notar" },
  { "time": 112, "orig": "Simplemente, así lo sentí" },
  { "time": 116, "orig": "Cuando te vi" },
  { "time": 122, "orig": "Me sorprendió" },
  { "time": 124, "orig": "Todo de ti" },
  { "time": 129, "orig": "De blanco y negro a color" },
  { "time": 132, "orig": "Me convertí" },
  { "time": 137, "orig": "Sé que no es fácil" },
  { "time": 139, "orig": "Decir te amo" },
  { "time": 141, "orig": "Yo tampoco lo esperaba" },
  { "time": 145.80, "orig": "Pero, así es el amor" },
  { "time": 148, "orig": "Simplemente pasó" },
  { "time": 150, "orig": "Y todo tuyo ya soy" },
  { "time": 153, "orig": "Antes que pase más" },
  { "time": 155, "orig": "Tiempo contigo amor" },
  { "time": 157, "orig": "Tengo que decir que eres el amor de mi vida" },
  { "time": 160.5, "orig": "Antes que te ame más" },
  { "time": 163.40, "orig": "Escucha por favor" },
  { "time": 166.20, "orig": "Déjame decir que todo te di" },
  { "time": 170, "orig": "Y no hay cómo explicar" },
  { "time": 172.50, "orig": "Pero, menos notar" },
  { "time": 174, "orig": "Simplemente así lo sentí" },
  { "time": 179, "orig": "Cuando te vi" },
  { "time": 184.90, "orig": "Todo cambió" },
  { "time": 189.80, "orig": "Cuando te vi" }

    ];
  }
  renderLines();
}

function renderLines(){
  lyricsEl.innerHTML = '';
  lines.forEach((ln, idx) => {
    const div = document.createElement('div');
    div.id = 'line-' + idx;
    div.className = 'line';
    div.innerHTML = `<b>${escapeHtml(ln.orig || '')}</b><i>${escapeHtml(ln.es || '')}</i>`;
    lyricsEl.appendChild(div);
  });
}

// helper to escape HTML
function escapeHtml(s){ return (s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// If lines have time==0 (or missing), once we know audio duration distribute them evenly
audio.addEventListener('loadedmetadata', () => {
  const duration = audio.duration || 1;
  // count how many lines missing time (<=0)
  const missing = lines.filter(l=>!l.time || l.time<=0).length;
  if(missing>0){
    // find indices and assign times spaced across last 90% of duration
    const start = 2; // start after 2s for intro breathing
    const end = Math.max(duration-1, start + missing*1.2);
    const span = Math.max((end - start) / missing, 0.8);
    let i = 0;
    for(let idx=0; idx<lines.length; idx++){
      if(!lines[idx].time || lines[idx].time<=0){
        lines[idx].time = start + i*span;
        i++;
      }
    }
  }
});

// Sync function: on timeupdate, highlight the latest line whose time <= currentTime
let currentActiveIndex = -1;
let currentNextIndex = -1;

audio.addEventListener('timeupdate', () => {
  const t = audio.currentTime;
  let activeIndex = -1;
  let nextIndex = -1;
  
  // Encontrar línea activa y siguiente
  for(let i=0;i<lines.length;i++){
    if(t >= lines[i].time) {
      activeIndex = i;
    } else {
      nextIndex = i;
      break;
    }
  }
  
  // Solo actualizar si cambió la línea activa o siguiente
  if(activeIndex !== currentActiveIndex || nextIndex !== currentNextIndex) {
    // Limpiar todas las clases y ocultar líneas
    document.querySelectorAll('.line').forEach((el, index) => {
      el.classList.remove('active', 'next', 'pulse', 'visible');
      
      // Mostrar solo las líneas relevantes (anterior, actual, siguiente)
      const showRange = 2; // mostrar 2 líneas antes y después
      if(activeIndex >= 0 && 
         index >= Math.max(0, activeIndex - showRange) && 
         index <= Math.min(lines.length - 1, activeIndex + showRange)) {
        el.classList.add('visible');
      }
    });
    
    // Activar línea actual
    if(activeIndex >= 0){
      const activeEl = document.getElementById('line-' + activeIndex);
      if(activeEl){
        activeEl.classList.add('active', 'visible');
        activeEl.classList.add('pulse');
        setTimeout(() => activeEl.classList.remove('pulse'), 600);
      }
    }
    
    // Mostrar próxima línea con preview
    if(nextIndex >= 0 && nextIndex < lines.length){
      const nextEl = document.getElementById('line-' + nextIndex);
      if(nextEl){
        nextEl.classList.add('next', 'visible');
      }
    }
    
    // Actualizar índices actuales
    currentActiveIndex = activeIndex;
    currentNextIndex = nextIndex;
  }
});

// Simple beat detection to add decorative pulses (Web Audio API)
let audioCtx, analyser, source, dataArray;
function initAudioAnalysis(){
  try{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    detectBeats();
  }catch(e){
    console.warn("Audio analysis not available:", e);
  }
}

let lastEnergy = 0;
function detectBeats(){
  if(!analyser) return;
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for(let i=0;i<dataArray.length;i++) sum += dataArray[i];
  const energy = sum / dataArray.length;
  // dynamic threshold
  if(energy > lastEnergy * 1.25 && energy > 30){
    // create heart / pulse effect
    makeHeartPulse();
  }
  lastEnergy = (lastEnergy*0.8) + (energy*0.2);
  requestAnimationFrame(detectBeats);
}

function makeHeartPulse(){
  const container = document.getElementById('floating-hearts');
  const effects = ['❤', '✨', '💫', '🎵', '🎶'];
  const effect = effects[Math.floor(Math.random() * effects.length)];
  
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.style.left = (10 + Math.random()*80) + '%';
  heart.style.fontSize = (16 + Math.random()*32) + 'px';
  heart.style.opacity = 0.8 + Math.random()*0.2;
  heart.innerHTML = effect;
  
  // Añadir efecto de glow aleatorio
  if(Math.random() > 0.6){
    heart.style.textShadow = '0 0 20px rgba(255,105,180,0.8)';
    heart.style.filter = 'drop-shadow(0 0 10px rgba(255,105,180,0.6))';
  }
  
  container.appendChild(heart);
  setTimeout(()=>heart.remove(), 8000);
  
  // Crear efecto de ondas en línea activa
  const activeEl = document.querySelector('.line.active');
  if(activeEl && Math.random() > 0.7){
    activeEl.style.transform = 'translateY(0) scale(1.04)';
    setTimeout(() => {
      activeEl.style.transform = 'translateY(0) scale(1.02)';
    }, 150);
  }
}

// Start after user interaction (browsers require user gesture)
document.addEventListener('click', async function onFirstClick(){
  document.removeEventListener('click', onFirstClick);
  await loadLyrics();
  initAudioAnalysis();
  createBackgroundHearts();
});

// also load lyrics early (in case user opens file directly)
loadLyrics();

// Iniciar corazones inmediatamente para prueba
setTimeout(() => {
  createBackgroundHearts();
}, 1000);

// Crear corazones de fondo con efecto neón
function createBackgroundHearts(){
  const container = document.getElementById('background-hearts');
  if(!container) {
    console.log('Contenedor de corazones no encontrado');
    return;
  }
  
  console.log('Creando corazones de fondo...');
  
  // Crear muchos corazones iniciales
  for(let i = 0; i < 15; i++){
    setTimeout(() => {
      createBackgroundHeart();
    }, i * 500);
  }
  
  // Crear nuevos corazones frecuentemente
  setInterval(createBackgroundHeart, 800);
}

function createBackgroundHeart(){
  const container = document.getElementById('background-hearts');
  if(!container) return;
  
  const heartTypes = ['❤', '💖', '💕', '💗', '💓', '💝'];
  const heart = document.createElement('div');
  heart.className = 'background-heart';
  heart.innerHTML = heartTypes[Math.floor(Math.random() * heartTypes.length)];
  
  // Posición horizontal aleatoria dentro del contenedor
  heart.style.left = (5 + Math.random() * 90) + '%';
  heart.style.bottom = '0px';
  
  // Tamaño aleatorio más variado
  const size = 20 + Math.random() * 35;
  heart.style.fontSize = size + 'px';
  
  // Duración aleatoria para más variedad
  const duration = 8 + Math.random() * 6;
  heart.style.animationDuration = `2s, ${duration}s`;
  
  console.log('Corazón creado:', heart);
  container.appendChild(heart);
  
  // Remover después de que termine la animación
  setTimeout(() => {
    if(heart.parentNode) {
      heart.remove();
    }
  }, duration * 1000 + 2000);
}
