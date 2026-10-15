(async()=>{
 const section=document.querySelector('#tenders');if(!section)return;
 const lang=document.documentElement.lang.split('-')[0];let d;try{const j=await (await fetch('tender-locales.json')).json();d=j[lang]||j.ru}catch{return}
 const form=document.querySelector('#tender-filters'),list=document.querySelector('#tender-results'),status=document.querySelector('#tender-status'),updated=document.querySelector('#tender-updated'),more=document.querySelector('#tender-more');
 let rows=[],queries=[],errors=[],page=1,busy=false,hasLoaded=false,updatedAt=null,queryText='',queryProfile='all',queryStatus='',generation=0;
 const normal=s=>String(s||'').toLocaleLowerCase('uk').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node};
 const date=s=>s?new Date(s).toLocaleString(lang==='uk'?'uk-UA':lang,{timeZone:'Europe/Kyiv',timeZoneName:'short'}):d.noDeadline;
 const link=(text,url)=>{const a=el('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
 const safeURL=u=>{try{const v=new URL(u);return ['http:','https:'].includes(v.protocol)?v.href:null}catch{return null}};
 const details=new Map();
 async function detail(id){if(details.has(id))return details.get(id);const r=await fetch('/api/tender?id='+encodeURIComponent(id));if(!r.ok)throw new Error(d.unavailable);const j=await r.json();details.set(id,j);return j}
 const fields=()=>Object.fromEntries(new FormData(form));
 const sectors={nuclear:'енергоатом; атом; ядер; чорнобил; ізотоп; східгзк; східний гірничо',metal:'металург; арселор; метал; інтерпайп; гірничо; комбінат',border:'митниц; митн; прикордон',defence:'оборон; військ; збройн; національн гвард; частина',education:'університет; інститут; академі; коледж; училищ; школ; науков',industry:'завод; виробнич; промислов; підприємств; комбінат'};
 form.elements.sector.addEventListener('change',()=>{form.elements.buyer.value=sectors[form.elements.sector.value]||''});

 function matches(t,f){
  const p=t.procuringEntity||{},buyer=normal([p.name,p.identifier?.legalName,p.identifier?.id].join(' ')),region=normal([p.address?.region,p.address?.locality].join(' '));
  if(f.buyer&&!String(f.buyer).split(/[;,\n]/).filter(v=>v.trim()).some(v=>buyer.includes(normal(v))))return false;
  if(f.region&&!region.includes(normal(f.region)))return false;
  if(f.status==='active'&&!String(t.status).startsWith('active.'))return false;
  if(f.status&&f.status!=='active'&&t.status!==f.status)return false;
  const end=t.tenderPeriod?.endDate;
  if(f.deadlineFrom&&(!end||Date.parse(end)<Date.parse(f.deadlineFrom+'T00:00:00+03:00')))return false;
  if(f.deadlineTo&&(!end||Date.parse(end)>Date.parse(f.deadlineTo+'T23:59:59+03:00')))return false;
  const codes=(f.cpv||'').split(/[;,\s]+/).map(v=>v.replace(/-\d$/,'').replace(/0+$/,'')).filter(Boolean);
  if(codes.length&&!codes.some(c=>(t.items||[]).some(i=>String(i.classification?.id||'').replace(/-\d$/,'').startsWith(c))))return false;
  return true;
 }
 function readerTools(t,container){
  const box=el('div'),heading=el('h4',d.ocrTitle),input=el('input');input.type='file';input.accept='.pdf,.docx,.txt,image/*';input.setAttribute('aria-label',d.ocrUpload);const output=el('div');box.append(heading,el('p',d.ocrPrivacy),input,output);container.append(box);
  const run=async(file,button)=>{if(button)button.disabled=true;input.disabled=true;output.textContent=d.ocrBusy;try{const result=await window.PositronDocumentReader.read(file,p=>{output.textContent=d.ocrBusy+' '+p});output.replaceChildren();if(result.limited)output.append(el('p',d.ocrLimit));output.append(el('h4',d.ocrMatch),el('p',result.families.join(' · ')||d.ocrNone),el('p',d.candidate),el('h4',d.ocrReview));const pre=el('div',result.lines.join('\n'),'tender-review-output');output.append(pre);const raw=el('details');raw.append(el('summary',d.ocrText),el('div',result.text,'tender-review-output'));output.append(raw)}catch{output.textContent=d.ocrError+' '+d.ocrLimit}finally{if(button)button.disabled=false;input.disabled=false}};
  input.addEventListener('change',()=>{if(input.files[0])run(input.files[0])});
  const tools=el('div',undefined,'tender-ocr-tools');(t.documents||[]).filter(doc=>/pdf|image|wordprocessingml|text\/plain/.test(doc.format||'')||/\.(pdf|docx|txt|jpe?g|png)$/i.test(doc.title||'')).forEach(doc=>{const button=el('button',d.ocrRun+': '+doc.title);button.type='button';button.addEventListener('click',async()=>{button.disabled=true;output.textContent=d.ocrBusy;try{const r=await fetch('/api/document?id='+encodeURIComponent(t.tenderID)+'&document='+encodeURIComponent(doc.id));if(!r.ok)throw new Error();const blob=await r.blob();await run(new File([blob],doc.title||'document.pdf',{type:doc.format||blob.type}),button)}catch{output.textContent=d.ocrError;button.disabled=false}});tools.append(button)});box.append(tools);
 }
 function reviewPanel(t,container){
  container.replaceChildren();container.append(el('h4',d.technical),el('p',d.candidate,'tender-candidate'));
  if(t.analysis?.families.length){const p=el('p');t.analysis.families.forEach((f,i)=>{if(i)p.append(' · ');const product=typeof products!=='undefined'?products.find(p=>p.id===f.id):null;const a=el('a',product?.name||f.name);a.href='#catalog';a.addEventListener('click',()=>{document.querySelector('[data-filter="all"]')?.click();const search=document.querySelector('#search');if(search){search.value=product?.name||f.name;search.dispatchEvent(new Event('input',{bubbles:true}))}});p.append(a)});container.append(p)}else container.append(el('p',d.noFit));
  const check=el('ul');['task','range','construction','certificates','service'].forEach(k=>check.append(el('li',d[k])));container.append(el('h4',d.checklist),check);
  if(t.description)container.append(el('p',t.description));
  container.append(el('h4',d.lots));const lots=el('ul');(t.lots||[]).forEach(l=>lots.append(el('li',[l.title,l.status].filter(Boolean).join(' · '))));(t.items||[]).forEach(i=>lots.append(el('li',[i.description,i.quantity,i.unit?.name,i.classification?.id].filter(v=>v!==undefined).join(' · '))));container.append(lots);
  container.append(el('h4',d.documents));const docs=el('ul');(t.documents||[]).forEach(doc=>{const u=safeURL(doc.url);if(!u)return;const li=el('li');li.append(link(doc.title||d.documents,u));docs.append(li)});container.append(docs,el('p',d.ocrNote));readerTools(t,container);
 }
 function render(){
  list.replaceChildren();const f=fields();const filtered=rows.map(t=>details.get(t.tenderID)||t).filter(t=>matches(t,f));
  for(const t of filtered){
   const card=el('article',undefined,'tender-card');const p=t.procuringEntity||{};
   card.append(el('div',t.tenderID+' · '+t.status,'tender-meta'),el('h3',t.title),el('p',p.name||p.identifier?.legalName||''));
   card.append(el('p',[p.identifier?.id,p.address?.region,p.address?.locality].filter(Boolean).join(' · '),'tender-meta'));
   const amount=t.value?.amount;card.append(el('p',d.amount+': '+(amount!==undefined?Number(amount).toLocaleString(lang)+' '+(t.value.currency||''):'—')+' · '+d.deadline+': '+date(t.tenderPeriod?.endDate)));
   card.append(link(d.portal+' ↗','https://prozorro.gov.ua/uk/tender/'+t.tenderID));
   const inspect=el('details'),summary=el('summary',d.inspect),body=el('div');inspect.append(summary,body);inspect.addEventListener('toggle',async()=>{if(!inspect.open||body.dataset.ready)return;body.textContent=d.loading;try{const data=await detail(t.tenderID);reviewPanel(data,body);body.dataset.ready='true'}catch{body.textContent=d.unavailable}});card.append(inspect);list.append(card);
  }
  status.textContent=(filtered.length?filtered.length+' · ':d.empty+' ')+d.coverage+(errors.length?' '+d.partial:'')+(errors.includes('details')?' '+d.detailError:'');
  more.hidden=!queries.some(q=>q.more)||page>=10;
 }
 async function load(append=false){
  if(busy)return;const f=fields();if(f.deadlineFrom&&f.deadlineTo&&f.deadlineFrom>f.deadlineTo){form.elements.deadlineTo.setCustomValidity(d.deadlineFrom+' ≤ '+d.deadlineTo);form.reportValidity();return}
  form.elements.deadlineTo.setCustomValidity('');busy=true;const gen=++generation;status.textContent=d.loading;form.querySelector('[type=submit]').disabled=true;more.disabled=true;
  if(!append){page=1;rows=[];queryText=f.keywords.trim();queryProfile=f.profile;queryStatus=f.status;details.clear()}
  try{
   const response=await fetch('/api/tenders?q='+encodeURIComponent(queryText)+'&page='+page+'&profile='+encodeURIComponent(queryProfile)+'&status='+encodeURIComponent(queryStatus));if(!response.ok)throw new Error();const j=await response.json();
   if(gen!==generation)return;const map=new Map(rows.map(t=>[t.tenderID,t]));j.data.forEach(t=>map.set(t.tenderID,t));rows=[...map.values()];queries=j.queries;errors=j.errors;updatedAt=j.updatedAt;updated.textContent=d.updated+': '+date(updatedAt);hasLoaded=true;
   if(f.cpv||f.region||/\d{5,}/.test(f.buyer)||f.deadlineFrom||f.deadlineTo){
    let ix=0,failed=0;const pending=rows.filter(t=>!details.has(t.tenderID));await Promise.all(Array.from({length:Math.min(4,pending.length)},async()=>{while(ix<pending.length){const row=pending[ix++];try{await detail(row.tenderID)}catch{failed++}}}));if(failed)errors.push('details');
   }
   render();
  }catch{status.textContent=d.unavailable;more.hidden=true;if(!append)list.replaceChildren()}
  finally{busy=false;form.querySelector('[type=submit]').disabled=false;more.disabled=false}
 }
 for(const field of ['deadlineFrom','deadlineTo'])form.elements[field].addEventListener('input',()=>form.elements.deadlineTo.setCustomValidity(''));form.addEventListener('submit',e=>{e.preventDefault();load()});form.addEventListener('reset',()=>setTimeout(()=>{if(hasLoaded)load()},0));document.querySelector('#tender-refresh').addEventListener('click',()=>load());more.addEventListener('click',()=>{page++;load(true)});
 if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!hasLoaded&&!busy)load()},{rootMargin:'100px'});io.observe(section)}else if(location.hash==='#tenders')load();
 document.querySelectorAll('a[href="#tenders"]').forEach(a=>a.addEventListener('click',()=>{if(!hasLoaded)load()}));
 setInterval(()=>{if(!document.hidden&&hasLoaded&&!busy){const rect=section.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight&&!section.querySelector('details[open]')&&!form.contains(document.activeElement))load();else if(updatedAt&&Date.now()-Date.parse(updatedAt)>900000)updated.textContent=d.stale}},300000);
})();
