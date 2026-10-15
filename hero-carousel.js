// Shared carousel; product content comes from the selected language's app script.
(()=>{
const lang=document.documentElement.lang.split('-')[0];
const copy={ru:{pause:'Пауза презентации',play:'Продолжить презентацию',details:'Подробнее об изделии: ',image:'Увеличить изображение: ',index:'ПРИБОРЫ РАДИАЦИОННОГО КОНТРОЛЯ',brochure:'Проспект: '},uk:{pause:'Пауза презентації',play:'Продовжити презентацію',details:'Докладніше про виріб: ',image:'Збільшити зображення: ',index:'ПРИЛАДИ РАДІАЦІЙНОГО КОНТРОЛЮ',brochure:'Проспект: '},en:{pause:'Pause slideshow',play:'Resume slideshow',details:'Product details: ',image:'Enlarge image: ',index:'RADIATION MONITORING INSTRUMENTS',brochure:'Brochure: '},ar:{pause:'إيقاف العرض مؤقتاً',play:'متابعة العرض',details:'تفاصيل المنتج: ',image:'تكبير الصورة: ',index:'أجهزة الرقابة الإشعاعية',brochure:'النشرة: '},zh:{pause:'暂停产品展示',play:'继续产品展示',details:'产品详情：',image:'放大图片：',index:'辐射监测仪器',brochure:'产品资料：'},de:{pause:'Präsentation pausieren',play:'Präsentation fortsetzen',details:'Produktdetails: ',image:'Bild vergrößern: ',index:'GERÄTE ZUR STRAHLUNGSÜBERWACHUNG',brochure:'Prospekt: '},fr:{pause:'Mettre la présentation en pause',play:'Reprendre la présentation',details:'Détails du produit : ',image:'Agrandir l’image : ',index:'APPAREILS DE SURVEILLANCE RADIOLOGIQUE',brochure:'Brochure : '}}[lang]||{};
const carousel=document.querySelector('#hero-carousel'),image=document.querySelector('#hero-product-image'),title=document.querySelector('#hero-product-name'),type=document.querySelector('#hero-product-type'),details=document.querySelector('#hero-product-details'),brochure=document.querySelector('#hero-product-brochure'),counter=document.querySelector('#hero-count'),index=document.querySelector('#hero-index'),play=document.querySelector('#hero-play');
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
const hoverMedia=window.matchMedia('(hover: hover)');
const short={ru:['Пауза','Продолжить'],uk:['Пауза','Продовжити'],en:['Pause','Resume'],ar:['إيقاف','متابعة'],zh:['暂停','继续'],de:['Pause','Fortsetzen'],fr:['Pause','Reprendre']}[lang];
const interval=6000;
let current=0,playing=!motion.matches,hover=false,timer=null,loaded=false,active=true;
function display(n){current=(n+products.length)%products.length;const p=products[current];image.src=`assets/${p.id}-cutout.png`;image.alt=p.name;image.setAttribute('aria-label',copy.image+p.name);title.textContent=p.name;type.textContent=p.type;details.dataset.product=p.id;details.setAttribute('aria-label',copy.details+p.name);brochure.href=`assets/catalog.pdf#page=${p.page}`;brochure.setAttribute('aria-label',copy.brochure+p.name+' · PDF');counter.textContent=`${current+1} / ${products.length}`;index.textContent=String(current+1).padStart(2,'0')+' / '+copy.index;}
function updatePlay(){play.textContent=(playing?'Ⅱ ':'▶ ')+short[Number(!playing)];play.setAttribute('aria-pressed',String(!playing));play.setAttribute('aria-label',playing?copy.pause:copy.play);}
function clear(){if(timer!==null){clearTimeout(timer);timer=null;}}
function schedule(){
 clear();
 if(!loaded||!active||!playing||hover||document.hidden)return;
 timer=setTimeout(()=>{
  timer=null;
  if(playing&&!hover&&!document.hidden&&!document.querySelector('dialog[open]'))display(current+1);
  schedule();
 },interval);
}
function pause(){playing=false;clear();updatePlay();}
function manual(step){pause();display(current+step);}
document.querySelector('#hero-prev').addEventListener('click',()=>manual(-1));
document.querySelector('#hero-next').addEventListener('click',()=>manual(1));
play.addEventListener('click',()=>{playing=!playing;hover=false;updatePlay();schedule();});
carousel.addEventListener('mouseenter',()=>{hover=hoverMedia.matches;schedule();});
carousel.addEventListener('mouseleave',()=>{hover=false;schedule();});
// Interaction pauses persist until Resume is explicitly selected.
carousel.addEventListener('pointerdown',e=>{if(e.target!==play&&!play.contains(e.target))pause();});
carousel.addEventListener('focusin',e=>{if(e.target!==play&&!play.contains(e.target))pause();});
carousel.addEventListener('keydown',e=>{
 if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
 if(e.key==='ArrowLeft'){e.preventDefault();manual(-1);}
 if(e.key==='ArrowRight'){e.preventDefault();manual(1);}
});
const onMotion=e=>{if(e.matches)pause();};
if(motion.addEventListener)motion.addEventListener('change',onMotion);
else if(motion.addListener)motion.addListener(onMotion);
document.addEventListener('visibilitychange',schedule);
window.addEventListener('pagehide',()=>{active=false;clear();});
window.addEventListener('pageshow',()=>{active=true;schedule();});
// Existing product cutouts are unchanged; begin only after image decoding.
const ready=Promise.all(products.slice(0,2).map(p=>{const img=new Image();const src=`assets/${p.id}-cutout.png`;img.src=window.PositronImages?.url(src)||src;return typeof img.decode==='function'?img.decode().catch(()=>{}):Promise.resolve();}));
display(0);updatePlay();ready.then(()=>{loaded=true;schedule();});
})();
