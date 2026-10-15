(()=>{
 const folders={ru:'ru',uk:'ua',en:'en',ar:'ar',zh:'zh',de:'de',fr:'fr'};
 function url(id){return '/products/'+folders[document.documentElement.lang.split('-')[0]]+'/'+id+'.html?theme='+(document.documentElement.dataset.theme==='dark'?'dark':'light');}
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-product-page]');if(link){link.href=url(link.dataset.productPage);return;}
  const hero=event.target.closest('#hero-product-details');if(hero&&hero.dataset.product){hero.href=url(hero.dataset.product);event.preventDefault();event.stopImmediatePropagation();if(event.ctrlKey||event.metaKey||event.shiftKey)window.open(hero.href,'_blank','noopener');else location.assign(hero.href);}
 },true);
})();
