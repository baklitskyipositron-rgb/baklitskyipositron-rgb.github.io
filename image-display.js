(()=>{
 const sources=window.PositronImageSources||{};
 const previews=new Set(Object.values(sources).flatMap(entry=>entry.variants.map(v=>v.path))); 
 function key(source){try{return new URL(source,location.href).pathname.replace(/^\//,'');}catch{return '';}}
 function url(source){const entry=sources[key(source)];return entry?'/'+entry.large:source;}
 function apply(img,source=img.getAttribute('src')){if(!source||img.id==='full-image')return;const sourceKey=key(source),entry=sources[sourceKey];if(!entry){if(img.dataset.optimizedPreview==='true'&&!previews.has(sourceKey)){img.removeAttribute('srcset');img.removeAttribute('sizes');delete img.dataset.originalSrc;delete img.dataset.optimizedPreview;}return;}img.dataset.optimizedPreview='true';img.dataset.originalSrc='/'+key(source);img.sizes='(max-width:800px) 95vw, 50vw';img.srcset=entry.variants.map(v=>'/'+v.path+' '+v.width+'w').join(', ');img.src='/'+entry.large;}
 window.PositronImages={url,apply};
 document.querySelectorAll('img[src]').forEach(img=>apply(img));
 const observer=new MutationObserver(changes=>{for(const change of changes){if(change.type==='attributes'){apply(change.target);continue;}for(const node of change.addedNodes){if(node.nodeType!==1)continue;if(node.matches('img[src]'))apply(node);node.querySelectorAll('img[src]').forEach(img=>apply(img));}}});
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
})();
