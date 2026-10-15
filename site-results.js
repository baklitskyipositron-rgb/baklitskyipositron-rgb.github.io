(()=>{
 const lang=document.documentElement.lang.split('-')[0],texts={
 ru:['Настройки статистики','Разрешить анонимный учёт просмотров изделий, нажатий на проспекты и категории источника обращения? Без имён, текстов заявок, полных URL и идентификаторов посетителя. По умолчанию выключено.','Разрешить','Отключить','Включено','Выключено'],
 uk:['Налаштування статистики','Дозволити анонімний облік переглядів виробів, натискань на проспекти та категорії джерела звернення? Без імен, текстів заявок, повних URL та ідентифікаторів відвідувача. Типово вимкнено.','Дозволити','Вимкнути','Увімкнено','Вимкнено'],
 en:['Statistics settings','Allow anonymous counts of product views, brochure clicks and enquiry source categories? No names, enquiry text, full URLs or visitor identifiers. Disabled by default.','Allow','Disable','Enabled','Disabled'],
 de:['Statistikeinstellungen','Anonyme Zählung von Produktaufrufen, Prospekt-Klicks und Herkunftskategorien von Anfragen erlauben? Ohne Namen, Anfragetexte, vollständige URLs oder Besucherkennungen. Standardmäßig deaktiviert.','Erlauben','Deaktivieren','Aktiviert','Deaktiviert'],
 fr:['Paramètres des statistiques','Autoriser le comptage anonyme des vues des produits, des clics sur les brochures et des catégories de provenance des demandes ? Sans noms, textes des demandes, URL complètes ni identifiants de visiteurs. Désactivé par défaut.','Autoriser','Désactiver','Activé','Désactivé'],
 ar:['إعدادات الإحصاءات','هل تسمح بإحصاء مجهول لمشاهدات المنتجات والنقرات على الكتيبات وفئات مصادر الطلبات؟ دون أسماء أو نصوص طلبات أو روابط كاملة أو معرّفات للزوار. معطّل افتراضيًا.','السماح','تعطيل','مفعّل','معطّل'],
 zh:['统计设置','是否允许匿名统计产品页面浏览、宣传册点击和咨询来源类别？不记录姓名、咨询内容、完整网址或访客标识。默认关闭。','允许','关闭','已开启','已关闭']};
 const t=texts[lang]||texts.en,products=['rzba','kordon','mks','bdmg','amp','surb','rug','sgi','conveyor','bn'];let allowed=false,viewed=false;
 try{allowed=localStorage.getItem('positron-statistics')==='allow';}catch{}
 if(navigator.globalPrivacyControl||navigator.doNotTrack==='1')allowed=false;
 function source(){if(!allowed)return 'unknown';try{let saved=sessionStorage.getItem('positron-source-category');if(saved)return saved;let value='direct';if(new URLSearchParams(location.search).has('utm_source'))value='campaign';else if(document.referrer){const host=new URL(document.referrer).hostname;if(host!==location.hostname)value=/(google\.|bing\.|duckduckgo\.|yahoo\.)/.test(host)?'search':/(facebook\.|instagram\.|linkedin\.|t\.co$)/.test(host)?'social':'referral';}sessionStorage.setItem('positron-source-category',value);return value;}catch{return 'unknown';}}
 window.PositronSourceCategory=source;
 function send(event,product){if(!allowed||!products.includes(product))return;fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true,event,product,language:lang,source:source()}),keepalive:true}).catch(()=>{});}
 function view(){const id=document.body.dataset.product;if(!viewed&&products.includes(id)&&allowed){viewed=true;send('product_view',id);}}
 const panel=document.createElement('details');panel.className='statistics-options';panel.dir=lang==='ar'?'rtl':'ltr';const summary=document.createElement('summary');summary.textContent=t[0];const desc=document.createElement('p');desc.textContent=t[1];const state=document.createElement('p');state.setAttribute('role','status');
 const yes=document.createElement('button'),no=document.createElement('button');yes.type=no.type='button';yes.textContent=t[2];no.textContent=t[3];
 function set(value){allowed=value&&!navigator.globalPrivacyControl&&navigator.doNotTrack!=='1';try{localStorage.setItem('positron-statistics',allowed?'allow':'deny');if(!allowed)sessionStorage.removeItem('positron-source-category');}catch{}state.textContent=allowed?t[4]:t[5];if(allowed)view();}
 yes.onclick=()=>set(true);no.onclick=()=>set(false);state.textContent=allowed?t[4]:t[5];panel.append(summary,desc,yes,no,state);document.body.append(panel);view();
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;let u;try{u=new URL(a.href,location.href);}catch{return;}if(!/\.pdf$/i.test(u.pathname))return;let id=document.body.dataset.product||a.closest('[data-product]')?.dataset.product;if(!id){const hash=a.getAttribute('href')||'';id=products.find(p=>hash.includes(p+'-'));}send('brochure_click',id);});
})();
