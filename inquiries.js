(async()=>{
 const form=document.querySelector('#inquiry');if(!form)return;
 const labels=window.PositronInquiryText[document.documentElement.lang.split('-')[0]];
 if(typeof location!=='undefined' && typeof products!=='undefined'){const id=new URLSearchParams(location.search).get('product');const selected=products.find(p=>p.id===id);if(selected)form.querySelector('[name=product]').value=selected.name;}
 try{if(typeof location!=='undefined'&&new URLSearchParams(location.search).get('technical')==='1'&&window.PositronTechnicalHandoff){const draft=window.PositronTechnicalHandoff.read(sessionStorage,document.documentElement.lang.split('-')[0]);if(draft){const message=form.querySelector('[name=message]');if(message){const apply=()=>{message.value=draft.text;form.querySelector('[name=product]').value=draft.productName;try{sessionStorage.removeItem('positron-technical-handoff');}catch{}};if(!message.value)apply();else{const insert=document.createElement('button');insert.type='button';insert.className='btn';insert.textContent=window.PositronTechnicalHandoff.labels[document.documentElement.lang.split('-')[0]];insert.onclick=()=>{apply();insert.remove();};form.prepend(insert);}}}}
 }catch{}
 const button=form.querySelector('[type=submit]'),status=document.querySelector('#form-status'),normal=button.textContent;
 let busy=false;
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!form.reportValidity())return;
  busy=true;button.disabled=true;button.textContent=labels.sending;status.textContent='';delete status.dataset.saved;
  try{
   const f=new FormData(form),body={};for(const key of ['name','email','phone','organization','product','message','website'])body[key]=String(f.get(key)||'');
   if(window.PositronSourceCategory)body.source=window.PositronSourceCategory();
   body.consent=f.get('consent')==='on';body.language=document.documentElement.lang.split('-')[0];
   const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(body))))].map(x=>x.toString(16).padStart(2,'0')).join('');
   let prior;try{prior=JSON.parse(sessionStorage.getItem('positron-inquiry-key')||'null');}catch{}
   body.idempotencyKey=prior?.hash===hash?prior.id:crypto.randomUUID();
   try{sessionStorage.setItem('positron-inquiry-key',JSON.stringify({hash,id:body.idempotencyKey}));}catch{}
   const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
   const result=await response.json();if(!response.ok||!result.accepted){status.textContent=response.status===429?labels.rate:labels.error;return;}
   status.textContent=labels.success+' '+result.number;status.dataset.saved='true';form.reset();
   try{sessionStorage.removeItem('positron-inquiry-key');}catch{}
  }catch{status.textContent=labels.error;}finally{busy=false;button.disabled=false;button.textContent=normal;}
 });
})();
