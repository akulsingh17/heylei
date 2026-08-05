/* script.js */
document.addEventListener('DOMContentLoaded', () => {
    // Environment Effects: Sakura Petals Generator
    const envEffects = document.getElementById('envEffects');
    function createPetal() {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        const size = Math.random() * 8 + 8;
        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.4}px`;
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.animationDuration = `${Math.random() * 6 + 6}s`;
        petal.style.animationDelay = `${Math.random() * 5}s`;
        envEffects.appendChild(petal);
        setTimeout(() => petal.remove(), 12000);
    }
    for (let i = 0; i < 15; i++) createPetal();
    setInterval(createPetal, 800);

    // Scene Navigation Manager
    function showScene(sceneId) {
        document.querySelectorAll('.scene').forEach(scene => {
            scene.classList.remove('active');
        });
        document.getElementById(sceneId).classList.add('active');
    }

    // Helper: Floating Hearts Effect
    function createHearts(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.classList.add('floating-heart');
            heart.innerHTML = ['❤️', '💖', '✨', '💛'][Math.floor(Math.random() * 4)];
            heart.style.left = `${x + (Math.random() * 60 - 30)}px`;
            heart.style.top = `${y + (Math.random() * 40 - 20)}px`;
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 1500);
        }
    }

    // Attempt audio playback on first interaction
    const bgMusic = document.getElementById('bgMusic');
    function playAudio() {
        if (bgMusic.paused) {
            bgMusic.volume = 0.2;
            bgMusic.play().catch(() => {});
        }
    }

    // --- OPENING SCENE ---
    const petMeBtn = document.getElementById('petMeBtn');
    petMeBtn.addEventListener('click', (e) => {
        playAudio();
        const rect = petMeBtn.getBoundingClientRect();
        createHearts(rect.left + rect.width / 2, rect.top, 8);
        
        // Dog happy jump animation
        const dog = document.getElementById('openingDog');
        dog.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        dog.style.transform = 'translateY(-30px) scale(1.1)';
        
        setTimeout(() => {
            showScene('scene-level1');
        }, 700);
    });

    // --- LEVEL 1: FETCH GAME ---
    let successfulFetches = 0;
    const fetchCountEl = document.getElementById('fetchCount');
    const tennisBall = document.getElementById('tennisBall');
    const fetchArea = document.getElementById('fetchArea');
    const fetchDog = document.getElementById('fetchDog');

    let isDragging = false;
    let ballStartX = 50, ballStartY = 50;

    tennisBall.addEventListener('mousedown', startDrag);
    tennisBall.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        isDragging = true;
        playAudio();
    }

    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', (e) => dragMove(e.touches[0]));

    function dragMove(e) {
        if (!isDragging) return;
        const rect = fetchArea.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x = Math.max(20, Math.min(x, rect.width - 40));
        y = Math.max(20, Math.min(y, rect.height - 40));
        tennisBall.style.position = 'absolute';
        tennisBall.style.left = `${x}px`;
        tennisBall.style.top = `${y}px`;
    }

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        
        // Animate dog running to ball
        fetchDog.style.transition = 'transform 0.6s ease-in-out';
        fetchDog.style.transform = 'translateX(120px) scale(1.05)';
        
        setTimeout(() => {
            tennisBall.style.display = 'none';
            createHearts(window.innerWidth / 2, window.innerHeight / 2, 3);
            
            setTimeout(() => {
                fetchDog.style.transform = 'translateX(0) scale(1)';
                successfulFetches++;
                fetchCountEl.textContent = successfulFetches;
                
                if (successfulFetches >= 3) {
                    setTimeout(() => showScene('scene-level2'), 800);
                } else {
                    tennisBall.style.display = 'block';
                    tennisBall.style.position = 'static';
                }
            }, 600);
        }, 600);
    }

    // --- LEVEL 2: TREAT GAME ---
    const treatCards = document.querySelectorAll('.treat-card');
    const treatFeedback = document.getElementById('treatFeedback');

    treatCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const treatType = card.getAttribute('data-treat');
            const rect = card.getBoundingClientRect();
            
            if (treatType === 'bone') {
                createHearts(rect.left + rect.width / 2, rect.top, 6);
                treatFeedback.style.color = '#2a9d8f';
                treatFeedback.textContent = "Yum! Buddy's absolute favourite! 🎉";
                setTimeout(() => showScene('scene-level3'), 1200);
            } else if (treatType === 'broccoli') {
                treatFeedback.style.color = '#e76f51';
                treatFeedback.textContent = "Blech! Buddy wrinkled his nose! Try again! 🐶🥦";
            } else {
                treatFeedback.style.color = '#e76f51';
                treatFeedback.textContent = "Too sour! Buddy made a funny face! 🍋✨";
            }
        });
    });

    // --- LEVEL 3: RELATIONSHIP QUESTION ---
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.getAttribute('data-status');
            if (status === 'committed') {
                showScene('scene-committed');
            } else {
                showScene('scene-level4');
                initPuzzle();
            }
        });
    });

    // --- LEVEL 4: MEMORY PUZZLE ---
    const puzzleGrid = document.getElementById('puzzleGrid');
    let nextExpectedTile = 1;

    function initPuzzle() {
        puzzleGrid.innerHTML = '';
        nextExpectedTile = 1;
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, '🐾'];
        numbers.sort(() => Math.random() - 0.5);

        numbers.forEach(num => {
            const tile = document.createElement('div');
            tile.classList.add('puzzle-tile');
            tile.textContent = num;
            tile.addEventListener('click', () => {
                if (num === nextExpectedTile) {
                    tile.classList.add('solved');
                    nextExpectedTile++;
                    createHearts(tile.getBoundingClientRect().x, tile.getBoundingClientRect().y, 2);
                    if (nextExpectedTile > 8) {
                        setTimeout(() => showScene('scene-level5'), 1000);
                    }
                } else if (num !== '🐾') {
                    tile.style.transform = 'translateX(5px)';
                    setTimeout(() => tile.style.transform = 'none', 200);
                }
            });
            puzzleGrid.appendChild(tile);
        });
    }

    // --- LEVEL 5: POEM REVEAL ---
    const envelope = document.getElementById('envelope');
    const envelopeContainer = document.getElementById('envelopeContainer');
    const poemCard = document.getElementById('poemCard');
    const poemText = document.getElementById('poemText');

    const fullPoem = `In quiet moments, soft and sweet,
Where busy days and daydreams meet,
A gentle thought begins to grow,
Like morning light upon the snow.

It isn't loud, it isn't grand,
Just like a warm touch of a hand,
A smiling face, a friendly spark,
That brings a brightness to the dark.

And as these little moments blend,
It's nice to share them with a friend. 🌸`;

    envelopeContainer.addEventListener('click', () => {
        envelope.classList.add('open');
        playAudio();
        setTimeout(() => {
            envelopeContainer.classList.add('hidden');
            poemCard.classList.remove('hidden');
            typeWriterPoem();
        }, 700);
    });

    function typeWriterPoem() {
        let i = 0;
        poemText.textContent = '';
        function type() {
            if (i < fullPoem.length) {
                poemText.textContent += fullPoem.charAt(i);
                i++;
                setTimeout(type, 25);
            } else {
                // Add a continue button after poem finishes
                const nextBtn = document.createElement('button');
                nextBtn.classList.add('btn-glass');
                nextBtn.style.marginTop = '15px';
                nextBtn.textContent = 'Continue 🐾';
                nextBtn.addEventListener('click', () => showScene('scene-level6'));
                poemCard.appendChild(nextBtn);
            }
        }
        type();
    }

    // --- LEVEL 6: FINAL PROPOSAL SCREEN ---
    const respBtns = document.querySelectorAll('.resp-btn');
    const responseDisplay = document.getElementById('responseDisplay');

    respBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const resp = btn.getAttribute('data-resp');
            const rect = btn.getBoundingClientRect();
            createHearts(rect.left, rect.top, 6);

            if (resp === 'yes') {
                responseDisplay.textContent = "Yay! Buddy is doing happy tail wags! ☕🐾 See you soon!";
            } else if (resp === 'maybe') {
                responseDisplay.textContent = "That's completely okay! Take all the time you need. 😊";
            } else {
                responseDisplay.textContent = "No rush at all! Buddy and I are just glad you stopped by. 🌸";
            }
        });
    });
});
