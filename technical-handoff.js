(function(root){
 function read(storage,language,now=Date.now()){
  let x;try{x=JSON.parse(storage.getItem('positron-technical-handoff')||'null');}catch{return null;}
  if(!x||x.version!==1||x.language!==language||typeof x.text!=='string'||x.text.length<5||x.text.length>4000||typeof x.productName!=='string'||!x.productName||x.productName.length>200||!Number.isFinite(Date.parse(x.createdAt))||now-Date.parse(x.createdAt)>3600000||Date.parse(x.createdAt)>now+60000)return null;return x;
 }
 const labels={ru:'Вставить подготовленный технический запрос',uk:'Вставити підготовлений технічний запит',en:'Insert the prepared technical enquiry',de:'Vorbereitete technische Anfrage einfügen',fr:'Insérer la demande technique préparée',ar:'إدراج الطلب الفني المُعدّ',zh:'插入已准备的技术咨询'};
 const api={read,labels};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PositronTechnicalHandoff=api;
})(typeof window==='undefined'?globalThis:window);
