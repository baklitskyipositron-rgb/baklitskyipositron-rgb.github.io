(()=>{
 const area=document.querySelector('#items'),status=document.querySelector('#admin-status'),more=document.querySelector('#more');let cursor=null,busy=false;
 const labels={new:'Новая',in_progress:'В работе',answered:'Предложение отправлено',closed:'Завершена'};
 const notices={waiting_configuration:'Ожидает подключения почты',failed:'Ошибка отправки уведомления',submitted:'Принято почтовым сервисом',unknown:'Результат отправки неизвестен — требуется проверка',busy:'Отправка выполняется или действует минутная пауза',review_required:'Повтор заблокирован — проверьте журнал почтового сервиса'};
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 async function mutate(body){
  const r=await fetch('/api/inquiries/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(r.status===409)throw Error('Заявка изменена другим сотрудником. Обновите журнал.');if(!r.ok)throw Error('Не удалось сохранить. Проверьте поля и подтверждение отправки.');return r.json();
 }
 function card(row){
  const a=el('article');if(row.status!=='closed'&&!row.responded_at&&row.due_at&&row.due_at<Date.now())a.className='overdue';a.append(el('h2',row.number),el('p',new Date(row.created_at).toLocaleString('ru-RU')+' · '+row.name+' · '+row.organization),el('p','Email: '+row.email+'\nТелефон: '+row.phone+(row.product.startsWith('Career / ')?'\nНаправление работы: '+row.product.slice(9):'\nОборудование: '+row.product)+'\nЯзык: '+row.language),el('p',row.message),el('p','Письмо предприятию: '+(notices[row.notification_status]||row.notification_status)+' · Попыток: '+row.notification_attempts+(row.notification_http_code?' · HTTP '+row.notification_http_code:'')+(row.notification_provider_id?' · ID '+row.notification_provider_id:'')),el('p','Подтверждение клиенту: '+(notices[row.receipt_status]||row.receipt_status)+' · Попыток: '+row.receipt_attempts+(row.receipt_http_code?' · HTTP '+row.receipt_http_code:'')+(row.receipt_provider_id?' · ID '+row.receipt_provider_id:'')));
  if(row.resume_key){const cv=el('a','Скачать резюме · '+(row.resume_name||'PDF'));cv.href='/api/careers/resume?id='+encodeURIComponent(row.id);a.append(cv);}
  const actions=el('div');actions.className='actions';const select=el('select');select.setAttribute('aria-label','Статус '+row.number);
  for(const [v,t] of Object.entries(labels)){const o=el('option',t);o.value=v;o.selected=v===row.status;select.append(o);}
  const fields=el('div');fields.className='workflow-fields';
  function input(title,value,type='text'){const label=el('label',title),x=el(type==='textarea'?'textarea':'input');if(type!=='textarea')x.type=type;x.value=value||'';label.append(x);fields.append(label);return x;}
  const owner=input('Ответственный — ФИО / должность',row.assignee);owner.maxLength=200;
  const due=input('Срок ответа — местное время',row.due_at?new Date(row.due_at-new Date(row.due_at).getTimezoneOffset()*60000).toISOString().slice(0,16):'','datetime-local');
  const notes=input('Заметки оператора',row.operator_notes,'textarea');notes.maxLength=4000;
  const ackLabel=el('label'),ack=el('input');ack.type='checkbox';ackLabel.append(ack,el('span','Подтверждаю: предложение действительно отправлено клиенту.'));fields.append(ackLabel);
  a.append(el('p','Источник: '+({unknown:'Не определён',direct:'Прямой переход',search:'Поисковая система',social:'Социальная сеть',referral:'Другой сайт',campaign:'Кампания'})[row.source]+(row.responded_at?' · Ответ отмечен: '+new Date(row.responded_at).toLocaleString('ru-RU'):'')),fields);
  const save=el('button','Сохранить обработку');save.onclick=async()=>{save.disabled=true;try{const r=await mutate({id:row.id,status:select.value,assignee:owner.value,dueAt:due.value?new Date(due.value).getTime():null,operatorNotes:notes.value,revision:row.revision,responseConfirmed:ack.checked});row.revision=r.revision;status.textContent='Обработка сохранена.';await load(false);}catch(e){status.textContent=e.message;}finally{save.disabled=false;}};
  const history=el('pre');history.className='audit';history.hidden=true;const audit=el('button','История обработки');audit.onclick=async()=>{try{const r=await fetch('/api/inquiries/admin?audit='+encodeURIComponent(row.id),{cache:'no-store'});if(!r.ok)throw Error('История недоступна.');const d=await r.json();history.textContent=d.history.map(x=>{const v=JSON.parse(x.payload);return new Date(x.created_at).toLocaleString('ru-RU')+' · '+labels[v.status]+' · '+v.assignee+'\n'+v.operatorNotes;}).join('\n\n')||'Изменений пока нет.';history.hidden=false;}catch(e){status.textContent=e.message;}};
  function retryButton(title,action,mailStatus,until){const b=el('button',title);b.disabled=['submitted','review_required'].includes(mailStatus)||(until&&until>Date.now());b.onclick=async()=>{b.disabled=true;try{const r=await mutate({id:row.id,action});status.textContent=notices[r.notification]||r.notification;await load(false);}catch(e){status.textContent=e.message;}finally{if(!['submitted','review_required'].includes(mailStatus))b.disabled=false;}};return b;}
  const retry=retryButton('Повторить письмо предприятию','retry_notification',row.notification_status,row.notification_claim_until);
  const receipt=retryButton('Повторить подтверждение клиенту','retry_receipt',row.receipt_status,row.receipt_claim_until);
  const preview=el('button','Посмотреть тексты писем'),mailText=el('pre');mailText.className='audit';mailText.hidden=true;preview.onclick=async()=>{try{const r=await fetch('/api/inquiries/admin?mailPreview='+encodeURIComponent(row.id),{cache:'no-store'});if(!r.ok)throw Error('Предпросмотр недоступен.');const d=await r.json();mailText.textContent=['employee','customer'].map(k=>{const x=d[k];return (k==='employee'?'ПРЕДПРИЯТИЮ':'КЛИЕНТУ')+'\nКому: '+x.to.join(', ')+'\nТема: '+x.subject+'\n\n'+x.text;}).join('\n\n');mailText.hidden=false;}catch(e){status.textContent=e.message;}};
  const remove=el('button','Удалить данные');remove.onclick=async()=>{if(!confirm('Удалить заявку и контактные данные без возможности восстановления?'))return;remove.disabled=true;try{await mutate({id:row.id,action:'delete'});a.remove();status.textContent='Данные удалены.';}catch(e){status.textContent=e.message;remove.disabled=false;}};
  actions.append(select,save,retry,receipt,preview,audit,remove);a.append(actions,history,mailText);return a;
 }
 async function load(append){
  if(busy)return;busy=true;status.textContent='Загрузка…';
  try{
   const r=await fetch('/api/inquiries/admin'+(append&&cursor?'?before='+cursor.created_at+'&beforeId='+encodeURIComponent(cursor.id):''),{cache:'no-store'});
   if(r.status===401){status.textContent='Войдите через ChatGPT для доступа к журналу.';return;}
   if(r.status===403){status.textContent='Для этой учётной записи доступ к журналу не предоставлен.';return;}
   if(!r.ok)throw Error('Журнал временно недоступен.');const d=await r.json();document.querySelector('#sign-in').hidden=true;
   document.querySelector('#mail-status').textContent=d.mailConfigured?'Почтовый сервис подключён. Статус «принято сервисом» не подтверждает доставку в почтовый ящик.':'Почтовый сервис ещё не подключён. Заявки сохраняются в журнале, но автоматические письма не отправляются.';
   const setup=document.querySelector('#mail-configuration');setup.hidden=false;document.querySelector('#mail-configuration-status').textContent=d.mailConfigured?'Параметры заданы. Перед началом работы проверьте подтверждение домена и доставку тестовой заявки.':'Не заданы: '+d.mailConfiguration.missing.join(', ')+(d.mailConfiguration.invalid.length?' · Проверьте формат: '+d.mailConfiguration.invalid.join(', '):'');
   if(!append)area.replaceChildren();for(const row of d.items)area.append(card(row));cursor=d.items.at(-1);more.hidden=d.items.length<50;status.textContent=d.items.length?'Журнал обновлён.':'Заявок пока нет.';
  }catch(e){status.textContent=e.message;}finally{busy=false;}
 }
 document.querySelector('#reload').onclick=()=>load(false);more.onclick=()=>load(true);load(false);
})();
