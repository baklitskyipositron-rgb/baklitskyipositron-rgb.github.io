/* Size against the actual rendered labels, including localized text and loaded fonts. */
(() => {
 const nav=document.querySelector('header>#nav');
 const title=document.querySelector('.hero h1');
 let scheduled=false;
 function update(){
  scheduled=false;
  if(nav && !nav.classList.contains('compact-menu') && innerWidth>=1024){
   nav.classList.remove('nav-two-rows');
   const links=[...nav.children].filter(e=>e.matches('a:not(.tender-nav)'));
   let size=16, available=nav.clientWidth;
   const gap=parseFloat(getComputedStyle(nav).columnGap)||10;
   const measure=()=>links.reduce((sum,e)=>sum+e.getBoundingClientRect().width,0);
   nav.style.setProperty('--nav-font-size',size+'px');
   let width=(available-measure()-gap*8)/2;
   while(width<150 && size>14){size--;nav.style.setProperty('--nav-font-size',size+'px');width=(available-measure()-gap*8)/2;}
   if(width<150)nav.classList.add('nav-two-rows');
   else nav.style.setProperty('--nav-feature-width',Math.min(260,Math.floor(width))+'px');
  } else if(nav){nav.classList.remove('nav-two-rows');nav.style.removeProperty('--nav-font-size');nav.style.removeProperty('--nav-feature-width');}
  if(title){
   title.style.removeProperty('font-size');
   if(innerWidth>=768){
    const style=getComputedStyle(title);
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    if(ctx){
     const base=parseFloat(style.fontSize);ctx.font=style.font;
     const measured=ctx.measureText(title.textContent.trim()).width;
     if(measured>title.clientWidth-2)title.style.fontSize=(base*(title.clientWidth-2)/measured).toFixed(2)+'px';
    }
   }
  }
 }
 const queue=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
 addEventListener('resize',queue,{passive:true});addEventListener('orientationchange',queue,{passive:true});
 if(window.visualViewport)visualViewport.addEventListener('resize',queue,{passive:true});
 if(document.fonts)document.fonts.ready.then(queue);
 queue();
})();
