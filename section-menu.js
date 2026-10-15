(()=>{
 const menu=document.querySelector('.section-menu');if(!menu)return;
 const summary=menu.querySelector('summary');
 const close=()=>{menu.open=false;};
 menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
 document.addEventListener('click',event=>{if(!menu.contains(event.target))close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){close();summary.focus();}});
 menu.addEventListener('toggle',()=>{if(menu.open){const nuclear=document.querySelector('.nuclear-nav');if(nuclear)nuclear.open=false;}});
 const nuclear=document.querySelector('.nuclear-nav');if(nuclear)nuclear.addEventListener('toggle',()=>{if(nuclear.open)close();});
})();
