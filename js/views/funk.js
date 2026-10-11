import { esc, $, $$, pick } from '../lib/util.js';
import { NATO_ALPHABET, MORSE } from '../data/wissen.js';

let audio;
async function playMorse(code, wpm = 18) {
  audio ||= new (window.AudioContext || window.webkitAudioContext)();
  const unit = 1.2 / wpm;
  let t = audio.currentTime + 0.05;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = 650; gain.gain.value = 0;
  osc.connect(gain).connect(audio.destination);
  osc.start();
  for (const ch of code) {
    if (ch === '.' || ch === '-') {
      const len = ch === '.' ? unit : unit * 3;
      gain.gain.setValueAtTime(0.25, t); gain.gain.setValueAtTime(0, t + len);
      t += len + unit;
    } else if (ch === ' ') t += unit * 2;
    else if (ch === '/') t += unit * 4;
  }
  osc.stop(t + 0.1);
  return (t - audio.currentTime) * 1000;
}

export async function render(el) {
  el.innerHTML = `
    <div class="page-head">
      <span class="kicker">Fernmelder</span>
      <h1>Funk &amp; Morse</h1>
      <hr class="rule">
      <p>Im Sprechfunk wird mit dem NATO-Buchstabieralphabet buchstabiert. Gib einen Text ein – die App übersetzt ihn ins NATO-Alphabet und in Morsezeichen, die du dir auch anhören kannst.</p>
    </div>
    <div class="grid cols-2 section">
      <div class="sim-panel">
        <label class="field"><span>Klartext</span><input class="input" id="txt" value="Bundeswehr" maxlength="80"></label>
        <h3>NATO-Alphabet</h3>
        <div class="big-output" id="nato"></div>
        <h3 style="margin-top:14px">Morsecode</h3>
        <div class="big-output mono" id="morse"></div>
        <button class="btn" id="play" style="margin-top:12px">▶ Morsecode abspielen</button>
      </div>
      <div class="sim-panel">
        <h3>Trainer</h3>
        <p class="small muted">Welches Wort gehört zum Buchstaben?</p>
        <div id="trainer"></div>
        <p class="small" id="tscore" style="margin-top:10px"></p>
      </div>
    </div>
    <div class="section card table-scroll"><table class="rank-table"><thead><tr><th>Zeichen</th><th>NATO</th><th>Morse</th></tr></thead><tbody>
      ${Object.keys(MORSE).filter((k) => NATO_ALPHABET[k]).map((k) => `<tr><td><b>${k}</b></td><td>${NATO_ALPHABET[k]}</td><td class="mono">${MORSE[k]}</td></tr>`).join('')}
    </tbody></table></div>`;

  const conv = () => {
    const v = $('#txt', el).value.toUpperCase().replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE').replace(/ß/g, 'SS');
    $('#nato', el).textContent = [...v].map((c) => (c === ' ' ? '·' : NATO_ALPHABET[c] || c)).join(' ');
    $('#morse', el).textContent = v.split(' ').map((w) => [...w].map((c) => MORSE[c] || '').filter(Boolean).join(' ')).join(' / ');
  };
  $('#txt', el).addEventListener('input', conv);
  conv();
  $('#play', el).addEventListener('click', async (e) => {
    e.target.disabled = true;
    const ms = await playMorse($('#morse', el).textContent);
    setTimeout(() => { e.target.disabled = false; }, ms);
  });

  let ok = 0, total = 0;
  const letters = Object.keys(NATO_ALPHABET).filter((k) => /[A-Z]/.test(k));
  function round() {
    const l = pick(letters);
    const opts = [l];
    while (opts.length < 4) { const x = pick(letters); if (!opts.includes(x)) opts.push(x); }
    opts.sort(() => Math.random() - 0.5);
    $('#trainer', el).innerHTML = `<p style="font-size:3rem;font-family:var(--font-cond);font-weight:800;margin:0">${l}</p>` + opts.map((o) => `<button class="quiz-opt" data-o="${o}">${esc(NATO_ALPHABET[o])}</button>`).join('');
    $$('#trainer .quiz-opt', el).forEach((b) => b.addEventListener('click', () => {
      total++;
      const right = b.dataset.o === l;
      if (right) ok++;
      $$('#trainer .quiz-opt', el).forEach((x) => { x.disabled = true; if (x.dataset.o === l) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
      $('#tscore', el).textContent = `${ok} von ${total} richtig`;
      setTimeout(round, 900);
    }));
  }
  round();
}
