// js/main.js - final pro build: gold theme, modal login, admin tabs, announcements filtered

// ملاحظة: دوال load, save, creds, saveCreds موجودة في data-layer.js
// LS_KEYS معرّف في data-layer.js

function nowISO(){ return new Date().toISOString(); }
function uid(){ return 'id_' + Math.random().toString(36).slice(2,9); }

function ensureDefaults(){
  // تأكد من وجود الاعتمادات في localStorage فقط
  if(!localStorage.getItem('bp_creds')) localStorage.setItem('bp_creds', JSON.stringify({user:'younes', pass:'younes'}));
  
  // تأكد من وجود إعدادات أيام العمل الافتراضية
  if(!localStorage.getItem('bp_workdays')) {
    const defaultWorkDays = [
      {dayOfWeek: 0, dayName: 'Dimanche', capacity: 5},
      {dayOfWeek: 2, dayName: 'Mardi', capacity: 5},
      {dayOfWeek: 4, dayName: 'Jeudi', capacity: 5},
      {dayOfWeek: 5, dayName: 'Vendredi', capacity: 3}
    ];
    localStorage.setItem('bp_workdays', JSON.stringify(defaultWorkDays));
  }
}
ensureDefaults();

// Days: جميع أيام الأسبوع
function dayLabelFromKey(key){ 
  const d=new Date(key+'T00:00:00'); 
  const dayMap = {
    0: typeof t === 'function' ? t('day.sunday') : 'Dimanche',
    1: typeof t === 'function' ? t('day.monday') : 'Lundi',
    2: typeof t === 'function' ? t('day.tuesday') : 'Mardi',
    3: typeof t === 'function' ? t('day.wednesday') : 'Mercredi',
    4: typeof t === 'function' ? t('day.thursday') : 'Jeudi',
    5: typeof t === 'function' ? t('day.friday') : 'Vendredi',
    6: typeof t === 'function' ? t('day.saturday') : 'Samedi'
  };
  const nm = dayMap[d.getDay()] || d.toLocaleDateString(); 
  const date = ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear(); 
  return nm + ' ' + date; 
}
function dayKeyFromDate(d){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }

// الحصول على أيام العمل المُكونة
function getConfiguredWorkDays() {
  const stored = localStorage.getItem('bp_workdays');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

// الحصول على قائمة أيام العمل القادمة بناءً على التكوين
function getWorkingDays(next=180){ 
  const workDaysConfig = getConfiguredWorkDays();
  const allowedDays = workDaysConfig.map(w => w.dayOfWeek);
  const res=[]; 
  const t=new Date(); 
  for(let i=0;i<next;i++){ 
    const d=new Date(); 
    d.setDate(t.getDate()+i); 
    if(allowedDays.includes(d.getDay())) res.push(dayKeyFromDate(d)); 
  } 
  return res; 
}

// الحصول على السعة من التكوين
function capacity(key){ 
  const d=new Date(key+'T00:00:00'); 
  const dayOfWeek = d.getDay();
  const workDaysConfig = getConfiguredWorkDays();
  const dayConfig = workDaysConfig.find(w => w.dayOfWeek === dayOfWeek);
  return dayConfig ? dayConfig.capacity : 5;
}

// Announcements: only show admin-created and system (cancel/restore) on public page
function pushAnnonce(text,type='user'){ const a=load(LS_KEYS.ANN); a.unshift({id:uid(), text, ts:nowISO(), type}); save(LS_KEYS.ANN,a); log('Annonce: '+text); renderAnnonces(); }
function log(msg){ const j=load(LS_KEYS.JOUR); j.unshift({id:uid(), msg, ts:nowISO()}); save(LS_KEYS.JOUR,j); }

// BOOKINGS - الزبون يختار اليوم المحدد
function addBooking(name, surname, phone, selectedDayKey){
  if(!name || !surname){ alert('Nom et Prénom requis'); return false; }
  if(!selectedDayKey){ alert('Veuillez choisir un jour'); return false; }
  
  const bks = load(LS_KEYS.BOOK);
  
  // حساب عدد الحجوزات في اليوم المختار (بما فيها المكتملة)
  const dayBookings = bks.filter(b => b.dayKey === selectedDayKey);
  const dayCapacity = capacity(selectedDayKey);
  
  if(dayBookings.length >= dayCapacity){
    alert('Ce jour est complet. Veuillez choisir un autre jour.');
    return false;
  }
  
  const nb = {
    id: uid(), 
    name, 
    surname, 
    phone: phone || '', 
    dayKey: selectedDayKey, 
    dayLabel: dayLabelFromKey(selectedDayKey), 
    inProgress: false, 
    completed: false, 
    createdAt: nowISO()
  }; 
  
  bks.push(nb); 
  save(LS_KEYS.BOOK, bks); 
  
  const successMsg = (typeof t === 'function' ? t('reservation.success') : 'Réservé: ') + nb.dayLabel;
  document.getElementById('resInfo') && (document.getElementById('resInfo').innerText = successMsg); 
  
  log('Nouvelle réservation: ' + name + ' ' + surname + ' - ' + nb.dayLabel);
  return true;
}

// RENDER PUBLIC LIST grouped by day, show En cours badge (hide completed)
function renderList(){
  const container=document.getElementById('publicDays'); if(!container) return;
  const bks = load(LS_KEYS.BOOK).filter(x => !x.completed).slice().sort((a,b)=> a.dayKey.localeCompare(b.dayKey) || a.createdAt.localeCompare(b.createdAt));
  const days = [...new Set(bks.map(x=>x.dayKey))];
  container.innerHTML='';
  days.forEach(k=>{
    const dayBlock = document.createElement('div'); dayBlock.className='day-block';
    const title = document.createElement('div'); title.className='day-title'; const capacityText = typeof t === 'function' ? t('list.capacity') : 'Capacité: '; title.innerHTML = `<strong>${dayLabelFromKey(k)}</strong><span class="muted">${capacityText}${capacity(k)}</span>`;
    dayBlock.appendChild(title);
    bks.filter(x=>x.dayKey===k).forEach(c=>{
      const row=document.createElement('div'); row.className='client-row' + (c.inProgress? ' highlight':''); const badgeText = typeof t === 'function' ? t('list.inprogress') : 'En cours'; row.innerHTML = `<div class="client-name">${c.name} ${c.surname}</div><div class="client-actions">${c.inProgress? `<span class="badge">${badgeText}</span>`:''}</div>`;
      dayBlock.appendChild(row);
    });
    container.appendChild(dayBlock);
  });
  const noneText = typeof t === 'function' ? t('list.none') : 'Aucune réservation pour l\'instant.'; if(days.length===0) container.innerHTML=`<p class="muted">${noneText}</p>`;
}

// render cancelled days with restore button
function renderCancelledDays(){
  const container = document.getElementById('cancelledDays'); if(!container) return;
  const cancelled = load(LS_KEYS.CAN);
  container.innerHTML='';
  
  if(cancelled.length > 0){
    const title = document.createElement('h4');
    title.style.color = 'var(--gold1)';
    title.style.marginBottom = '15px';
    title.innerHTML = '<span data-i18n="admin.cancelled.title">Jours annulés (restaurables)</span>';
    container.appendChild(title);
    
    cancelled.forEach(c => {
      const block = document.createElement('div');
      block.className = 'day-block';
      block.style.background = 'rgba(220, 53, 69, 0.1)';
      block.style.borderLeft = '3px solid rgba(220, 53, 69, 0.5)';
      
      const d = new Date(c.ts);
      const dateStr = d.toLocaleString('fr-FR', {dateStyle: 'medium', timeStyle: 'short'});
      const restoreText = typeof t === 'function' ? t('admin.restoreday') : 'Restaurer jour';
      
      block.innerHTML = `
        <div class="day-title">
          <strong style="color: #dc3545;">🚫 ${dayLabelFromKey(c.dayKey)}</strong>
          <span class="muted" style="font-size: 12px;">Annulé le ${dateStr} • ${c.bookings.length} client(s)</span>
          <div><button onclick="restoreDayByKey('${c.dayKey}')" style="background: rgba(40, 167, 69, 0.8);"><span>${restoreText}</span></button></div>
        </div>
      `;
      container.appendChild(block);
    });
  }
}

// ADMIN helpers render days with actions, phone visible here (hide completed)
function renderAdminDays(){
  const container=document.getElementById('adminDays'); if(!container) return;
  const bks = load(LS_KEYS.BOOK).filter(x => !x.completed).slice().sort((a,b)=> a.dayKey.localeCompare(b.dayKey) || a.createdAt.localeCompare(b.createdAt));
  const days = getWorkingDays(90);
  container.innerHTML='';
  days.forEach(k=>{
    const items = bks.filter(x=>x.dayKey===k);
    const block=document.createElement('div'); block.className='day-block';
    const title=document.createElement('div'); title.className='day-title'; const cancelText = typeof t === 'function' ? t('admin.cancelday') : 'Annuler jour'; title.innerHTML=`<strong>${dayLabelFromKey(k)}</strong><div><button onclick="cancelDayByKey('${k}')"><span>${cancelText}</span></button></div>`;
    block.appendChild(title);
    if(items.length===0){ const p=document.createElement('p'); p.className='muted'; p.innerText= typeof t === 'function' ? t('admin.noclient') : 'Aucun client'; block.appendChild(p); }
    items.forEach((c,idx)=>{
      const row=document.createElement('div'); row.className='client-row' + (c.inProgress? ' highlight':'');
      const nameDiv=document.createElement('div'); nameDiv.className='client-name'; nameDiv.innerText = (idx+1) + '. ' + c.name + ' ' + c.surname + (c.phone? ' • ' + c.phone : ' • ---');
      const actionsDiv=document.createElement('div'); actionsDiv.className='client-actions';
      const btnProm=document.createElement('button'); btnProm.innerHTML='<span>'+(typeof t === 'function' ? t('button.promote') : 'Promouvoir')+'</span>'; btnProm.onclick=()=> promoteBooking(c.id);
      const btnIn=document.createElement('button'); btnIn.innerHTML='<span>'+(typeof t === 'function' ? t('button.inprogress') : 'En cours')+'</span>'; btnIn.onclick=()=> setInProgress(c.id);
      const btnPaid=document.createElement('button'); btnPaid.innerHTML='<span>'+(typeof t === 'function' ? t('button.paid') : '💰 Payé')+'</span>'; btnPaid.style.background='rgba(40, 167, 69, 0.8)'; btnPaid.onclick=()=> { const amount = prompt('Montant (DA)', '200'); if(amount) markAsPaid(c.id, parseInt(amount)); };
      const btnDebt=document.createElement('button'); btnDebt.innerHTML='<span>'+(typeof t === 'function' ? t('button.debt') : '📝 Dين')+'</span>'; btnDebt.style.background='rgba(220, 53, 69, 0.8)'; btnDebt.onclick=()=> { if(confirm('Marquer comme dette?')) markAsDebt(c.id); };
      const btnEdit=document.createElement('button'); btnEdit.innerHTML='<span>'+(typeof t === 'function' ? t('button.edit') : 'Éditer')+'</span>'; btnEdit.onclick=()=> editBooking(c.id);
      const btnDel=document.createElement('button'); btnDel.innerHTML='<span>'+(typeof t === 'function' ? t('button.delete') : 'Supprimer')+'</span>'; btnDel.onclick=()=> { if(confirm(typeof t === 'function' ? t('button.delete') + '?' : 'Supprimer?')) deleteBooking(c.id); };
      actionsDiv.appendChild(btnProm); actionsDiv.appendChild(btnIn); actionsDiv.appendChild(btnPaid); actionsDiv.appendChild(btnDebt); actionsDiv.appendChild(btnEdit); actionsDiv.appendChild(btnDel);
      row.appendChild(nameDiv); row.appendChild(actionsDiv); block.appendChild(row);
    });
    container.appendChild(block);
  });
}

// delete booking - الحجز يُحذف فقط بدون تقديم تلقائي
function deleteBooking(id){ 
  let bks = load(LS_KEYS.BOOK); 
  const b = bks.find(x=>x.id===id); 
  if(!b) return;
  
  // حذف الحجز فقط - الحجوزات الأخرى تبقى في أماكنها
  bks = bks.filter(x=>x.id!==id); 
  
  save(LS_KEYS.BOOK, bks); 
  pushSystem('Suppression: réservation supprimée (' + (b ? b.name + ' ' + b.surname : id) + ')'); 
  renderAdminDays(); 
  renderList(); 
  renderAnnonces(); 
  log('Suppression reservation ' + id); 
}

// promote - move earlier in array among same-day entries
function promoteBooking(id){
  const bks = load(LS_KEYS.BOOK);
  const idx = bks.findIndex(x=>x.id===id); if(idx===-1) return;
  // find previous index with same dayKey
  let prev = -1;
  for(let i=0;i<idx;i++) if(bks[i].dayKey === bks[idx].dayKey) prev = i;
  if(prev === -1) return alert('Déjà premier de la journée');
  // swap positions
  const tmp = bks[prev]; bks[prev] = bks[idx]; bks[idx] = tmp; save(LS_KEYS.BOOK,bks); pushSystem('Promotion: ' + bks[prev].name + ' promu'); renderAdminDays(); renderList();
}

// edit booking (name/surname and optionally move day)
function editBooking(id){
  const bks = load(LS_KEYS.BOOK);
  const i = bks.findIndex(x=>x.id===id); if(i===-1) return;
  const b = bks[i];
  const nn = prompt('Nom', b.name); if(nn===null) return;
  const ns = prompt('Prénom', b.surname); if(ns===null) return;
  const days = getWorkingDays(120); const opt = days.map((d,idx)=> (idx+1)+'. '+dayLabelFromKey(d)).join('\n');
  const choice = prompt('Choisir numéro du jour (0 garder le même)\n'+opt, '0'); if(choice===null) return;
  let newKey = b.dayKey; const num = parseInt(choice);
  if(!isNaN(num) && num>0 && num<=days.length) newKey = days[num-1];
  // capacity check excluding self
  const counts={}; bks.forEach((bb,ii)=> { if(ii!==i) counts[bb.dayKey] = (counts[bb.dayKey]||0)+1; });
  if((counts[newKey]||0) >= capacity(newKey)) return alert('Le jour choisi est plein');
  bks[i].name = nn.trim(); bks[i].surname = ns.trim(); bks[i].dayKey = newKey; bks[i].dayLabel = dayLabelFromKey(newKey); save(LS_KEYS.BOOK,bks); pushSystem('Modification: réservation modifiée ('+bks[i].name+')'); renderAdminDays(); renderList();
}

// set in progress
function setInProgress(id){ const bks = load(LS_KEYS.BOOK); const b = bks.find(x=>x.id===id); if(!b) return; bks.forEach(x=> x.inProgress=false); b.inProgress = true; save(LS_KEYS.BOOK,bks); pushSystem('État: '+b.name+' en cours de coupe'); renderAdminDays(); renderList(); renderAnnonces(); }

// mark as paid and add to income
function markAsPaid(id, price = 100){
  const bks = load(LS_KEYS.BOOK);
  const b = bks.find(x=>x.id===id);
  if(!b) return;
  
  const income = load(LS_KEYS.INCOME);
  income.push({
    id: uid(),
    bookingId: id,
    clientName: b.name + ' ' + b.surname,
    dayKey: b.dayKey,
    amount: price,
    ts: nowISO()
  });
  save(LS_KEYS.INCOME, income);
  
  // Mark as completed instead of deleting (keeps the spot occupied)
  b.completed = true;
  b.inProgress = false;
  save(LS_KEYS.BOOK, bks);
  
  log('Paiement reçu: ' + b.name + ' ' + b.surname + ' - ' + price + ' DA');
  renderAdminDays();
  renderList();
  renderAccounting();
}

// mark as debt
function markAsDebt(id){
  const bks = load(LS_KEYS.BOOK);
  const b = bks.find(x=>x.id===id);
  if(!b) return;
  
  const debts = load(LS_KEYS.DEBT);
  debts.push({
    id: uid(),
    bookingId: id,
    name: b.name,
    surname: b.surname,
    phone: b.phone || '',
    dayKey: b.dayKey,
    dayLabel: b.dayLabel,
    amount: 200,
    ts: nowISO()
  });
  save(LS_KEYS.DEBT, debts);
  
  // Mark as completed instead of deleting (keeps the spot occupied)
  b.completed = true;
  b.inProgress = false;
  save(LS_KEYS.BOOK, bks);
  
  log('Dette ajoutée: ' + b.name + ' ' + b.surname);
  renderAdminDays();
  renderList();
  renderDebts();
}

// pay debt
function payDebt(debtId, amount){
  const debts = load(LS_KEYS.DEBT);
  const debt = debts.find(x=>x.id===debtId);
  if(!debt) return;
  
  const income = load(LS_KEYS.INCOME);
  income.push({
    id: uid(),
    bookingId: debt.bookingId,
    clientName: debt.name + ' ' + debt.surname,
    dayKey: debt.dayKey,
    amount: amount || debt.amount,
    ts: nowISO(),
    wasDebt: true
  });
  save(LS_KEYS.INCOME, income);
  
  // remove debt
  const newDebts = debts.filter(x=>x.id!==debtId);
  save(LS_KEYS.DEBT, newDebts);
  
  log('Dette payée: ' + debt.name + ' ' + debt.surname + ' - ' + amount + ' DA');
  renderDebts();
  renderAccounting();
}

// delete debt
function deleteDebt(debtId){
  let debts = load(LS_KEYS.DEBT);
  const debt = debts.find(x=>x.id===debtId);
  debts = debts.filter(x=>x.id!==debtId);
  save(LS_KEYS.DEBT, debts);
  log('Dette supprimée: ' + (debt? debt.name + ' ' + debt.surname : debtId));
  renderDebts();
}

// render debts list
function renderDebts(){
  const container = document.getElementById('debtsList');
  if(!container) return;
  
  const debts = load(LS_KEYS.DEBT).sort((a,b)=> b.ts.localeCompare(a.ts));
  container.innerHTML = '';
  
  if(debts.length === 0){
    container.innerHTML = '<p class="muted">' + (typeof t === 'function' ? t('debts.none') : 'Aucune dette') + '</p>';
    return;
  }
  
  let totalDebt = 0;
  debts.forEach(d => {
    totalDebt += d.amount;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.background = 'rgba(220, 53, 69, 0.1)';
    card.style.borderLeft = '3px solid rgba(220, 53, 69, 0.5)';
    
    const date = new Date(d.ts);
    const dateStr = date.toLocaleDateString('fr-FR');
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-size: 18px; font-weight: bold; color: var(--gold-bright); margin-bottom: 8px;">
            ${d.name} ${d.surname}
          </div>
          <div class="muted" style="font-size: 13px; margin-bottom: 5px;">
            📅 ${d.dayLabel}
          </div>
          <div class="muted" style="font-size: 13px; margin-bottom: 5px;">
            📞 ${d.phone || '---'}
          </div>
          <div style="color: #dc3545; font-weight: bold; font-size: 16px; margin-top: 10px;">
            💰 ${d.amount} DA
          </div>
          <div class="muted" style="font-size: 12px; margin-top: 8px;">
            Enregistré le ${dateStr}
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-direction: column;">
          <button onclick="payDebt('${d.id}', ${d.amount})" style="background: rgba(40, 167, 69, 0.8);">
            <span>${typeof t === 'function' ? t('debts.pay') : 'Payer'}</span>
          </button>
          <button onclick="if(confirm('Supprimer?')) deleteDebt('${d.id}')" style="background: rgba(220, 53, 69, 0.8);">
            <span>${typeof t === 'function' ? t('button.delete') : 'Supprimer'}</span>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  // total debt summary
  const summary = document.createElement('div');
  summary.className = 'card';
  summary.style.background = 'rgba(220, 53, 69, 0.2)';
  summary.style.borderLeft = '4px solid #dc3545';
  summary.innerHTML = `
    <div style="font-size: 20px; font-weight: bold; color: var(--gold-bright);">
      📊 ${typeof t === 'function' ? t('debts.total') : 'Total des dettes'}: <span style="color: #dc3545;">${totalDebt} DA</span>
    </div>
  `;
  container.insertBefore(summary, container.firstChild);
}

// render accounting (monthly income)
function renderAccounting(){
  const container = document.getElementById('accountingList');
  if(!container) return;
  
  const income = load(LS_KEYS.INCOME).sort((a,b)=> b.ts.localeCompare(a.ts));
  container.innerHTML = '';
  
  if(income.length === 0){
    container.innerHTML = '<p class="muted">' + (typeof t === 'function' ? t('accounting.none') : 'Aucun revenu enregistré') + '</p>';
    return;
  }
  
  // group by month
  const byMonth = {};
  income.forEach(inc => {
    const date = new Date(inc.ts);
    const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    if(!byMonth[monthKey]) byMonth[monthKey] = [];
    byMonth[monthKey].push(inc);
  });
  
  // render each month
  Object.keys(byMonth).sort().reverse().forEach(monthKey => {
    const items = byMonth[monthKey];
    let total = 0;
    
    const monthBlock = document.createElement('div');
    monthBlock.className = 'card';
    monthBlock.style.marginBottom = '25px';
    
    const [year, month] = monthKey.split('-');
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthName = monthNames[parseInt(month) - 1];
    
    let itemsHTML = '';
    items.forEach(inc => {
      total += inc.amount;
      const date = new Date(inc.ts);
      const dateStr = date.toLocaleDateString('fr-FR');
      const debtBadge = inc.wasDebt ? '<span class="badge" style="background: rgba(40, 167, 69, 0.8); margin-left: 8px;">Dette payée</span>' : '';
      
      itemsHTML += `
        <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <span style="font-weight: bold;">${inc.clientName}</span>
            <span class="muted" style="margin-left: 10px; font-size: 13px;">${dateStr}</span>
            ${debtBadge}
          </div>
          <div style="color: var(--gold-bright); font-weight: bold; font-size: 16px;">
            +${inc.amount} DA
          </div>
        </div>
      `;
    });
    
    monthBlock.innerHTML = `
      <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <h3 style="color: var(--gold-bright); margin: 0;">📅 ${monthName} ${year}</h3>
          <div style="font-size: 24px; font-weight: bold; color: var(--gold-bright);">
            💰 ${total} DA
          </div>
        </div>
      </div>
      <div>${itemsHTML}</div>
    `;
    
    container.appendChild(monthBlock);
  });
  
  // grand total
  const grandTotal = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalCard = document.createElement('div');
  totalCard.className = 'card';
  totalCard.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))';
  totalCard.style.borderLeft = '4px solid var(--gold-bright)';
  totalCard.innerHTML = `
    <div style="font-size: 22px; font-weight: bold; color: var(--gold-bright); text-align: center;">
      🏆 ${typeof t === 'function' ? t('accounting.grandtotal') : 'Total général'}: ${grandTotal} DA
    </div>
  `;
  container.insertBefore(totalCard, container.firstChild);
}

// cancel day: snapshot and reassign
function cancelDayByKey(dayKey){
  let bks = load(LS_KEYS.BOOK);
  const toMove = bks.filter(x=> x.dayKey===dayKey);
  if(toMove.length===0) return alert('Aucune réservation pour ce jour');
  const cancelled = load(LS_KEYS.CAN); cancelled.unshift({dayKey, bookings: JSON.parse(JSON.stringify(toMove)), ts: nowISO()}); save(LS_KEYS.CAN, cancelled);
  // remove original
  bks = bks.filter(x=> x.dayKey !== dayKey);
  // reassign each in order to next available day
  const days = getWorkingDays(365);
  for(const orig of toMove){
    const start = days.indexOf(dayKey);
    let placed=false;
    for(let i=start+1;i<days.length;i++){
      const k = days[i]; const cap = capacity(k); const cnt = bks.filter(bb=>bb.dayKey===k).length;
      if(cnt < cap){ const copy = Object.assign({}, orig); copy.id = uid(); copy.dayKey = k; copy.dayLabel = dayLabelFromKey(k); copy.inProgress=false; bks.push(copy); placed=true; break; }
    }
    if(!placed){ alert('Impossible de reprogrammer certains clients automatiquement'); break; }
  }
  save(LS_KEYS.BOOK,bks); 
  pushSystem('🚫 Jour annulé: ' + dayLabelFromKey(dayKey) + ' - Les clients ont été reprogrammés automatiquement'); 
  renderCancelledDays(); renderAdminDays(); renderList(); renderAnnonces(); populateDaySelect();
}

// restore day (if capacity allows)
function restoreDayByKey(dayKey){
  let cancelled = load(LS_KEYS.CAN);
  const idx = cancelled.findIndex(x=> x.dayKey === dayKey);
  if(idx === -1) return alert('Aucun jour annulé trouvé');
  const snapshot = cancelled[idx];
  const bks = load(LS_KEYS.BOOK);
  const existing = bks.filter(x=> x.dayKey === dayKey).length;
  if(existing + snapshot.bookings.length > capacity(dayKey)) return alert('Pas assez de place pour restaurer');
  // restore with new ids
  snapshot.bookings.forEach(ob => { const copy = Object.assign({}, ob); copy.id = uid(); copy.inProgress = false; bks.push(copy); });
  cancelled.splice(idx,1); save(LS_KEYS.CAN, cancelled); save(LS_KEYS.BOOK, bks); 
  pushSystem('✅ Jour restauré: ' + dayLabelFromKey(dayKey) + ' - Les réservations ont été rétablies'); 
  renderCancelledDays(); renderAdminDays(); renderList(); renderAnnonces(); populateDaySelect();
}

// create annonce (admin)
function createAnnonce(){ const t = document.getElementById('annText').value.trim(); if(!t) return alert('Texte vide'); pushAnnonce(t,'user'); document.getElementById('annText').value=''; alert('Annonce publiée'); renderAdminAnns(); }

// system annonce helper
function pushSystem(text){ pushAnnonce(text,'system'); log('SYS: '+text); }

// render annonces (public page shows only admin-created user annonces and system notifications)
function renderAnnonces(){
  const list = document.getElementById('annList'); if(!list) return;
  const anns = load(LS_KEYS.ANN).filter(a=> a.type==='user' || a.type==='system');
  list.innerHTML='';
  if(anns.length===0){ list.innerHTML='<p class="muted">'+(typeof t === 'function' ? t('announcements.none') : 'Aucune annonce')+'</p>'; return; }
  anns.forEach(a=>{ 
    const node=document.createElement('div'); 
    node.className='card'; 
    const d=new Date(a.ts); 
    const prefix = a.type === 'system' ? '<strong style="color: var(--gold-bright);">[SYSTÈME]</strong> ' : '';
    node.innerHTML = `<div style="font-size:13px;color:var(--muted);margin-bottom:8px;">${d.toLocaleString('fr-FR', {dateStyle: 'full', timeStyle: 'short'})}</div><p>${prefix}${a.text}</p>`; 
    list.appendChild(node); 
  });
}

// render admin-only annonces (all user created)
function renderAdminAnns(){
  const el = document.getElementById('adminAnns'); if(!el) return;
  const anns = load(LS_KEYS.ANN).filter(a=> a.type==='user');
  el.innerHTML='';
  if(anns.length===0){ el.innerHTML='<p class="muted">Aucune annonce créée</p>'; return; }
  anns.forEach(a=>{ const node=document.createElement('div'); node.className='card'; const d=new Date(a.ts); node.innerHTML = `<div style="font-size:13px;color:var(--muted);margin-bottom:8px;">${d.toLocaleString('fr-FR', {dateStyle: 'full', timeStyle: 'short'})}</div><p>${a.text}</p>`; el.appendChild(node); });
}

// populate day select for admin restore/cancel lists
function populateDaySelect(){
  const sel = document.getElementById('daySelect'); if(!sel) return;
  sel.innerHTML='';
  const cancelled = load(LS_KEYS.CAN);
  cancelled.forEach(c=>{ const opt=document.createElement('option'); opt.value=c.dayKey; opt.innerText=dayLabelFromKey(c.dayKey) + ' (annulé)'; sel.appendChild(opt); });
  const days = getWorkingDays(180);
  days.forEach(d=>{ const opt=document.createElement('option'); opt.value=d; opt.innerText=dayLabelFromKey(d); sel.appendChild(opt); });
}

// login modal functions (shared across pages)
function openLoginModal(){ document.getElementById('loginModal') && document.getElementById('loginModal').classList.remove('hidden'); }
function closeLoginModal(){ document.getElementById('loginModal') && document.getElementById('loginModal').classList.add('hidden'); }
function doModalLogin(){
  const u = document.getElementById('modalUser').value.trim(); const p = document.getElementById('modalPass').value.trim();
  const c = creds();
  if(u === c.user && p === c.pass){ // success
    closeLoginModal();
    // Store login state and redirect
    sessionStorage.setItem('admin_logged_in', 'true');
    if(window.location.pathname.includes('admin.html')){
      activateAdminArea();
    } else {
      window.location.href = 'admin.html';
    }
  } else { 
    const msg = document.getElementById('modalMsg');
    if (msg) msg.innerText = typeof t === 'function' ? t('login.error') : 'Identifiants incorrects';
  }
}
function activateAdminArea(){
  // show admin area on admin page if present
  const area = document.getElementById('adminArea'); if(area) area.classList.remove('hidden');
  // if on admin.html, also open first tab and render data
  setupTabs();
  renderCancelledDays(); renderAdminDays(); renderAdminAnns(); renderDebts(); renderAccounting(); renderJournal(); populateDaySelect();
  const welcomeMsg = typeof t === 'function' ? t('login.welcome') : 'مرحباً، تم تسجيل دخولك كحلاق';
  alert(welcomeMsg);
}

// setup tabs handlers
function setupTabs(){
  const btns = document.querySelectorAll('.tab-btn'); btns.forEach(b=> b.onclick = function(){ document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active')); this.classList.add('active'); const t=this.dataset.tab; document.querySelectorAll('.tab.panel').forEach(p=>p.classList.add('hidden')); document.getElementById(t).classList.remove('hidden'); });
}

function wrapNavLinks(){
  document.querySelectorAll('.nav a').forEach(link => {
    if (!link.querySelector('span')) {
      link.innerHTML = '<span>' + link.textContent + '</span>';
    }
  });
}
window.addEventListener('DOMContentLoaded', wrapNavLinks);

// change credentials
function changeCredentials(){ const nu=document.getElementById('newUser').value.trim(); const np=document.getElementById('newPass').value.trim(); if(!nu||!np) return alert('Remplir'); saveCreds({user:nu, pass:np}); alert('Identifiants mis à jour'); log('Changement cred'); }

// render journal (admin)
function renderJournal(){ const el = document.getElementById('journalList'); if(!el) return; const j = load(LS_KEYS.JOUR); el.innerHTML = ''; j.forEach(it=>{ const d=new Date(it.ts); const node=document.createElement('div'); node.className='card'; node.innerHTML=`<div style="font-size:13px;color:var(--muted)">${d.toLocaleString()}</div><p>${it.msg}</p>`; el.appendChild(node); }); if(j.length===0) el.innerHTML='<p class="muted">Journal vide</p>'; }

// reset all storage (admin) - complete wipe
function resetAll(){ 
  if(!confirm('⚠️ حذف جميع البيانات نهائياً؟\n\nسيتم مسح:\n• جميع الحجوزات\n• الديون والمدفوعات\n• الإعلانات والسجل\n• الأيام الملغاة\n\nهل أنت متأكد؟')) return;
  
  // Clear all data
  localStorage.removeItem(LS_KEYS.BOOK);
  localStorage.removeItem(LS_KEYS.CAN);
  localStorage.removeItem(LS_KEYS.ANN);
  localStorage.removeItem(LS_KEYS.JOUR);
  localStorage.removeItem(LS_KEYS.INCOME);
  localStorage.removeItem(LS_KEYS.DEBT);
  
  // Reset to defaults
  ensureDefaults();
  
  // Re-render everything
  renderList();
  renderAdminDays();
  renderAnnonces();
  renderAdminAnns();
  renderJournal();
  renderDebts();
  renderAccounting();
  populateDaySelect();
  
  alert('✅ تم مسح جميع البيانات!\nالموقع الآن كأنه جديد تماماً.');
  
  // Reload page to ensure clean state
  setTimeout(() => location.reload(), 1000);
}

// clean up past days automatically
function cleanPastDays(){
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dayKeyFromDate(today);
  
  let bks = load(LS_KEYS.BOOK);
  const removed = bks.filter(x => x.dayKey < todayKey);
  
  if(removed.length > 0){
    bks = bks.filter(x => x.dayKey >= todayKey);
    save(LS_KEYS.BOOK, bks);
    log(`Nettoyage automatique: ${removed.length} réservation(s) passée(s) supprimée(s)`);
  }
  
  // clean cancelled days that are in the past
  let cancelled = load(LS_KEYS.CAN);
  const removedCancelled = cancelled.filter(x => x.dayKey < todayKey);
  
  if(removedCancelled.length > 0){
    cancelled = cancelled.filter(x => x.dayKey >= todayKey);
    save(LS_KEYS.CAN, cancelled);
    log(`Nettoyage automatique: ${removedCancelled.length} jour(s) annulé(s) passé(s) supprimé(s)`);
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Prevent body scroll when menu is open
  if (mobileMenu.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function closeMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ========== إدارة أيام العمل ==========

// عرض قائمة أيام العمل المُكونة
function renderWorkingDaysConfig() {
  const container = document.getElementById('workingDaysList');
  if (!container) return;
  
  const workDays = getConfiguredWorkDays();
  container.innerHTML = '';
  
  if (workDays.length === 0) {
    container.innerHTML = '<p class="muted">' + (typeof t === 'function' ? t('workdays.none') : 'Aucun jour de travail configuré') + '</p>';
    return;
  }
  
  // ترتيب حسب رقم اليوم
  workDays.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  
  const dayNames = {
    0: 'Dimanche',
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi'
  };
  
  workDays.forEach(day => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.background = 'rgba(255, 255, 255, 0.05)';
    card.style.borderLeft = '3px solid var(--gold1)';
    card.style.marginBottom = '15px';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-size: 20px; font-weight: bold; color: var(--gold-bright); margin-bottom: 8px;">
            📅 ${dayNames[day.dayOfWeek]}
          </div>
          <div class="muted" style="font-size: 14px;">
            ${typeof t === 'function' ? t('workdays.capacity') : 'Capacité'}: <strong style="color: var(--gold1);">${day.capacity}</strong> ${typeof t === 'function' ? t('workdays.clients') : 'clients'}
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-direction: column;">
          <button onclick="editDayCapacity(${day.dayOfWeek})" style="background: rgba(40, 167, 69, 0.8);">
            <span>${typeof t === 'function' ? t('workdays.modify') : 'Modifier capacité'}</span>
          </button>
          <button onclick="if(confirm('${typeof t === 'function' ? t('workdays.remove') : 'Supprimer ce jour de travail?'}')) removeWorkingDay(${day.dayOfWeek})" style="background: rgba(220, 53, 69, 0.8);">
            <span>${typeof t === 'function' ? t('button.delete') : 'Supprimer'}</span>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// إضافة يوم عمل جديد
function addWorkingDay() {
  const dayNames = {
    0: 'Dimanche',
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi'
  };
  
  const workDays = getConfiguredWorkDays();
  const existingDays = workDays.map(w => w.dayOfWeek);
  
  // إنشاء قائمة الأيام المتاحة
  const availableDays = [];
  for (let i = 0; i < 7; i++) {
    if (!existingDays.includes(i)) {
      availableDays.push({ num: i, name: dayNames[i] });
    }
  }
  
  if (availableDays.length === 0) {
    alert(typeof t === 'function' ? t('workdays.alreadyconfigured') : 'Tous les jours de la semaine sont déjà configurés!');
    return;
  }
  
  const options = availableDays.map(d => `${d.num}. ${d.name}`).join('\n');
  const choice = prompt((typeof t === 'function' ? t('workdays.choose') : 'Choisir le jour (numéro)') + ':\n' + options);
  
  if (choice === null) return;
  
  const dayNum = parseInt(choice);
  if (isNaN(dayNum) || dayNum < 0 || dayNum > 6 || existingDays.includes(dayNum)) {
    alert(typeof t === 'function' ? t('workdays.invalid') : 'Choix invalide');
    return;
  }
  
  const capacity = prompt(typeof t === 'function' ? t('workdays.capacityinput') : 'Capacité (nombre de clients):', '5');
  if (capacity === null) return;
  
  const cap = parseInt(capacity);
  if (isNaN(cap) || cap < 1 || cap > 20) {
    alert(typeof t === 'function' ? t('workdays.capacityinvalid') : 'Capacité invalide (1-20)');
    return;
  }
  
  workDays.push({
    dayOfWeek: dayNum,
    dayName: dayNames[dayNum],
    capacity: cap
  });
  
  localStorage.setItem('bp_workdays', JSON.stringify(workDays));
  log(`Jour de travail ajouté: ${dayNames[dayNum]} (capacité: ${cap})`);
  renderWorkingDaysConfig();
  renderAdminDays();
  renderList();
  alert(`✅ ${dayNames[dayNum]} ajouté avec succès!`);
}

// حذف يوم عمل
function removeWorkingDay(dayOfWeek) {
  const dayNames = {
    0: 'Dimanche',
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi'
  };
  
  let workDays = getConfiguredWorkDays();
  workDays = workDays.filter(d => d.dayOfWeek !== dayOfWeek);
  
  localStorage.setItem('bp_workdays', JSON.stringify(workDays));
  log(`Jour de travail supprimé: ${dayNames[dayOfWeek]}`);
  renderWorkingDaysConfig();
  renderAdminDays();
  renderList();
  alert(`✅ ${dayNames[dayOfWeek]} supprimé!`);
}

// تعديل سعة يوم
function editDayCapacity(dayOfWeek) {
  const workDays = getConfiguredWorkDays();
  const day = workDays.find(d => d.dayOfWeek === dayOfWeek);
  
  if (!day) return;
  
  const newCapacity = prompt((typeof t === 'function' ? t('workdays.newcapacity') : 'Nouvelle capacité pour') + ' ' + day.dayName + ':', day.capacity);
  if (newCapacity === null) return;
  
  const cap = parseInt(newCapacity);
  if (isNaN(cap) || cap < 1 || cap > 20) {
    alert(typeof t === 'function' ? t('workdays.capacityinvalid') : 'Capacité invalide (1-20)');
    return;
  }
  
  day.capacity = cap;
  localStorage.setItem('bp_workdays', JSON.stringify(workDays));
  log(`Capacité modifiée: ${day.dayName} → ${cap} clients`);
  renderWorkingDaysConfig();
  renderAdminDays();
  renderList();
  alert('✅ ' + (typeof t === 'function' ? t('workdays.updated') : 'Capacité mise à jour') + ': ' + cap + ' ' + (typeof t === 'function' ? t('workdays.clients') : 'clients'));
}

// initial renderers for pages
window.addEventListener('DOMContentLoaded', ()=>{ cleanPastDays(); renderList(); renderAnnonces(); setupTabs(); try{ renderCancelledDays(); renderAdminDays(); renderAdminAnns(); renderDebts(); renderAccounting(); renderWorkingDaysConfig(); populateDaySelect(); }catch(e){} });
