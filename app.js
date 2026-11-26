const rail=document.querySelector('#rail');
const dashboard=document.querySelector('#dashboard');
const dashboardChapter=document.querySelector('.dashboard-chapter');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const orb=document.querySelector('.motion-orb');
const header=document.querySelector('.top');
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n)};
let target=0, animatingScroll=false, pointerX=0, pointerY=0, driftX=0, driftY=0, frameId=0;
function maxScroll(){return Math.max(0,rail.scrollWidth-rail.clientWidth)}
function render(now){
 const max=maxScroll(); target=clamp(target,0,max);
 if(animatingScroll){
   const difference=target-rail.scrollLeft;
   if(reduced||Math.abs(difference)<.3){rail.scrollLeft=target;animatingScroll=false}
   else rail.scrollLeft+=difference*.17;
 }
 const progress=max?clamp(rail.scrollLeft/max,0,1):0;
 const flight=smooth(progress/.3);
 const reveal=smooth((progress-.31)/.63);
 const pointerWeight=1-smooth(progress/.16);
 driftX+=(pointerX-driftX)*.055;driftY+=(pointerY-driftY)*.055;
 const breath=reduced?0:Math.sin(now/1600)*1.6;
 const introX=innerWidth*(.70+.14*flight);
 const landingX=innerWidth*(1-progress+.14);
 const x=progress<.3?introX:landingX;
 const y=innerHeight*(.62-.07*flight)-Math.sin(Math.PI*flight)*innerHeight*.055;
 const base=Math.min(innerWidth*.25,300);
 const diameter=base*(1-.62*flight)+reveal*Math.min(innerWidth*.20,200);
 const offsetX=driftX*pointerWeight,offsetY=(driftY+breath)*pointerWeight;
 orb.style.width=diameter+'px';orb.style.height=diameter+'px';
 orb.style.transform=`translate3d(${x+offsetX-diameter/2}px,${y+offsetY-diameter/2}px,0)`;
 orb.style.opacity=String(reduced?(progress<.35?1:0):1-smooth((progress-.40)/.28));
 orb.style.visibility=progress>.78?'hidden':'visible';
 dashboardChapter.style.clipPath=reduced?'none':`circle(${3.5+reveal*150}% at 14% 55%)`;
 const head=smooth((progress-.62)/.3);header.style.opacity=head;header.style.pointerEvents=head>.8?'auto':'none';
 document.querySelector('.top-link').textContent='К началу ←';
 frameId=requestAnimationFrame(render);
}
rail.addEventListener('scroll',()=>{if(!animatingScroll)target=rail.scrollLeft},{passive:true});
rail.addEventListener('wheel',e=>{
 if(document.querySelector('dialog[open]'))return;
 if(innerWidth<=760&&rail.scrollLeft>rail.clientWidth*.8&&e.target.closest('.dashboard'))return;
 const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
 if(!delta)return;
 e.preventDefault();target=clamp((animatingScroll?target:rail.scrollLeft)+delta,0,maxScroll());animatingScroll=true;
},{passive:false});
window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){pointerX=clamp((e.clientX/innerWidth-.5)*16,-8,8);pointerY=clamp((e.clientY/innerHeight-.5)*16,-8,8)}},{passive:true});
document.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0});
function navigate(destination){target=clamp(destination,0,maxScroll());animatingScroll=true}
document.querySelector('.identity').addEventListener('click',e=>{e.preventDefault();navigate(0)});
document.querySelector('.top-link').addEventListener('click',e=>{e.preventDefault();navigate(0)});
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();navigate(e.key==='ArrowRight'?maxScroll():0)}});
requestAnimationFrame(()=>{rail.scrollLeft=0;target=0;frameId=requestAnimationFrame(render)});
window.addEventListener('resize',()=>{target=clamp(target,0,maxScroll())});
const emptyDetail=document.querySelector('#empty-detail');
const draftSurface=emptyDetail.querySelector('.draft-surface');
let activeTile=null, closing=false;
document.querySelectorAll('.tile').forEach(tile=>tile.addEventListener('click',()=>{
  const scholarshipModal=emptyDetail.querySelector('.scholarship-modal');
  const educationModal=emptyDetail.querySelector('.education-modal');
  const lctModal=emptyDetail.querySelector('.lct-modal');
  const contestsModal=emptyDetail.querySelector('.contests-modal');
  const extraModalNames={languages:'languages',devtime:'devtime',goodline:'goodline',skif:'skif',awards:'awards',atwinta:'atwinta',ctip:'ctip',scaena:'scaena',academic:'academic',viridis:'viridis'};
  activeTile=tile; closing=false; emptyDetail.classList.remove('is-closing');
  const extraModals=Object.fromEntries(Object.keys(extraModalNames).map(name=>[name,emptyDetail.querySelector('.'+name+'-modal')]));
  const selectedExtra=Object.keys(extraModals).find(name=>tile.classList.contains('tile-'+name));
  Object.entries(extraModals).forEach(([name,modal])=>{modal.hidden=name!==selectedExtra; if(name===selectedExtra) modal.scrollTop=0;});
  const isScholarship=tile.classList.contains('tile-scholarships');
  const isEducation=tile.classList.contains('tile-education');
  const isLct=tile.classList.contains('tile-lct');
  const isContests=tile.classList.contains('tile-contests');
  scholarshipModal.hidden=!isScholarship; educationModal.hidden=!isEducation; lctModal.hidden=!isLct; contestsModal.hidden=!isContests;
  emptyDetail.classList.toggle('has-scholarship',isScholarship);
  emptyDetail.classList.toggle('has-experience',isEducation||isLct||isContests||!!selectedExtra);
  const titleId=isScholarship?'scholarship-title':isEducation?'education-title':isLct?'lct-title':isContests?'contests-title':selectedExtra?selectedExtra+'-title':null;
  if(titleId) emptyDetail.setAttribute('aria-labelledby',titleId); else emptyDetail.removeAttribute('aria-labelledby');
  if(isEducation) educationModal.scrollTop=0; if(isLct) lctModal.scrollTop=0; if(isContests) contestsModal.scrollTop=0;
  const origin=tile.getBoundingClientRect();
  const startColor=getComputedStyle(tile).backgroundColor;
  draftSurface.getAnimations().forEach(animation=>animation.cancel());
  emptyDetail.showModal();
  if(reduced)return;
  const destination=draftSurface.getBoundingClientRect();
  draftSurface.animate([
    {transform:'translate('+ (origin.left-destination.left) +'px,'+ (origin.top-destination.top) +'px) scale('+ (origin.width/destination.width) +','+ (origin.height/destination.height) +')',backgroundColor:startColor},
    {transform:'translate(0,0) scale(1,1)',backgroundColor:'#ffffff'}
  ],{duration:820,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
}));
function closeDetail(){
  if(!emptyDetail.open || closing)return;
  if(reduced || !activeTile){emptyDetail.close();return}
  closing=true;
  activeTile.querySelectorAll(':scope > span').forEach(part=>part.animate([{opacity:0,filter:'blur(5px)'},{opacity:1,filter:'blur(0px)'}],{duration:350,delay:150,easing:'cubic-bezier(.2,.7,.2,1)'}));
  const origin=activeTile.getBoundingClientRect();
  const destination=emptyDetail.getBoundingClientRect();
  const currentTransform=getComputedStyle(draftSurface).transform;
  draftSurface.getAnimations().forEach(animation=>animation.cancel());
  emptyDetail.classList.add('is-closing');
  const anim=draftSurface.animate([
    {transform:currentTransform==='none'?'translate(0,0) scale(1,1)':currentTransform,backgroundColor:'#fff'},
    {transform:'translate('+ (origin.left-destination.left) +'px,'+ (origin.top-destination.top) +'px) scale('+ (origin.width/destination.width) +','+ (origin.height/destination.height) +')',backgroundColor:getComputedStyle(activeTile).backgroundColor}
  ],{duration:300,easing:'cubic-bezier(.16,.75,.28,1)',fill:'both'});
  anim.finished.then(()=>{emptyDetail.close();emptyDetail.classList.remove('is-closing');closing=false}).catch(()=>{});
}
document.querySelector('.draft-close').addEventListener('click',closeDetail);
emptyDetail.addEventListener('click',e=>{if(e.target===emptyDetail)closeDetail()});
emptyDetail.addEventListener('cancel',e=>{e.preventDefault();closeDetail()});

