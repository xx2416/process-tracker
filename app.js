const PLAN=[
  {day:'D1',title:'Hoop #1 + PG Primer',time:'20–30m primer + pickup',hint:'Mobility + knee iso + decel holds + ball rhythm. Pickup: choose ONE focus (pace change / stop balance / weak-hand entry / pass read).'},
  {day:'D2',title:'PG Skill + COD + Upper Push',time:'~70–110m total',hint:'Decel/cut mechanics, PG move block (hesi, retreat/re-attack, snake), then upper push + row + glute support.'},
  {day:'D3',title:'Sprint + Lower Power/Strength',time:'~65–100m total',hint:'Anchor day. Quality sprints (10–20m), 1 main jump pattern, trap bar strength, single-leg + hamstring + calf/tib.'},
  {day:'D4',title:'Tempo #1 + Pull/Posture',time:'~35–60m total',hint:'Easy tempo or bike, pull-focused upper work, mobility reset. Goal = recover and move cleaner.'},
  {day:'D5',title:'Hoop #2 + Light Primer',time:'10–20m primer + pickup',hint:'Light foot rhythm + dribble rhythm + few decel holds. One pickup theme only; no junk conditioning.'},
  {day:'D6',title:'PG Skill Lab + Micro Lower/Rehab',time:'~45–80m total',hint:'Footwork + handle under movement + reactive-lite. Then shallow single-leg, bridge/thrust, adductor, calf/tib, core.'},
  {day:'D7',title:'Tempo #2/Zone2 + Durability',time:'~30–75m total',hint:'Easy tempo or Zone2. Lateral work, adductor, hamstring/back extension, calf/tib, core.'},
];

const KEY='workout-minimal-v5';
const HIST_KEY='workout-history-v1';
let selectedDayIndex=0;

const completionEl=document.getElementById('completion');
const daySelectEl=document.getElementById('daySelect');
const dayChipsEl=document.getElementById('dayChips');
const focusCardEl=document.getElementById('focusCard');

const blank=()=>({
  weekOf:new Date().toISOString().slice(0,10),
  days:PLAN.map(p=>({...p,done:false,date:'',startTime:'',duration:'',knee:'',actual:'',note:''})),
  meta:{sleep:'',soreness:'',stress:'',bestJump:''}
});

const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||blank()}catch{return blank()}};
const save=(s)=>localStorage.setItem(KEY,JSON.stringify(s));
const loadHist=()=>{try{return JSON.parse(localStorage.getItem(HIST_KEY))||[]}catch{return []}};
const saveHist=(h)=>localStorage.setItem(HIST_KEY,JSON.stringify(h));
const clone=(x)=>JSON.parse(JSON.stringify(x));

function plusDays(isoDate, days){ const d=new Date(isoDate+'T00:00:00'); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }

function syncDayDates(state){ state.days.forEach((d,i)=>{ if(!d.date) d.date=plusDays(state.weekOf,i); }); }

function render(){
  const s=load();
  syncDayDates(s);
  save(s);

  renderDayPicker(s);
  renderFocusDay(s, selectedDayIndex);
  bindMeta(s);
  bindActions();
  stats(s);
  renderHistory();
}

function renderDayPicker(s){
  daySelectEl.innerHTML='';
  dayChipsEl.innerHTML='';
  s.days.forEach((d,i)=>{
    const label=`${d.day} · ${d.date} · ${d.title}`;
    const opt=document.createElement('option'); opt.value=i; opt.textContent=label; daySelectEl.appendChild(opt);

    const chip=document.createElement('button');
    chip.className='chip'+(i===selectedDayIndex?' active':'');
    chip.textContent=`${d.day}${d.done?' ✅':''}`;
    chip.onclick=()=>{ selectedDayIndex=i; render(); };
    dayChipsEl.appendChild(chip);
  });
  if(selectedDayIndex>s.days.length-1) selectedDayIndex=0;
  daySelectEl.value=String(selectedDayIndex);
  daySelectEl.onchange=()=>{ selectedDayIndex=Number(daySelectEl.value); render(); };
}

function renderFocusDay(s, idx){
  const d=s.days[idx];
  focusCardEl.innerHTML=`
    <div class="row">
      <strong>${d.day} · ${d.title}</strong>
      <label><input id="doneBox" type="checkbox" ${d.done?'checked':''}/> done</label>
    </div>
    <div class="plan"><b>Date:</b> <input id="dayDate" type="date" value="${d.date||''}" style="max-width:180px;display:inline-block;margin-left:6px;padding:4px 8px" /></div>
    <div class="plan"><b>Session hint:</b> ${d.hint}</div>
    <div class="plan"><b>Planned duration:</b> ${d.time}</div>

    <div class="grid">
      <input id="startTime" type="time" value="${d.startTime||''}" title="Log time">
      <input id="duration" type="number" min="0" placeholder="Training minutes" value="${d.duration||''}">
      <input id="knee" type="number" min="0" max="10" placeholder="Knee pain (0-10)" value="${d.knee||''}">
      <input id="actual" type="text" placeholder="What you actually did (short)" value="${d.actual||''}">
    </div>
    <textarea id="note" class="note" placeholder="Daily log details: drills, feel, wins, pain notes, changes">${d.note||''}</textarea>
  `;

  const update=(key,val)=>{ s.days[idx][key]=val; save(s); stats(s); renderHistory(); renderDayPicker(s); };
  document.getElementById('doneBox').onchange=e=>update('done',e.target.checked);
  document.getElementById('dayDate').oninput=e=>update('date',e.target.value);
  document.getElementById('startTime').oninput=e=>update('startTime',e.target.value);
  document.getElementById('duration').oninput=e=>update('duration',e.target.value);
  document.getElementById('knee').oninput=e=>update('knee',e.target.value);
  document.getElementById('actual').oninput=e=>update('actual',e.target.value);
  document.getElementById('note').oninput=e=>update('note',e.target.value);
}

function bindMeta(s){
  [['weekOf'],['sleep','sleep'],['soreness','soreness'],['stress','stress'],['bestJump','bestJump']].forEach(([id,mk])=>{
    const el=document.getElementById(id); el.value=id==='weekOf'?s.weekOf:(s.meta[mk]||'');
    el.oninput=()=>{
      if(id==='weekOf'){ s.weekOf=el.value; s.days.forEach((d,i)=>d.date=plusDays(s.weekOf,i)); }
      else s.meta[mk]=el.value;
      save(s); render();
    };
  });
}

function bindActions(){
  document.getElementById('todayBtn').onclick=()=>{
    const s=load();
    const today=new Date().toISOString().slice(0,10);
    const i=s.days.findIndex(d=>d.date===today);
    if(i>=0){ selectedDayIndex=i; render(); }
    else alert('Today is outside the selected week.');
  };

  document.getElementById('reset').onclick=()=>{localStorage.removeItem(KEY); selectedDayIndex=0; render();};
  document.getElementById('export').onclick=()=>downloadJson(load(), `workout-${load().weekOf}.json`);
  document.getElementById('archive').onclick=archiveCurrentWeek;
  document.getElementById('import').onclick=()=>document.getElementById('importFile').click();
  document.getElementById('importFile').onchange=importWeekFile;
  document.getElementById('tabDaily').onclick=()=>switchTab('daily');
  document.getElementById('tabHistory').onclick=()=>switchTab('history');
}

function switchTab(tab){
  const daily=document.getElementById('dailyView');
  const history=document.getElementById('historyView');
  const tDaily=document.getElementById('tabDaily');
  const tHist=document.getElementById('tabHistory');
  if(tab==='history'){daily.classList.add('hidden'); history.classList.remove('hidden'); tDaily.classList.add('ghost'); tDaily.classList.remove('active'); tHist.classList.add('active'); tHist.classList.remove('ghost');}
  else {history.classList.add('hidden'); daily.classList.remove('hidden'); tHist.classList.add('ghost'); tHist.classList.remove('active'); tDaily.classList.add('active'); tDaily.classList.remove('ghost');}
}

function archiveCurrentWeek(){
  const cur=clone(load());
  const hist=loadHist().filter(w=>w.weekOf!==cur.weekOf);
  hist.unshift({...cur, archivedAt:new Date().toISOString()});
  saveHist(hist);
  alert(`Saved week ${cur.weekOf} to history.`);
  renderHistory();
}

function importWeekFile(e){
  const f=e.target.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(!data.weekOf || !Array.isArray(data.days)) throw new Error('Bad file format');
      const hist=loadHist().filter(w=>w.weekOf!==data.weekOf);
      hist.unshift({...data, importedAt:new Date().toISOString()});
      saveHist(hist);
      alert(`Imported week ${data.weekOf} into history.`);
      renderHistory();
    }catch{ alert('Import failed. Use an exported week JSON file.'); }
    e.target.value='';
  };
  reader.readAsText(f);
}

function renderHistory(){
  const current=clone(load());
  const hist=loadHist();
  const all=[current,...hist.filter(w=>w.weekOf!==current.weekOf)];

  const dailyMins=[]; const weeklyCompletion=[];
  all.forEach(w=>{
    weeklyCompletion.push((w.days.filter(d=>d.done).length/7)*100);
    w.days.forEach(d=>{ const m=Number(d.duration); if(!Number.isNaN(m)&&m>0) dailyMins.push(m); });
  });
  document.getElementById('sumDailyMins').textContent=dailyMins.length?(dailyMins.reduce((a,b)=>a+b,0)/dailyMins.length).toFixed(1):'-';
  document.getElementById('sumWeeklyCompletion').textContent=weeklyCompletion.length?`${(weeklyCompletion.reduce((a,b)=>a+b,0)/weeklyCompletion.length).toFixed(0)}%`:'-';

  const monthCount={};
  all.forEach(w=>{ const m=(w.weekOf||'').slice(0,7)||'unknown'; monthCount[m]=(monthCount[m]||0)+w.days.filter(d=>d.done).length; });
  const months=Object.entries(monthCount).sort((a,b)=>a[0]<b[0]?1:-1);
  document.getElementById('sumMonthlyWorkouts').textContent=months[0]?.[1]??0;

  const sel=document.getElementById('weekSelect'); const existing=sel.value; sel.innerHTML='';
  all.sort((a,b)=>a.weekOf<b.weekOf?1:-1).forEach(w=>{ const o=document.createElement('option'); o.value=w.weekOf; o.textContent=w.weekOf+(w===current?' (current)':''); sel.appendChild(o); });
  sel.value=[...sel.options].some(o=>o.value===existing)?existing:(sel.options[0]?.value||'');
  sel.onchange=()=>renderWeekDetails(all.find(w=>w.weekOf===sel.value));
  renderWeekDetails(all.find(w=>w.weekOf===sel.value));

  const monthRows=months.map(([m,c])=>`<tr><td>${m}</td><td>${c}</td></tr>`).join('')||'<tr><td colspan="2">No history yet</td></tr>';
  document.getElementById('monthTable').innerHTML=`<h3>Monthly Summary</h3><table><thead><tr><th>Month</th><th>Completed workouts</th></tr></thead><tbody>${monthRows}</tbody></table>`;
}

function renderWeekDetails(w){
  const wrap=document.getElementById('weekDetails');
  if(!w){wrap.innerHTML='<h3>Week Details</h3><p>No week selected.</p>';return;}
  const rows=w.days.map(d=>`<tr><td>${d.day}</td><td>${d.date||''}</td><td>${d.title||''}</td><td>${d.done?'✅':'—'}</td><td>${d.startTime||''}</td><td>${d.duration||''}</td><td>${d.knee||''}</td><td>${d.actual||''}</td><td>${d.note||''}</td></tr>`).join('');
  wrap.innerHTML=`<h3>Week Details: ${w.weekOf}</h3><table><thead><tr><th>Day</th><th>Date</th><th>Session</th><th>Done</th><th>Log Time</th><th>Minutes</th><th>Knee</th><th>Actual Work</th><th>Daily Log</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function stats(s){ completionEl.textContent=`${Math.round((s.days.filter(d=>d.done).length/7)*100)}% complete`; }

function downloadJson(data, filename){ const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); }

render();