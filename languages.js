// Language navigation preserves the section; theme changes preserve the live page.
(()=>{
const root=document.documentElement,theme=document.querySelector('[data-theme-link]');
const light={ru:'index.html',uk:'ua.html',en:'en.html',ar:'ar.html',zh:'zh.html',de:'de.html',fr:'fr.html'},dark={ru:'dark.html',uk:'dark-ua.html',en:'dark-en.html',ar:'dark-ar.html',zh:'dark-zh.html',de:'dark-de.html',fr:'dark-fr.html'};
const labels={ru:['◐ Тёмный фон','◑ Светлый фон'],uk:['◐ Темне тло','◑ Світле тло'],en:['◐ Dark theme','◑ Light theme'],ar:['◐ خلفية داكنة','◑ خلفية فاتحة'],zh:['◐ 深色背景','◑ 浅色背景'],de:['◐ Dunkler Hintergrund','◑ Heller Hintergrund'],fr:['◐ Fond sombre','◑ Fond clair']};
const lang=root.lang.split('-')[0];let busy=false;
function updateLinks(){const isDark=root.dataset.theme==='dark';document.querySelectorAll('[data-language]').forEach(link=>{link.href=(isDark?dark:light)[link.dataset.language]+(isDark?'':'?theme=light')+window.location.hash;});theme.href=(isDark?light:dark)[lang]+(isDark?'?theme=light':'')+window.location.hash;document.querySelectorAll('.geography-nav a,.careers-nav a,.technical-docs-nav a,[data-compare-link],[data-technical-link],a[data-product-page]').forEach(a=>{const u=new URL(a.href,window.location.href);u.searchParams.set('theme',isDark?'dark':'light');a.href=u.pathname+u.search+u.hash;});}
function apply(isDark,x,y){if(isDark)root.dataset.theme='dark';else delete root.dataset.theme;
 const label=labels[lang][Number(isDark)];theme.textContent=label;theme.setAttribute('aria-label',label.slice(2));document.querySelector('meta[name="theme-color"]').content=isDark?'#09131d':'#102b3d';
 // Update the address for refresh/share without navigation or anchor scrolling.
 const url=new URL(window.location.href);url.pathname=url.pathname.replace(/[^/]*$/,(isDark?dark:light)[lang]);url.searchParams.set('theme',isDark?'dark':'light');window.history.replaceState(window.history.state,'',url.href);updateLinks();
 const previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo({left:x,top:y,behavior:'instant'});requestAnimationFrame(()=>{window.scrollTo({left:x,top:y,behavior:'instant'});requestAnimationFrame(()=>{root.style.scrollBehavior=previous;busy=false;});});
}
updateLinks();window.addEventListener('hashchange',updateLinks);
theme.addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();if(busy)return;busy=true;const x=window.scrollX,y=window.scrollY,isDark=root.dataset.theme!=='dark';
 if(!isDark){document.querySelector('link[href="dark.css"]')?.remove();apply(false,x,y);return;}
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='dark.css';sheet.onload=()=>apply(true,x,y);sheet.onerror=()=>{sheet.remove();busy=false;};document.querySelector('link[data-theme-anchor],link[href="old-content.css"],link[href="tablet.css"]').before(sheet);
});
})();
