(function(root){
 const ids=['rzba','kordon','mks','bdmg','amp','surb','rug','sgi','conveyor','bn'];
 function selected(value){return [...new Set(String(value||'').split(',').filter(x=>ids.includes(x)))].slice(0,3);}
 function toggle(list,id){if(!ids.includes(id))return {items:list,limited:false};if(list.includes(id))return {items:list.filter(x=>x!==id),limited:false};if(list.length===3)return {items:list,limited:true};return {items:[...list,id],limited:false};}
 function filter(rows,{search='',category='',use=''}={}){const q=search.trim().toLocaleLowerCase();return rows.filter(p=>(!category||p.category===category)&&(!use||p.solutions.includes(use))&&(!q||[p.name,p.type,p.description,...p.specs.flat()].join(' ').toLocaleLowerCase().includes(q)));}
 function parse(text){const found=text.match(/const products=(\[[\s\S]*?\]);(?=\s*let filter=)/);if(!found)throw Error('catalog');const rows=JSON.parse(found[1]);if(!Array.isArray(rows)||rows.length!==10||new Set(rows.map(x=>x.id)).size!==10||rows.some(x=>!ids.includes(x.id)||!['name','type','description','category','url'].every(k=>typeof x[k]==='string')||!Array.isArray(x.solutions)||!Array.isArray(x.specs)||x.specs.some(a=>!Array.isArray(a)||a.length!==2||a.some(v=>typeof v!=='string'))||!Number.isInteger(x.page)))throw Error('catalog');return rows;}
 const api={selected,toggle,filter,parse};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PositronCompare=api;
})(typeof window==='undefined'?globalThis:window);
