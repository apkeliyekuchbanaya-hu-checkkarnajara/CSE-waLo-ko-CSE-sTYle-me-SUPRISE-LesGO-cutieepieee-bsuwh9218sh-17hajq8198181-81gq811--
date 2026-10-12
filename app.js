/* =========================================================
   CUTIEEPIEE BIRTHDAY STORY — editable config
   ========================================================= */
const CONFIG = {
  name: "Cutieeepieee",
  password: "1327",
  bgm: "assets/audio/since-tum-bgm.mp3",
  fallbackBgm: "assets/audio/soft-ambient-bgm.mp3",
  photos: [
    {file:"photo01.jpg", caption:"That smile. Always my favourite.", land:false},
    {file:"photo02.jpg", caption:"Simplicity looks beautiful on you.", land:true},
    {file:"photo03.jpg", caption:"A little frame, a lot of feelings.", land:false},
    {file:"photo04.jpg", caption:"Pretty without even trying.", land:true},
    {file:"photo05.jpg", caption:"One of my favourite views.", land:false},
    {file:"photo06.jpg", caption:"Just you being you. 🤍", land:false}
  ]
};

const $ = (s, p=document)=>p.querySelector(s);
const $$ = (s, p=document)=>[...p.querySelectorAll(s)];
const scenes = $$(".scene");
const transition = $("#transition");
const toast = $("#toast");
let sfxOn = true, musicOn = true, audioStarted = false;

function goTo(id){
  transition.classList.remove("run"); void transition.offsetWidth; transition.classList.add("run");
  setTimeout(()=>{
    scenes.forEach(s=>s.classList.remove("active"));
    $("#"+id).classList.add("active");
    window.scrollTo({top:0,behavior:"instant"});
  },420);
}
function toastMsg(msg){
  toast.textContent=msg; toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1500);
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

/* Ambient particles */
const ambient = $("#ambient");
for(let i=0;i<20;i++){
  const p=document.createElement("span"); p.className="ambient-petal";
  p.textContent=["✦","✧","♡","❀","·"][i%5];
  p.style.left=(Math.random()*100)+"%"; p.style.top=(Math.random()*100)+"%";
  p.style.animationDelay=(Math.random()*5)+"s"; p.style.fontSize=(8+Math.random()*18)+"px";
  ambient.appendChild(p);
}

/* Web Audio SFX — no extra sound files required */
let ctx;
function audioCtx(){ if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)(); return ctx; }
function tone(freq=520,dur=.08,type="sine",gain=.04){
  if(!sfxOn)return;
  const c=audioCtx(),o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(gain,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);
  o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur+.02);
}
function sfx(kind){
  if(kind==="click") tone(520,.06,"sine",.025);
  if(kind==="catch"){tone(680,.07,"sine",.035);setTimeout(()=>tone(900,.1,"sine",.025),50)}
  if(kind==="match"){tone(520,.08,"triangle",.035);setTimeout(()=>tone(760,.12,"triangle",.03),70)}
  if(kind==="pop"){tone(170,.09,"sine",.05);setTimeout(()=>tone(90,.06,"sine",.02),30)}
  if(kind==="success"){tone(520,.1,"triangle",.04);setTimeout(()=>tone(700,.1,"triangle",.04),90);setTimeout(()=>tone(920,.18,"triangle",.04),180)}
  if(kind==="wrong"){tone(170,.12,"sawtooth",.025);setTimeout(()=>tone(120,.1,"sawtooth",.018),100)}
  if(kind==="unlock"){tone(430,.1,"sine",.04);setTimeout(()=>tone(620,.16,"sine",.04),100);setTimeout(()=>tone(880,.24,"sine",.04),220)}
}
$("#sfxToggle").onclick=()=>{sfxOn=!sfxOn;$("#sfxToggle").textContent=sfxOn?"✦":"×"; if(sfxOn)sfx("click")};
const bgm=$("#bgm"); bgm.volume=.32;
async function startMusic(){
  if(audioStarted || !musicOn)return;
  try{
    await bgm.play();
    audioStarted=true;
  }catch(e){
    // If the requested personal BGM is not present yet, keep music working
    // with the included gentle fallback track. Adding since-tum-bgm.mp3 later
    // automatically restores the requested track.
    if(!bgm.dataset.fallback){
      bgm.dataset.fallback="1";
      bgm.src=CONFIG.fallbackBgm;
      bgm.load();
      try{await bgm.play();audioStarted=true;toastMsg("Soft BGM is playing ♡ Add your Since Tum track anytime.");}
      catch(err){toastMsg("Tap the music button to start BGM ♫");}
    }
  }
}
$("#musicToggle").onclick=async()=>{musicOn=!musicOn;$("#musicToggle").textContent=musicOn?"♫":"×";if(musicOn){await startMusic()}else{bgm.pause()}};
function fadeMusic(target=.32,ms=800){
  const start=bgm.volume, t0=performance.now();
  function f(t){const p=Math.min(1,(t-t0)/ms);bgm.volume=start+(target-start)*p;if(p<1)requestAnimationFrame(f)}
  requestAnimationFrame(f);
}

/* Permission */
const reaction=$("#permissionReaction img"), response=$("#permissionResponse"), permissionTitle=$("#permissionTitle"), heroLines=[...document.querySelectorAll("#permission .hero-line")];
function showPermissionResponse(){
  permissionTitle.classList.add("hidden");
  heroLines.forEach(el=>el.classList.add("hidden"));
  $("#choiceRow").classList.add("hidden");
  response.classList.remove("hidden");
}
function restorePermissionPage(){
  permissionTitle.classList.remove("hidden");
  heroLines.forEach(el=>el.classList.remove("hidden"));
  response.classList.add("hidden");
  $("#choiceRow").classList.remove("hidden");
}
$("#yesBtn").onclick=async()=>{
  sfx("success"); startMusic();
  reaction.src="assets/stickers/blep-cat.jpg";
  response.innerHTML="Good Girl, BTW<br><b>Are you really excited ?</b><br><button id='excitedBtn' class='btn primary' style='margin-top:12px'>I am 😳</button>";
  showPermissionResponse();
  await sleep(100); $("#excitedBtn").onclick=()=>{sfx("click");goTo("catch");prepareCatch()};
};
$("#noBtn").onclick=()=>{
  sfx("wrong"); reaction.src="assets/stickers/angry-cat.jpg";
  response.innerHTML="Itni Himmat, Haan ? 😾<br><button id='backBtn' class='btn primary' style='margin-top:12px'>Go Back</button>";
  showPermissionResponse();
  $("#backBtn").onclick=()=>{reaction.src="assets/stickers/pink-bow-cat.jpg";restorePermissionPage();sfx("click")};
};

/* Catch hearts */
let catchRunning=false, score=0,lives=3,combo=1,heartTimer,heartSpawnTimer;
const catchPraise=["Amazing !","Cutie !","So cute !","Perfect !"];
let praiseIndex=0;
function showCatchFeedback(text,miss=false){
  const el=$("#catchFeedback");
  el.textContent=text;
  el.className="catch-feedback"+(miss?" miss":"");
  void el.offsetWidth;
  el.classList.add("show");
}
function prepareCatch(){
  score=0;lives=3;combo=1;praiseIndex=0;
  $("#heartScore").textContent="0/10";$("#heartLives").textContent="♥ ♥ ♥";$("#heartCombo").textContent="x1";
  $("#catchFeedback").className="catch-feedback";
  $("#catchFeedback").textContent="";
  $("#catcher").classList.remove("sad");
  $("#heartComplete").classList.add("hidden");
  $("#startHeartGame").classList.remove("hidden");
}
function spawnHeart(){
  if(!catchRunning)return;
  const board=$("#heartGame"), h=document.createElement("div");h.className="falling-heart";h.textContent=["💗","💖","💘","💕"][Math.floor(Math.random()*4)];
  h.style.left=(6+Math.random()*88)+"%";h.style.top="-40px";
  board.appendChild(h);
  const speed=230+Math.random()*180+score*18;
  let last=performance.now(), y=-40;
  function frame(now){
    if(!h.isConnected || !catchRunning)return;
    const dt=(now-last)/1000;last=now;y+=speed*dt;h.style.top=y+"px";
    const cr=$("#catcher").getBoundingClientRect(),hr=h.getBoundingClientRect();
    if(hr.bottom>=cr.top && hr.left<cr.right && hr.right>cr.left){
      h.classList.add("catch-pop");sfx("catch");score++;combo=Math.min(5,combo+1);
      showCatchFeedback(score>=10 ? "That's my girl !" : catchPraise[praiseIndex%catchPraise.length]);praiseIndex++;
      $("#heartScore").textContent=`${score}/10`;$("#heartCombo").textContent="x"+combo;
      if(score>=10){
        catchRunning=false;
        clearInterval(heartSpawnTimer);
        cancelAnimationFrame(heartTimer);
        setTimeout(()=>{
          sfx("success");
          $("#heartComplete").classList.remove("hidden");
          // Let her enjoy the victory message at her own pace; continue is user-controlled.
        },420);
        return;
      }
      setTimeout(()=>h.remove(),250);return;
    }
    if(y>board.clientHeight+20){
      h.classList.add("missed");
      lives--;combo=1;
      $("#heartCombo").textContent="x1";
      $("#heartLives").textContent="♥ ".repeat(Math.max(lives,0)).trim();
      $("#catcher").classList.remove("sad");void $("#catcher").offsetWidth;$("#catcher").classList.add("sad");
      showCatchFeedback("Aww 😿 Missed!",true);
      setTimeout(()=>h.remove(),560);
      if(lives<=0){catchRunning=false;clearInterval(heartSpawnTimer);toastMsg("Aww 😭 Try again, you got this!");$("#startHeartGame").classList.remove("hidden");}
      return;
    }
    heartTimer=requestAnimationFrame(frame);
  }
  heartTimer=requestAnimationFrame(frame);
  setTimeout(()=>{if(h.isConnected)h.remove()},4000);
}
let catchCountdownActive=false;
function startCatchCountdown(){
  if(catchRunning||catchCountdownActive)return;
  catchCountdownActive=true;prepareCatch();$("#startHeartGame").classList.add("hidden");
  const board=$("#heartGame");
  let overlay=$("#catchCountdown");
  if(!overlay){overlay=document.createElement("div");overlay.id="catchCountdown";overlay.className="catch-countdown hidden";overlay.setAttribute("aria-live","assertive");overlay.setAttribute("aria-label","Game countdown");board.appendChild(overlay)}
  const steps=["3","2","1","Catch!"];let i=0;
  const showStep=()=>{
    overlay.textContent=steps[i];overlay.classList.remove("hidden","countdown-pop");void overlay.offsetWidth;overlay.classList.add("countdown-pop");
    if(steps[i]==="Catch!")sfx("success");else sfx("click");
    i++;
    if(i<steps.length){setTimeout(showStep,700)}else{
      setTimeout(()=>{overlay.classList.add("hidden");catchCountdownActive=false;catchRunning=true;
        heartSpawnTimer=setInterval(()=>{if(!catchRunning){clearInterval(heartSpawnTimer)}else spawnHeart()},620);
        setTimeout(()=>clearInterval(heartSpawnTimer),20000);
      },520);
    }
  };
  showStep();
}
$("#startHeartGame").onclick=startCatchCountdown;

/* Intro start runs the same countdown before play begins. */
$("#catchIntroStart").onclick=()=>{sfx("click");$("#catch").classList.remove("catch-intro-mode");$("#catchIntro").classList.add("hidden");startCatchCountdown()};
let pointerX=.5;
$("#heartGame").addEventListener("pointermove",e=>{
  const r=$("#heartGame").getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width;
  $("#catcher").style.left=(pointerX*100)+"%";
});
$("#heartGame").addEventListener("pointerdown",e=>{
  const r=$("#heartGame").getBoundingClientRect();$("#catcher").style.left=(((e.clientX-r.left)/r.width)*100)+"%";
});

$("#heartContinue").onclick=()=>{sfx("click");$("#heartComplete").classList.add("hidden");goTo("memory");initMemory()};

/* Memory */
const icons=["🌷","🌷","💗","💗","🧸","🧸","🌙","🌙"];
let first=null,second=null,lockBoard=false,matches=0,moves=0;

/* Intro-only start control; the original memory gameplay initializer remains unchanged. */
$("#startMemory").onclick=()=>{sfx("click");$("#memory").classList.remove("memory-intro-mode");$("#memoryIntro").classList.add("hidden");initMemory()};
function initMemory(){
  const arr=[...icons].sort(()=>Math.random()-.5), grid=$("#memoryGrid");grid.innerHTML="";
  first=second=null;lockBoard=false;matches=0;moves=0;$("#pairsFound").textContent="0/4";$("#memoryMoves").textContent="0";
  arr.forEach((icon,i)=>{
    const card=document.createElement("button");card.className="memory-card";card.dataset.icon=icon;
    card.innerHTML=`<div class="memory-inner"><div class="card-face card-front"></div><div class="card-face card-back">${icon}</div></div>`;
    card.onclick=()=>flipCard(card);grid.appendChild(card);
  });
}
function addMatchHearts(cardA,cardB){
  [cardA,cardB].forEach(card=>{
    const r=card.getBoundingClientRect(), host=$("#memory").getBoundingClientRect();
    for(let n=0;n<3;n++){
      const particle=document.createElement("span");particle.className="memory-heart-particle";particle.textContent="♥";
      particle.style.left=(r.left-host.left+r.width*(.25+Math.random()*.5))+"px";
      particle.style.top=(r.top-host.top+r.height*.35)+"px";
      particle.style.setProperty("--drift",((Math.random()-.5)*54)+"px");
      $("#memory").appendChild(particle);setTimeout(()=>particle.remove(),950);
    }
  });
}
function flipCard(card){
  if(lockBoard||card===first||card.classList.contains("matched")||card.classList.contains("flipped"))return;
  sfx("click");card.classList.add("flipped");
  if(!first){first=card;return}
  second=card;moves++;$("#memoryMoves").textContent=moves;lockBoard=true;
  if(first.dataset.icon===second.dataset.icon){
    const a=first,b=second;a.classList.add("matched");b.classList.add("matched");addMatchHearts(a,b);
    matches++;$("#pairsFound").textContent=`${matches}/4`;sfx("match");first=second=null;
    setTimeout(()=>{lockBoard=false;if(matches===4){
      sfx("success");$("#memoryComplete").classList.remove("hidden");
      // Keep the completion message visible until she chooses to continue.
    }},560);
  }else{
    first.classList.add("wrong-match");second.classList.add("wrong-match");sfx("wrong");
    const a=first,b=second;
    setTimeout(()=>{a.classList.remove("wrong-match","flipped");b.classList.remove("wrong-match","flipped");first=second=null;lockBoard=false},1050);
  }
}
$("#restartMemory").onclick=()=>{sfx("click");initMemory()};
$("#memoryContinue").onclick=()=>{sfx("click");$("#memoryComplete").classList.add("hidden");goTo("balloons");initBalloons()};

/* Balloons */
const words=["You","Are","So","Special","My Cutieeepieee"];

/* Intro-only start control; the original balloon gameplay initializer remains unchanged. */
$("#startBalloons").onclick=()=>{sfx("click");$("#balloons").classList.remove("balloon-intro-mode");$("#balloonIntro").classList.add("hidden");initBalloons()};
function initBalloons(){
  const area=$("#balloonArea");
  area.innerHTML='<div id="balloonWords" class="balloon-words" aria-live="polite"></div>';
  $("#balloonComplete").classList.add("hidden");
  popped=0;
  const positions=[[20,12],[65,7],[42,30],[16,55],[66,52]];
  const gradients=[
    ["#ff9fca","#d85f98"],
    ["#e8b8ff","#9b75d6"],
    ["#ffd1ae","#ef8b83"],
    ["#ff9abf","#c84f86"],
    ["#e9c8f5","#a97ac9"]
  ];
  words.forEach((word,i)=>{
    const b=document.createElement("div");
    b.className="balloon";
    b.dataset.word=word;
    b.dataset.i=i;
    b.innerHTML="";
    b.style.left=positions[i][0]+"%";
    b.style.top=positions[i][1]+"%";
    b.style.setProperty("--balloon-a",gradients[i][0]);
    b.style.setProperty("--balloon-b",gradients[i][1]);
    b.style.setProperty("--floatDur",`${4.8+Math.random()*2.4}s`);
    b.style.setProperty("--driftX",`${Math.round(-10+Math.random()*20)}px`);
    b.style.setProperty("--driftY",`${Math.round(-14+Math.random()*28)}px`);
    b.style.setProperty("--delay",`${(-Math.random()*2.5).toFixed(2)}s`);
    b.onclick=()=>popBalloon(b);
    area.appendChild(b);
  });
}
let popped=0;
function popBalloon(b){
  if(b.classList.contains("pop"))return;
  b.classList.add("pop");
  sfx("pop");

  // The revealed word stays behind the balloon. When the balloon pops away,
  // the word is already sitting exactly where it was hiding.
  const area=$("#balloonArea");
  const wordsLayer=$("#balloonWords");
  const r=b.getBoundingClientRect();
  const ar=area.getBoundingClientRect();
  const w=document.createElement("div");
  w.className="balloon-word";
  w.textContent=words[popped];
  w.style.left=(r.left-ar.left+r.width/2)+"px";
  w.style.top=(r.top-ar.top+r.height/2)+"px";
  w.style.setProperty("--delay",`${popped*90}ms`);
  w.style.setProperty("--index",popped);
  wordsLayer.appendChild(w);

  popped++;
  if(popped===5){
    // Give the last pop a beat, then slowly assemble the five words into one
    // cinematic vertical message before revealing the final line.
    setTimeout(()=>{
      wordsLayer.classList.add("assemble");
      // Arrange the complete sentence in one horizontal line using each
      // word's real width, so the long final phrase never overlaps.
      requestAnimationFrame(()=>{
        const items=[...wordsLayer.querySelectorAll(".balloon-word")];
        const gap=Math.max(5,Math.min(18,wordsLayer.clientWidth*0.012));
        const widths=items.map(el=>el.getBoundingClientRect().width);
        const total=widths.reduce((sum,w)=>sum+w,0)+gap*(items.length-1);
        const start=Math.max(10,(wordsLayer.clientWidth-total)/2);
        let x=start;
        items.forEach((el,i)=>{
          el.style.left=(x+widths[i]/2)+"px";
          el.style.top="30%";
          x+=widths[i]+gap;
        });
      });
      sfx("success");
      confettiBurst();
      setTimeout(()=>{
        $("#balloonComplete").classList.remove("hidden");
      },3400);
    },900);
  }
}
$("#toLock").onclick=()=>{sfx("click");goTo("lock");setupLock()};

/* Lock */
let pin="";
let pinProcessing=false;
let wrongPinTimer=null;
function setupLock(){
  if(wrongPinTimer){clearTimeout(wrongPinTimer);wrongPinTimer=null;}
  $("#wrongPinPopup")?.classList.add("hidden");
  $("#keypad").style.visibility="visible";
  $("#keypad").style.pointerEvents="auto";
  $("#lockMessage").textContent="";
  $("#lockIcon").classList.remove("lock-breaking","unlock");
  $("#lockIcon").textContent="🔒";
  $("#lockBreakBurst").innerHTML="";
  pinProcessing=false;
  $("#pinDots").style.visibility="visible";
  $(".lock-card").classList.remove("lock-shake","lock-success-sequence");
  pin="";renderPin();
  const keys=[1,2,3,4,5,6,7,8,9,"⌫",0,"↵"],k=$("#keypad");k.innerHTML="";
  keys.forEach(v=>{const b=document.createElement("button");b.textContent=v;b.onclick=()=>keyPress(String(v));k.appendChild(b)});
}
function renderPin(){$$("#pinDots i").forEach((d,i)=>d.classList.toggle("filled",i<pin.length))}
function keyPress(v){
  if(pinProcessing || $("#keypad").style.pointerEvents==="none")return;
  sfx("click");
  if(v==="⌫"){pin=pin.slice(0,-1);renderPin();return}
  if(v==="↵"){checkPin();return}
  if(pin.length<4){pin+=v;renderPin();if(pin.length===4)setTimeout(checkPin,180)}
}
function checkPin(){
  if(pinProcessing)return;
  if(pin===CONFIG.password){
    pinProcessing=true;
    // Keep the lock page visible: the lock pops, breaks, then hearts erupt from its position.
    $("#keypad").style.pointerEvents="none";
    $("#keypad").style.visibility="hidden";
    $("#pinDots").style.visibility="hidden";
    $("#lockMessage").textContent="";
    sfx("unlock");fadeMusic(.22,700);
    const icon=$("#lockIcon"), card=$(".lock-card"), breakLayer=$("#lockBreakBurst");
    card.classList.add("lock-success-sequence");
    icon.classList.remove("unlock"); void icon.offsetWidth; icon.classList.add("lock-breaking");
    breakLayer.innerHTML="";
    ["✦","╱","◆","╲","✧","•","🔓","✦"].forEach((glyph,i)=>{
      const bit=document.createElement("span");bit.className="lock-break-piece";bit.textContent=glyph;
      const angle=(i*45+Math.random()*18)*Math.PI/180, dist=42+Math.random()*75;
      bit.style.setProperty("--sx",`${Math.cos(angle)*dist}px`);
      bit.style.setProperty("--sy",`${Math.sin(angle)*dist}px`);
      bit.style.setProperty("--delay",`${Math.random()*100}ms`);
      breakLayer.appendChild(bit);
    });
    setTimeout(()=>{heartPartyBurst(icon.getBoundingClientRect());},420);
    setTimeout(()=>{goTo("cake");prepareCake();$("#pinDots").style.visibility="visible";},2180);
  }else{
    sfx("wrong");
    const card=$(".lock-card"), keypad=$("#keypad"), popup=$("#wrongPinPopup");
    $("#lockMessage").textContent="";
    pin="";renderPin();
    keypad.style.visibility="hidden";keypad.style.pointerEvents="none";
    popup.classList.remove("hidden");
    card.classList.add("lock-shake");
    setTimeout(()=>card.classList.remove("lock-shake"),500);
    if(wrongPinTimer) clearTimeout(wrongPinTimer);
    wrongPinTimer=setTimeout(()=>{popup.classList.add("hidden");keypad.style.visibility="visible";keypad.style.pointerEvents="auto";wrongPinTimer=null;pinProcessing=false;},1000);
  }
}

/* Cake — cinematic hero moment */
let cakeDone=false,micStream=null,analyser=null,micRAF=null;
function wakeCake(){
  if(cakeDone)return;
  const scene=$("#cake");
  scene.classList.add("cake-awake");
  setTimeout(()=>scene.classList.add("cake-cinematic-ready"),900);
}
function createCakePetals(){
  const box=$("#cakePetals"); if(!box)return; box.innerHTML="";
  for(let i=0;i<26;i++){
    const p=document.createElement("i");
    p.style.left=(Math.random()*100)+"%";
    p.style.top=(-10-Math.random()*20)+"%";
    p.style.setProperty("--x",`${Math.round((Math.random()-.5)*180)}px`);
    p.style.animationDelay=(Math.random()*1.3)+"s";
    p.style.animationDuration=(2.5+Math.random()*1.6)+"s";
    box.appendChild(p);
  }
}
function revealCake(){
  if(cakeDone)return; cakeDone=true;
  if(micStream)micStream.getTracks().forEach(t=>t.stop());
  if(micRAF)cancelAnimationFrame(micRAF);
  const scene=$("#cake");
  scene.classList.add("revealed");
  $("#candle").classList.add("off");
  $$(".mini-candle",scene).forEach(c=>c.classList.add("off"));
  $("#cakeInstruction").textContent="Wish made. 🤍";
  $("#blowBtn").disabled=true; $("#micBtn").disabled=true;
  $("#cakeCelebrationContinue").hidden=false;
  sfx("success"); confettiBurst(); createCakePetals();
  fadeMusic(.28,1000);
  setTimeout(()=>{ startCakeCelebration(); },520);
}
function extinguishCake(){ revealCake(); }
function prepareCake(){
  cakeDone=false;
  const scene=$("#cake");
  scene.classList.remove("cake-awake","cake-cinematic-ready","revealed");
  $("#blowBtn").disabled=false; $("#micBtn").disabled=false;
  $("#cakeCelebrationContinue").hidden=true;
  $("#cakeInstruction").textContent="Tap “Blow” or use the microphone to make your wish ♡";
  wakeCake();
}
$("#blowBtn").onclick=()=>extinguishCake();
$("#candle").onclick=()=>extinguishCake();
$("#micBtn").onclick=async()=>{
  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:true});
    const c=audioCtx(); analyser=c.createAnalyser(); analyser.fftSize=256;
    const source=c.createMediaStreamSource(micStream); source.connect(analyser);
    const data=new Uint8Array(analyser.frequencyBinCount);
    toastMsg("Mic on — gently blow 🌬");
    function detect(){
      analyser.getByteTimeDomainData(data); let sum=0;
      for(const v of data){const n=(v-128)/128;sum+=n*n}
      const rms=Math.sqrt(sum/data.length);
      if(rms>.18){extinguishCake();return}
      micRAF=requestAnimationFrame(detect);
    }
    detect();
  }catch(e){toastMsg("Mic unavailable — tap the flame instead.");}
};

function startCakeCelebration(){
  const overlay=$("#cakeCelebration");
  if(!overlay)return;
  overlay.classList.add("celebrating");
  overlay.setAttribute("aria-hidden","false");
  const rain=$("#celebrationRain");
  rain.innerHTML="";
  const pieces=["✦","✧","❀","♡","•","✦","❀"];
  for(let i=0;i<46;i++){
    const el=document.createElement("i");
    el.textContent=pieces[i%pieces.length];
    el.style.left=(Math.random()*100)+"%";
    el.style.setProperty("--drift",`${Math.round((Math.random()-.5)*150)}px`);
    el.style.setProperty("--fall",`${2.8+Math.random()*3.8}s`);
    el.style.setProperty("--delay",`${Math.random()*2.5}s`);
    el.style.fontSize=(10+Math.random()*13)+"px";
    rain.appendChild(el);
  }
}
const cakeCelebrationContinue=$("#cakeCelebrationContinue");
if(cakeCelebrationContinue){
  let continueLocked=false;
  const continueCakeCelebration=(e)=>{
    if(e){ e.preventDefault(); e.stopPropagation(); }
    if(continueLocked || cakeCelebrationContinue.hidden) return;
    continueLocked=true;
    sfx("click");
    const overlay=$("#cakeCelebration");
    if(overlay){
      overlay.classList.remove("celebrating");
      overlay.setAttribute("aria-hidden","true");
    }
    cakeCelebrationContinue.hidden=true;
    goTo("hug");
    setTimeout(()=>{ continueLocked=false; },700);
  };
  cakeCelebrationContinue.onclick=continueCakeCelebration;
  cakeCelebrationContinue.addEventListener("pointerdown",continueCakeCelebration,{passive:false});
}

/* Hug */
$("#surpriseBox").onclick=()=>{
  sfx("success");$("#surpriseBox").closest(".hug-gift-card").classList.add("hidden");$("#hugReveal").classList.remove("hidden");
};
$("#toLetter").onclick=()=>{sfx("click");fadeMusic(.2,700);goTo("letterOpening")};
$("#revealLetterButton").onclick=()=>{const opening=$("#letterOpening");sfx("click");opening.classList.add("opening-exit");setTimeout(()=>{opening.classList.remove("opening-exit");goTo("letter");initLetter()},650)};

/* Letter: exact supplied message, split into cinematic lines */
const letterPages=[
[
"I don't wish for you to be like anyone else,",
"I only wish for you to be yourself",
"but as a better version of yourself 💗",
"",
"And finally",
"\"My birthday wish for my gurl, the most beautiful soul I know.\"",
"I wish you enjoy your day",
"and achieve your dreams",
"as well as stay happy & healthy ✨"
],
[
"Keep smiling the way you do,",
"because your smile is my favourite thing",
"& you are the reason behind my smile also 😚",
"",
"I always remember our every moments,",
"scenes, memories and time spent with you",
"because it feels me like a home",
"and my personal comfort place 👀",
"",
"I don't know, ki ye enough hai ki nai",
"but meeting you is one of the best thing",
"that ever happened with me 🤞🏻"
],
[
"No matter how much my life get busy",
"but I hope you always remember one thing",
"that is 'You will always be my favourite",
"and important person in my entire life' 🫂",
"",
"I love you more than words",
"because words can be explained",
"but how much I love you it can't be explained 🤌🏻",
"",
"Last but not the least",
"I hope that someday I will be able to celebrate",
"your birthday with you 💖",
"",
"Happy 18th Madam Ji 🥂"
]
];
let letterPage=0;
function initLetter(){letterPage=0;showLetterPage()}
function showLetterPage(){
  const wrap=$("#letterLines");wrap.innerHTML="";
  letterPages[letterPage].forEach((line,i)=>{const p=document.createElement("p");p.className="letter-line";p.textContent=line||"\u00a0";wrap.appendChild(p);setTimeout(()=>p.classList.add("show"),180+i*150)});
  $("#letterPageNo").innerHTML=`<span class="page-dot">♡</span> Page ${letterPage+1} / 3`;
  $("#prevLetter").disabled=letterPage===0;
  $("#letterProgressFill").style.width=`${((letterPage+1)/3)*100}%`;
  $("#nextLetter").innerHTML=letterPage===2?'See the memories <span aria-hidden="true">→</span>':'Continue reading <span aria-hidden="true">→</span>';
}
$("#prevLetter").onclick=()=>{
  if(letterPage>0){sfx("click");letterPage--;showLetterPage()}
};
$("#nextLetter").onclick=()=>{
  sfx("click");
  if(letterPage<2){letterPage++;showLetterPage()}else{goTo("photos");renderPhotos()}
};

/* Photos */
let photoViewerIndex=0;
function renderPhotos(){
  const grid=$("#photoGrid");grid.innerHTML="";
  CONFIG.photos.forEach((p,i)=>{
    const card=document.createElement("article");
    card.className="photo-card premium-photo-card";
    card.dataset.index=i;
    card.innerHTML=`
      <button class="photo-card-button" type="button" aria-label="Open memory ${i+1}">
        <span class="photo-card-glow"></span>
        <span class="photo-image-wrap"><img src="assets/photos/${p.file}" alt="${p.caption}" loading="lazy"></span>
        <span class="photo-card-caption">${p.caption}</span>
        <span class="photo-card-open">View memory <b>↗</b></span>
      </button>`;
    card.querySelector(".photo-card-button").addEventListener("click",()=>openPhotoViewer(i));
    grid.appendChild(card);
    requestAnimationFrame(()=>setTimeout(()=>card.classList.add("photo-in"),90+i*75));
  });
}
function openPhotoViewer(index){
  photoViewerIndex=(index+CONFIG.photos.length)%CONFIG.photos.length;
  const viewer=$("#photoViewer");
  viewer.classList.add("open");viewer.setAttribute("aria-hidden","false");
  document.body.classList.add("photo-viewer-open");
  updatePhotoViewer(true);
}
function updatePhotoViewer(first=false){
  const p=CONFIG.photos[photoViewerIndex];
  const img=$("#photoViewerImage"), bg=$("#photoViewerBg"), cap=$("#photoViewerCaption");
  img.classList.remove("focus-in");
  void img.offsetWidth;
  img.src=`assets/photos/${p.file}`;img.alt=p.caption;
  bg.style.backgroundImage=`url("assets/photos/${p.file}")`;
  cap.textContent=p.caption;
  $("#photoViewerCount").textContent=`${photoViewerIndex+1} / ${CONFIG.photos.length}`;
  setTimeout(()=>img.classList.add("focus-in"),first?120:40);
}
function closePhotoViewer(){
  const viewer=$("#photoViewer");viewer.classList.remove("open");viewer.setAttribute("aria-hidden","true");document.body.classList.remove("photo-viewer-open");
}
$("#photoViewerClose").onclick=closePhotoViewer;
$("#photoPrev").onclick=()=>{photoViewerIndex=(photoViewerIndex-1+CONFIG.photos.length)%CONFIG.photos.length;updatePhotoViewer()};
$("#photoNext").onclick=()=>{photoViewerIndex=(photoViewerIndex+1)%CONFIG.photos.length;updatePhotoViewer()};
$("#photoViewer").addEventListener("click",e=>{if(e.target.id==="photoViewer"||e.target.id==="photoViewerBg")closePhotoViewer()});
document.addEventListener("keydown",e=>{if(!$("#photoViewer").classList.contains("open"))return;if(e.key==="Escape")closePhotoViewer();if(e.key==="ArrowLeft")$("#photoPrev").click();if(e.key==="ArrowRight")$("#photoNext").click()});
$("#toEnding").onclick=()=>{sfx("success");fadeMusic(.12,1200);goTo("ending")};

/* Correct-password sequence: hearts burst outward from the broken lock and briefly cover the screen. */
let heartPartyTimer=null;
function heartPartyBurst(lockRect){
  const layer=$("#heartPartyBurst"); if(!layer)return;
  layer.innerHTML=""; layer.classList.add("active");
  const hearts=["💗","💖","💘","💕","💓","💝","❤️","🩷","💞","🤍","💟","♥"];
  const cx=lockRect ? lockRect.left+lockRect.width/2 : window.innerWidth/2;
  const cy=lockRect ? lockRect.top+lockRect.height/2 : window.innerHeight/2;
  const count=96;
  for(let i=0;i<count;i++){
    const h=document.createElement("span"); h.className="heart-party-piece";
    h.textContent=hearts[Math.floor(Math.random()*hearts.length)];
    h.style.left=cx+"px"; h.style.top=cy+"px";
    // Distribute destinations over the whole viewport, all originating from the lock.
    const col=i%12, row=Math.floor(i/12);
    const tx=(col+.25+Math.random()*.5)*window.innerWidth/12;
    const ty=(row+.25+Math.random()*.5)*window.innerHeight/8;
    h.style.setProperty("--dx",`${Math.round(tx-cx)}px`);
    h.style.setProperty("--dy",`${Math.round(ty-cy)}px`);
    h.style.setProperty("--rot",`${Math.round((Math.random()-.5)*100)}deg`);
    h.style.setProperty("--size",`${Math.round(24+Math.random()*17)}px`);
    h.style.setProperty("--delay",`${Math.round(Math.random()*180)}ms`);
    layer.appendChild(h);
  }
  if(heartPartyTimer)clearTimeout(heartPartyTimer);
  heartPartyTimer=setTimeout(()=>{layer.classList.remove("active");layer.innerHTML="";heartPartyTimer=null;},2250);
}

/* Confetti */
function confettiBurst(){
  const box=$("#confetti");if(!box)return;
  for(let i=0;i<35;i++){const c=document.createElement("i");c.style.left=Math.random()*100+"%";c.style.top=(-5-Math.random()*15)+"%";c.style.background=["#d77b9e","#e6c56f","#c8b8e8","#f1a9bf","#fff"][i%5];c.style.transform=`rotate(${Math.random()*180}deg)`;c.style.animationDelay=Math.random()*.25+"s";box.appendChild(c);setTimeout(()=>c.remove(),2000)}
}

/* Easter eggs */
let taps=0,tapTimer;
document.addEventListener("dblclick",e=>{if(e.target.closest("button"))return; taps++;clearTimeout(tapTimer);tapTimer=setTimeout(()=>taps=0,900);if(taps>=2){toastMsg("Secret sparkle found ✦");sfx("success");confettiBurst();taps=0}});
document.addEventListener("pointerdown",e=>{if(e.target===document.body && e.pointerType==="touch"){}});

/* Initial state */
$("#musicToggle").title="BGM: on when browser allows";
renderPhotos();
