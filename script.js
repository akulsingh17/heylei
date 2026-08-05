// --- BACKGROUND & PETALS & CLOUDS ENGINE ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

let width, height;
function resize() {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const petals = [];
for (let i = 0; i < 35; i++) {
    petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 6 + 4,
        d: Math.random() * 35,
        color: Math.random() > 0.5 ? '#ffb3c1' : '#ffccd5',
        tilt: Math.random() * 10 - 10,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
        tiltAngle: 0
    });
}

const clouds = [];
for (let i = 0; i < 5; i++) {
    clouds.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.4),
        speed: Math.random() * 0.2 + 0.1,
        scale: Math.random() * 0.8 + 0.6
    });
}

function drawCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.arc(25, -15, 25, 0, Math.PI * 2);
    ctx.arc(50, 0, 30, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function updateBackground() {
    bgCtx.clearRect(0, 0, width, height);

    // Draw & Move Clouds
    clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > width + 100) c.x = -100;
        drawCloud(bgCtx, c.x, c.y, c.scale);
    });

    // Draw & Move Petals
    petals.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.d) + 1 + p.r / 2) * 0.5;
        p.x += Math.sin(p.tiltAngle) * 1.5;

        if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
        }

        bgCtx.beginPath();
        bgCtx.fillStyle = p.color;
        bgCtx.ellipse(p.x, p.y, p.r, p.r * 0.6, p.tiltAngle, 0, Math.PI * 2);
        bgCtx.fill();
    });

    requestAnimationFrame(updateBackground);
}
updateBackground();


// --- PROCEDURAL GOLDEN RETRIEVER ANIMATION ENGINE ---
const dogCanvas = document.getElementById('dogCanvas');
const dogCtx = dogCanvas.getContext('2d');

let dogState = 'walkIn'; // walkIn, idle, run, jump, sit, sleep
let dogX = -100;
let dogY = 120;
let targetX = window.innerWidth / 2;
let animTimer = 0;
let pawPrints = [];

function resizeDogStage() {
    dogCanvas.width = window.innerWidth;
    dogCanvas.height = 250;
}
window.addEventListener('resize', resizeDogStage);
resizeDogStage();

// Mouse/Cursor tracking for idle look
let mouseX = window.innerWidth / 2;
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
});

function drawDog(x, y, state) {
    dogCtx.save();
    dogCtx.translate(x, y);

    animTimer += 0.1;
    let breath = Math.sin(animTimer) * 2;
    let tailWag = Math.sin(animTimer * 8) * 15;
    let headTilt = (state === 'idle') ? Math.sin(animTimer * 2) * 5 : 0;
    let blink = (Math.floor(animTimer * 2) % 15 === 0) ? 0.1 : 1;

    // Body
    dogCtx.fillStyle = '#f4a261';
    dogCtx.beginPath();
    dogCtx.ellipse(0, 10 + breath, 50, 32, 0, 0, Math.PI * 2);
    dogCtx.fill();

    // Tail
    dogCtx.save();
    dogCtx.translate(-45, 0);
    dogCtx.rotate((tailWag * Math.PI) / 180);
    dogCtx.strokeStyle = '#e76f51';
    dogCtx.lineWidth = 8;
    dogCtx.lineCap = 'round';
    dogCtx.beginPath();
    dogCtx.moveTo(0, 0);
    dogCtx.quadraticCurveTo(-25, -20, -35, -10);
    dogCtx.stroke();
    dogCtx.restore();

    // Head
    dogCtx.save();
    dogCtx.translate(35, -15 + breath/2 + headTilt);

    dogCtx.fillStyle = '#f4a261';
    dogCtx.beginPath();
    dogCtx.arc(0, 0, 26, 0, Math.PI * 2);
    dogCtx.fill();

    // Ears
    dogCtx.fillStyle = '#e76f51';
    dogCtx.beginPath();
    dogCtx.ellipse(-12, 10, 10, 18, 0.3, 0, Math.PI * 2);
    dogCtx.ellipse(12, 10, 10, 18, -0.3, 0, Math.PI * 2);
    dogCtx.fill();

    // Eyes
    dogCtx.fillStyle = '#264653';
    let eyeLookX = (mouseX > x + 35) ? 2 : -2;
    dogCtx.beginPath();
    dogCtx.ellipse(-7 + eyeLookX, -3, 3, 3 * blink, 0, 0, Math.PI * 2);
    dogCtx.ellipse(7 + eyeLookX, -3, 3, 3 * blink, 0, 0, Math.PI * 2);
    dogCtx.fill();

    // Snout & Nose
    dogCtx.fillStyle = '#ffffff';
    dogCtx.beginPath();
    dogCtx.ellipse(0, 6, 12, 9, 0, 0, Math.PI * 2);
    dogCtx.fill();

    dogCtx.fillStyle = '#264653';
    dogCtx.beginPath();
    dogCtx.arc(0, 3, 4, 0, Math.PI * 2);
    dogCtx.fill();

    dogCtx.restore();
    dogCtx.restore();
}

function updateDog() {
    dogCtx.clearRect(0, 0, dogCanvas.width, dogCanvas.height);

    if (dogState === 'walkIn') {
        dogX += 2;
        if (dogX >= dogCanvas.width / 2) {
            dogX = dogCanvas.width / 2;
            dogState = 'idle';
        }
    } else if (dogState === 'run') {
        dogX += 4;
        if (dogX > dogCanvas.width + 50) {
            dogX = -50;
        }
    }

    drawDog(dogX, dogY, dogState);
    requestAnimationFrame(updateDog);
}
updateDog();


// --- STORY & LEVEL MANAGEMENT ---
const storyContent = document.getElementById('story-content');
let currentLevel = 0;

const levels = [
    // Level 0: Opening Scene
    () => {
        storyContent.innerHTML = `
            <div class="speech-bubble">
                Hi 😊<br>My human asked me to show you something.<br>Would you come with me?
            </div>
            <button class="btn" id="petBtn">Pet Me 🐾</button>
        `;
        document.getElementById('petBtn').addEventListener('click', () => {
            dogState = 'run';
            setTimeout(() => {
                dogState = 'idle';
                dogX = dogCanvas.width / 2;
                loadLevel(1);
            }, 1000);
        });
    },

    // Level 1: Fetch Game
    () => {
        let throws = 0;
        storyContent.innerHTML = `
            <h2>Level 1: Fetch! 🎾</h2>
            <p>Drag the tennis ball to throw it for Buddy!</p>
            <div class="game-area" id="gameArea">
                <div class="draggable-ball" id="ball">🎾</div>
            </div>
            <p id="fetchCount">Successful throws: 0 / 3</p>
        `;

        const ball = document.getElementById('ball');
        const area = document.getElementById('gameArea');
        let isDragging = false;

        ball.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                throws++;
                document.getElementById('fetchCount').innerText = `Successful throws: ${throws} / 3`;
                ball.style.transform = 'translate(0, 0)';
                if (throws >= 3) {
                    setTimeout(() => loadLevel(2), 1000);
                }
            }
        });
        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = area.getBoundingClientRect();
                let x = e.clientX - rect.left - 22;
                let y = e.clientY - rect.top - 22;
                ball.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
    },

    // Level 2: Treat Game
    () => {
        storyContent.innerHTML = `
            <h2>Level 2: Buddy's Favourite Treat 🦴</h2>
            <p>Three treats! Which one is Buddy's absolute favourite?</p>
            <div class="treat-container">
                <span class="treat-item" data-treat="carrot">🥕</span>
                <span class="treat-item" data-treat="bone">🦴</span>
                <span class="treat-item" data-treat="broccoli">🥦</span>
            </div>
            <p id="treatMsg">Pick wisely!</p>
        `;

        document.querySelectorAll('.treat-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const treat = e.target.getAttribute('data-treat');
                const msg = document.getElementById('treatMsg');
                if (treat === 'bone') {
                    msg.innerText = "Yummy! Buddy loves bones best! 🎉";
                    setTimeout(() => loadLevel(3), 1200);
                } else if (treat === 'carrot') {
                    msg.innerText = "Crunchy, but not my favourite! Try again 🐰";
                } else {
                    msg.innerText = "Blech! Broccoli is for humans! 🥦🤢";
                }
            });
        });
    },

    // Level 3: Relationship Question
    () => {
        storyContent.innerHTML = `
            <h2>Level 3: A Gentle Question 🌸</h2>
            <p>Before I continue...<br>My human wanted me to ask...</p>
            <button class="btn btn-choice" data-status="single">❤️ I'm single</button><br>
            <button class="btn btn-choice" data-status="committed">💛 I'm committed</button><br>
            <button class="btn btn-choice" data-status="none">🌼 I'd rather not answer</button>
        `;

        document.querySelectorAll('.btn-choice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.getAttribute('data-status');
                if (status === 'committed') {
                    storyContent.innerHTML = `
                        <h2>Thank you for sharing! 💛</h2>
                        <p>I hope this little adventure still made you smile 😊</p>
                        <button class="btn" onclick="location.reload()">Start Over</button>
                    `;
                } else {
                    loadLevel(4);
                }
            });
        });
    },

    // Level 4: Memory Puzzle
    () => {
        storyContent.innerHTML = `
            <h2>Level 4: Memory Puzzle 🧩</h2>
            <p>Tap all the tiles to light them up!</p>
            <div class="puzzle-grid" id="puzzleGrid"></div>
        `;

        const grid = document.getElementById('puzzleGrid');
        let solvedCount = 0;
        for (let i = 0; i < 9; i++) {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            tile.innerText = i + 1;
            tile.addEventListener('click', () => {
                if (!tile.classList.contains('solved')) {
                    tile.classList.add('solved');
                    solvedCount++;
                    if (solvedCount === 9) {
                        setTimeout(() => loadLevel(5), 1000);
                    }
                }
            });
            grid.appendChild(tile);
        }
    },

    // Level 5: Poem Reveal
    () => {
        storyContent.innerHTML = `
            <h2>Level 5: A Special Letter 💌</h2>
            <div class="poem-box" id="poemBox"></div>
            <button class="btn" id="nextLevelBtn" style="display:none;">Continue 🐾</button>
        `;

        const poemText = `Like morning sun upon the dew,
My days grow brighter knowing you.
A gentle soul, a heart so sweet,
With every laugh, my world's complete.`;

        let i = 0;
        const poemBox = document.getElementById('poemBox');
        function typeWriter() {
            if (i < poemText.length) {
                poemBox.innerHTML += poemText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                document.getElementById('nextLevelBtn').style.display = 'inline-block';
            }
        }
        typeWriter();

        document.getElementById('nextLevelBtn').addEventListener('click', () => loadLevel(6));
    },

    // Level 6: Final Screen
    () => {
        storyContent.innerHTML = `
            <h2>A Final Question ☕</h2>
            <p>I just wanted you to know<br>I really enjoy talking to you.<br>Would you like to go for coffee sometime?</p>
            <button class="btn final-ans" data-resp="yes">😊 Yes</button>
            <button class="btn btn-secondary final-ans" data-resp="maybe">🤍 Maybe</button>
            <button class="btn btn-secondary final-ans" data-resp="think">🌸 Let me think</button>
            <p id="finalResponse" style="margin-top: 15px; font-weight: 600; color: var(--accent-pink);"></p>
        `;

        document.querySelectorAll('.final-ans').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resp = e.target.getAttribute('data-resp');
                const finalResp = document.getElementById('finalResponse');
                if (resp === 'yes') {
                    finalResp.innerText = "Yay! My human is going to be so happy! ☕✨";
                } else if (resp === 'maybe') {
                    finalResp.innerText = "No rush at all! Take all the time you need 🤍";
                } else {
                    finalResp.innerText = "Take a breather! Buddy will wait right here 🌸🐾";
                }
            });
        });
    }
];

function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    const card = document.getElementById('ui-card');
    card.style.animation = 'none';
    card.offsetHeight; /* trigger reflow */
    card.style.animation = 'cardPopUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    
    // Play subtle background audio on first interaction
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.play().catch(() => {});

    levels[currentLevel]();
}

// Initialize Opening Scene
loadLevel(0);
