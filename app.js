/* ==========================================================================
   1. SCALE REPOSITORY, DIATONIC POOL & TRANSPOSITION
   ========================================================================== */
const ALL_DIATONIC_PITCHES = [
  "Do2", "Re2", "Mi2", "Fa2", "Sol2", "La2", "Ti2",
  "Do3", "Re3", "Mi3", "Fa3", "Sol3", "La3", "Ti3",
  "Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Ti4",
  "Do5"
];

const BASE_FREQUENCIES = {
  "Do2": 65.406,  "Re2": 73.416,  "Mi2": 82.407,  "Fa2": 87.307,  "Sol2": 97.999,  "La2": 110.000, "Ti2": 123.471,
  "Do3": 130.813, "Re3": 146.832, "Mi3": 164.814, "Fa3": 174.614, "Sol3": 195.998, "La3": 220.000, "Ti3": 246.942,
  "Do4": 261.626, "Re4": 293.665, "Mi4": 329.628, "Fa4": 349.228, "Sol4": 391.995, "La4": 440.000, "Ti4": 493.883,
  "Do5": 523.251
};

const CHROMATIC_SCALE = [
  { id: 0,  fr: "Do",   hu: "Do", en: "C" },
  { id: 1,  fr: "Do♯",  hu: "Di", en: "C♯" },
  { id: 2,  fr: "Ré",   hu: "Re", en: "D" },
  { id: 3,  fr: "Ré♯",  hu: "Ri", en: "D♯" },
  { id: 4,  fr: "Mi",   hu: "Mi", en: "E" },
  { id: 5,  fr: "Fa",   hu: "Fa", en: "F" },
  { id: 6,  fr: "Fa♯",  hu: "Fi", en: "F♯" },
  { id: 7,  fr: "Sol",  hu: "So", en: "G" },
  { id: 8,  fr: "Sol♯", hu: "Si", en: "G♯" },
  { id: 9,  fr: "La",   hu: "La", en: "A" },
  { id: 10, fr: "La♯",  hu: "Li", en: "A♯" },
  { id: 11, fr: "Si",   hu: "Ti", en: "B" }
];

let currentRootIndex = 0; // 0 = C

let minRangeFraction = 4 / (ALL_DIATONIC_PITCHES.length - 1);  // Sol2
let maxRangeFraction = 18 / (ALL_DIATONIC_PITCHES.length - 1); // Sol4

let SCALE_PITCHES = [];
let NOTE_SLOT_CENTERS = {};

function rebuildActiveScale() {
  const totalSteps = ALL_DIATONIC_PITCHES.length - 1;
  const minIdx = Math.round(minRangeFraction * totalSteps);
  let maxIdx = Math.round(maxRangeFraction * totalSteps);

  if (maxIdx <= minIdx) {
    maxIdx = minIdx + 1;
  }
  minRangeIndex = Math.min(Math.max(minIdx, 0), totalSteps - 1);
  maxRangeIndex = Math.min(Math.max(maxIdx, minRangeIndex + 1), totalSteps);

  SCALE_PITCHES = [];
  for (let i = maxRangeIndex; i >= minRangeIndex; i--) {
    SCALE_PITCHES.push(ALL_DIATONIC_PITCHES[i]);
  }

  NOTE_SLOT_CENTERS = {};
  SCALE_PITCHES.forEach((pitch, idx) => {
    NOTE_SLOT_CENTERS[pitch] = (idx + 0.5) / SCALE_PITCHES.length;
  });

  updateRangeUI();
}

function getTransposedFrequency(noteName) {
  const baseFreq = BASE_FREQUENCIES[noteName];
  if (!baseFreq) return 261.63;
  const semitones = currentRootIndex;
  return baseFreq * Math.pow(2, semitones / 12);
}

const NOTE_TRANSLATIONS = {
  FR: { "Do": "Do", "Re": "Ré", "Mi": "Mi", "Fa": "Fa", "Sol": "Sol", "La": "La", "Ti": "Si" },
  HU: { "Do": "Do", "Re": "Re", "Mi": "Mi", "Fa": "Fa", "Sol": "So",  "La": "La", "Ti": "Ti" },
  EN: { "Do": "C",  "Re": "D",  "Mi": "E",  "Fa": "F",  "Sol": "G",   "La": "A",  "Ti": "B"  }
};

const SOUND_TRANSLATIONS = {
  FR: {
    clarinet: "Clarinette",
    flute: "Flûte",
    brass: "Cuivres",
    harp: "Harpe",
    synth_lead: "Synth Lead"
  },
  HU: {
    clarinet: "Klarinét",
    flute: "Fuvola",
    brass: "Rézfúvós",
    harp: "Hárfa",
    synth_lead: "Szinti Lead"
  },
  EN: {
    clarinet: "Clarinet",
    flute: "Flute",
    brass: "Brass",
    harp: "Harp",
    synth_lead: "Synth Lead"
  }
};

const PRESET_KEYS = ["clarinet", "flute", "brass", "harp", "synth_lead"];

const UI_TRANSLATIONS = {
  FR: {
    rangeTitle: "Tessiture",
    tutorialTitle: "Signes Kodály",
    tooltips: {
      flagFr: "Français (Do, Ré, Mi, Fa, Sol, La, Si)",
      flagHu: "Magyar / Kodály (Do, Re, Mi, Fa, So, La, Ti)",
      flagEn: "Notation alphabétique (C, D, E, F, G, A, B)",
      rangePill: "Tessiture vocale / Sélection de la gamme",
      rootPill: "Transposition / Tonalité de base (Diapason)",
      soundPill: "Timbres sonores & Volumes",
      tutorialPill: "Guide des signes Kodály / Tutorial"
    }
  },
  HU: {
    rangeTitle: "Hangterjedelem",
    tutorialTitle: "Kodály kézjelek",
    tooltips: {
      flagFr: "Francia szolfézs (Do, Ré, Mi, Fa, Sol, La, Si)",
      flagHu: "Magyar / Kodály (Do, Re, Mi, Fa, So, La, Ti)",
      flagEn: "Betűs hangnevek (C, D, E, F, G, A, B)",
      rangePill: "Hangterjedelem / Skálatartomány kiválasztása",
      rootPill: "Transzponálás / Alaphang (Hangvilla)",
      soundPill: "Hangszínek & Hangerők",
      tutorialPill: "Kodály kézjelek útmutató / Tutorial"
    }
  },
  EN: {
    rangeTitle: "Range",
    tutorialTitle: "Kodály Hand Signs",
    tooltips: {
      flagFr: "French (Fixed-Do: Do, Ré, Mi...)",
      flagHu: "Hungarian / Kodály (Do, Re, Mi, Fa, So, La, Ti)",
      flagEn: "Alphabetical notation (C, D, E, F, G, A, B)",
      rangePill: "Vocal pitch range / Scale limits",
      rootPill: "Transposition / Root key (Tuning Fork)",
      soundPill: "Sound styles & Volumes",
      tutorialPill: "Kodály Hand Signs Guide / Tutorial"
    }
  }
};

let currentLanguage = 'FR';
let activeClassifierMetric = 'rectangle';
let isDebugVisible = false;

let showDebugScales = true;
let showDebugMetric = false;
let showDebugMeshSlider = false;
let showDebugVolumes = false;

let normalMeshOpacity = 0.30;
const MAX_SLIDER_RATIO = 0.80;
let thresholdTriangle = 0.26;
let thresholdRectangle = 0.34;

function formatNoteName(rawNote) {
  if (!rawNote) return '—';
  const root = rawNote.replace(/[0-9]/g, '');
  const octave = rawNote.replace(/\D/g, '');
  const translatedRoot = (NOTE_TRANSLATIONS[currentLanguage] && NOTE_TRANSLATIONS[currentLanguage][root]) || root;
  return `${translatedRoot}${octave}`;
}

function getLocalizedRootName(idx) {
  const item = CHROMATIC_SCALE[idx];
  if (currentLanguage === 'FR') return item.fr;
  if (currentLanguage === 'HU') return item.hu;
  return item.en;
}

/* Range & Root UI Elements */
const btnRangePill = document.getElementById('btn-range-pill');
const popoverRange = document.getElementById('popover-range');
const lblRangePill = document.getElementById('lbl-range-pill');
const lblRangeCurrent = document.getElementById('lbl-range-current');
const lblRangeMinDisp = document.getElementById('lbl-range-min-disp');
const lblRangeMaxDisp = document.getElementById('lbl-range-max-disp');
const rangeHighlightBar = document.getElementById('range-highlight-bar');
const handleRangeMin = document.getElementById('handle-range-min');
const handleRangeMax = document.getElementById('handle-range-max');

const btnRootPill = document.getElementById('btn-root-pill');
const popoverRoot = document.getElementById('popover-root');
const rootDialSvg = document.getElementById('root-dial-svg');
const lblRootHub = document.getElementById('lbl-root-hub');

function renderCircularRootDial() {
  rootDialSvg.innerHTML = '';
  const rInner = 36;
  const rOuter = 104;
  const numSectors = 12;
  const anglePerSector = (2 * Math.PI) / numSectors;

  for (let i = 0; i < numSectors; i++) {
    const startAngle = i * anglePerSector - Math.PI / 2 - anglePerSector / 2;
    const endAngle = startAngle + anglePerSector;

    const x1 = rInner * Math.cos(startAngle);
    const y1 = rInner * Math.sin(startAngle);
    const x2 = rOuter * Math.cos(startAngle);
    const y2 = rOuter * Math.sin(startAngle);
    const x3 = rOuter * Math.cos(endAngle);
    const y3 = rOuter * Math.sin(endAngle);
    const x4 = rInner * Math.cos(endAngle);
    const y4 = rInner * Math.sin(endAngle);

    const d = `M ${x1} ${y1} L ${x2} ${y2} A ${rOuter} ${rOuter} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rInner} ${rInner} 0 0 0 ${x1} ${y1} Z`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", `dial-sector ${i === currentRootIndex ? 'active-root' : ''}`);
    path.setAttribute("fill", i === currentRootIndex ? "rgba(56, 189, 248, 0.45)" : (i % 2 === 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)"));
    path.setAttribute("stroke", i === currentRootIndex ? "#38bdf8" : "rgba(255, 255, 255, 0.12)");
    path.setAttribute("stroke-width", i === currentRootIndex ? "2" : "1");

    path.addEventListener('click', (e) => {
      e.stopPropagation();
      currentRootIndex = i;
      renderCircularRootDial();
      updateActiveRootAudio();
    });

    rootDialSvg.appendChild(path);

    const midAngle = (startAngle + endAngle) / 2;
    const textR = 78; // Pushed more towards the outside of the ring (rInner: 36, rOuter: 104)
    const tx = textR * Math.cos(midAngle);
    const ty = textR * Math.sin(midAngle);

    // Dynamic radial orientation:
    // Top piece (i = 0, -90°) reads from center to top (-90°).
    // Right piece (i = 3, 0°) reads left to right (0°).
    // Bottom piece (i = 6, +90°) reads bottom to center (-90°).
    // Left piece (i = 9, 180°) reads left to right (0°).
    const midAngleDeg = midAngle * (180 / Math.PI);
    const rotAngle = (i >= 6) ? (midAngleDeg - 180) : midAngleDeg;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", tx);
    text.setAttribute("y", ty);
    text.setAttribute("transform", `rotate(${rotAngle}, ${tx}, ${ty})`);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-size", i === currentRootIndex ? "16.5" : "15");
    text.setAttribute("font-family", "JetBrains Mono, monospace");
    text.setAttribute("font-weight", i === currentRootIndex ? "800" : "600");
    text.setAttribute("fill", i === currentRootIndex ? "#ffffff" : "rgba(226, 232, 240, 0.9)");
    text.setAttribute("pointer-events", "none");
    text.textContent = getLocalizedRootName(i);

    rootDialSvg.appendChild(text);
  }

  lblRootHub.textContent = getLocalizedRootName(currentRootIndex);
}

function updateActiveRootAudio() {
  ['left', 'right'].forEach(side => {
    const tracker = (side === 'left') ? leftHandTracker : rightHandTracker;
    if (tracker.stableNote) {
      synth.setNote(side, tracker.stableNote, true);
    }
  });
}

function updateRangeUI() {
  const minName = formatNoteName(ALL_DIATONIC_PITCHES[minRangeIndex]);
  const maxName = formatNoteName(ALL_DIATONIC_PITCHES[maxRangeIndex]);
  const rangeStr = `${minName} – ${maxName}`;

  if (lblRangePill) lblRangePill.textContent = rangeStr;
  if (lblRangeCurrent) lblRangeCurrent.textContent = rangeStr;
  if (lblRangeMinDisp) lblRangeMinDisp.textContent = minName;
  if (lblRangeMaxDisp) lblRangeMaxDisp.textContent = maxName;

  const lblRangeTitle = document.getElementById('lbl-range-title');
  if (lblRangeTitle && typeof UI_TRANSLATIONS !== 'undefined') {
    const u = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.FR;
    lblRangeTitle.textContent = u.rangeTitle;
  }

  const minPct = minRangeFraction * 100;
  const maxPct = maxRangeFraction * 100;

  if (handleRangeMin) handleRangeMin.style.left = `${minPct}%`;
  if (handleRangeMax) handleRangeMax.style.left = `${maxPct}%`;
  if (rangeHighlightBar) {
    rangeHighlightBar.style.left = `${minPct}%`;
    rangeHighlightBar.style.width = `${maxPct - minPct}%`;
  }
}

const btnSoundPill = document.getElementById('btn-sound-pill');
const popoverSound = document.getElementById('popover-sound');

const btnTutorialPill = document.getElementById('btn-tutorial-pill');
const popoverTutorial = document.getElementById('popover-tutorial');
const tutorialSignsList = document.getElementById('tutorial-signs-list');
const lblTutorialTitle = document.getElementById('lbl-tutorial-title');
const btnToggleHistory = document.getElementById('btn-toggle-history');
const lblBtnHistory = document.getElementById('lbl-btn-history');
const tutorialViewSigns = document.getElementById('tutorial-view-signs');
const tutorialViewHistory = document.getElementById('tutorial-view-history');
const tutorialHistoryContent = document.getElementById('tutorial-history-content');

let isHistoryOpen = false;

const TUTORIAL_SIGNS = [
  { key: 'Do',  img: 'images/signs/do.png' },
  { key: 'Re',  img: 'images/signs/re.png' },
  { key: 'Mi',  img: 'images/signs/mi.png' },
  { key: 'Fa',  img: 'images/signs/fa.png' },
  { key: 'Sol', img: 'images/signs/sol.png' },
  { key: 'La',  img: 'images/signs/la.png' },
  { key: 'Ti',  img: 'images/signs/si.png' }
];

const TUTORIAL_HISTORY = {
  FR: {
    btnHistory: "Histoire",
    btnSigns: "Signes",
    titleSigns: "Signes Kodály",
    titleHistory: "Histoire des signes",
    whatIsItTitle: "À quoi ça sert ?",
    whatIsIt: "Ces gestes de la main donnent une forme physique, spatiale et visuelle concrète à chaque degré de la gamme. Ils ancrent la mémoire auditive et kinesthésique, facilitent la justesse du chant et permettent d'internaliser les hauteurs de notes relatives sans partition.",
    whoWhenTitle: "Qui l'a inventé et quand ?",
    whoWhen: "Les signes ont d'abord été créés vers 1870 par John Curwen en Angleterre pour sa méthode Tonic Sol-fa. Au milieu du XXe siècle (vers 1940-1950), le compositeur et pédagogue hongrois Zoltán Kodály les a intégrés et popularisés à travers le monde dans sa méthode d'éducation musicale.",
    hungaryNoteTitle: "Le hongrois",
    hungaryNote: "Pour honorer l'origine du créateur de la méthode Kodály, l'application est disponible dans sa langue."
  },
  HU: {
    btnHistory: "Történet",
    btnSigns: "Kézjelek",
    titleSigns: "Kodály kézjelek",
    titleHistory: "A kézjelek története",
    whatIsItTitle: "Mire szolgál?",
    whatIsIt: "A kézjelek kézzelfogható fizikai, térbeli és vizuális formát adnak a skála minden egyes fokának. Erősítik az auditív és kinesztetikus memóriát, segítik a tiszta intonációt és kottamentes módon fejlesztik a relatív hallást.",
    whoWhenTitle: "Ki találta fel és mikor?",
    whoWhen: "A kézjeleket eredetileg John Curwen angol pedagógus dolgozta ki 1870 körül a Tonic Sol-fa módszerhez. Később, a 20. század közepén (az 1940-es és 1950-es években), a magyar zeneszerző és pedagógus, Kodály Zoltán emelte be zenei nevelési koncepciójába.",
    hungaryNoteTitle: "A magyar nyelv",
    hungaryNote: "A Kodály-módszer megalkotója előtt tisztelegve az alkalmazás az ő anyanyelvén is elérhető."
  },
  EN: {
    btnHistory: "History",
    btnSigns: "Signs",
    titleSigns: "Kodály Hand Signs",
    titleHistory: "History of the signs",
    whatIsItTitle: "What is it useful for?",
    whatIsIt: "These hand gestures give each degree of the diatonic scale a distinct physical, spatial, and visual shape. By engaging muscle memory and visual association, they dramatically improve pitch accuracy, sight-singing, and inner hearing without needing sheet music.",
    whoWhenTitle: "Who invented it and when?",
    whoWhen: "The hand signs were originally developed around 1870 by English educator John Curwen for his Tonic Sol-fa method. Later in the mid-20th century (c. 1940s–1950s), Hungarian composer and pedagogue Zoltán Kodály adapted and championed them worldwide as a core element of the Kodály method.",
    hungaryNoteTitle: "Hungarian",
    hungaryNote: "To honor the origin of the creator of the Kodály method, the application is available in his native language."
  }
};

function renderTutorialSigns() {
  if (!tutorialSignsList) return;
  tutorialSignsList.innerHTML = '';

  const h = TUTORIAL_HISTORY[currentLanguage] || TUTORIAL_HISTORY.EN;

  if (lblTutorialTitle) {
    lblTutorialTitle.textContent = isHistoryOpen ? h.titleHistory : h.titleSigns;
  }
  if (lblBtnHistory) {
    lblBtnHistory.textContent = isHistoryOpen ? h.btnSigns : h.btnHistory;
  }

  // Render Signs in 2 adjacent columns (1 & 2 on row 1, 3 & 4 on row 2, etc.)
  // Transparent, non-button presentation without grey card background or borders
  TUTORIAL_SIGNS.forEach(sign => {
    const noteName = (NOTE_TRANSLATIONS[currentLanguage] && NOTE_TRANSLATIONS[currentLanguage][sign.key]) || sign.key;

    const cell = document.createElement('div');
    cell.className = 'flex items-center gap-3 bg-transparent select-none p-1';

    // Generous hand sign image container without grey backing
    const imgContainer = document.createElement('div');
    imgContainer.className = 'w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center';

    const img = document.createElement('img');
    img.src = sign.img;
    img.alt = noteName;
    img.className = 'w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]';

    imgContainer.appendChild(img);

    // Note name directly to the right
    const nameSpan = document.createElement('span');
    nameSpan.className = 'font-mono-note text-xl sm:text-2xl font-bold text-sky-300 tracking-wide';
    nameSpan.textContent = noteName;

    cell.appendChild(imgContainer);
    cell.appendChild(nameSpan);
    tutorialSignsList.appendChild(cell);
  });

  // Slot 8 (plugs the hole in the 4x2 grid): Credits & GPL-3.0 License
  const creditsCell = document.createElement('div');
  creditsCell.className = 'flex flex-col justify-center gap-0.5 select-none p-1 border-l border-white/10 pl-3';

  creditsCell.innerHTML = `
    <span class="text-[11px] font-semibold text-slate-200 tracking-wide">Hatep with Gemini</span>
    <span class="text-[9px] text-slate-400 font-mono-note leading-tight">
      © 2026 · <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline">GNU GPLv3</a> (Free to share & change with source)
    </span>
  `;

  tutorialSignsList.appendChild(creditsCell);

  renderTutorialHistory();
}

function renderTutorialHistory() {
  if (!tutorialHistoryContent) return;
  tutorialHistoryContent.innerHTML = '';

  const data = TUTORIAL_HISTORY[currentLanguage] || TUTORIAL_HISTORY.EN;

  const card = document.createElement('div');
  card.className = 'p-3.5 rounded-xl bg-sky-950/25 border border-sky-500/30 flex flex-col gap-3 shadow-lg';

  card.innerHTML = `
    <div class="flex flex-col gap-1">
      <div class="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
        <span>🎯</span>
        <span>${data.whatIsItTitle}</span>
      </div>
      <div class="text-[11px] leading-relaxed text-slate-200">${data.whatIsIt}</div>
    </div>

    <div class="flex flex-col gap-1 pt-1.5 border-t border-white/10">
      <div class="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
        <span>⏳</span>
        <span>${data.whoWhenTitle}</span>
      </div>
      <div class="text-[11px] leading-relaxed text-slate-200">${data.whoWhen}</div>
    </div>

    <div class="flex flex-col gap-1 pt-1.5 border-t border-white/10">
      <div class="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
        <span>🇭🇺</span>
        <span>${data.hungaryNoteTitle}</span>
      </div>
      <div class="text-[11px] leading-relaxed text-slate-200">${data.hungaryNote}</div>
    </div>
  `;

  tutorialHistoryContent.appendChild(card);
}

function updateHistoryToggleState() {
  const h = TUTORIAL_HISTORY[currentLanguage] || TUTORIAL_HISTORY.EN;

  if (isHistoryOpen) {
    tutorialViewSigns.classList.add('hidden');
    tutorialViewHistory.classList.remove('hidden');
    btnToggleHistory.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border border-amber-400/50 bg-amber-500/25 text-amber-300 hover:bg-amber-500/35 cursor-pointer flex items-center gap-1.5 shadow-sm';
    if (lblBtnHistory) lblBtnHistory.textContent = h.btnSigns;
    if (lblTutorialTitle) lblTutorialTitle.textContent = h.titleHistory;
  } else {
    tutorialViewSigns.classList.remove('hidden');
    tutorialViewHistory.classList.add('hidden');
    btnToggleHistory.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border border-white/15 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer flex items-center gap-1.5 shadow-sm';
    if (lblBtnHistory) lblBtnHistory.textContent = h.btnHistory;
    if (lblTutorialTitle) lblTutorialTitle.textContent = h.titleSigns;
  }
}

if (btnToggleHistory) {
  btnToggleHistory.addEventListener('click', (e) => {
    e.stopPropagation();
    isHistoryOpen = !isHistoryOpen;
    updateHistoryToggleState();
  });
}

btnRangePill.addEventListener('click', (e) => {
  e.stopPropagation();
  popoverRange.classList.toggle('hidden');
  popoverRoot.classList.add('hidden');
  if (popoverSound) popoverSound.classList.add('hidden');
  if (popoverTutorial) popoverTutorial.classList.add('hidden');
});

btnRootPill.addEventListener('click', (e) => {
  e.stopPropagation();
  popoverRoot.classList.toggle('hidden');
  popoverRange.classList.add('hidden');
  if (popoverSound) popoverSound.classList.add('hidden');
  if (popoverTutorial) popoverTutorial.classList.add('hidden');
});

if (btnSoundPill && popoverSound) {
  btnSoundPill.addEventListener('click', (e) => {
    e.stopPropagation();
    popoverSound.classList.toggle('hidden');
    popoverRange.classList.add('hidden');
    popoverRoot.classList.add('hidden');
    if (popoverTutorial) popoverTutorial.classList.add('hidden');
  });
}

if (btnTutorialPill && popoverTutorial) {
  btnTutorialPill.addEventListener('click', (e) => {
    e.stopPropagation();
    popoverTutorial.classList.toggle('hidden');
    popoverRange.classList.add('hidden');
    popoverRoot.classList.add('hidden');
    if (popoverSound) popoverSound.classList.add('hidden');
  });
}

document.addEventListener('click', (e) => {
  if (!popoverRange.contains(e.target) && e.target !== btnRangePill) {
    popoverRange.classList.add('hidden');
  }
  if (!popoverRoot.contains(e.target) && !btnRootPill.contains(e.target)) {
    popoverRoot.classList.add('hidden');
  }
  if (popoverSound && !popoverSound.contains(e.target) && !btnSoundPill.contains(e.target)) {
    popoverSound.classList.add('hidden');
  }
  if (popoverTutorial && !popoverTutorial.contains(e.target) && !btnTutorialPill.contains(e.target)) {
    popoverTutorial.classList.add('hidden');
  }
});

function setupDualRangeSlider() {
  const track = document.getElementById('range-track-bg');
  let activeThumb = null;
  const minGapFraction = 0.08; // ensure min and max don't overlap completely

  function updateThumbPos(e) {
    if (!activeThumb) return;
    const rect = track.getBoundingClientRect();
    const fraction = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);

    if (activeThumb === handleRangeMin) {
      minRangeFraction = Math.min(fraction, maxRangeFraction - minGapFraction);
    } else if (activeThumb === handleRangeMax) {
      maxRangeFraction = Math.max(fraction, minRangeFraction + minGapFraction);
    }
    rebuildActiveScale();
  }

  handleRangeMin.addEventListener('pointerdown', (e) => {
    activeThumb = handleRangeMin;
    handleRangeMin.setPointerCapture(e.pointerId);
  });
  handleRangeMax.addEventListener('pointerdown', (e) => {
    activeThumb = handleRangeMax;
    handleRangeMax.setPointerCapture(e.pointerId);
  });

  window.addEventListener('pointermove', (e) => {
    if (activeThumb) updateThumbPos(e);
  });
  window.addEventListener('pointerup', () => {
    activeThumb = null;
  });
}

setupDualRangeSlider();
renderCircularRootDial();
rebuildActiveScale();

const flagFr = document.getElementById('flag-fr');
const flagHu = document.getElementById('flag-hu');
const flagEn = document.getElementById('flag-en');

function updateAllTooltips() {
  const t = UI_TRANSLATIONS[currentLanguage] ? UI_TRANSLATIONS[currentLanguage].tooltips : UI_TRANSLATIONS.FR.tooltips;
  if (flagFr) flagFr.title = t.flagFr;
  if (flagHu) flagHu.title = t.flagHu;
  if (flagEn) flagEn.title = t.flagEn;
  if (btnRangePill) btnRangePill.title = t.rangePill;
  if (btnRootPill) btnRootPill.title = t.rootPill;
  if (btnSoundPill) btnSoundPill.title = t.soundPill;
  if (btnTutorialPill) btnTutorialPill.title = t.tutorialPill;
}

function updateSoundPopoverTranslations() {
  const trans = SOUND_TRANSLATIONS[currentLanguage] || SOUND_TRANSLATIONS.EN;

  document.querySelectorAll('.sound-box-btn').forEach(btn => {
    const preset = btn.dataset.preset;
    if (preset && trans[preset]) {
      btn.title = trans[preset];
    }
  });
}

function initSoundButtons() {
  document.querySelectorAll('.sound-box-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const side = btn.dataset.side;
      const preset = btn.dataset.preset;
      if (!side || !preset) return;

      synth.setPreset(side, preset);

      document.querySelectorAll(`.sound-box-btn[data-side="${side}"]`).forEach(b => {
        if (side === 'left') {
          b.className = (b === btn)
            ? 'sound-box-btn w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all cursor-pointer bg-sky-500/30 border-sky-400 text-white shadow-[0_0_10px_rgba(56,189,248,0.5)] ring-1 ring-sky-400'
            : 'sound-box-btn w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all cursor-pointer bg-black/40 border-white/10 hover:bg-white/10 text-slate-300';
        } else {
          b.className = (b === btn)
            ? 'sound-box-btn w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all cursor-pointer bg-rose-500/30 border-rose-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)] ring-1 ring-rose-400'
            : 'sound-box-btn w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all cursor-pointer bg-black/40 border-white/10 hover:bg-white/10 text-slate-300';
        }
      });
    });
  });
}

function updateFlagUI(selected) {
  currentLanguage = selected;
  [
    { btn: flagFr, id: 'FR' },
    { btn: flagHu, id: 'HU' },
    { btn: flagEn, id: 'EN' }
  ].forEach(({ btn, id }) => {
    if (id === selected) {
      btn.classList.add('opacity-100', 'ring-2', 'ring-sky-400/90');
      btn.classList.remove('opacity-30');
    } else {
      btn.classList.remove('opacity-100', 'ring-2', 'ring-sky-400/90');
      btn.classList.add('opacity-30');
    }
  });
  updateAllTooltips();
  renderCircularRootDial();
  updateRangeUI();
  updateSoundPopoverTranslations();
  renderTutorialSigns();
}

updateAllTooltips();
updateSoundPopoverTranslations();
initSoundButtons();
renderTutorialSigns();

flagFr.addEventListener('click', () => updateFlagUI('FR'));
flagHu.addEventListener('click', () => updateFlagUI('HU'));
flagEn.addEventListener('click', () => updateFlagUI('EN'));

const btnMetricTriangle = document.getElementById('btn-metric-triangle');
const btnMetricRectangle = document.getElementById('btn-metric-rectangle');

btnMetricTriangle.addEventListener('click', () => {
  activeClassifierMetric = 'triangle';
  btnMetricTriangle.className = 'px-2.5 py-1 rounded bg-sky-500 text-white font-semibold shadow transition-all';
  btnMetricRectangle.className = 'px-2.5 py-1 rounded text-slate-400 hover:text-white transition-all';
});

btnMetricRectangle.addEventListener('click', () => {
  activeClassifierMetric = 'rectangle';
  btnMetricRectangle.className = 'px-2.5 py-1 rounded bg-emerald-500 text-white font-semibold shadow transition-all';
  btnMetricTriangle.className = 'px-2.5 py-1 rounded text-slate-400 hover:text-white transition-all';
});

const dbgToggleScales = document.getElementById('dbg-toggle-scales');
const dbgToggleMetric = document.getElementById('dbg-toggle-metric');
const dbgToggleMeshSlider = document.getElementById('dbg-toggle-mesh-slider');
const dbgToggleVolumes = document.getElementById('dbg-toggle-volumes');

const debugMetricPanel = document.getElementById('debug-metric-panel');
const debugMeshPanel = document.getElementById('debug-mesh-panel');
const debugVolumesPanel = document.getElementById('debug-volumes-panel');

const inputMeshOpacity = document.getElementById('input-mesh-opacity');
const lblMeshOpacity = document.getElementById('lbl-mesh-opacity');

const inputVolLeft = document.getElementById('input-vol-left');
const lblVolLeft = document.getElementById('lbl-vol-left');
const inputVolRight = document.getElementById('input-vol-right');
const lblVolRight = document.getElementById('lbl-vol-right');
const inputStereoPan = document.getElementById('input-stereo-pan');
const lblStereoPan = document.getElementById('lbl-stereo-pan');

/* Sound Popover Elements */
const inputSoundVolLeft = document.getElementById('input-sound-vol-left');
const lblSoundVolLeft = document.getElementById('lbl-sound-vol-left');
const inputSoundVolRight = document.getElementById('input-sound-vol-right');
const lblSoundVolRight = document.getElementById('lbl-sound-vol-right');

function syncVolLeft(val) {
  const pct = `${Math.round(val * 100)}%`;
  if (lblVolLeft) lblVolLeft.textContent = pct;
  if (inputVolLeft) inputVolLeft.value = val;
  if (lblSoundVolLeft) lblSoundVolLeft.textContent = pct;
  if (inputSoundVolLeft) inputSoundVolLeft.value = val;
  synth.setVolume('left', val);
}

function syncVolRight(val) {
  const pct = `${Math.round(val * 100)}%`;
  if (lblVolRight) lblVolRight.textContent = pct;
  if (inputVolRight) inputVolRight.value = val;
  if (lblSoundVolRight) lblSoundVolRight.textContent = pct;
  if (inputSoundVolRight) inputSoundVolRight.value = val;
  synth.setVolume('right', val);
}

function syncStereoPan(val) {
  const pct = `${Math.round(val * 100)}%`;
  if (lblStereoPan) lblStereoPan.textContent = pct;
  if (inputStereoPan) inputStereoPan.value = val;
  synth.setStereoPanning(val);
}

if (inputVolLeft) inputVolLeft.addEventListener('input', (e) => syncVolLeft(parseFloat(e.target.value)));
if (inputSoundVolLeft) inputSoundVolLeft.addEventListener('input', (e) => syncVolLeft(parseFloat(e.target.value)));

if (inputVolRight) inputVolRight.addEventListener('input', (e) => syncVolRight(parseFloat(e.target.value)));
if (inputSoundVolRight) inputSoundVolRight.addEventListener('input', (e) => syncVolRight(parseFloat(e.target.value)));

if (inputStereoPan) inputStereoPan.addEventListener('input', (e) => syncStereoPan(parseFloat(e.target.value)));

dbgToggleVolumes.addEventListener('click', () => {
  showDebugVolumes = !showDebugVolumes;
  debugVolumesPanel.classList.toggle('hidden', !showDebugVolumes);
  if (showDebugVolumes) {
    dbgToggleVolumes.className = 'px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all font-semibold';
  } else {
    dbgToggleVolumes.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition-all font-semibold';
  }
});

dbgToggleScales.addEventListener('click', () => {
  showDebugScales = !showDebugScales;
  dbgToggleScales.textContent = `Scales: ${showDebugScales ? 'ON' : 'OFF'}`;
  if (showDebugScales) {
    dbgToggleScales.className = 'px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all font-semibold';
  } else {
    dbgToggleScales.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-white/10 hover:bg-slate-700 transition-all font-semibold';
  }
});

dbgToggleMetric.addEventListener('click', () => {
  showDebugMetric = !showDebugMetric;
  dbgToggleMetric.textContent = `Sol/Mi Metric: ${showDebugMetric ? 'ON' : 'OFF'}`;
  debugMetricPanel.classList.toggle('hidden', !showDebugMetric);
  if (showDebugMetric) {
    dbgToggleMetric.className = 'px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all font-semibold';
  } else {
    dbgToggleMetric.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-white/10 hover:bg-slate-700 transition-all font-semibold';
  }
});

dbgToggleMeshSlider.addEventListener('click', () => {
  showDebugMeshSlider = !showDebugMeshSlider;
  debugMeshPanel.classList.toggle('hidden', !showDebugMeshSlider);
  if (showDebugMeshSlider) {
    dbgToggleMeshSlider.className = 'px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all font-semibold';
  } else {
    dbgToggleMeshSlider.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition-all font-semibold';
  }
});

inputMeshOpacity.addEventListener('input', (e) => {
  normalMeshOpacity = parseFloat(e.target.value);
  lblMeshOpacity.textContent = `${Math.round(normalMeshOpacity * 100)}%`;
});

function updateThresholdPositions() {
  const trianglePct = Math.min(Math.max((thresholdTriangle / MAX_SLIDER_RATIO) * 100, 0), 100);
  const rectanglePct = Math.min(Math.max((thresholdRectangle / MAX_SLIDER_RATIO) * 100, 0), 100);

  document.querySelectorAll('.threshold-marker-triangle').forEach(el => {
    el.style.left = `${trianglePct}%`;
  });
  document.querySelectorAll('.lbl-triangle-thresh').forEach(el => {
    el.textContent = thresholdTriangle.toFixed(2);
  });

  document.querySelectorAll('.threshold-marker-rectangle').forEach(el => {
    el.style.left = `${rectanglePct}%`;
  });
  document.querySelectorAll('.lbl-rectangle-thresh').forEach(el => {
    el.textContent = thresholdRectangle.toFixed(2);
  });
}

function initInteractiveSliders() {
  let isDragging = null;

  function updateValueFromPointer(track, clientX) {
    const rect = track.getBoundingClientRect();
    const fraction = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const newThresh = Math.round(fraction * MAX_SLIDER_RATIO * 100) / 100;
    
    if (track.dataset.metric === 'triangle') {
      thresholdTriangle = newThresh;
    } else {
      thresholdRectangle = newThresh;
    }
    updateThresholdPositions();
  }

  document.querySelectorAll('.slider-track-triangle, .slider-track-rectangle').forEach(track => {
    track.addEventListener('pointerdown', (e) => {
      isDragging = track;
      track.setPointerCapture(e.pointerId);
      updateValueFromPointer(track, e.clientX);
    });

    track.addEventListener('pointermove', (e) => {
      if (isDragging === track) {
        updateValueFromPointer(track, e.clientX);
      }
    });

    track.addEventListener('pointerup', (e) => {
      if (isDragging === track) {
        track.releasePointerCapture(e.pointerId);
        isDragging = null;
      }
    });

    track.addEventListener('pointercancel', () => {
      isDragging = null;
    });
  });

  updateThresholdPositions();
}

initInteractiveSliders();

window.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') {
    isDebugVisible = !isDebugVisible;
    document.getElementById('debug-panel').classList.toggle('hidden', !isDebugVisible);
    if (isDebugVisible) {
      showDebugScales = true;
      dbgToggleScales.textContent = 'Scales: ON';
      dbgToggleScales.className = 'px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all font-semibold';

      showDebugMetric = false;
      dbgToggleMetric.textContent = 'Sol/Mi Metric: OFF';
      dbgToggleMetric.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-white/10 hover:bg-slate-700 transition-all font-semibold';
      debugMetricPanel.classList.add('hidden');

      showDebugMeshSlider = false;
      dbgToggleMeshSlider.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition-all font-semibold';
      debugMeshPanel.classList.add('hidden');

      showDebugVolumes = false;
      dbgToggleVolumes.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition-all font-semibold';
      debugVolumesPanel.classList.add('hidden');
    }
  }
});

/* ==========================================================================
   2. DYNAMIC FULL-HEIGHT OCTAVE RESOLVER
   ========================================================================== */
function resolveProximityNote(sign, landmarks) {
  if (!sign || !landmarks || landmarks.length === 0 || SCALE_PITCHES.length === 0) return null;

  let sumY = 0;
  for (let i = 0; i < landmarks.length; i++) {
    sumY += landmarks[i].y;
  }
  const handY = sumY / landmarks.length;

  const candidatePitches = SCALE_PITCHES.filter(pitch => pitch.startsWith(sign));
  if (candidatePitches.length === 0) return null;

  let closestPitch = candidatePitches[0];
  let minDistance = Math.abs(handY - NOTE_SLOT_CENTERS[closestPitch]);

  for (let i = 1; i < candidatePitches.length; i++) {
    const candidate = candidatePitches[i];
    const dist = Math.abs(handY - NOTE_SLOT_CENTERS[candidate]);
    if (dist < minDistance) {
      minDistance = dist;
      closestPitch = candidate;
    }
  }

  return closestPitch;
}

/* ==========================================================================
   3. AUDIO SYNTHESIS ENGINE
   ========================================================================== */
const SOUND_PRESETS = {
  clarinet: {
    type1: "square",
    type2: "sine",
    filterType: "lowpass",
    filterFreq: 1500,
    filterQ: 1.8,
    detune1: 0,
    detune2: 12,
    mix1: 0.35,
    mix2: 0.55,
    gainMult: 0.34,
    isRaspy: false
  },
  flute: {
    type1: "sine",
    type2: "sine",
    filterType: "lowpass",
    filterFreq: 1800,
    filterQ: 0.9,
    detune1: 0,
    detune2: 3,
    mix1: 0.85,
    mix2: 0.15,
    gainMult: 0.38,
    isRaspy: false
  },
  brass: {
    type1: "sawtooth",
    type2: "sawtooth",
    filterType: "lowpass",
    filterFreq: 1750,
    filterQ: 2.2,
    detune1: -5,
    detune2: 5,
    mix1: 0.45,
    mix2: 0.40,
    gainMult: 0.32,
    isRaspy: true
  },
  harp: {
    type1: "triangle",
    type2: "sine",
    filterType: "lowpass",
    filterFreq: 2400,
    filterQ: 0.8,
    detune1: 0,
    detune2: 1200,
    mix1: 0.65,
    mix2: 0.25,
    gainMult: 0.38,
    isRaspy: false
  },
  synth_lead: {
    type1: "sawtooth",
    type2: "square",
    filterType: "lowpass",
    filterFreq: 2800,
    filterQ: 2.6,
    detune1: -4,
    detune2: 4,
    mix1: 0.50,
    mix2: 0.40,
    gainMult: 0.30,
    isRaspy: false
  }
};

class HarmoniousDualSynth {
  constructor() {
    this.ctx = null;
    this.voices = { left: null, right: null };
    this.masterGain = null;
    this.volLeft = 0.75;
    this.volRight = 0.75;
    this.stereoPanRatio = 0.20;
    this.presetLeft = 'clarinet';
    this.presetRight = 'harp';
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    const rightFilter = this.ctx.createBiquadFilter();
    const rightPan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (rightPan) {
      rightPan.pan.setValueAtTime(this.stereoPanRatio, this.ctx.currentTime);
      rightFilter.connect(rightPan);
      rightPan.connect(this.masterGain);
    } else {
      rightFilter.connect(this.masterGain);
    }
    this.voices.right = this.createVoice(rightFilter, this.presetRight, rightPan);

    const leftFilter = this.ctx.createBiquadFilter();
    const leftPan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (leftPan) {
      leftPan.pan.setValueAtTime(-this.stereoPanRatio, this.ctx.currentTime);
      leftFilter.connect(leftPan);
      leftPan.connect(this.masterGain);
    } else {
      leftFilter.connect(this.masterGain);
    }
    this.voices.left = this.createVoice(leftFilter, this.presetLeft, leftPan);
  }

  createVoice(destFilter, presetKey, pannerNode) {
    const preset = SOUND_PRESETS[presetKey] || SOUND_PRESETS.warm;

    destFilter.type = preset.filterType;
    destFilter.frequency.setValueAtTime(preset.filterFreq, this.ctx.currentTime);
    destFilter.Q.setValueAtTime(preset.filterQ, this.ctx.currentTime);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = preset.type1;
    osc2.type = preset.type2;

    osc1.detune.setValueAtTime(preset.detune1, this.ctx.currentTime);
    osc2.detune.setValueAtTime(preset.detune2, this.ctx.currentTime);

    const mix1 = this.ctx.createGain();
    const mix2 = this.ctx.createGain();
    mix1.gain.setValueAtTime(preset.mix1, this.ctx.currentTime);
    mix2.gain.setValueAtTime(preset.mix2, this.ctx.currentTime);

    osc1.connect(mix1);
    osc2.connect(mix2);
    mix1.connect(gainNode);
    mix2.connect(gainNode);

    gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gainNode.connect(destFilter);

    osc1.start();
    osc2.start();

    return {
      osc1,
      osc2,
      mix1,
      mix2,
      filter: destFilter,
      gain: gainNode,
      isPlaying: false,
      currentNote: null,
      isRaspy: preset.isRaspy,
      gainMult: preset.gainMult,
      presetKey: presetKey,
      panner: pannerNode
    };
  }

  setPreset(side, presetKey) {
    if (side === 'left') this.presetLeft = presetKey;
    if (side === 'right') this.presetRight = presetKey;

    const preset = SOUND_PRESETS[presetKey];
    if (!preset) return;

    const voice = this.voices[side];
    if (!voice || !this.ctx) return;

    const now = this.ctx.currentTime;
    voice.presetKey = presetKey;
    voice.isRaspy = preset.isRaspy;
    voice.gainMult = preset.gainMult;

    voice.filter.type = preset.filterType;
    voice.filter.frequency.setTargetAtTime(preset.filterFreq, now, 0.04);
    voice.filter.Q.setTargetAtTime(preset.filterQ, now, 0.04);

    voice.osc1.type = preset.type1;
    voice.osc2.type = preset.type2;
    voice.osc1.detune.setTargetAtTime(preset.detune1, now, 0.04);
    voice.osc2.detune.setTargetAtTime(preset.detune2, now, 0.04);

    voice.mix1.gain.setTargetAtTime(preset.mix1, now, 0.04);
    voice.mix2.gain.setTargetAtTime(preset.mix2, now, 0.04);

    if (voice.isPlaying && voice.currentNote) {
      const targetGain = (side === 'left') ? (this.volLeft * voice.gainMult) : (this.volRight * voice.gainMult);
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(targetGain, now, 0.03);

      const freq = getTransposedFrequency(voice.currentNote);
      if (freq) {
        voice.osc2.frequency.setTargetAtTime(voice.isRaspy ? freq : freq * 1.002, now, 0.028);
      }
    }
  }

  setVolume(side, val) {
    if (side === 'left') this.volLeft = val;
    if (side === 'right') this.volRight = val;

    const voice = this.voices[side];
    if (voice && voice.isPlaying && this.ctx) {
      const now = this.ctx.currentTime;
      const targetGain = (side === 'left') ? (this.volLeft * (voice.gainMult || 0.32)) : (this.volRight * (voice.gainMult || 0.35));
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(targetGain, now, 0.03);
    }
  }

  setStereoPanning(separationRatio) {
    this.stereoPanRatio = separationRatio;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.voices.left && this.voices.left.panner) {
      this.voices.left.panner.pan.setTargetAtTime(-separationRatio, now, 0.03);
    }
    if (this.voices.right && this.voices.right.panner) {
      this.voices.right.panner.pan.setTargetAtTime(separationRatio, now, 0.03);
    }
  }

  setNote(side, noteName, forceGlissando = false) {
    if (!this.ctx) return;
    const voice = this.voices[side];
    if (!voice) return;

    const freq = getTransposedFrequency(noteName);
    if (!freq) return;

    const now = this.ctx.currentTime;
    const targetGain = (side === 'left') ? (this.volLeft * (voice.gainMult || 0.32)) : (this.volRight * (voice.gainMult || 0.35));

    if (!voice.isPlaying || voice.currentNote !== noteName || forceGlissando) {
      voice.osc1.frequency.cancelScheduledValues(now);
      voice.osc2.frequency.cancelScheduledValues(now);

      voice.osc1.frequency.setTargetAtTime(freq, now, 0.028);
      voice.osc2.frequency.setTargetAtTime(voice.isRaspy ? freq : freq * 1.002, now, 0.028);

      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(targetGain, now, 0.035);

      voice.isPlaying = true;
      voice.currentNote = noteName;
    }
  }

  releaseVoice(side) {
    if (!this.ctx) return;
    const voice = this.voices[side];
    if (!voice || !voice.isPlaying) return;

    const now = this.ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0.0001, now, 0.05);
    voice.isPlaying = false;
    voice.currentNote = null;
  }
}

const synth = new HarmoniousDualSynth();

/* ==========================================================================
   4. GESTURE RECOGNITION
   ========================================================================== */
function classifyKodalyGesture(landmarks) {
  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5], indexPip = landmarks[6], indexDip = landmarks[7], indexTip = landmarks[8];
  const middleMcp = landmarks[9], middlePip = landmarks[10], middleDip = landmarks[11], middleTip = landmarks[12];
  const ringMcp = landmarks[13], ringPip = landmarks[14], ringDip = landmarks[15], ringTip = landmarks[16];
  const pinkyMcp = landmarks[17], pinkyPip = landmarks[18], pinkyDip = landmarks[19], pinkyTip = landmarks[20];

  const isExt = (tip, pip, mcp) => dist(tip, wrist) > dist(pip, wrist) * 1.15 && dist(tip, mcp) > dist(pip, mcp);
  const indexExt = isExt(indexTip, indexPip, indexMcp);
  const middleExt = isExt(middleTip, middlePip, middleMcp);
  const ringExt = isExt(ringTip, ringPip, ringMcp);
  const pinkyExt = isExt(pinkyTip, pinkyPip, pinkyMcp);

  const isCurledOrFolded = (tip, dip, pip, mcp) => {
    const fullCurl = dist(tip, wrist) <= dist(pip, wrist) * 1.05;
    const foldedTable = dist(tip, mcp) < dist(pip, mcp) * 0.95 || dist(tip, wrist) < dist(pip, wrist);
    return fullCurl || foldedTable;
  };

  const indexCurled = isCurledOrFolded(indexTip, indexDip, indexPip, indexMcp);
  const middleCurled = isCurledOrFolded(middleTip, middleDip, middlePip, middleMcp);
  const ringCurled = isCurledOrFolded(ringTip, ringDip, ringPip, ringMcp);
  const pinkyCurled = isCurledOrFolded(pinkyTip, pinkyDip, pinkyPip, pinkyMcp);

  const palmTriangleArea = 0.5 * Math.abs(
    wrist.x * (indexMcp.y - pinkyMcp.y) +
    indexMcp.x * (pinkyMcp.y - wrist.y) +
    pinkyMcp.x * (wrist.y - indexMcp.y)
  );
  const handScale = dist(wrist, middleMcp);
  const handAreaRef = handScale * handScale;
  const palmAreaRatio = palmTriangleArea / (handAreaRef || 0.001);

  const x1 = indexMcp.x, y1 = indexMcp.y;
  const x2 = indexTip.x, y2 = indexTip.y;
  const x3 = pinkyTip.x, y3 = pinkyTip.y;
  const x4 = pinkyMcp.x, y4 = pinkyMcp.y;

  const fingerRectArea = 0.5 * Math.abs(
    (x1 * y2 - y1 * x2) +
    (x2 * y3 - y2 * x3) +
    (x3 * y4 - y3 * x4) +
    (x4 * y1 - y4 * x1)
  );
  const fingerRectRatio = fingerRectArea / (handAreaRef || 0.001);

  const avgTipX = (indexTip.x + middleTip.x + ringTip.x + pinkyTip.x) / 4;
  const avgTipY = (indexTip.y + middleTip.y + ringTip.y + pinkyTip.y) / 4;
  const avgMcpX = (indexMcp.x + middleMcp.x + ringMcp.x + pinkyMcp.x) / 4;
  const avgMcpY = (indexMcp.y + middleMcp.y + ringMcp.y + pinkyMcp.y) / 4;

  const dx = avgTipX - avgMcpX;
  const dy = avgTipY - avgMcpY;

  // Scale-invariant hand pitch angle in degrees relative to horizontal
  const pitchAngleDeg = Math.atan2(-dy, Math.abs(dx)) * (180 / Math.PI);

  let detectedSign = null;

  // 1. Ti (or Si): Index pointing up
  if (indexExt && middleCurled && ringCurled && pinkyCurled) {
    detectedSign = "Ti";
  }
  // 2. Fist: Fa vs Do
  else if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
    const thumbToIndexPipDist = dist(thumbTip, indexPip);
    const indexProximalLength = dist(indexMcp, indexPip);
    const thumbExtensionRatio = thumbToIndexPipDist / (indexProximalLength || 0.001);

    detectedSign = (thumbExtensionRatio > 1.25) ? "Fa" : "Do";
  }
  // 3. Open Hand: Re, La, and Sol vs Mi (using scale-invariant pitch angle)
  else {
    const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;
    if (extendedCount >= 3) {
      if (pitchAngleDeg >= 18 && pitchAngleDeg <= 58) {
        detectedSign = "Re";
      } else if (pitchAngleDeg <= -18 && pitchAngleDeg >= -58) {
        detectedSign = "La";
      } else if (Math.abs(pitchAngleDeg) < 16) {
        if (activeClassifierMetric === 'triangle') {
          detectedSign = (palmAreaRatio > thresholdTriangle) ? "Sol" : "Mi";
        } else {
          detectedSign = (fingerRectRatio > thresholdRectangle) ? "Sol" : "Mi";
        }
      }
    }
  }

  return {
    sign: detectedSign,
    pitchAngle: pitchAngleDeg,
    palmArea: palmTriangleArea,
    palmRatio: palmAreaRatio,
    rectArea: fingerRectArea,
    rectRatio: fingerRectRatio
  };
}

/* ==========================================================================
   5. HYSTERESIS FILTERING (DEBOUNCE)
   ========================================================================== */
class HandStateTracker {
  constructor() {
    this.history = [];
    this.stableNote = null;
    this.missedFrames = 0;
  }

  update(detectedSign, landmarks) {
    this.missedFrames = 0;
    if (!detectedSign) {
      this.history.push(null);
    } else {
      const note = resolveProximityNote(detectedSign, landmarks);
      this.history.push({ sign: detectedSign, note });
    }

    if (this.history.length > 5) this.history.shift();

    const validFrames = this.history.filter(Boolean);
    if (validFrames.length >= 3) {
      const latestNote = validFrames[validFrames.length - 1].note;
      const matchCount = validFrames.filter(f => f.note === latestNote).length;
      if (matchCount >= 2) {
        this.stableNote = latestNote;
      }
    }
  }

  registerMiss() {
    this.missedFrames++;
    if (this.missedFrames > 6) {
      this.history = [];
      this.stableNote = null;
    }
  }
}

const leftHandTracker = new HandStateTracker();
const rightHandTracker = new HandStateTracker();

/* ==========================================================================
   6. RENDERING & DEBUG VERTICAL PITCH LADDER HUD
   ========================================================================== */
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const noteLeft = document.getElementById('note-left');
const dotsLeft = document.getElementById('dots-left');
const noteRight = document.getElementById('note-right');
const dotsRight = document.getElementById('dots-right');

const debugLeftPalmArea = document.getElementById('debug-left-palm-area');
const debugLeftPalmRatio = document.getElementById('debug-left-palm-ratio');
const debugLeftPalmBar = document.getElementById('debug-left-palm-bar');
const debugLeftRectArea = document.getElementById('debug-left-rect-area');
const debugLeftRectRatio = document.getElementById('debug-left-rect-ratio');
const debugLeftRectBar = document.getElementById('debug-left-rect-bar');
const debugLeftAngle = document.getElementById('debug-left-angle');
const debugLeftAngleZone = document.getElementById('debug-left-angle-zone');

const debugRightPalmArea = document.getElementById('debug-right-palm-area');
const debugRightPalmRatio = document.getElementById('debug-right-palm-ratio');
const debugRightPalmBar = document.getElementById('debug-right-palm-bar');
const debugRightRectArea = document.getElementById('debug-right-rect-area');
const debugRightRectRatio = document.getElementById('debug-right-rect-ratio');
const debugRightRectBar = document.getElementById('debug-right-rect-bar');
const debugRightAngle = document.getElementById('debug-right-angle');
const debugRightAngleZone = document.getElementById('debug-right-angle-zone');

let lastHandsResults = null;
let viewRect = { x: 0, y: 0, w: 0, h: 0 };
let hasReceivedFirstFrame = false;

function calculateViewRect() {
  const canvasW = canvasElement.width;
  const canvasH = canvasElement.height;
  const videoW = videoElement.videoWidth || 1280;
  const videoH = videoElement.videoHeight || 720;

  const videoAspect = videoW / videoH;
  const canvasAspect = canvasW / canvasH;

  let drawW, drawH, offsetX, offsetY;

  if (canvasAspect > videoAspect) {
    drawH = canvasH;
    drawW = canvasH * videoAspect;
    offsetX = (canvasW - drawW) / 2;
    offsetY = 0;
  } else {
    drawW = canvasW;
    drawH = canvasW / videoAspect;
    offsetX = 0;
    offsetY = (canvasH - drawH) / 2;
  }

  viewRect = { x: offsetX, y: offsetY, w: drawW, h: drawH };
}

const PITCH_COLORS = [
  '#e11d48', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

function drawDebugPitchLadders() {
  if (!isDebugVisible || !showDebugScales) return;

  const totalNotes = SCALE_PITCHES.length;
  const slotHeight = viewRect.h / totalNotes;
  const ladderWidth = 42;

  const ladders = [
    {
      x: viewRect.x + viewRect.w - ladderWidth,
      activeNote: leftHandTracker.stableNote,
      activeColor: '#38bdf8',
      sideLabel: 'L'
    },
    {
      x: viewRect.x,
      activeNote: rightHandTracker.stableNote,
      activeColor: '#f43f5e',
      sideLabel: 'R'
    }
  ];

  ladders.forEach(ladder => {
    canvasCtx.save();

    for (let i = 0; i < totalNotes; i++) {
      const pitch = SCALE_PITCHES[i];
      const y = viewRect.y + i * slotHeight;
      const isActive = (ladder.activeNote === pitch);

      canvasCtx.fillStyle = isActive ? ladder.activeColor : 'rgba(15, 23, 42, 0.65)';
      canvasCtx.fillRect(ladder.x, y, ladderWidth, slotHeight - 1.5);

      canvasCtx.fillStyle = PITCH_COLORS[i % PITCH_COLORS.length];
      canvasCtx.fillRect(ladder.x, y, 4, slotHeight - 1.5);

      canvasCtx.save();
      canvasCtx.translate(ladder.x + ladderWidth / 2, y + slotHeight / 2 + 3);
      canvasCtx.scale(-1, 1);

      canvasCtx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
      canvasCtx.font = isActive ? 'bold 10px monospace' : '9px monospace';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText(formatNoteName(pitch), 0, 0);
      canvasCtx.restore();
    }

    canvasCtx.restore();
  });
}

function updateDebugHUD(side, palmArea, palmRatio, rectArea, rectRatio, pitchAngle = 0) {
  const isLeft = (side === 'left');
  const areaEl = isLeft ? debugLeftPalmArea : debugRightPalmArea;
  const ratioEl = isLeft ? debugLeftPalmRatio : debugRightPalmRatio;
  const barEl = isLeft ? debugLeftPalmBar : debugRightPalmBar;

  const rectAreaEl = isLeft ? debugLeftRectArea : debugRightRectArea;
  const rectRatioEl = isLeft ? debugLeftRectRatio : debugRightRectRatio;
  const rectBarEl = isLeft ? debugLeftRectBar : debugRightRectBar;

  const angleEl = isLeft ? debugLeftAngle : debugRightAngle;
  const zoneEl = isLeft ? debugLeftAngleZone : debugRightAngleZone;

  areaEl.textContent = palmArea.toFixed(3);
  ratioEl.textContent = palmRatio.toFixed(3);
  const palmPct = Math.min(Math.max((palmRatio / MAX_SLIDER_RATIO) * 100, 0), 100);
  barEl.style.width = `${palmPct}%`;

  rectAreaEl.textContent = rectArea.toFixed(3);
  rectRatioEl.textContent = rectRatio.toFixed(3);
  const rectPct = Math.min(Math.max((rectRatio / MAX_SLIDER_RATIO) * 100, 0), 100);
  rectBarEl.style.width = `${rectPct}%`;

  angleEl.textContent = `${pitchAngle >= 0 ? '+' : ''}${pitchAngle.toFixed(1)}°`;

  if (pitchAngle >= 18 && pitchAngle <= 58) {
    zoneEl.textContent = "(Ré: +18°..+58°)";
    zoneEl.className = "text-[9px] text-amber-300 font-bold ml-1";
  } else if (pitchAngle <= -18 && pitchAngle >= -58) {
    zoneEl.textContent = "(La: -58°..-18°)";
    zoneEl.className = "text-[9px] text-indigo-300 font-bold ml-1";
  } else if (Math.abs(pitchAngle) < 16) {
    zoneEl.textContent = "(Sol/Mi: ±16°)";
    zoneEl.className = "text-[9px] text-emerald-300 font-bold ml-1";
  } else {
    zoneEl.textContent = "(Transition)";
    zoneEl.className = "text-[9px] text-slate-500 ml-1";
  }
}

function resetDebugHUD(side) {
  const isLeft = (side === 'left');
  const angleEl = isLeft ? debugLeftAngle : debugRightAngle;
  const zoneEl = isLeft ? debugLeftAngleZone : debugRightAngleZone;

  updateDebugHUD(side, 0, 0, 0, 0, 0);
  angleEl.textContent = "—";
  zoneEl.textContent = "(-)";
  zoneEl.className = "text-[9px] text-slate-500 ml-1";
}

let isCameraStreaming = false;

function renderCompositeFrame() {
  if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
    if (!isCameraStreaming) {
      isCameraStreaming = true;
      stopLoadingAnimation();
    }
  }

  if (canvasElement.width !== window.innerWidth || canvasElement.height !== window.innerHeight) {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
  }

  calculateViewRect();

  canvasCtx.save();
  canvasCtx.fillStyle = '#06090e';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  if (videoElement.readyState >= 2) {
    canvasCtx.drawImage(videoElement, viewRect.x, viewRect.y, viewRect.w, viewRect.h);
  }

  drawDebugPitchLadders();

  let userLeftDetected = false;
  let userRightDetected = false;

  if (lastHandsResults && lastHandsResults.multiHandLandmarks && lastHandsResults.multiHandedness) {
    for (let i = 0; i < lastHandsResults.multiHandLandmarks.length; i++) {
      const landmarks = lastHandsResults.multiHandLandmarks[i];
      const handedness = lastHandsResults.multiHandedness[i];

      const isUserLeft = (handedness.label === 'Right');
      
      const opacity = isDebugVisible ? 1.0 : normalMeshOpacity;
      const jointFillOpacity = isDebugVisible ? 1.0 : Math.min(normalMeshOpacity + 0.05, 1.0);

      const jointColor = isUserLeft 
        ? `rgba(56, 189, 248, ${opacity.toFixed(2)})`
        : `rgba(244, 63, 94, ${opacity.toFixed(2)})`;
      
      const boneColor = isUserLeft 
        ? `rgba(56, 189, 248, ${opacity.toFixed(2)})`
        : `rgba(244, 63, 94, ${opacity.toFixed(2)})`;

      const mappedLandmarks = landmarks.map(pt => ({
        x: (viewRect.x + pt.x * viewRect.w) / canvasElement.width,
        y: (viewRect.y + pt.y * viewRect.h) / canvasElement.height,
        z: pt.z
      }));

      drawConnectors(canvasCtx, mappedLandmarks, HAND_CONNECTIONS, { 
        color: boneColor, 
        lineWidth: isDebugVisible ? 3.5 : 2.0 
      });
      drawLandmarks(canvasCtx, mappedLandmarks, { 
        color: jointColor, 
        fillColor: isDebugVisible ? '#ffffff' : (isUserLeft ? `rgba(56,189,248,${jointFillOpacity.toFixed(2)})` : `rgba(244,63,94,${jointFillOpacity.toFixed(2)})`), 
        lineWidth: isDebugVisible ? 1.5 : 1.0, 
        radius: isDebugVisible ? 4.5 : 2.5 
      });

      const analysis = classifyKodalyGesture(landmarks);

      if (isUserLeft) {
        userLeftDetected = true;
        leftHandTracker.update(analysis.sign, landmarks);
        updateDebugHUD('left', analysis.palmArea, analysis.palmRatio, analysis.rectArea, analysis.rectRatio, analysis.pitchAngle);
      } else {
        userRightDetected = true;
        rightHandTracker.update(analysis.sign, landmarks);
        updateDebugHUD('right', analysis.palmArea, analysis.palmRatio, analysis.rectArea, analysis.rectRatio, analysis.pitchAngle);
      }
    }
  }

  if (!userLeftDetected) {
    leftHandTracker.registerMiss();
    resetDebugHUD('left');
  }
  if (!userRightDetected) {
    rightHandTracker.registerMiss();
    resetDebugHUD('right');
  }

  if (leftHandTracker.stableNote) {
    synth.setNote('left', leftHandTracker.stableNote);
    noteLeft.textContent = formatNoteName(leftHandTracker.stableNote);
    noteLeft.classList.remove('hidden');
    dotsLeft.classList.add('hidden');
  } else {
    synth.releaseVoice('left');
    noteLeft.classList.add('hidden');
    dotsLeft.classList.remove('hidden');
  }

  if (rightHandTracker.stableNote) {
    synth.setNote('right', rightHandTracker.stableNote);
    noteRight.textContent = formatNoteName(rightHandTracker.stableNote);
    noteRight.classList.remove('hidden');
    dotsRight.classList.add('hidden');
  } else {
    synth.releaseVoice('right');
    noteRight.classList.add('hidden');
    dotsRight.classList.remove('hidden');
  }

  canvasCtx.restore();
}

/* ==========================================================================
   7. LOADING SCREEN
   ========================================================================== */
const KODALY_SIGNS_IMAGES = [
  'images/signs/do.png',
  'images/signs/re.png',
  'images/signs/mi.png',
  'images/signs/fa.png',
  'images/signs/sol.png',
  'images/signs/la.png',
  'images/signs/si.png'
];

// Preload the loading sign images into browser cache
KODALY_SIGNS_IMAGES.forEach(src => {
  const img = new Image();
  img.src = src;
});

const loadingOverlay = document.getElementById('loading-overlay');
const loadingHandsContainer = document.getElementById('loading-hands-container');
const loadingStatusText = document.getElementById('loading-status-text');
const loadingRetryBtn = document.getElementById('loading-retry-btn');

// Fisher-Yates shuffle algorithm
function getShuffledDeck(array) {
  const deck = [...array];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function startLoadingAnimation() {
  if (!loadingOverlay) return;
  loadingOverlay.classList.remove('opacity-0');

  // Shuffle all 7 hand signs so each sign appears once before any can repeat
  const shuffledSigns = getShuffledDeck(KODALY_SIGNS_IMAGES);

  if (loadingHandsContainer) {
    loadingHandsContainer.innerHTML = '';
    shuffledSigns.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Kodaly hand sign loading';
      img.className = 'loading-cycle-sign absolute inset-0 m-auto w-44 h-44 object-contain drop-shadow-[0_0_28px_rgba(56,189,248,0.65)]';
      // Negative offset for first item so it displays immediately without initial delay (1.2s per sign)
      const delay = (i === 0) ? -0.15 : (i * 1.2 - 0.15);
      img.style.animationDelay = `${delay.toFixed(2)}s`;
      loadingHandsContainer.appendChild(img);
    });
  }
}

function stopLoadingAnimation() {
  if (loadingOverlay) {
    loadingOverlay.classList.add('opacity-0');
    setTimeout(() => {
      if (loadingOverlay && loadingOverlay.parentNode) {
        loadingOverlay.remove();
      }
    }, 550);
  }
}

function showLoadingError(message) {
  if (loadingHandsContainer) {
    loadingHandsContainer.style.opacity = '0.35';
  }
  if (loadingStatusText) {
    loadingStatusText.textContent = message || "Camera error: please allow camera access.";
    loadingStatusText.classList.remove('animate-pulse');
    loadingStatusText.classList.add('text-rose-400');
  }
  if (loadingRetryBtn) {
    loadingRetryBtn.classList.remove('hidden');
    loadingRetryBtn.onclick = () => {
      window.location.reload();
    };
  }
}

/* ==========================================================================
   8. INITIALIZATION & CAMERA LOOP
   ========================================================================== */
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.65,
  minTrackingConfidence: 0.65
});
hands.onResults((results) => {
  lastHandsResults = results;
});

const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
let cameraInstance = null;

async function startApplication() {
  synth.init();

  startOverlay.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => startOverlay.remove(), 480);
  startLoadingAnimation();

  try {
    cameraInstance = new Camera(videoElement, {
      onFrame: async () => {
        try {
          await hands.send({ image: videoElement });
        } catch (mediaPipeErr) {
          console.warn("Hands processing warning:", mediaPipeErr);
        }
        renderCompositeFrame();
      },
      width: 1280,
      height: 720
    });

    await cameraInstance.start();
  } catch (err) {
    console.error("Camera access error:", err);
    showLoadingError("Could not access camera. Check device & permissions.");
  }
}

startBtn.addEventListener('click', () => {
  startApplication().catch(err => {
    console.error("Initialization error:", err);
    showLoadingError("Failed to initialize vision synthesizer.");
  });
});

window.addEventListener('resize', () => {
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
});
