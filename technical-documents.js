(()=>{
 const root=document.documentElement,theme=document.querySelector('[data-docs-theme]');
 const dark=()=>root.dataset.theme==='dark';
 function apply(){
  if(theme){theme.textContent=dark()?theme.dataset.themeLight:theme.dataset.themeDark;theme.href='?theme='+(dark()?'light':'dark')+location.hash;theme.setAttribute('aria-label',theme.textContent);}
  document.querySelectorAll('a[data-language]').forEach(a=>{const u=new URL(a.href);u.searchParams.set('theme',dark()?'dark':'light');a.href=u.pathname+u.search+location.hash;});
  document.querySelectorAll('a[data-docs-target],.technical-docs-nav a,[data-compare-link],[data-technical-link],.geography-nav a,.careers-nav a').forEach(a=>{const u=new URL(a.href);u.searchParams.set('theme',dark()?'dark':'light');a.href=u.pathname+u.search+u.hash;});
  document.querySelectorAll('a[data-main-target]').forEach(a=>{a.href=(dark()?document.body.dataset.mainDark:document.body.dataset.mainLight)+'?theme='+(dark()?'dark':'light')+a.dataset.mainTarget;});
 }
 function select(){const id=location.hash.slice(1),item=document.getElementById(id);if(!item?.classList.contains('document-product'))return;document.querySelectorAll('.document-product').forEach(x=>x.open=x===item);requestAnimationFrame(()=>item.scrollIntoView({block:'start',behavior:'instant'}));apply();}
 theme?.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const y=scrollY;root.dataset.theme=dark()?'light':'dark';const u=new URL(location.href);u.searchParams.set('theme',root.dataset.theme);history.replaceState(history.state,'',u.pathname+u.search+u.hash);apply();requestAnimationFrame(()=>scrollTo({top:y,behavior:'instant'}));});
 document.addEventListener('toggle',event=>{if(!event.target.matches?.('.document-product')||!event.target.open)return;document.querySelectorAll('.document-product').forEach(x=>{if(x!==event.target)x.open=false;});history.replaceState(history.state,'',location.pathname+location.search+'#'+event.target.id);apply();},true);
 const header=document.querySelector('header'),offset=()=>root.style.setProperty('--documents-header-offset',(header.getBoundingClientRect().height+20)+'px');offset();if(window.ResizeObserver)new ResizeObserver(offset).observe(header);
 document.addEventListener('click',event=>{const a=event.target.closest?.('.technical-docs-nav a');if(a&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){const u=new URL(a.href);if(u.pathname===location.pathname&&u.hash===location.hash){event.preventDefault();select();}}});
 window.addEventListener('hashchange',select);apply();select();
})();
