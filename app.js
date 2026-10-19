const PAY=0.85,N=150,START=10000;
const A={"EUR/USD":{p:1.0850,v:0.00014,d:5},"BTC/USD":{p:67250,v:26,d:2},"XAU/USD":{p:2650,v:0.7,d:2},"Volatility 100":{p:1000,v:1.4,d:2}};
const EXPS=[[30,"30s"],[60,"1m"],[300,"5m"]];
const P={},H={};
for(const k in A){let p=A[k].p;H[k]=[];for(let i=0;i<N;i++){p+=rnd()*A[k].v;H[k].push(+p.toFixed(A[k].d))}P[k]=H[k][N-1]}
function rnd(){return (Math.random()+Math.random()+Math.random()-1.5)*1.6}
const s={bal:START,sym:"EUR/USD",exp:60,open:[],hist:[],id:0};
try{const d=JSON.parse(localStorage.getItem("tl_demo")||"null");if(d){s.bal=d.bal;s.hist=d.hist||[]}}catch(e){}
const $=id=>document.getElementById(id);
const fmt=(n,d)=>n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const usd=n=>(n<0?"-":"")+"$"+fmt(Math.abs(n),2);
const save=()=>{try{localStorage.setItem("tl_demo",JSON.stringify({bal:s.bal+s.open.reduce((a,t)=>a+t.stake,0),hist:s.hist}))}catch(e){}};
let tt;function toast(m,c){const t=$("toast");t.textContent=m;t.style.borderLeftColor=c||"var(--accent)";t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),3200)}
function build(){
 $("tabs").innerHTML=Object.keys(A).map(k=>`<button class="tab${k===s.sym?" on":""}" data-s="${k}">${k}</button>`).join("");
 $("exp").innerHTML=EXPS.map(e=>`<button class="${e[0]===s.exp?"on":""}" data-e="${e[0]}">${e[1]}</button>`).join("");
 $("chips").innerHTML=[10,50,100,500].map(v=>`<button data-v="${v}">$${v}</button>`).join("");
 $("strip").innerHTML=Object.keys(A).map(k=>`<button class="chip" data-s="${k}"><small>${k}</small><b></b><i></i></button>`).join("");
}
$("tabs").onclick=e=>{const b=e.target.closest("[data-s]");if(b){s.sym=b.dataset.s;build();paint()}};
$("exp").onclick=e=>{const b=e.target.closest("[data-e]");if(b){s.exp=+b.dataset.e;build()}};
$("chips").onclick=e=>{const b=e.target.closest("[data-v]");if(b){$("stake").value=b.dataset.v;ret()}};
$("stake").oninput=ret;
function stake(){return Math.floor(+$("stake").value)||0}
function ret(){$("ret").textContent=usd(stake()*(1+PAY))}
function place(dir){
 const st=stake();
 if(st<1){toast("Enter a stake of at least $1.","var(--down)");return}
 if(st>s.bal){toast("Stake is higher than your balance. Lower it or reset the balance.","var(--down)");return}
 s.bal-=st;beep(520,.08);
 s.open.push({id:++s.id,sym:s.sym,dir,stake:st,entry:P[s.sym],start:Date.now(),end:Date.now()+s.exp*1000});
 save();paint();
}
$("hi").onclick=()=>place("up");$("lo").onclick=()=>place("down");
$("reset").onclick=()=>{s.bal=START;s.hist=[];s.open=[];save();paint();toast("Balance reset to $10,000.00")};
function tick(){
 for(const k in A){const a=A[k];P[k]=+(P[k]+rnd()*a.v+(a.p-P[k])*0.0008).toFixed(a.d);H[k].push(P[k]);if(H[k].length>N)H[k].shift()}
 const now=Date.now();
 s.open=s.open.filter(t=>{
  if(now<t.end)return true;
  const x=P[t.sym],df=x-t.entry;let r="tie",pl=0;
  if(df!==0){if((df>0)===(t.dir==="up")){r="win";pl=t.stake*PAY}else{r="loss";pl=-t.stake}}
  s.bal+=r==="win"?t.stake*(1+PAY):r==="tie"?t.stake:0;
  s.hist.unshift({sym:t.sym,dir:t.dir,stake:t.stake,entry:t.entry,exit:x,r,pl});settleFx(r);
  toast(r==="win"?`Won ${usd(pl)} on ${t.sym}`:r==="loss"?`Lost ${usd(-pl)} on ${t.sym}`:`${t.sym} closed level. Stake returned.`,r==="win"?"var(--up)":r==="loss"?"var(--down)":"var(--muted)");
  return false});
 s.hist=s.hist.slice(0,40);save();paint();
}
function paint(){
 const a=A[s.sym],h=H[s.sym],p=h[h.length-1],ch=p-h[0];
 $("bal").textContent=usd(s.bal);
 if(pb!==undefined&&s.bal!==pb){const bl=$("bal");bl.classList.remove("flash-up","flash-dn");void bl.offsetWidth;bl.classList.add(s.bal>pb?"flash-up":"flash-dn")}pb=s.bal;
 $("price").textContent=fmt(p,a.d);
 $("chg").textContent=(ch>=0?"+":"")+fmt(ch/h[0]*100,2)+"%";$("chg").className=ch>=0?"up":"dn";
 const tot=s.hist.length,w=s.hist.filter(x=>x.r==="win").length,net=s.hist.reduce((q,x)=>q+x.pl,0);
 $("sT").textContent=tot;$("sW").textContent=tot?Math.round(w/tot*100)+"%":"–";
 $("sP").textContent=usd(net);$("sP").className=net>0?"up":net<0?"dn":"";
 let sk=0;const ty=s.hist[0]&&s.hist[0].r;for(const q of s.hist){if(q.r===ty&&ty!=="tie")sk++;else break}
 $("streak").textContent=sk>=2?(ty==="win"?sk+" wins in a row":sk+" losses in a row"):"";
 document.querySelectorAll("#strip .chip").forEach(c=>{const k=c.dataset.s,hh=H[k],cg=hh[hh.length-1]-hh[0];c.classList.toggle("on",k===s.sym);c.querySelector("b").textContent=fmt(hh[hh.length-1],A[k].d);const ii=c.querySelector("i");ii.textContent=(cg>=0?"▲ ":"▼ ")+fmt(Math.abs(cg/hh[0]*100),2)+"%";ii.className=cg>=0?"up":"dn"});
 const arrow=d=>d==="up"?'<span class="up">▲ Higher</span>':'<span class="dn">▼ Lower</span>';
 $("open").innerHTML=s.open.length?`<table><tr><th>Asset</th><th>Call</th><th class="r">Entry</th><th class="r">Now</th><th class="r">Stake</th><th class="r">Left</th></tr>`+s.open.map(t=>{const x=P[t.sym],win=(x>t.entry)===(t.dir==="up")&&x!==t.entry,d=A[t.sym].d;return `<tr><td>${t.sym}</td><td>${arrow(t.dir)}</td><td class="r">${fmt(t.entry,d)}</td><td class="r ${x===t.entry?"":win?"up":"dn"}">${fmt(x,d)}</td><td class="r">${usd(t.stake)}</td><td class="r">${Math.max(0,Math.ceil((t.end-Date.now())/1000))}s<div class="bar"><i style="width:${Math.max(0,(t.end-Date.now())/(t.end-t.start)*100)}%"></i></div></td></tr>`}).join("")+"</table>":'<div class="empty">No open trades. Pick an expiry and a stake, then choose Higher or Lower.</div>';
 $("hist").innerHTML=s.hist.length?`<table><tr><th>Asset</th><th>Call</th><th class="r">Entry</th><th class="r">Exit</th><th class="r">Result</th></tr>`+s.hist.map(t=>{const d=A[t.sym].d;return `<tr><td>${t.sym}</td><td>${arrow(t.dir)}</td><td class="r">${fmt(t.entry,d)}</td><td class="r">${fmt(t.exit,d)}</td><td class="r ${t.pl>0?"up":t.pl<0?"dn":""}">${t.r==="tie"?"Tie":usd(t.pl)}</td></tr>`}).join("")+"</table>":'<div class="empty">Closed trades will appear here.</div>';
 draw();
}
function draw(){
 const c=$("cv"),x=c.getContext("2d"),dpr=window.devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;
 if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
 x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
 const a=A[s.sym],d=H[s.sym],n=d.length,css=getComputedStyle(document.documentElement),col=k=>css.getPropertyValue(k).trim();
 const op=s.open.filter(t=>t.sym===s.sym);
 let mn=Math.min(...d),mx=Math.max(...d);op.forEach(t=>{mn=Math.min(mn,t.entry);mx=Math.max(mx,t.entry)});
 const pd=(mx-mn)*.15||a.v;mn-=pd;mx+=pd;
 const L=6,R=84,T=10,B=8,pw=w-L-R,ph=h-T-B,X=i=>L+i/(n-1)*pw,Y=v=>T+(1-(v-mn)/(mx-mn))*ph;
 x.font="11px 'IBM Plex Sans',system-ui,sans-serif";x.lineWidth=1;
 for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4,y=Y(v);x.strokeStyle=col("--line");x.beginPath();x.moveTo(L,y);x.lineTo(L+pw,y);x.stroke();x.fillStyle=col("--muted");x.fillText(fmt(v,a.d),L+pw+8,y+4)}
 const g=x.createLinearGradient(0,T,0,T+ph);g.addColorStop(0,col("--chart")+"30");g.addColorStop(1,col("--chart")+"00");
 x.beginPath();d.forEach((v,i)=>i?x.lineTo(X(i),Y(v)):x.moveTo(X(i),Y(v)));
 x.strokeStyle=col("--chart");x.lineWidth=2;x.lineJoin="round";x.stroke();
 x.lineTo(X(n-1),T+ph);x.lineTo(X(0),T+ph);x.closePath();x.fillStyle=g;x.fill();
 x.lineWidth=1;
 op.forEach(t=>{const y=Y(t.entry),cl=col(t.dir==="up"?"--up":"--down");x.setLineDash([5,4]);x.strokeStyle=cl;x.beginPath();x.moveTo(L,y);x.lineTo(L+pw,y);x.stroke();x.setLineDash([]);x.fillStyle=cl;x.fillText((t.dir==="up"?"▲ Higher ":"▼ Lower ")+usd(t.stake),L+6,y-5)});
 const last=d[n-1],ly=Y(last),upm=last>=d[n-2];
 x.setLineDash([2,3]);x.strokeStyle=col("--muted");x.beginPath();x.moveTo(L,ly);x.lineTo(L+pw,ly);x.stroke();x.setLineDash([]);
 x.fillStyle=col(upm?"--up":"--down");x.beginPath();x.roundRect(L+pw+2,ly-10,R-4,20,4);x.fill();
 x.fillStyle="#fff";x.fillText(fmt(last,a.d),L+pw+8,ly+4);
 if(hov!==null){const i=Math.max(0,Math.min(n-1,Math.round((hov-L)/pw*(n-1)))),px=X(i),py=Y(d[i]);x.setLineDash([3,3]);x.strokeStyle=col("--muted");x.beginPath();x.moveTo(px,T);x.lineTo(px,T+ph);x.stroke();x.setLineDash([]);x.beginPath();x.arc(px,py,4,0,7);x.fillStyle=col("--text");x.fill();const tp=$("tip");tp.textContent=fmt(d[i],a.d)+" ("+((n-1-i)*0.5).toFixed(1)+"s ago)";tp.style.left=Math.max(4,Math.min(px+10,w-150))+"px";tp.style.top=Math.max(py-34,4)+"px";tp.style.opacity=1}else $("tip").style.opacity=0;
 x.beginPath();x.arc(X(n-1),ly,4,0,7);x.fillStyle=col("--chart");x.fill();
}
addEventListener("resize",draw);
let pb,hov=null,snd=false,ac;
function beep(f,t){if(!snd)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+t)}catch(e){}}
function settleFx(r){const el=document.querySelector(".chartbox");el.classList.remove("win-glow","loss-glow");void el.offsetWidth;if(r==="win"){el.classList.add("win-glow");beep(880,.18)}else if(r==="loss"){el.classList.add("loss-glow");beep(220,.25)}}
$("snd").onclick=()=>{snd=!snd;$("snd").textContent=snd?"Sound on":"Sound off";$("snd").setAttribute("aria-pressed",snd);beep(660,.1)};
$("thm").onclick=()=>{const r=document.documentElement;r.dataset.theme=getComputedStyle(r).colorScheme==="dark"?"light":"dark";draw()};
$("strip").onclick=e=>{const b=e.target.closest("[data-s]");if(b){s.sym=b.dataset.s;build();paint()}};
$("cv").onpointermove=e=>{hov=e.clientX-$("cv").getBoundingClientRect().left;draw()};
$("cv").onpointerleave=()=>{hov=null;draw()};
document.querySelectorAll(".go button").forEach(b=>b.addEventListener("click",e=>{const r=b.getBoundingClientRect(),dm=Math.max(r.width,r.height),sp=document.createElement("span");sp.className="rip";sp.style.cssText=`width:${dm}px;height:${dm}px;left:${e.clientX-r.left-dm/2}px;top:${e.clientY-r.top-dm/2}px`;b.appendChild(sp);setTimeout(()=>sp.remove(),600)}));
addEventListener("keydown",e=>{if(e.target.tagName==="INPUT"||e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key.toLowerCase();if(k==="arrowup"||k==="h"){e.preventDefault();$("hi").click()}else if(k==="arrowdown"||k==="l"){e.preventDefault();$("lo").click()}else if(k==="1"||k==="2"||k==="3"){s.exp=EXPS[+k-1][0];build()}});
function feedItem(){const ks=Object.keys(A),k=ks[Math.floor(Math.random()*ks.length)],dir=Math.random()<.5?"up":"dn",st=[10,20,50,100,250][Math.floor(Math.random()*5)],ex=EXPS[Math.floor(Math.random()*3)][1],f=$("feed"),d=document.createElement("div");d.className="fi";d.innerHTML=`<span>Sim-trader ${100+Math.floor(Math.random()*900)} <small>${k}, ${ex}</small></span><span class="${dir}">${dir==="up"?"▲ Higher":"▼ Lower"} $${st}</span>`;f.prepend(d);while(f.children.length>14)f.lastChild.remove()}
function loopFeed(){feedItem();setTimeout(loopFeed,1200+Math.random()*2800)}
for(let i=0;i<6;i++)feedItem();loopFeed();
(async()=>{
 if(typeof claude==="undefined")return;
 let sample=null;try{sample=await claude.use("sample")}catch(e){}
 if(!sample)return;
 $("coach").hidden=false;
 let ctl=null;
 const SYS="You are a patient trading-education coach inside a practice binary-options simulator that uses virtual money and randomly simulated prices. Explain in plain language in under 170 words. Never predict prices or promise profit, because the simulated prices are random walks. Stress risk management and small stakes, and note that real binary options carry a high risk of loss and need a licensed provider. This is education, not financial advice.\n\n";
 function ctx(){const h=H[s.sym],r=h.slice(-40),mn=Math.min(...r),mx=Math.max(...r),mv=r[r.length-1]-r[0],t=s.hist.slice(0,20),w=t.filter(x=>x.r==="win").length;return `Asset: ${s.sym}. Last 40 prices, oldest first: ${r.join(", ")}. Range ${mn} to ${mx}. Change ${mv.toFixed(A[s.sym].d)}. Balance $${s.bal.toFixed(2)} (started at $${START}). Last ${t.length} trades, ${w} wins: ${t.map(x=>x.dir+" $"+x.stake+" "+x.r).join("; ")||"none yet"}. Open trades: ${s.open.length}. Stake entered: $${stake()}.`}
 async function run(prompt){
  if(ctl)ctl.abort();ctl=new AbortController();const out=$("ans");out.textContent="Thinking...";
  try{await sample(SYS+prompt+"\n\nData:\n"+ctx(),{signal:ctl.signal,cache:false,modelTier:"quick",onText:({text})=>{out.textContent=text}})}
  catch(e){if(e&&(e.code==="aborted"||e.name==="AbortError"))return;out.textContent=e&&e.code==="rate_limited"?"The coach is busy. Wait a moment and try again.":e&&e.code==="not_granted"?"The coach needs your permission to run. Allow it and try again.":"The coach couldn’t answer. Try again."}
 }
 const PR={chart:"Describe what this simulated price chart has done recently (trend, volatility, range) and what a learner should notice. Do not predict the next move.",review:"Review my recent practice trades: win rate, stake size against balance, streaks, and two concrete habits to improve.",risk:"Assess my risk right now: my stake as a percent of balance, my open trades, and what stake size would be sensible. Give one clear rule."};
 document.querySelector(".qa").onclick=e=>{const b=e.target.closest("[data-a]");if(b)run(PR[b.dataset.a])};
 const go=()=>{const q=$("q").value.trim();if(q){run("Answer this learner’s question: "+q);$("q").value=""}};
 $("askb").onclick=go;$("q").onkeydown=e=>{if(e.key==="Enter")go()};
})();
let nm="";try{nm=localStorage.getItem("tl_name")||""}catch(e){}
function who(){$("join").textContent=nm?"Hi, "+nm:"Create demo account"}
$("join").onclick=()=>{$("nm").value=nm;$("dlg").showModal()};
$("dno").onclick=()=>$("dlg").close();
$("dyes").onclick=()=>{nm=$("nm").value.trim().slice(0,24);try{localStorage.setItem("tl_name",nm)}catch(e){}who();$("dlg").close();if(nm)toast("Welcome, "+nm+". Your $10,000 practice balance is ready.")};
who();
$("pay").oninput=()=>{const p=+$("pay").value||0;$("be").textContent=p>0?(10000/(100+p)).toFixed(1)+"%":"-"};
$("cta").onclick=()=>$("trade").scrollIntoView({behavior:"smooth"});
build();ret();paint();setInterval(tick,500);
