(()=>{
 const loadScript=(url,globalName)=>{if(window[globalName])return Promise.resolve(window[globalName]);return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=()=>resolve(window[globalName]);s.onerror=reject;document.head.append(s)})};
 let pdfModule,ocrPromise;
 async function ocr(){if(!ocrPromise)ocrPromise=loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js','Tesseract');return ocrPromise}
 window.PositronDocumentReader={async read(file,progress){
  if(file.size>15*1024*1024)throw new Error('LIMIT');const name=(file.name||'').toLowerCase();let worker,text='',limited=false;
  const recognize=async image=>{if(!worker){const t=await ocr();worker=await t.createWorker('ukr+eng',1,{logger:m=>{if(m.status==='recognizing text')progress(Math.round(m.progress*100)+'%')}})}return (await worker.recognize(image)).data.text};
  try{
   if(name.endsWith('.txt')||file.type==='text/plain')text=await file.text();
   else if(name.endsWith('.docx')||file.type.includes('wordprocessingml')){const m=await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.9.0/mammoth.browser.min.js','mammoth');text=(await m.extractRawText({arrayBuffer:await file.arrayBuffer()})).value}
   else if(name.endsWith('.pdf')||file.type==='application/pdf'){
    if(!pdfModule){pdfModule=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');pdfModule.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'}
    const pdf=await pdfModule.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;limited=pdf.numPages>40;
    try{for(let n=1;n<=Math.min(40,pdf.numPages);n++){progress(n+' / '+pdf.numPages);const page=await pdf.getPage(n),content=await page.getTextContent();let part=content.items.map(i=>i.str||'').join(' ');if(part.replace(/\s/g,'').length<30){const view=page.getViewport({scale:1.6}),canvas=document.createElement('canvas');canvas.width=view.width;canvas.height=view.height;await page.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;part=await recognize(canvas)}text+='\n['+n+']\n'+part;page.cleanup()}}finally{await pdf.destroy()}
   }else if(file.type.startsWith('image/')||/\.(jpe?g|png|webp|bmp)$/i.test(name))text=await recognize(file);
   else throw new Error('FORMAT');
   const lines=text.split(/\n|(?<=[.;])\s+/).filter(s=>/альфа|бета|гамма|нейтрон|потужн|діапазон|диапазон|чутлив|чувств|похиб|погреш|\bIP\d|мкЗв|мЗв|µSv|mSv|кев|кэВ|МеВ|RS.?485|сертиф|калібр|калибр|повір|повер/i.test(s));
   const rules=await (await fetch('tender-catalog.json')).json();const families=rules.filter(rule=>new RegExp(rule.pattern,'i').test(text)&&(!rule.exclude||!new RegExp(rule.exclude,'i').test(text))).map(rule=>(typeof products!=='undefined'?products.find(p=>p.id===rule.id)?.name:null)||rule.name);
   return {text,limited,lines:lines.slice(0,80),families};
  }finally{if(worker)await worker.terminate()}
 }};
})();
