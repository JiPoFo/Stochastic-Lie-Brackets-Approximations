const DPR=Math.min(2,window.devicePixelRatio||1);
const fitCanvas=(c)=>{const r=c.getBoundingClientRect(); const w=Math.max(1,Math.floor(r.width*DPR)),h=Math.max(1,Math.floor(r.height*DPR)); if(c.width!==w||c.height!==h){c.width=w;c.height=h;} return {w,h};};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function arrow(ctx,x,y,dx,dy,color,alpha=.9,width=1.4){const L=Math.hypot(dx,dy)||1;const ux=dx/L,uy=dy/L;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width*DPR;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();const ex=x+dx,ey=y+dy,s=4.4*DPR;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-s*(ux*.7-uy),ey-s*(uy*.7+ux));ctx.lineTo(ex-s*(ux*.7+uy),ey-s*(uy*.7-ux));ctx.closePath();ctx.fill();ctx.restore();}

// Reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Hero: stochastic transport across a softly curved manifold sheet.
// This intentionally avoids the contour-field look of the companion project page.
const hero=document.getElementById('heroCanvas'),hctx=hero.getContext('2d');
let ht=0;
const heroThreads=Array.from({length:13},(_,i)=>({
  seed:i*1.713,
  phase:(i*0.137)%1,
  speed:.00065+.00008*(i%5),
  width:.65+(i%3)*.28
}));

function heroCurvePoint(u,seed,w,h,t){
  const x=w*(.47+.56*u);
  const center=h*(.48 + .055*Math.sin(seed*.8));
  const arch=Math.sin(Math.PI*u);
  const y=center
    + h*.23*(u-.50)*(u-.50)
    + h*.055*Math.sin(5.2*u+seed+t*.55)
    + h*.027*Math.sin(13*u+seed*2.1-t*.31)
    - h*.18*arch;
  return {x,y};
}
function drawHero(){
  const {w,h}=fitCanvas(hero);
  hctx.clearRect(0,0,w,h);
  ht+=1;

  // Warm-violet atmosphere on the right.
  const gx=w*.77,gy=h*.46,gr=Math.min(w,h)*.34;
  const fog=hctx.createRadialGradient(gx,gy,0,gx,gy,gr*1.45);
  fog.addColorStop(0,'rgba(169,140,255,.115)');
  fog.addColorStop(.42,'rgba(106,55,111,.065)');
  fog.addColorStop(1,'rgba(0,0,0,0)');
  hctx.fillStyle=fog;
  hctx.beginPath();hctx.arc(gx,gy,gr*1.45,0,Math.PI*2);hctx.fill();

  // A sparse warped manifold mesh.
  hctx.lineWidth=.65*DPR;
  for(let row=0;row<9;row++){
    const v=(row-4)/4;
    hctx.strokeStyle=`rgba(169,140,255,${0.045+0.008*(4-Math.abs(row-4))})`;
    hctx.beginPath();
    for(let k=0;k<=100;k++){
      const u=k/100;
      const p=heroCurvePoint(u,row*.61,w,h,ht*.003);
      const yy=p.y + v*h*.12*(.45+.55*Math.sin(Math.PI*u));
      k?hctx.lineTo(p.x,yy):hctx.moveTo(p.x,yy);
    }
    hctx.stroke();
  }
  for(let col=0;col<11;col++){
    const u=.05+.09*col;
    hctx.strokeStyle='rgba(255,179,92,.035)';
    hctx.beginPath();
    for(let r=-4;r<=4;r++){
      const p=heroCurvePoint(u,col*.57,w,h,ht*.003);
      const yy=p.y + (r/4)*h*.12*(.45+.55*Math.sin(Math.PI*u));
      r===-4?hctx.moveTo(p.x,yy):hctx.lineTo(p.x,yy);
    }
    hctx.stroke();
  }

  // Stochastic sample-path ribbons.
  heroThreads.forEach((th,idx)=>{
    th.phase=(th.phase+th.speed)%1;
    const hue = idx%3===0 ? '255,179,92' : (idx%3===1 ? '255,122,122' : '169,140,255');

    hctx.strokeStyle=`rgba(${hue},${idx%3===0?.29:.20})`;
    hctx.lineWidth=th.width*DPR;
    hctx.beginPath();
    for(let k=0;k<=92;k++){
      const u=k/92;
      const p=heroCurvePoint(u,th.seed,w,h,ht*.003);
      const jitter=h*.012*Math.sin(17*u+th.seed*2.4+ht*.012)
                  +h*.006*Math.sin(41*u+th.seed);
      const yy=p.y+jitter;
      k?hctx.lineTo(p.x,yy):hctx.moveTo(p.x,yy);
    }
    hctx.stroke();

    // Bright moving sample along each stochastic path.
    const q=heroCurvePoint(th.phase,th.seed,w,h,ht*.003);
    const jitter=h*.012*Math.sin(17*th.phase+th.seed*2.4+ht*.012)
                +h*.006*Math.sin(41*th.phase+th.seed);
    const r=(idx%4===0?2.7:1.55)*DPR;
    hctx.shadowColor=`rgba(${hue},.75)`;
    hctx.shadowBlur=(idx%4===0?13:7)*DPR;
    hctx.fillStyle=`rgba(${hue},${idx%4===0?.92:.62})`;
    hctx.beginPath();hctx.arc(q.x,q.y+jitter,r,0,Math.PI*2);hctx.fill();
    hctx.shadowBlur=0;
  });

  // A softly glowing preferred region rather than a sharp equilibrium marker.
  const tx=w*.865,ty=h*.335;
  const attract=hctx.createRadialGradient(tx,ty,0,tx,ty,70*DPR);
  attract.addColorStop(0,'rgba(255,193,118,.20)');
  attract.addColorStop(.25,'rgba(255,139,122,.08)');
  attract.addColorStop(1,'rgba(0,0,0,0)');
  hctx.fillStyle=attract;
  hctx.beginPath();hctx.arc(tx,ty,70*DPR,0,Math.PI*2);hctx.fill();

  requestAnimationFrame(drawHero);
}
drawHero();

// Fixed synthetic Brownian path and smooth McShane-like interpolation.
const wc=document.getElementById('wienerCanvas'),wctx=wc.getContext('2d');
const epsSlider=document.getElementById('epsSlider'),epsValue=document.getElementById('epsValue');
let seed=17;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
const base=[];let y=0;for(let i=0;i<180;i++){const u1=Math.max(1e-8,rnd()),u2=rnd();const z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);y+=z*.12;base.push(y)}
function catmull(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)}
function drawWiener(){const {w,h}=fitCanvas(wc);wctx.clearRect(0,0,w,h);const eps=+epsSlider.value;epsValue.value=eps.toFixed(2);const step=Math.max(2,Math.round(eps*110));const inds=[];for(let i=0;i<base.length;i+=step)inds.push(i);if(inds[inds.length-1]!==base.length-1)inds.push(base.length-1);const ymin=Math.min(...base),ymax=Math.max(...base),pad=(ymax-ymin)*.12;const map=(i,v)=>[22*DPR+(w-44*DPR)*i/(base.length-1),h-25*DPR-(h-50*DPR)*(v-(ymin-pad))/(ymax-ymin+2*pad)];
  wctx.strokeStyle='rgba(255,255,255,.18)';wctx.lineWidth=.9*DPR;wctx.beginPath();base.forEach((v,i)=>{const [x,yy]=map(i,v);i?wctx.lineTo(x,yy):wctx.moveTo(x,yy)});wctx.stroke();
  wctx.strokeStyle='#ffb35c';wctx.lineWidth=2*DPR;wctx.shadowColor='#ffb35c55';wctx.shadowBlur=7*DPR;wctx.beginPath();let first=true;for(let s=0;s<inds.length-1;s++){const i0=inds[Math.max(0,s-1)],i1=inds[s],i2=inds[s+1],i3=inds[Math.min(inds.length-1,s+2)];for(let q=0;q<18;q++){const t=q/18,idx=i1+(i2-i1)*t,val=catmull(base[i0],base[i1],base[i2],base[i3],t);const [x,yy]=map(idx,val);first?(wctx.moveTo(x,yy),first=false):wctx.lineTo(x,yy)}}wctx.stroke();wctx.shadowBlur=0;
  inds.forEach(i=>{const [x,yy]=map(i,base[i]);wctx.fillStyle='#fff0d8';wctx.beginPath();wctx.arc(x,yy,2.1*DPR,0,Math.PI*2);wctx.fill()});
  wctx.font=`${10*DPR}px system-ui`;wctx.fillStyle='rgba(255,255,255,.5)';wctx.fillText('same Wiener increments',22*DPR,20*DPR);
}
epsSlider.addEventListener('input',drawWiener);window.addEventListener('resize',drawWiener);drawWiener();

// 3D-ish sphere projection helpers
function proj(v,w,h){const yaw=-.72,pitch=.42,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x1=cy*v.x+sy*v.z,z1=-sy*v.x+cy*v.z,y2=cp*v.y-sp*z1,z2=sp*v.y+cp*z1,S=Math.min(w,h)*.34;return{x:w*.5+x1*S,y:h*.53-y2*S,z:z2,S}}
function drawSphereWire(ctx,w,h,alpha=.15){const C=proj({x:0,y:0,z:0},w,h),R=Math.min(w,h)*.34;const g=ctx.createRadialGradient(C.x-R*.28,C.y-R*.32,R*.06,C.x,C.y,R);g.addColorStop(0,'#4b2b46');g.addColorStop(.62,'#24162b');g.addColorStop(1,'#100c14');ctx.fillStyle=g;ctx.beginPath();ctx.arc(C.x,C.y,R,0,Math.PI*2);ctx.fill();ctx.lineWidth=.75*DPR;ctx.strokeStyle=`rgba(255,179,92,${alpha})`;for(let z=-.8;z<=.8;z+=.2){const rr=Math.sqrt(1-z*z);ctx.beginPath();for(let k=0;k<=100;k++){const a=2*Math.PI*k/100,p=proj({x:rr*Math.cos(a),y:rr*Math.sin(a),z},w,h);k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.stroke()}ctx.strokeStyle='rgba(255,255,255,.09)';for(let m=0;m<12;m++){const a=2*Math.PI*m/12;ctx.beginPath();for(let k=0;k<=100;k++){const th=Math.PI*k/100,p=proj({x:Math.sin(th)*Math.cos(a),y:Math.sin(th)*Math.sin(a),z:Math.cos(th)},w,h);k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.stroke()}}

// Gibbs cloud interactive; exact vMF sampling for phi=1-z on S^2.
const gs=document.getElementById('gibbsSphere'),gctx=gs.getContext('2d');const ks=document.getElementById('kappaSlider'),kv=document.getElementById('kappaValue');let samples=[];
function sampleVMF(kappa,n=520){samples=[];const a=2*kappa;for(let i=0;i<n;i++){const u=Math.random();let z;if(a<1e-4)z=2*u-1;else{const em=Math.exp(-a),ep=Math.exp(a);z=Math.log(em+u*(ep-em))/a;}const th=2*Math.PI*Math.random(),r=Math.sqrt(Math.max(0,1-z*z));samples.push({x:r*Math.cos(th),y:r*Math.sin(th),z})}}
function refreshSamples(){const k=+ks.value;kv.value=k.toFixed(1);sampleVMF(k);drawGibbs()}
function drawGibbs(){const {w,h}=fitCanvas(gs);gctx.clearRect(0,0,w,h);drawSphereWire(gctx,w,h,.17);const pts=samples.map(s=>({s,p:proj(s,w,h)})).sort((a,b)=>a.p.z-b.p.z);pts.forEach(({s,p})=>{const front=.35+.65*(p.z+1)/2;gctx.fillStyle=`rgba(255,179,92,${.16+.55*front})`;gctx.beginPath();gctx.arc(p.x,p.y,(1.3+1.4*front)*DPR,0,Math.PI*2);gctx.fill()});const top=proj({x:0,y:0,z:1},w,h);gctx.shadowColor='#fff';gctx.shadowBlur=16*DPR;gctx.fillStyle='white';gctx.beginPath();gctx.arc(top.x,top.y,5.2*DPR,0,Math.PI*2);gctx.fill();gctx.shadowBlur=0;gctx.font=`${11*DPR}px system-ui`;gctx.fillStyle='#f2e5ef';gctx.fillText('x★',top.x+8*DPR,top.y-5*DPR)}
ks.addEventListener('input',refreshSamples);window.addEventListener('resize',drawGibbs);refreshSamples();

// Animated stylized stochastic trajectories on sphere.
const tc=document.getElementById('trajectoryCanvas'),tctx=tc.getContext('2d');let phase=0;const pathSeeds=[.2,1.5,2.8,4.2,5.4,6.7,8.1];
function slerpPath(t,a){const theta=Math.PI*(1-t);const wob=.23*Math.sin(7*t+a)*(1-t)*t;const lon=a+.8*Math.sin(4*t+a);const z=Math.cos(theta)+.12*wob;const rr=Math.sqrt(Math.max(0,1-z*z));return{x:rr*Math.cos(lon+wob),y:rr*Math.sin(lon-wob*.5),z:clamp(z,-1,1)}}
function drawTraj(){const {w,h}=fitCanvas(tc);tctx.clearRect(0,0,w,h);drawSphereWire(tctx,w,h,.12);phase=(phase+.0035)%1;pathSeeds.forEach((a,idx)=>{tctx.strokeStyle=idx%2?'rgba(255,179,92,.58)':'rgba(169,140,255,.50)';tctx.lineWidth=(1.25+idx%3*.15)*DPR;tctx.beginPath();for(let k=0;k<=120;k++){const tt=k/120,p=proj(slerpPath(tt,a),w,h);k?tctx.lineTo(p.x,p.y):tctx.moveTo(p.x,p.y)}tctx.stroke();const q=proj(slerpPath((phase+idx*.09)%1,a),w,h);tctx.fillStyle='#fff1df';tctx.beginPath();tctx.arc(q.x,q.y,2.6*DPR,0,Math.PI*2);tctx.fill()});const top=proj({x:0,y:0,z:1},w,h);tctx.shadowColor='#ffb35c';tctx.shadowBlur=18*DPR;tctx.fillStyle='white';tctx.beginPath();tctx.arc(top.x,top.y,5*DPR,0,Math.PI*2);tctx.fill();tctx.shadowBlur=0;requestAnimationFrame(drawTraj)}drawTraj();
