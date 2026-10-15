(()=>{
 const root=document.documentElement,body=document.body,theme=document.querySelector('[data-product-theme]');
 function apply(){const dark=root.dataset.theme==='dark';if(theme){theme.textContent=dark?theme.dataset.themeLight:theme.dataset.themeDark;theme.setAttribute('aria-label',theme.textContent);theme.href=dark?'?theme=light':'?theme=dark';}
  document.querySelectorAll('a[data-language]').forEach(a=>{const u=new URL(a.href);u.searchParams.set('theme',dark?'dark':'light');a.href=u.pathname+u.search+u.hash;});
  document.querySelectorAll('[data-compare-link],[data-technical-link],.geography-nav a,.careers-nav a,.technical-docs-nav a').forEach(a=>{const u=new URL(a.href);u.searchParams.set('theme',dark?'dark':'light');a.href=u.pathname+u.search+u.hash;});
  document.querySelectorAll('[data-main-target]').forEach(a=>{const hash=a.dataset.mainTarget;a.href=(dark?body.dataset.mainDark:body.dataset.mainLight)+'?theme='+(dark?'dark':'light')+(hash==='#contact'?'&product='+body.dataset.product:'')+hash;});
 }
 apply();theme?.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();const y=scrollY;root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';const u=new URL(location.href);u.searchParams.set('theme',root.dataset.theme);history.replaceState(null,'',u.pathname+u.search+u.hash);apply();requestAnimationFrame(()=>scrollTo({top:y,behavior:'instant'}));});
 document.querySelectorAll('[data-technical-link]').forEach(a=>{const u=new URL(a.href);u.searchParams.set('theme',root.dataset.theme);a.href=u.pathname+u.search+u.hash;});
 const review=document.querySelector('#product-review-status');
 if(review)(async()=>{try{
  const response=await fetch('/api/content-review?product='+encodeURIComponent(body.dataset.product)+'&lang='+encodeURIComponent(body.dataset.language),{cache:'no-store'});if(!response.ok)return;const data=await response.json();
  if(!data.approved)return;const approved=Date.parse(data.reviewedAt),due=Date.parse(data.nextReviewAt);if(!Number.isFinite(approved)||!Number.isFinite(due)||due<=Date.now())return;
  review.textContent=review.dataset.reviewLabel+' '+new Date(approved).toLocaleDateString(root.lang);review.hidden=false;
  const expire=()=>{const remaining=due-Date.now();if(remaining<=0)review.hidden=true;else setTimeout(expire,Math.min(remaining,2147483647));};expire();
 }catch{}})();
 const destination=document.querySelector('#product-full-description'),status=document.querySelector('#detail-status');
 (async()=>{try{
  const response=await fetch(body.dataset.sourcePage,{cache:'no-cache'});if(!response.ok)throw Error('source');const template=document.createElement('template');template.innerHTML=await response.text();
  const panel=template.content.querySelector('#old-'+body.dataset.product);if(!panel){status.textContent='';return;}
  const content=panel.querySelector('.old-content');if(!content)throw Error('content');content.querySelector('.old-source')?.remove();
  content.querySelectorAll('script,style,form').forEach(n=>n.remove());const known=new Set([...content.querySelectorAll('[id]')].map(n=>n.id));known.add('old-'+body.dataset.product);
  for(const node of content.querySelectorAll('[src],[href]'))for(const attr of ['src','href']){if(!node.hasAttribute(attr))continue;const value=node.getAttribute(attr);
   if(attr==='href'&&value.startsWith('#')&&known.has(value.slice(1)))continue;
   node.setAttribute(attr,new URL(value,new URL(body.dataset.sourcePage,location.origin)).href);
  }
  destination.id='old-'+body.dataset.product;destination.replaceChildren(...content.childNodes);status.textContent='';
  if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target){let n=target;while(n){if(n.tagName==='DETAILS')n.open=true;n=n.parentElement;}target.scrollIntoView();}}
 }catch{status.textContent='';}})();
})();
