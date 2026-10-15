(function(root){
 const fields=['task','radiation','ranges','environment','climate','interfaces','quantity','delivery','documents','notes'];
 function compose(input,product,t,{now=new Date().toISOString()}={}){
 const blocks=[{style:'Title',text:t.title},{text:'Позитрон ГМБХ'},{text:t.documentIntro||t.intro},{text:t.generated+': '+((t.rtl?'\u2066':'')+now.slice(0,10)+' '+now.slice(11,16)+' UTC'+(t.rtl?'\u2069':''))},{text:t.product+': '+(product?.name||t.undecided)},{style:'Heading1',text:t.requirements}];
 fields.forEach((key,i)=>{let value=input[key];if(Array.isArray(value))value=value.filter(v=>typeof v==='string'&&v.trim()).join(', ');value=String(value||'').trim();blocks.push({text:t.fields[i]+': '+(value||t.clarify)});});
 blocks.push({style:'Heading1',text:t.catalogue});if(product){blocks.push({text:product.name+' — '+product.type});for(const [key,value]of product.specs)blocks.push({text:key+': '+value});blocks.push({text:'https://positron-2026-v1.eagercorgi32.chatgpt.site'+product.url},{text:'https://positron-2026-v1.eagercorgi32.chatgpt.site/assets/catalog.pdf#page='+product.page});}else blocks.push({text:t.clarify});
 blocks.push({text:t.review});return {blocks,text:blocks.map(b=>b.text).join('\n\n'),productName:product?.name||t.undecided,productId:product?.id||null,createdAt:now};
 }
 const api={fields,compose};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PositronTechnicalRequest=api;
})(typeof window==='undefined'?globalThis:window);
