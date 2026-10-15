(()=>{
 const selector='header>#nav.compact-menu details',menus=()=>[...document.querySelectorAll(selector)];
 function fit(menu){const rect=menu.getBoundingClientRect(),left=rect.left;if(Number.isFinite(rect.bottom))menu.style.setProperty('--dropdown-height',Math.max(80,window.innerHeight-rect.bottom-20)+'px');const width=Math.min(document.documentElement.clientWidth||window.innerWidth,window.innerWidth);menu.style.setProperty('--dropdown-room',Math.max(1,width-left-12)+'px');}
 function fitOpen(){for(const menu of menus())if(menu.open)fit(menu);}
 window.addEventListener('resize',fitOpen);window.visualViewport?.addEventListener('resize',fitOpen);
 // Delegation also covers headers loaded later by comparison and request pages.
 document.addEventListener('toggle',event=>{const menu=event.target;if(!menu.matches?.(selector)||!menu.open)return;fit(menu);for(const other of menus())if(other!==menu)other.open=false;},true);
 document.addEventListener('click',event=>{const link=event.target.closest?.('a');for(const menu of menus())if(!menu.contains(event.target)||(link&&menu.contains(link)))menu.open=false;});
 document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;for(const menu of menus())if(menu.open){menu.open=false;menu.querySelector('summary')?.focus();}});
})();
