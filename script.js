const DPR=Math.min(2,window.devicePixelRatio||1);
const fitCanvas=(c)=>{const r=c.getBoundingClientRect(); const w=Math.max(1,Math.floor(r.width*DPR)),h=Math.max(1,Math.floor(r.height*DPR)); if(c.width!==w||c.height!==h){c.width=w;c.height=h;} return {w,h};};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function arrow(ctx,x,y,dx,dy,color,alpha=.9,width=1.4){const L=Math.hypot(dx,dy)||1;const ux=dx/L,uy=dy/L;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width*DPR;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();const ex=x+dx,ey=y+dy,s=4.4*DPR;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-s*(ux*.7-uy),ey-s*(uy*.7+ux));ctx.lineTo(ex-s*(ux*.7+uy),ey-s*(uy*.7-ux));ctx.closePath();ctx.fill();ctx.restore();}

// Reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Hero: moving stochastic threads around an implied sphere.
const hero=document.getElementById('heroCanvas'),hctx=hero.getContext('2d');
let ht=0;
function drawHero(){const {w,h}=fitCanvas(hero);hctx.clearRect(0,0,w,h);ht+=.004;
  const cx=w*.73,cy=h*.46,R=Math.min(w,h)*.28;
  const g=hctx.createRadialGradient(cx,cy,R*.05,cx,cy,R*1.2);g.addColorStop(0,'rgba(32,105,144,.19)');g.addColorStop(.65,'rgba(14,50,75,.07)');g.addColorStop(1,'rgba(0,0,0,0)');hctx.fillStyle=g;hctx.beginPath();hctx.arc(cx,cy,R*1.25,0,Math.PI*2);hctx.fill();
  hctx.strokeStyle='rgba(88,215,244,.14)';hctx.lineWidth=.7*DPR;for(let j=0;j<14;j++){const rr=R*(.18+j*.055);hctx.beginPath();for(let k=0;k<=130;k++){const a=2*Math.PI*k/130;const wob=.075*Math.sin(3*a+ht*3+j*.16)+.035*Math.sin(5*a-ht*2);const x=cx+rr*(1+wob)*Math.cos(a),y=cy+rr*.68*(1+wob)*Math.sin(a);k?hctx.lineTo(x,y):hctx.moveTo(x,y);}hctx.stroke();}
  for(let p=0;p<18;p++){const a=ht*(1.2+(p%5)*.09)+p*.91;const rr=R*(.2+.68*((p*37)%17)/16);const x=cx+rr*Math.cos(a),y=cy+.68*rr*Math.sin(a);hctx.fillStyle=p%4===0?'rgba(255,255,255,.9)':'rgba(88,215,244,.45)';hctx.beginPath();hctx.arc(x,y,(p%4===0?2.5:1.4)*DPR,0,Math.PI*2);hctx.fill();}
  requestAnimationFrame(drawHero)}drawHero();

// Fixed synthetic Brownian path and smooth McShane-like interpolation.
const wc=document.getElementById('wienerCanvas'),wctx=wc.getContext('2d');
const epsSlider=document.getElementById('epsSlider'),epsValue=document.getElementById('epsValue');
let seed=17;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
const base=[];let y=0;for(let i=0;i<180;i++){const u1=Math.max(1e-8,rnd()),u2=rnd();const z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);y+=z*.12;base.push(y)}
function catmull(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)}
function drawWiener(){const {w,h}=fitCanvas(wc);wctx.clearRect(0,0,w,h);const eps=+epsSlider.value;epsValue.value=eps.toFixed(2);const step=Math.max(2,Math.round(eps*110));const inds=[];for(let i=0;i<base.length;i+=step)inds.push(i);if(inds[inds.length-1]!==base.length-1)inds.push(base.length-1);const ymin=Math.min(...base),ymax=Math.max(...base),pad=(ymax-ymin)*.12;const map=(i,v)=>[22*DPR+(w-44*DPR)*i/(base.length-1),h-25*DPR-(h-50*DPR)*(v-(ymin-pad))/(ymax-ymin+2*pad)];
  wctx.strokeStyle='rgba(255,255,255,.18)';wctx.lineWidth=.9*DPR;wctx.beginPath();base.forEach((v,i)=>{const [x,yy]=map(i,v);i?wctx.lineTo(x,yy):wctx.moveTo(x,yy)});wctx.stroke();
  wctx.strokeStyle='#58d7f4';wctx.lineWidth=2*DPR;wctx.shadowColor='#58d7f455';wctx.shadowBlur=7*DPR;wctx.beginPath();let first=true;for(let s=0;s<inds.length-1;s++){const i0=inds[Math.max(0,s-1)],i1=inds[s],i2=inds[s+1],i3=inds[Math.min(inds.length-1,s+2)];for(let q=0;q<18;q++){const t=q/18,idx=i1+(i2-i1)*t,val=catmull(base[i0],base[i1],base[i2],base[i3],t);const [x,yy]=map(idx,val);first?(wctx.moveTo(x,yy),first=false):wctx.lineTo(x,yy)}}wctx.stroke();wctx.shadowBlur=0;
  inds.forEach(i=>{const [x,yy]=map(i,base[i]);wctx.fillStyle='#dff9ff';wctx.beginPath();wctx.arc(x,yy,2.1*DPR,0,Math.PI*2);wctx.fill()});
  wctx.font=`${10*DPR}px system-ui`;wctx.fillStyle='rgba(255,255,255,.5)';wctx.fillText('same Wiener increments',22*DPR,20*DPR);
}
epsSlider.addEventListener('input',drawWiener);window.addEventListener('resize',drawWiener);drawWiener();

// 3D-ish sphere projection helpers
function proj(v,w,h){const yaw=-.72,pitch=.42,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x1=cy*v.x+sy*v.z,z1=-sy*v.x+cy*v.z,y2=cp*v.y-sp*z1,z2=sp*v.y+cp*z1,S=Math.min(w,h)*.34;return{x:w*.5+x1*S,y:h*.53-y2*S,z:z2,S}}
function drawSphereWire(ctx,w,h,alpha=.15){const C=proj({x:0,y:0,z:0},w,h),R=Math.min(w,h)*.34;const g=ctx.createRadialGradient(C.x-R*.28,C.y-R*.32,R*.06,C.x,C.y,R);g.addColorStop(0,'#244960');g.addColorStop(.62,'#102333');g.addColorStop(1,'#071018');ctx.fillStyle=g;ctx.beginPath();ctx.arc(C.x,C.y,R,0,Math.PI*2);ctx.fill();ctx.lineWidth=.75*DPR;ctx.strokeStyle=`rgba(88,215,244,${alpha})`;for(let z=-.8;z<=.8;z+=.2){const rr=Math.sqrt(1-z*z);ctx.beginPath();for(let k=0;k<=100;k++){const a=2*Math.PI*k/100,p=proj({x:rr*Math.cos(a),y:rr*Math.sin(a),z},w,h);k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.stroke()}ctx.strokeStyle='rgba(255,255,255,.09)';for(let m=0;m<12;m++){const a=2*Math.PI*m/12;ctx.beginPath();for(let k=0;k<=100;k++){const th=Math.PI*k/100,p=proj({x:Math.sin(th)*Math.cos(a),y:Math.sin(th)*Math.sin(a),z:Math.cos(th)},w,h);k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.stroke()}}

// Gibbs cloud interactive; exact vMF sampling for phi=1-z on S^2.
const gs=document.getElementById('gibbsSphere'),gctx=gs.getContext('2d');const ks=document.getElementById('kappaSlider'),kv=document.getElementById('kappaValue');let samples=[];
function sampleVMF(kappa,n=520){samples=[];const a=2*kappa;for(let i=0;i<n;i++){const u=Math.random();let z;if(a<1e-4)z=2*u-1;else{const em=Math.exp(-a),ep=Math.exp(a);z=Math.log(em+u*(ep-em))/a;}const th=2*Math.PI*Math.random(),r=Math.sqrt(Math.max(0,1-z*z));samples.push({x:r*Math.cos(th),y:r*Math.sin(th),z})}}
function refreshSamples(){const k=+ks.value;kv.value=k.toFixed(1);sampleVMF(k);drawGibbs()}
function drawGibbs(){const {w,h}=fitCanvas(gs);gctx.clearRect(0,0,w,h);drawSphereWire(gctx,w,h,.17);const pts=samples.map(s=>({s,p:proj(s,w,h)})).sort((a,b)=>a.p.z-b.p.z);pts.forEach(({s,p})=>{const front=.35+.65*(p.z+1)/2;gctx.fillStyle=`rgba(88,215,244,${.16+.55*front})`;gctx.beginPath();gctx.arc(p.x,p.y,(1.3+1.4*front)*DPR,0,Math.PI*2);gctx.fill()});const top=proj({x:0,y:0,z:1},w,h);gctx.shadowColor='#fff';gctx.shadowBlur=16*DPR;gctx.fillStyle='white';gctx.beginPath();gctx.arc(top.x,top.y,5.2*DPR,0,Math.PI*2);gctx.fill();gctx.shadowBlur=0;gctx.font=`${11*DPR}px system-ui`;gctx.fillStyle='#dceaf3';gctx.fillText('x★',top.x+8*DPR,top.y-5*DPR)}
ks.addEventListener('input',refreshSamples);window.addEventListener('resize',drawGibbs);refreshSamples();

// Animated stylized stochastic trajectories on sphere.
const tc=document.getElementById('trajectoryCanvas'),tctx=tc.getContext('2d');let phase=0;const pathSeeds=[.2,1.5,2.8,4.2,5.4,6.7,8.1];
function slerpPath(t,a){const theta=Math.PI*(1-t);const wob=.23*Math.sin(7*t+a)*(1-t)*t;const lon=a+.8*Math.sin(4*t+a);const z=Math.cos(theta)+.12*wob;const rr=Math.sqrt(Math.max(0,1-z*z));return{x:rr*Math.cos(lon+wob),y:rr*Math.sin(lon-wob*.5),z:clamp(z,-1,1)}}
function drawTraj(){const {w,h}=fitCanvas(tc);tctx.clearRect(0,0,w,h);drawSphereWire(tctx,w,h,.12);phase=(phase+.0035)%1;pathSeeds.forEach((a,idx)=>{tctx.strokeStyle=idx%2?'rgba(88,215,244,.58)':'rgba(129,117,255,.50)';tctx.lineWidth=(1.25+idx%3*.15)*DPR;tctx.beginPath();for(let k=0;k<=120;k++){const tt=k/120,p=proj(slerpPath(tt,a),w,h);k?tctx.lineTo(p.x,p.y):tctx.moveTo(p.x,p.y)}tctx.stroke();const q=proj(slerpPath((phase+idx*.09)%1,a),w,h);tctx.fillStyle='#e9fbff';tctx.beginPath();tctx.arc(q.x,q.y,2.6*DPR,0,Math.PI*2);tctx.fill()});const top=proj({x:0,y:0,z:1},w,h);tctx.shadowColor='#58d7f4';tctx.shadowBlur=18*DPR;tctx.fillStyle='white';tctx.beginPath();tctx.arc(top.x,top.y,5*DPR,0,Math.PI*2);tctx.fill();tctx.shadowBlur=0;requestAnimationFrame(drawTraj)}drawTraj();
