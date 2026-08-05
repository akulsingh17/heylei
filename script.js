const scenes = [...document.querySelectorAll('.scene')];
const show = id => scenes.forEach(s => s.classList.toggle('active', s.id === id));

const petals = document.getElementById('petals');
const sparkles = document.getElementById('sparkles');

const poemText = `there is a quiet peace your presence leaves behind
somehow, my eyes always find you before my thoughts do
perhaps the silence between us has been speaking all along
and your eyes.....they hold a depth that makes me forget where I end and where you belong`;

const replies = {
  yes: 'That makes Boogie very happy 🥹✨ Coffee date approved.',
  maybe: 'Aww, Boogie will wait patiently and keep smiling 🤍',
  think: 'No rush at all. Boogie believes in gentle timelines 🌷'
};

for (let i = 0; i < 26; i++) {
  const p = document.createElement('i');
  p.className = 'petal';
  p.style.left = Math.random() * 100 + 'vw';
  p.style.animationDelay = Math.random() * 12 + 's';
  p.style.animationDuration = 8 + Math.random() * 10 + 's';
  p.style.opacity = .4 + Math.random() * .5;
  petals.appendChild(p);
}

for (let i = 0; i < 36; i++) {
  const s = document.createElement('i');
  s.className = 'spark';
  s.style.left = Math.random() * 100 + 'vw';
  s.style.top = Math.random() * 100 + 'vh';
  s.style.animationDelay = Math.random() * 6 + 's';
  sparkles.appendChild(s);
}

const flash = (x, y, txt = '💖') => {
  const e = document.createElement('div');
  e.textContent = txt;
  e.style.position = 'fixed';
  e.style.left = x + 'px';
  e.style.top = y + 'px';
  e.style.fontSize = '1.2rem';
  e.style.transition = 'transform 1s ease, opacity 1s ease';
  e.style.pointerEvents = 'none';
  e.style.zIndex = '20';
  document.body.appendChild(e);
  requestAnimationFrame(() => {
    e.style.transform = 'translateY(-80px) scale(1.8)';
    e.style.opacity = '0';
  });
  setTimeout(() => e.remove(), 1100);
};

document.getElementById('petBtn').addEventListener('click', () => {
  for (let i = 0; i < 18; i++) {
    flash(window.innerWidth / 2 + (Math.random() * 160 - 80), window.innerHeight * 0.6);
  }
  show('level1');
});

const ball = document.getElementById('ball');
const runner = document.getElementById('runnerDog');
const meter = document.getElementById('meterFill');
let throws = 0;
let drag = false;
let poemStarted = false;

const ballPos = () => ball.getBoundingClientRect();

ball.addEventListener('pointerdown', e => {
  drag = true;
  ball.setPointerCapture(e.pointerId);
  ball.style.cursor = 'grabbing';
});

ball.addEventListener('pointermove', e => {
  if (!drag) return;
  const r = document.querySelector('.field').getBoundingClientRect();
  ball.style.left = Math.min(88, Math.max(4, ((e.clientX - r.left) / r.width) * 100)) + '%';
  ball.style.top = Math.min(74, Math.max(12, ((e.clientY - r.top) / r.height) * 100)) + '%';
});

ball.addEventListener('pointerup', () => {
  if (!drag) return;
  drag = false;
  ball.style.cursor = 'grab';
  fetchBall();
});

ball.addEventListener('click', () => fetchBall());

function fetchBall() {
  ball.classList.remove('fly');
  void ball.offsetWidth;
  ball.classList.add('fly');
  runner.classList.add('running');

  setTimeout(() => flash(ballPos().left + 20, ballPos().top + 10, '🐾'), 180);
  setTimeout(() => flash(ballPos().left + 30, ballPos().top + 10, '🐾'), 320);

  setTimeout(() => runner.classList.remove('running'), 900);

  setTimeout(() => {
    ball.style.left = '14%';
    ball.style.top = '62%';
    ball.classList.remove('fly');
    throws++;
    meter.style.width = Math.min(100, throws / 3 * 100) + '%';
    document.getElementById('m1').textContent = throws < 3 ? `Nice throw ${throws}/3!` : 'Boogie got the ball three times!';
    if (throws >= 3) setTimeout(() => show('level2'), 1000);
  }, 980);
}

document.querySelectorAll('.treat').forEach(btn =>
  btn.addEventListener('click', () => {
    const ok = btn.dataset.correct === '1';
    document.getElementById('m2').textContent = ok ? 'Boogie does a tiny happy spin! 🎉' : 'Boogie politely disagrees 😅';
    if (ok) setTimeout(() => show('level3'), 900);
  })
);

document.querySelectorAll('.option').forEach(btn =>
  btn.addEventListener('click', () => {
    const next = btn.dataset.next;
    const msg = document.getElementById('m3');
    if (next === '6') {
      msg.textContent = 'I hope this little adventure still made you smile 😊';
      setTimeout(() => show('level6'), 1100);
    } else {
      msg.textContent = 'Thanks for answering gently. Boogie keeps going with a wag!';
      setTimeout(() => show('level4'), 1000);
    }
  })
);

const puzzle = document.getElementById('puzzle');
let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let sel = null;

function drawPuzzle() {
  puzzle.innerHTML = '';
  tiles.forEach((n, i) => {
    const b = document.createElement('button');
    b.className = 'tile';
    b.textContent = n || '🐶';
    if (sel === i) b.style.outline = '3px solid #ff9fc6';
    b.onclick = () => {
      if (sel === null) {
        sel = i;
        drawPuzzle();
        return;
      }
      [tiles[sel], tiles[i]] = [tiles[i], tiles[sel]];
      sel = null;
      drawPuzzle();
      if (tiles.join('') === '123456780') {
        document.getElementById('m4').textContent = 'Perfect! The envelope appears.';
        setTimeout(() => show('level5'), 800);
        startPoem();
      }
    };
    puzzle.appendChild(b);
  });
}

drawPuzzle();

function startPoem() {
  if (poemStarted) return;
  poemStarted = true;
  const el = document.getElementById('poem');
  const env = document.getElementById('envelope');
  env.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }],
    { duration: 700, iterations: 2 }
  );

  let i = 0;
  const t = setInterval(() => {
    el.textContent = poemText.slice(0, ++i);
    if (i >= poemText.length) {
      clearInterval(t);
      setTimeout(() => show('level6'), 1800);
    }
  }, 26);
}

document.getElementById('envelope').addEventListener('click', startPoem);

document.querySelectorAll('.response').forEach(btn =>
  btn.addEventListener('click', () => {
    document.getElementById('m6').textContent = replies[btn.dataset.reply];
  })
);

setInterval(() => {
  flash(Math.random() * window.innerWidth, window.innerHeight + 20, '✨');
}, 2400);
