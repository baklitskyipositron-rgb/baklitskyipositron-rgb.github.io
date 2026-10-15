(function(root){
 const labels={overdue:'Просрочено',needs_review:'Требует проверки',in_progress:'В работе',due7:'Пересмотр в течение 7 дней',due30:'Пересмотр через 8–30 дней',current:'Утверждено и актуально',unassigned:'Нет ответственного'};
 function select(rows,{language='',kind='',filter='',search=''}={}){
  const needle=search.trim().toLocaleLowerCase();
  return rows.filter(x=>(!language||x.language===language)&&(!kind||x.kind===kind)&&(!filter||(filter==='unassigned'?x.unassigned:filter==='approved'?x.status==='approved':x.review_state===filter))&&(!needle||(x.title+' '+(x.responsible||'')).toLocaleLowerCase().includes(needle)));
 }
 function csv(rows){
  const cell=v=>{let s=String(v??'');if(/^[\s]*[=+\-@]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const date=v=>v?new Date(v).toISOString():'';
  const values=[['Материал','Язык','Тип','Состояние','Ответственный','Утверждено UTC','Пересмотр UTC','Основание','Замечания','Адрес страницы'],...rows.map(x=>[x.title,x.language,x.kind==='product'?'Изделие':'Раздел',labels[x.review_state],x.responsible,date(x.approved_at),date(x.due_at),x.source_ref,x.notes,x.url])];
  return '\uFEFF'+values.map(row=>row.map(cell).join(';')).join('\r\n');
 }
 const api={labels,select,csv};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PositronReviewPlan=api;
})(typeof window==='undefined'?globalThis:window);
