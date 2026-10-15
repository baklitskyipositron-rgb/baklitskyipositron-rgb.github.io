(()=>{
 const area=document.querySelector('#entries'),status=document.querySelector('#control-status');let entries=[],loading=false;const plan=window.PositronReviewPlan;
 const labels={needs_review:'Требует проверки',in_progress:'В работе',approved:'Утверждено'};
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 function field(title,value,max,multi=false){const label=el('label',title),input=el(multi?'textarea':'input');input.value=value||'';input.maxLength=max;if(multi)input.rows=3;label.append(input);return [label,input];}
 function card(row){
  const a=el('article');a.className='control-card';a.dataset.overdue=String(row.overdue);a.dataset.approved=String(row.status==='approved'&&!row.overdue);
  a.append(el('h2',row.title+' · '+row.language.toUpperCase()),el('p',(row.overdue?'Просрочено · ':labels[row.status]+' · ')+(row.approved_at?'Последнее утверждение: '+new Date(row.approved_at).toLocaleDateString('ru-RU'):'Утверждения пока нет')));
  a.append(el('p','Приоритет: '+plan.labels[row.review_state]+(row.unassigned?' · Ответственный не назначен':'')+(row.due_at?' · Пересмотр до: '+new Date(row.due_at).toLocaleString('ru-RU'):'')));
  const preview=el('a','Открыть страницу для проверки ↗');preview.href=row.url;preview.target='_blank';preview.rel='noopener';a.append(preview);
  const fields=el('div');fields.className='control-fields';const [ownerLabel,owner]=field('Ответственный — ФИО / должность',row.responsible,200);
  const statusLabel=el('label','Статус'),state=el('select');for(const [v,t] of Object.entries(labels)){const o=el('option',t);o.value=v;o.selected=v===row.status;state.append(o);}statusLabel.append(state);
  const [sourceLabel,source]=field('Основание проверки — документ, номер, дата или ссылка',row.source_ref,2000,true);sourceLabel.className='wide';
  const [notesLabel,notes]=field('Замечания и необходимые исправления',row.notes,4000,true);notesLabel.className='wide';
  const periodLabel=el('label','Следующий пересмотр через, дней'),period=el('input');period.type='number';period.min='7';period.max='365';period.value=row.review_days||90;periodLabel.append(period);
  fields.append(ownerLabel,statusLabel,sourceLabel,notesLabel,periodLabel);a.append(fields);
  const ack=el('label');ack.className='approval-check';const checked=el('input');checked.type='checkbox';ack.append(checked,el('span','Я проверил текст, характеристики и актуальность документов на этой странице. Утверждение будет датировано временем сохранения.'));a.append(ack);
  const actions=el('div');actions.className='actions';const save=el('button','Сохранить результат');
  save.onclick=async()=>{save.disabled=true;status.textContent='Сохранение…';try{
   const response=await fetch('/api/content-control',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:row.key,responsible:owner.value,sourceRef:source.value,notes:notes.value,status:state.value,reviewDays:Number(period.value),revision:row.revision,acknowledged:checked.checked})});
   const result=await response.json();if(!response.ok)throw Error(result.error==='REVISION_CONFLICT'?'Запись изменена другим сотрудником. Обновите реестр перед повтором.':result.error==='APPROVAL_REQUIRES_REVIEW'?'Для утверждения нужны ответственный, основание и подтверждение проверки.':'Не удалось сохранить результат проверки.');
   status.textContent='Результат сохранён.';await load();
  }catch(e){status.textContent=e.message;}finally{save.disabled=false;}};
  const audit=el('button','История проверки'),history=el('div');audit.onclick=async()=>{audit.disabled=true;try{const response=await fetch('/api/content-control?audit='+encodeURIComponent(row.key),{cache:'no-store'});if(!response.ok)throw Error('История недоступна.');const data=await response.json();history.className='control-history';history.textContent=data.history.length?data.history.map(h=>{const p=JSON.parse(h.payload);return new Date(h.created_at).toLocaleString('ru-RU')+' · '+labels[p.status]+'\nОтветственный: '+p.responsible+'\nОснование: '+p.sourceRef+'\n'+p.notes;}).join('\n\n'):'Записей пока нет.';}catch(e){status.textContent=e.message;}finally{audit.disabled=false;}};
  actions.append(save,audit);a.append(actions,history);return a;
 }
 function filtered(){return plan.select(entries,{language:document.querySelector('#language').value,kind:document.querySelector('#kind').value,filter:document.querySelector('#filter-status').value,search:document.querySelector('#review-search').value});}
 function render(){const rows=filtered();area.replaceChildren();for(const row of rows)area.append(card(row));document.querySelector('#review-count').textContent='Показано: '+rows.length+' из '+entries.length;}
 function overview(summary,generatedAt){const box=document.querySelector('#review-overview');box.replaceChildren();box.hidden=false;for(const [key,title] of Object.entries(plan.labels)){const b=el('button');b.type='button';b.append(el('strong',String(summary[key]||0)),el('span',title));b.onclick=()=>{document.querySelector('#language').value='';document.querySelector('#kind').value='';document.querySelector('#review-search').value='';document.querySelector('#filter-status').value=key;render();};box.append(b);}document.querySelector('#review-snapshot').textContent='Состояние на: '+new Date(generatedAt).toLocaleString('ru-RU')+'. Перед новой проверкой обновите реестр.';}

 async function load(){if(loading)return;loading=true;try{
  const response=await fetch('/api/content-control',{cache:'no-store'});
  if(response.status===401){status.textContent='Войдите через ChatGPT для доступа к реестру.';return;}
  if(response.status===403){status.textContent='Для этой учётной записи доступ не предоставлен.';return;}
  if(!response.ok)throw Error('Реестр временно недоступен.');const data=await response.json();entries=data.items;document.querySelector('#sign-in').hidden=true;
  document.querySelector('#control-summary').textContent='Всего материалов: '+entries.length+' · Утверждено и актуально: '+(data.summary.current+data.summary.due7+data.summary.due30)+' · Просрочено: '+entries.filter(x=>x.overdue).length;
  overview(data.summary,data.generatedAt);document.querySelector('#export-plan').disabled=false;status.textContent='Реестр обновлён.';render();
 }catch(e){status.textContent=e.message;}finally{loading=false;}}
 for(const selector of ['#language','#kind','#filter-status'])document.querySelector(selector).onchange=render;
 document.querySelector('#review-search').oninput=render;
 document.querySelector('#export-plan').onclick=()=>{const blob=new Blob([plan.csv(filtered())],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='positron-review-plan-'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 document.querySelector('#reload').onclick=load;load();
})();
