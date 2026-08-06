/* ==========================================================================
   Fur Baby's Adventure — script.js
   Vanilla JS only. No frameworks.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------------
     0. UTILITIES
  --------------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const body = document.body;
  const dogStage = $('#dog-stage');
  const buddySvg = $('#buddy');
  const speechBubble = $('#speech-bubble');
  const speechText = $('#speech-text');
  const heartsLayer = $('#hearts');
  const pawTrailLayer = $('#paw-trail');
  const fxLayer = $('#fx-layer');
  const cursorTrailLayer = $('#cursor-trail');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------------------
     1. SCENE MANAGER
  --------------------------------------------------------------------- */
  const sceneOrder = ['intro', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6'];
  let currentScene = 'intro';

  // Tracks choices for the optional, user-initiated shareable report at the end.
  // Nothing here is ever sent anywhere automatically — she chooses if/when to
  // save or copy it herself.
  const journey = {
    treatAttempts: 0,
    relationshipChoice: null,
    finalChoice: null,
  };

  function goToScene(name) {
    const current = $('.scene.active');
    const next = document.getElementById(`scene-${name}`);
    if (!next || next === current) return;

    if (current) {
      current.classList.remove('active');
    }
    // small delay so CSS transition can be appreciated
    requestAnimationFrame(() => {
      next.classList.add('active');
    });

    if (!prefersReducedMotion) {
      sparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 10);
    }

    currentScene = name;
    body.className = `scene-${name}`;
    updateProgress(name);
    onEnterScene(name);
  }

  function updateProgress(name) {
    $$('.dot').forEach((d) => {
      d.classList.toggle('active', d.dataset.scene === name);
    });
  }

  function onEnterScene(name) {
    switch (name) {
      case 'intro':
        setDogState('idle');
        say("Hi 😊\nMy human asked me to show you something.\nWould you come with me?", 999999);
        break;
      case 'level1':
        setDogState('sit');
        centerDogFor('level1');
        say("Throw the ball for me!", 3200);
        resetFetchGame();
        break;
      case 'level2':
        setDogState('sit');
        centerDogFor('level2');
        say("Ooh, is one of those for me?", 3000);
        resetTreatGame();
        break;
      case 'level3':
        setDogState('idle');
        centerDogFor('level3');
        say("Before I continue...\nMy human wanted me to ask...", 3600);
        break;
      case 'committed':
        setDogState('sit');
        centerDogFor('committed');
        say("I hope this made you smile 😊", 999999);
        break;
      case 'level4':
        setDogState('sit');
        centerDogFor('level4');
        say("Watch closely, then copy the pattern!", 3200);
        startMemoryGame();
        break;
      case 'level5':
        setDogState('sit');
        centerDogFor('level5');
        say("I brought you something 💌", 3000);
        resetPoemScene();
        break;
      case 'level6':
        setDogState('sit');
        centerDogFor('level6');
        say("This is the important part...", 3200);
        break;
    }
    // Fetch is entirely gameplay-driven — never let auto-wander interfere with it.
    if (name !== 'level1') scheduleOverlapCheck();
  }

  // Positions Fur Baby per-scene (via inline style, since #dog-stage default is centered/bottom)
  function centerDogFor(scene) {
    dogStage.style.left = '50%';
    dogStage.style.bottom = '';
    dogStage.style.transform = 'translateX(-50%)';
    if (scene === 'level1') {
      dogStage.style.bottom = '8vh';
    }
  }

  const restStateByScene = {
    intro: 'idle', level1: 'sit', level2: 'sit', level3: 'idle',
    committed: 'sit', level4: 'sit', level5: 'sit', level6: 'sit',
  };

  /* ---------------------------------------------------------------------
     2. BUDDY: STATES, SPEECH, HEARTS, PAW PRINTS, IDLE BEHAVIOUR
  --------------------------------------------------------------------- */
  const STATES = ['idle', 'happy', 'jump', 'run', 'sit', 'sleep'];

  function setDogState(state) {
    STATES.forEach((s) => dogStage.classList.remove(`state-${s}`));
    if (state !== 'idle') dogStage.classList.add(`state-${state}`);
    if (state !== 'run') buddySvg.style.transform = '';
    resetIdleTimer();
  }

  let speechTimer = null;
  function say(text, duration = 2600) {
    speechText.textContent = text;
    speechBubble.classList.add('show');
    clearTimeout(speechTimer);
    if (duration < 999999) {
      speechTimer = setTimeout(() => speechBubble.classList.remove('show'), duration);
    }
  }
  function hideSpeech() {
    speechBubble.classList.remove('show');
  }

  function popHearts(count = 6) {
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'heart-pop';
      h.textContent = pick(['💗', '💕', '💖', '✨']);
      h.style.setProperty('--dx', `${rand(-70, 70)}px`);
      h.style.left = `${50 + rand(-10, 10)}%`;
      h.style.animationDelay = `${i * 0.06}s`;
      heartsLayer.appendChild(h);
      setTimeout(() => h.remove(), 1600 + i * 60);
    }
  }

  function dropPawPrint(x, y, flip) {
    const p = document.createElement('span');
    p.className = 'paw-print';
    p.textContent = '🐾';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.transform = `scale(${flip ? -1 : 1},1)`;
    pawTrailLayer.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }

  // Idle -> sleep after inactivity
  let idleTimer = null;
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (dogStage.classList.contains('state-sleep')) {
      dogStage.classList.remove('state-sleep');
    }
    idleTimer = setTimeout(() => {
      // only nap during calm scenes
      if (['intro', 'level3'].includes(currentScene)) {
        dogStage.classList.add('state-sleep');
      }
    }, 14000);
  }
  resetIdleTimer();
  ['pointerdown', 'pointermove', 'keydown'].forEach((evt) =>
    document.addEventListener(evt, () => {
      if (dogStage.classList.contains('state-sleep')) resetIdleTimer();
    }, { passive: true })
  );

  // Subtle "follow cursor" head tilt during idle
  document.addEventListener('pointermove', (e) => {
    if (currentScene !== 'intro') return;
    const cx = window.innerWidth / 2;
    const tilt = Math.max(-10, Math.min(10, (e.clientX - cx) / cx * 10));
    dogStage.style.setProperty('--cursor-tilt', `${tilt}deg`);
  });

  /* ---------------------------------------------------------------------
     2b. AUTO-WANDER — if Fur Baby's resting spot would cover the active
     card's content (e.g. a tall poem or report card), he patrols side to
     side instead of sitting still on top of it. Never touches Level 1,
     which owns his movement entirely for gameplay.
  --------------------------------------------------------------------- */
  let wandering = false;
  let wanderTimer = null;
  let overlapCheckTimer = null;

  function scheduleOverlapCheck(delay = 550) {
    if (currentScene === 'level1') return;
    clearTimeout(overlapCheckTimer);
    overlapCheckTimer = setTimeout(checkOverlapAndAdapt, delay);
  }

  function checkOverlapAndAdapt() {
    if (currentScene === 'level1') { stopWander(); return; }
    const card = $('.scene.active .glass-card');
    if (!card) { stopWander(); return; }
    const cardRect = card.getBoundingClientRect();
    const dogRect = dogStage.getBoundingClientRect();
    const overlaps = !(
      cardRect.bottom < dogRect.top ||
      cardRect.top > dogRect.bottom ||
      cardRect.right < dogRect.left ||
      cardRect.left > dogRect.right
    );
    if (overlaps) startWander();
    else stopWander();
  }

  function startWander() {
    if (wandering || currentScene === 'level1') return;
    wandering = true;
    say("I'll just scoot over here 🐾", 1800);
    wanderLoop();
  }

  function stopWander() {
    if (!wandering) return;
    wandering = false;
    clearTimeout(wanderTimer);
    centerDogFor(currentScene);
    setDogState(restStateByScene[currentScene] || 'idle');
  }

  function wanderLoop() {
    if (!wandering) return;
    const halfDog = dogStage.offsetWidth / 2 || 90;
    const goLeft = Math.random() < 0.5;
    const targetX = goLeft
      ? rand(halfDog + 16, Math.max(halfDog + 40, window.innerWidth * 0.22))
      : rand(Math.min(window.innerWidth * 0.78, window.innerWidth - halfDog - 40), window.innerWidth - halfDog - 16);

    setDogState('run');
    animateDogRunTo(targetX, () => {
      if (!wandering) {
        centerDogFor(currentScene);
        setDogState(restStateByScene[currentScene] || 'idle');
        return;
      }
      setDogState(pick(['sit', 'idle']));
      wanderTimer = setTimeout(() => {
        if (!wandering) return;
        // re-check whether he's still in the way before the next lap
        const card = $('.scene.active .glass-card');
        if (card) {
          const cardRect = card.getBoundingClientRect();
          const dogRect = dogStage.getBoundingClientRect();
          const stillOverlaps = !(
            cardRect.bottom < dogRect.top ||
            cardRect.top > dogRect.bottom ||
            cardRect.right < dogRect.left ||
            cardRect.left > dogRect.right
          );
          if (!stillOverlaps) { stopWander(); return; }
        }
        wanderLoop();
      }, rand(1500, 2600));
    });
  }

  window.addEventListener('resize', () => scheduleOverlapCheck(300));

  /* ---------------------------------------------------------------------
     3. INTRO: PET ME BUTTON
  --------------------------------------------------------------------- */
  $('#btn-pet-me').addEventListener('click', () => {
    ensureAudio();
    setDogState('jump');
    popHearts(8);
    say("Yippee! Let's go 🐾", 1800);
    setTimeout(() => {
      goToScene('level1');
    }, 1000);
  });

  /* ---------------------------------------------------------------------
     4. LEVEL 1 — FETCH GAME
  --------------------------------------------------------------------- */
  const fetchArea = $('#fetch-area');
  const ball = $('#tennis-ball');
  const throwCountEl = $('#throw-count');
  let throws = 0;
  let fetching = false;
  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

  function resetFetchGame() {
    throws = 0;
    throwCountEl.textContent = '0';
    fetching = false;
    ball.style.left = '50%';
    ball.style.top = '50%';
    ball.classList.remove('dragging');
  }

  function ballPointerDown(e) {
    if (fetching) return;
    dragging = true;
    ball.classList.add('dragging');
    ball.setPointerCapture(e.pointerId);
    const rect = ball.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left - rect.width / 2;
    dragOffset.y = e.clientY - rect.top - rect.height / 2;
  }

  function ballPointerMove(e) {
    if (!dragging) return;
    const areaRect = fetchArea.getBoundingClientRect();
    let x = e.clientX - areaRect.left - dragOffset.x;
    let y = e.clientY - areaRect.top - dragOffset.y;
    x = Math.max(20, Math.min(areaRect.width - 20, x));
    y = Math.max(20, Math.min(areaRect.height - 20, y));
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
  }

  function ballPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    ball.classList.remove('dragging');
    throwFetch();
  }

  ball.addEventListener('pointerdown', ballPointerDown);
  window.addEventListener('pointermove', ballPointerMove);
  window.addEventListener('pointerup', ballPointerUp);

  function throwFetch() {
    fetching = true;
    setDogState('run');
    say(pick(["I'll get it!", "Fetching!", "On my way!"]), 1400);

    const areaRect = fetchArea.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();
    const ballX = ballRect.left + ballRect.width / 2;
    const ballY = ballRect.top + ballRect.height / 2;
    const startLeft = window.innerWidth / 2;

    animateDogRunTo(ballX, () => {
      // "grab" the ball
      setDogState('happy');
      popHearts(2);
      spawnPaws(ballX, ballY);
      setTimeout(() => {
        setDogState('run');
        animateDogRunTo(startLeft, () => {
          setDogState('sit');
          fetching = false;
          ball.style.left = '50%';
          ball.style.top = '50%';
          throws++;
          throwCountEl.textContent = String(throws);
          if (throws >= 3) {
            say("Yay, three catches! You're a great thrower 🎾", 2600);
            popHearts(6);
            setTimeout(() => goToScene('level2'), 1800);
          } else {
            say('Throw it again!', 1600);
          }
        });
      }, 500);
    });
  }

  // Animate #dog-stage horizontally toward a target viewport X using transform, with paw prints.
  // Note: only the visual #buddy SVG is mirrored when changing direction — never #dog-stage
  // itself, since that element also holds the speech bubble/hearts/paw-trail, and flipping it
  // used to mirror the text Fur Baby was "saying".
  function animateDogRunTo(targetX, onDone) {
    const stageRectStart = dogStage.getBoundingClientRect();
    const startX = stageRectStart.left + stageRectStart.width / 2;
    const distance = targetX - startX;
    const duration = Math.min(1200, Math.max(500, Math.abs(distance) * 2.2));
    const startTime = performance.now();

    // Disable the CSS transition while we drive position manually frame-by-frame —
    // otherwise every tiny per-frame change gets re-eased over ~1s and motion turns to mush.
    const prevTransition = dogStage.style.transition;
    dogStage.style.transition = 'none';
    buddySvg.style.transform = `scaleX(${distance < 0 ? -1 : 1})`;

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
      const currentOffset = distance * eased;
      dogStage.style.transform = `translateX(calc(-50% + ${currentOffset}px))`;

      if (Math.random() < 0.35) {
        const r = dogStage.getBoundingClientRect();
        dropPawPrint(r.left + r.width / 2 + rand(-10, 10), r.bottom - 10, distance < 0);
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        dogStage.style.transition = prevTransition;
        onDone && onDone();
      }
    }
    requestAnimationFrame(frame);
  }

  function spawnPaws(x, y) {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => dropPawPrint(x + rand(-14, 14), y + rand(-8, 8), false), i * 80);
    }
  }

  /* ---------------------------------------------------------------------
     5. LEVEL 2 — TREAT GAME
  --------------------------------------------------------------------- */
  const treatCards = $$('.treat-card');
  const treatReaction = $('#treat-reaction');
  const correctTreatIndex = 1; // Peanut Butter Biscuit
  let treatSolved = false;

  const wrongReactions = [
    "Fur Baby sniffs it... and walks away. Not this one!",
    "Fur Baby gives you a polite 'no thank you' look.",
    "Fur Baby nudges it aside gently. Try again!",
  ];

  function resetTreatGame() {
    treatSolved = false;
    treatReaction.textContent = '';
    treatCards.forEach((c) => c.classList.remove('correct', 'wrong'));
  }

  treatCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (treatSolved) return;
      const idx = Number(card.dataset.treat);
      if (idx === correctTreatIndex) {
        treatSolved = true;
        card.classList.add('correct');
        setDogState('happy');
        popHearts(6);
        treatReaction.textContent = "That's exactly it! Fur Baby's tail is a blur! 🥜✨";
        say('My favorite! You know me so well!', 2600);
        setTimeout(() => goToScene('level3'), 2000);
      } else {
        journey.treatAttempts++;
        card.classList.add('wrong');
        setDogState('idle');
        treatReaction.textContent = pick(wrongReactions);
        say(pick(["Hehe, nope!", "Not quite!", "Try another one!"]), 1400);
        setTimeout(() => card.classList.remove('wrong'), 500);
      }
    });
  });

  /* ---------------------------------------------------------------------
     6. LEVEL 3 — RELATIONSHIP QUESTION
  --------------------------------------------------------------------- */
  $$('#scene-level3 .choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.choice;
      journey.relationshipChoice = choice;
      if (choice === 'committed') {
        setDogState('sit');
        say("That's okay 💛", 1800);
        setTimeout(() => goToScene('committed'), 900);
      } else if (choice === 'single') {
        setDogState('happy');
        popHearts(4);
        say('Yay! Let\'s keep going then!', 1800);
        setTimeout(() => goToScene('level4'), 1000);
      } else {
        setDogState('idle');
        say("That's okay! Let's just keep having fun 🐾", 2000);
        setTimeout(() => goToScene('level4'), 1200);
      }
    });
  });

  $('#btn-restart-1').addEventListener('click', restartAdventure);

  /* ---------------------------------------------------------------------
     7. LEVEL 4 — MEMORY PUZZLE (Simon-style paw sequence)
  --------------------------------------------------------------------- */
  const memoryGrid = $('#memory-grid');
  const memoryHint = $('#memory-hint');
  let sequence = [];
  let playerStep = 0;
  let showingSequence = false;
  let sequenceLength = 4;

  function buildMemoryGrid() {
    memoryGrid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const tile = document.createElement('button');
      tile.className = 'paw-tile';
      tile.textContent = '🐾';
      tile.dataset.index = String(i);
      tile.addEventListener('click', () => onTileClick(i, tile));
      memoryGrid.appendChild(tile);
    }
  }

  function startMemoryGame() {
    buildMemoryGrid();
    sequence = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * 9));
    playerStep = 0;
    showingSequence = true;
    memoryHint.textContent = 'Watch closely...';
    setTimeout(() => playSequence(), 700);
  }

  function playSequence() {
    const tiles = $$('.paw-tile', memoryGrid);
    let i = 0;
    const interval = setInterval(() => {
      if (i > 0) tiles[sequence[i - 1]].classList.remove('lit');
      if (i >= sequence.length) {
        clearInterval(interval);
        showingSequence = false;
        memoryHint.textContent = 'Now repeat the pattern!';
        return;
      }
      tiles[sequence[i]].classList.add('lit');
      i++;
    }, 650);
  }

  function onTileClick(index, tileEl) {
    if (showingSequence) return;
    if (index === sequence[playerStep]) {
      tileEl.classList.add('correct-flash');
      setTimeout(() => tileEl.classList.remove('correct-flash'), 300);
      playerStep++;
      if (playerStep === sequence.length) {
        memoryHint.textContent = 'Perfect memory! 🎉';
        setDogState('happy');
        popHearts(6);
        say('Wow, great memory!', 2000);
        setTimeout(() => goToScene('level5'), 1600);
      }
    } else {
      tileEl.classList.add('wrong-flash');
      setTimeout(() => tileEl.classList.remove('wrong-flash'), 300);
      memoryHint.textContent = "Oops, that's not it — watch again!";
      say('Almost! Watch again.', 1600);
      playerStep = 0;
      showingSequence = true;
      setTimeout(() => playSequence(), 900);
    }
  }

  /* ---------------------------------------------------------------------
     8. LEVEL 5 — POEM REVEAL
  --------------------------------------------------------------------- */
  const envelope = $('#envelope');
  const envelopeHint = $('#envelope-hint');
  const poemBox = $('#poem-box');
  const poemTextEl = $('#poem-text');

  const poemLines = [
    "there is a quiet peace your presence leaves behind,",
    "somehow, my eyes always find you before my thoughts do.",
    "perhaps the silence between us has been speaking all along,",
    "and your eyes.....they hold a depth that makes me forget",
    "where I end and where you belong.",
  ].join('\n');

  function resetPoemScene() {
    envelope.classList.remove('open');
    poemBox.hidden = true;
    poemTextEl.textContent = '';
    envelopeHint.textContent = 'Tap the envelope to open it';
    envelope.onclick = openEnvelope;
  }

  function openEnvelope() {
    envelope.onclick = null;
    envelope.classList.add('open');
    envelopeHint.textContent = '';
    setDogState('happy');
    popHearts(4);
    ensureAudio();
    playAmbientPiano();
    setTimeout(() => {
      poemBox.hidden = false;
      scheduleOverlapCheck(200);
      typewriter(poemTextEl, poemLines, 38, () => {
        scheduleOverlapCheck(150);
        setTimeout(() => goToScene('level6'), 1400);
      });
    }, 700);
  }

  function typewriter(el, text, speed, onDone) {
    let i = 0;
    el.textContent = '';
    const timer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        onDone && onDone();
      }
    }, speed);
  }

  /* ---------------------------------------------------------------------
     9. LEVEL 6 — FINAL SCREEN
  --------------------------------------------------------------------- */
  const finalReaction = $('#final-reaction');
  const finalResponses = {
    yes: "Yay! 😊 Fur Baby is doing zoomies of joy right now. Coffee it is!",
    maybe: "That's okay 🤍 No pressure at all — Fur Baby will just be happy to know you.",
    think: "Take all the time you need 🌸 Fur Baby will be here, tail wagging, whenever you're ready.",
  };

  $$('#scene-level6 .choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.final;
      journey.finalChoice = key;
      finalReaction.textContent = finalResponses[key] || '';
      if (key === 'yes') {
        setDogState('happy');
        popHearts(10);
        say('Best. Day. Ever!! 🐾💛', 3000);
      } else if (key === 'maybe') {
        setDogState('sit');
        say('Okay! I\'ll be right here 🤍', 2600);
      } else {
        setDogState('idle');
        say('Take your time 🌸', 2600);
      }
      revealSharePanel();
    });
  });

  /* ---------------------------------------------------------------------
     9b. OPTIONAL SHAREABLE REPORT — built and sent only if SHE chooses to
  --------------------------------------------------------------------- */
  const sharePanel = $('#share-panel');
  const reportList = $('#report-list');
  const shareStatus = $('#share-status');
  let sharePanelShown = false;

  const relationshipLabels = {
    single: "❤️ I'm single",
    committed: '💛 I\'m committed',
    pass: "🌼 I'd rather not answer",
  };
  const finalLabels = {
    yes: '😊 Yes, let\'s get coffee',
    maybe: '🤍 Maybe',
    think: '🌸 Let me think about it',
  };

  function buildReportLines() {
    const lines = [];
    if (journey.relationshipChoice) {
      lines.push(`Relationship status: ${relationshipLabels[journey.relationshipChoice]}`);
    }
    lines.push(
      journey.treatAttempts === 0
        ? 'Guessed Fur Baby\'s favorite treat on the first try 🥜'
        : `Guessed Fur Baby's favorite treat after ${journey.treatAttempts} tr${journey.treatAttempts === 1 ? 'y' : 'ies'} 🥜`
    );
    if (journey.finalChoice) {
      lines.push(`Coffee invite: ${finalLabels[journey.finalChoice]}`);
    }
    return lines;
  }

  function revealSharePanel() {
    if (sharePanelShown) {
      // still refresh in case they changed their answer
      renderReport();
      scheduleOverlapCheck(150);
      return;
    }
    sharePanelShown = true;
    renderReport();
    sharePanel.hidden = false;
    scheduleOverlapCheck(200);
  }

  function renderReport() {
    reportList.innerHTML = '';
    buildReportLines().forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      reportList.appendChild(li);
    });
  }

  function buildReportText() {
    const lines = buildReportLines();
    return `🐾 Fur Baby's Adventure Report\n${lines.join('\n')}`;
  }

  $('#btn-copy-text').addEventListener('click', async () => {
    const text = buildReportText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      shareStatus.textContent = 'Copied! Paste it wherever you\'d like to send it 💌';
    } catch (err) {
      shareStatus.textContent = 'Could not copy automatically — you can select the text above manually.';
    }
  });

  $('#btn-save-image').addEventListener('click', () => {
    const dataUrl = drawReportImage(buildReportLines());
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'buddys-adventure-report.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    shareStatus.textContent = 'Saved! You can share the image however you\'d like 🖼️';
  });

  function drawReportImage(lines) {
    const canvas = document.createElement('canvas');
    const W = 640, H = 460 + lines.length * 46;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#fff0f6');
    bg.addColorStop(0.6, '#f3e9ff');
    bg.addColorStop(1, '#eaf7f1');
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, W, H, 0);
    ctx.fill();

    // card
    const pad = 28;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // decorative paws
    ctx.font = '30px sans-serif';
    ctx.fillText('🐾', pad + 20, pad + 50);
    ctx.fillText('🐾', W - pad - 60, H - pad - 30);

    // title
    ctx.fillStyle = '#7a5aa8';
    ctx.font = '700 40px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Fur Baby's Adventure Report", W / 2, pad + 90);

    ctx.font = '24px "Segoe UI", sans-serif';
    ctx.fillStyle = '#5a4a5e';
    let y = pad + 150;
    lines.forEach((line) => {
      wrapText(ctx, line, W / 2, y, W - pad * 2 - 60, 32);
      y += 60;
    });

    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillStyle = '#8a768f';
    ctx.fillText('delivered with a wagging tail', W / 2, H - pad - 20);

    return canvas.toDataURL('image/png');
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, cx, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lineHeight));
  }

  /* ---------------------------------------------------------------------
     10. RESTART
  --------------------------------------------------------------------- */
  function restartAdventure() {
    wandering = false;
    clearTimeout(wanderTimer);
    clearTimeout(overlapCheckTimer);
    resetFetchGame();
    resetTreatGame();
    journey.treatAttempts = 0;
    journey.relationshipChoice = null;
    journey.finalChoice = null;
    sharePanelShown = false;
    sharePanel.hidden = true;
    shareStatus.textContent = '';
    goToScene('intro');
  }

  /* ---------------------------------------------------------------------
     11. AMBIENT BACKGROUND: CLOUDS, PETALS, SPARKLES
  --------------------------------------------------------------------- */
  function buildClouds() {
    const layer = $('#clouds');
    const count = window.innerWidth < 640 ? 3 : 5;
    for (let i = 0; i < count; i++) {
      const c = document.createElement('div');
      c.className = 'cloud';
      const w = rand(90, 200);
      const h = w * 0.4;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      c.style.top = `${rand(4, 45)}%`;
      c.style.setProperty('--w', w);
      c.style.animationDuration = `${rand(40, 80)}s`;
      c.style.animationDelay = `-${rand(0, 60)}s`;
      // pseudo bumps via inline style vars read by ::before/::after is tricky; use box-shadow instead
      c.style.boxShadow = `
        ${w * 0.25}px ${-h * 0.35}px 0 ${-h * 0.1}px #fff,
        ${w * 0.55}px ${-h * 0.15}px 0 ${-h * 0.2}px #fff,
        ${w * 0.15}px ${h * 0.1}px 0 ${-h * 0.15}px #fff
      `;
      layer.appendChild(c);
    }
  }

  function buildPetals() {
    const layer = $('#petals');
    const count = window.innerWidth < 640 ? 14 : 26;
    for (let i = 0; i < count; i++) {
      spawnPetal(layer, true);
    }
  }
  function spawnPetal(layer, randomDelay) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = pick(['🌸', '🌸', '🌸', '💮']);
    p.style.left = `${rand(0, 100)}%`;
    p.style.fontSize = `${rand(0.9, 1.7)}rem`;
    const fallDur = rand(9, 18);
    const swayDur = rand(3, 6);
    p.style.animationDuration = `${fallDur}s, ${swayDur}s`;
    p.style.animationDelay = randomDelay ? `-${rand(0, fallDur)}s, -${rand(0, swayDur)}s` : `0s, 0s`;
    layer.appendChild(p);
  }

  function buildSparkles() {
    const layer = $('#sparkles');
    const count = window.innerWidth < 640 ? 12 : 22;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      const size = rand(3, 8);
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.left = `${rand(0, 100)}%`;
      s.style.top = `${rand(0, 100)}%`;
      s.style.animationDuration = `${rand(2, 5)}s`;
      s.style.animationDelay = `-${rand(0, 5)}s`;
      layer.appendChild(s);
    }
  }

  buildClouds();
  buildPetals();
  buildSparkles();

  /* ---------------------------------------------------------------------
     12. SOFT AMBIENT AUDIO (procedural, no external files)
  --------------------------------------------------------------------- */
  let audioCtx = null;
  let soundOn = false;
  let ambientTimer = null;
  const soundToggleBtn = $('#sound-toggle');

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playNote(freq, time, dur = 1.1, gainPeak = 0.05) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainPeak, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + dur + 0.1);
  }

  const scale = [523.25, 587.33, 659.25, 783.99, 880.0]; // C major pentatonic-ish, soft & piano-like

  function playAmbientPiano() {
    if (!soundOn || !audioCtx) return;
    scheduleArpeggio();
    clearInterval(ambientTimer);
    ambientTimer = setInterval(scheduleArpeggio, 4200);
  }

  function scheduleArpeggio() {
    if (!soundOn || !audioCtx) return;
    const now = audioCtx.currentTime;
    let t = now;
    const notes = [pick(scale), pick(scale), pick(scale), pick(scale)];
    notes.forEach((f, i) => {
      playNote(f, t + i * 0.55, 1.3, 0.04);
    });
  }

  soundToggleBtn.addEventListener('click', () => {
    ensureAudio();
    soundOn = !soundOn;
    soundToggleBtn.textContent = soundOn ? '🔊' : '🔇';
    if (soundOn) {
      scheduleArpeggio();
      clearInterval(ambientTimer);
      ambientTimer = setInterval(scheduleArpeggio, 4200);
    } else {
      clearInterval(ambientTimer);
    }
  });

  /* ---------------------------------------------------------------------
     12b. POLISH: MAGIC PARTICLE BURSTS, CURSOR SPARKLES, CARD TILT, RIPPLES
  --------------------------------------------------------------------- */
  function sparkleBurst(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'burst-sparkle';
      const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3);
      const dist = rand(40, 120);
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      s.style.animationDelay = `${i * 0.02}s`;
      s.textContent = pick(['✨', '⋆', '·', '💫']);
      fxLayer.appendChild(s);
      setTimeout(() => s.remove(), 950);
    }
  }

  // Gentle cursor sparkle trail (desktop only, respects reduced motion)
  if (!prefersReducedMotion && hasFinePointer) {
    let lastTrailTime = 0;
    document.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - lastTrailTime < 70) return;
      lastTrailTime = now;
      const s = document.createElement('span');
      s.className = 'trail-sparkle';
      s.textContent = pick(['✨', '⋆', '·']);
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      cursorTrailLayer.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }, { passive: true });
  }

  // Subtle 3D tilt on glass cards for a premium feel
  if (!prefersReducedMotion && hasFinePointer) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.glass-card');
      $$('.glass-card.active-tilt').forEach((c) => {
        if (c !== card) {
          c.style.setProperty('--tiltX', '0deg');
          c.style.setProperty('--tiltY', '0deg');
          c.classList.remove('active-tilt');
        }
      });
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tiltX', `${(-py * 5).toFixed(2)}deg`);
      card.style.setProperty('--tiltY', `${(px * 5).toFixed(2)}deg`);
      card.classList.add('active-tilt');
    }, { passive: true });
  }

  // Ripple feedback on interactive elements
  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest('.glow-btn, .choice-btn, .treat-card, .icon-btn, .paw-tile');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    const computedPosition = getComputedStyle(target).position;
    if (computedPosition === 'static') target.style.position = 'relative';
    target.style.overflow = target.style.overflow || 'hidden';
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }, { passive: true });

  /* ---------------------------------------------------------------------
     12c. PRELOADER + BUDDY'S ENTRANCE WALK-ON
  --------------------------------------------------------------------- */
  function hidePreloader() {
    const pre = $('#preloader');
    if (!pre) { runIntroEntrance(); return; }
    pre.classList.add('hide');
    setTimeout(() => {
      pre.remove();
      runIntroEntrance();
    }, prefersReducedMotion ? 0 : 650);
  }

  function runIntroEntrance() {
    if (prefersReducedMotion) {
      dogStage.classList.remove('pre-entrance');
      onEnterScene('intro');
      return;
    }
    dogStage.classList.add('state-run');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => dogStage.classList.remove('pre-entrance'));
    });
    const settle = () => {
      dogStage.removeEventListener('transitionend', settle);
      setDogState('idle');
      say("Hi 😊\nMy human asked me to show you something.\nWould you come with me?", 999999);
      if (!prefersReducedMotion) sparkleBurst(window.innerWidth / 2, window.innerHeight * 0.55, 12);
    };
    dogStage.addEventListener('transitionend', settle);
    // safety fallback in case transitionend doesn't fire on some browsers
    setTimeout(() => {
      if (dogStage.classList.contains('state-run')) settle();
    }, 1400);
  }

  function startPreloaderSequence() {
    const MIN_VISIBLE = prefersReducedMotion ? 0 : 900;
    const started = performance.now();
    const finish = () => {
      const elapsed = performance.now() - started;
      setTimeout(hidePreloader, Math.max(0, MIN_VISIBLE - elapsed));
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(finish).catch(finish);
    } else {
      finish();
    }
  }

  /* ---------------------------------------------------------------------
     13. INIT
  --------------------------------------------------------------------- */
  updateProgress('intro');
  dogStage.classList.add('pre-entrance');
  setDogState('idle');
  if (document.readyState === 'complete') {
    startPreloaderSequence();
  } else {
    window.addEventListener('load', startPreloaderSequence);
  }
})();
