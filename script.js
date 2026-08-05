## script.js
```javascript
const scenes=[...document.querySelectorAll('.scene')];
const show=id=>scenes.forEach(s=>s.classList.toggle('active',s.id===id));

const petals=document.getElementById('petals');
const sparkles=document.getElementById('sparkles');
const app=document.getElementById('app');

const poemText=`there is a quiet peace your presence leaves behind
somehow, my eyes always find you before my thoughts do
perhaps the silence between us has been speaking all along
and your eyes.....they hold a depth that makes me forget where I end and where you belong`;

const messages={
  yes:'That makes Boogie very happy 🥹✨ Coffee date approved.',
  maybe:'Aww, Boogie will wait patiently and keep smiling 🤍',
  think:'No rush at all. Boogie believes in gentle timelines 🌷'
};

for(let i=0;i<22;i++){
  const p=document.createElement('i');
  p.className='petal';
  p.style.left=Math.random()*100+'vw';
  p.style.animationDelay=Math.random()*12+'s';
  p.style.animationDuration=8+Math.random()*10+'s';
  p.style.opacity=.55+Math.random()*.4;
  petals.appendChild(p);
}

for(let i=0;i<40;i++){
  const s=document.createElement('i');
  s.className='spark';
  s.style.left=Math.random()*100+'vw';
  s.style.top=Math.random()*100+'vh';
  s.style.animationDelay=Math.random()*6+'s';
  sparkles.appendChild(s);
}

document.getElementById('petMe').addEventListener('click',()=>{
  spawnHearts();
  show('scene-level1');
});

function spawnHearts(){
  for(let i=0;i<16;i++){
    const h=document.createElement('div');
    h.textContent='💖';
    h.style.position='fixed';
    h.style.left='50%';
    h.style.top='65%';
    h.style.fontSize='1.3rem';
    h.style.transform='translate(-50%,-50%)';
    h.style.transition='all 1s ease';
    document.body.appendChild(h);
    requestAnimationFrame(()=>{
      h.style.left=50+(Math.random()*36-18)+'%';
      h.style.top=30+Math.random()*20+'%';
      h.style.opacity='0';
      h.style.transform='translate(-50%,-50%) scale(1.8)';
    });
    setTimeout(()=>h.remove(),1100);
  }
}

const ball=document.getElementById('ball'),
  dogRunner=document.getElementById('dogRunner'),
  throwsBar=document.getElementById('throwsBar');

let throws=0,drag=false,poemStarted=false;

ball.addEventListener('pointerdown',e=>{
  drag=true;
  ball.setPointerCapture(e.pointerId);
  ball.style.cursor='grabbing';
});

ball.addEventListener('pointermove',e=>{
  if(!drag) return;
  const r=app.getBoundingClientRect();
  ball.style.left=Math.min(88,Math.max(4,((e.clientX-r.left)/r.width)*100))+'%';
  ball.style.top=Math.min(76,Math.max(20,((e.clientY-r.top)/r.height)*100))+'%';
});

ball.addEventListener('pointerup',()=>{
  if(!drag) return;
  drag=false;
  ball.style.cursor='grab';
  throwBall();
});

function throwBall(){
  ball.classList.remove('throwing');
  void ball.offsetWidth;
  ball.classList.add('throwing');
  dogRunner.classList.add('run');
  setTimeout(()=>dogRunner.classList.add('catch'),520);
  setTimeout(()=>{
    dogRunner.classList.remove('run','catch');
    ball.style.left='18%';
    ball.style.top='62%';
    ball.classList.remove('throwing');
    throws++;
    throwsBar.style.width=throws/3*100+'%';
    document.getElementById('level1Msg').textContent=throws<3?`Nice throw ${throws}/3!`:'';
    if(throws>=3){
      document.getElementById('level1Msg').textContent='Boogie got the ball three times!';
      setTimeout(()=>show('scene-level2'),900);
    }
  },900);
}

document.querySelectorAll('.treat').forEach(btn=>btn.addEventListener('click',()=>{
  const ok=btn.dataset.correct==='true';
  document.getElementById('level2Msg').textContent=ok?'Boogie does a tiny happy spin! 🎉':'Boogie makes a very dramatic but polite face 😅';
  if(ok) setTimeout(()=>show('scene-level3'),1000);
}));

document.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>{
  const state=btn.dataset.state;
  const msg=document.getElementById('level3Msg');
  if(state==='committed'){
    msg.textContent='I hope this little adventure still made you smile 😊';
    setTimeout(()=>show('scene-level6'),1200);
  }else{
    msg.textContent='Thanks for answering gently. Boogie keeps going with a wag!';
    setTimeout(()=>show('scene-level4'),1000);
  }
}));

const puzzle=document.getElementById('puzzle');
let tiles=[1,2,3,4,5,6,7,8,0],selected=null;

function renderPuzzle(){
  puzzle.innerHTML='';
  tiles.forEach((n,i)=>{
    const t=document.createElement('button');
    t.className='tile';
    t.textContent=n||'🐶';
    t.dataset.idx=i;
    if(selected===i)t.style.outline='3px solid #ff9fc6';
    t.addEventListener('click',()=>{
      if(selected===null){
        selected=i;
        renderPuzzle();
        return;
      }
      const a=tiles[selected],b=tiles[i];
      [tiles[selected],tiles[i]]=[b,a];
      selected=null;
      renderPuzzle();
      checkPuzzle();
    });
    puzzle.appendChild(t);
  });
}

function checkPuzzle(){
  if(tiles.join('')==='123456780'){
    document.getElementById('level4Msg').textContent='Perfect! The envelope appears.';
    setTimeout(()=>{
      show('scene-level5');
      startPoem();
    },900);
  }
}

renderPuzzle();

function startPoem(){
  if(poemStarted)return;
  poemStarted=true;
  const el=document.getElementById('poem');
  const env=document.getElementById('envelope');
  env.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:700,iterations:2});
  let i=0;
  const timer=setInterval(()=>{
    el.textContent=poemText.slice(0,++i);
    if(i>=poemText.length){
      clearInterval(timer);
      document.getElementById('level5Msg').textContent='';
      setTimeout(()=>show('scene-level6'),2200);
    }
  },28);
}

document.getElementById('envelope').addEventListener('click',startPoem);

document.querySelectorAll('.response').forEach(btn=>btn.addEventListener('click',()=>{
  document.getElementById('level6Msg').textContent=messages[btn.dataset.response];
}));

setInterval(()=>{
  const s=document.createElement('span');
  s.className='petal';
  s.textContent='✨';
  s.style.left=Math.random()*100+'vw';
  s.style.top='-20px';
  s.style.animation='fadeUp 2.2s ease forwards';
  sparkles.appendChild(s);
  setTimeout(()=>s.remove(),2300);
},1800);
```


- `envelope`
