const PLAN=[
  {day:'D1',title:'Hoop #1 + PG Primer',time:'20–30m primer + pickup',hint:'Mobility + knee iso + decel holds + ball rhythm. Pickup: choose ONE focus (pace change / stop balance / weak-hand entry / pass read).'},
  {day:'D2',title:'PG Skill + COD + Upper Push',time:'~70–110m total',hint:'Decel/cut mechanics, PG move block (hesi, retreat/re-attack, snake), then upper push + row + glute support.'},
  {day:'D3',title:'Sprint + Lower Power/Strength',time:'~65–100m total',hint:'Anchor day. Quality sprints (10–20m), 1 main jump pattern, trap bar strength, single-leg + hamstring + calf/tib.'},
  {day:'D4',title:'Tempo #1 + Pull/Posture',time:'~35–60m total',hint:'Easy tempo or bike, pull-focused upper work, mobility reset. Goal = recover and move cleaner.'},
  {day:'D5',title:'Hoop #2 + Light Primer',time:'10–20m primer + pickup',hint:'Light foot rhythm + dribble rhythm + few decel holds. One pickup theme only; no junk conditioning.'},
  {day:'D6',title:'PG Skill Lab + Micro Lower/Rehab',time:'~45–80m total',hint:'Footwork + handle under movement + reactive-lite. Then shallow single-leg, bridge/thrust, adductor, calf/tib, core.'},
  {day:'D7',title:'Tempo #2/Zone2 + Durability',time:'~30–75m total',hint:'Easy tempo or Zone2. Lateral work, adductor, hamstring/back extension, calf/tib, core.'},
];

const KEY='workout-minimal-v6';
const HIST_KEY='workout-history-v1';
const DAY_HIST_KEY='workout-day-history-v1';
let selectedDayIndex=0;

const completionEl=document.getElementById('completion');
const daySelectEl=document.getElementById('daySelect');
const focusCardEl=document.getElementById('focusCard');

const todayISO=()=>new Date().toISOString().slice(0,10);

const INSPO_QUOTES=[
  {
    quote:'“Great things come from daily discipline.”',
    note:'Mamba-inspired reminder: consistency beats motivation.'
  },
  {
    quote:'“Focus on one rep, then the next rep.”',
    note:'Win the small details: footwork, balance, clean finish.'
  },
  {
    quote:'“Pressure is a privilege — prepare for it.”',
    note:'Train calm under fatigue so game speed feels familiar.'
  },
  {
    quote:'“No shortcuts. Just standards.”',
    note:'Protect your knee, own your mechanics, stack quality days.'
  }
];

const blank=()=>({
  weekOf:todayISO(),
  days:PLAN.map(p=>({...p,done:false,logDate:todayISO(),startTime:'',duration:'',knee:'',actual:'',note:''})),
  meta:{sleep:'',soreness:'',stress:'',bestJump:''}
});

const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||blank()}catch{return blank()}};
const save=(s)=>localStorage.setItem(KEY,JSON.stringify(s));
const loadHist=()=>{try{return JSON.parse(localStorage.getItem(HIST_KEY))||[]}catch{return []}};
const saveHist=(h)=>localStorage.setItem(HIST_KEY,JSON.stringify(h));
const loadDayHist=()=>{try{return JSON.parse(localStorage.getItem(DAY_HIST_KEY))||[]}catch{return []}};
const saveDayHist=(h)=>localStorage.setItem(DAY_HIST_KEY,JSON.stringify(h));
const clone=(x)=>JSON.parse(JSON.stringify(x));

function render(){
  const s=load();
  // Default to today only when missing; keep user-entered dates intact.
  s.days.forEach(d=>{ if(!d.logDate) d.logDate=todayISO(); });
  save(s);

  renderInspo();
  renderDayPicker(s);
  renderFocusDay(s, selectedDayIndex);
  bindMeta(s);
  bindActions();
  stats(s);
  renderHistory();
}

function renderInspo(){
  const quoteEl=document.getElementById('inspoQuote');
  const noteEl=document.getElementById('inspoNote');
  if(!quoteEl||!noteEl) return;
  const daySeed=new Date().getDate()%INSPO_QUOTES.length;
  const pick=INSPO_QUOTES[daySeed];
  quoteEl.textContent=pick.quote;
  noteEl.textContent=pick.note;
}

function renderDayPicker(s){
  daySelectEl.innerHTML='';
  s.days.forEach((d,i)=>{
    const label=`${d.day} · ${d.title}`;
    const opt=document.createElement('option');
    opt.value=i;
    opt.textContent=label;
    daySelectEl.appendChild(opt);
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
    </div>
    <div class="plan"><b>Session hint:</b> ${d.hint}</div>
    <div class="plan"><b>Template duration:</b> ${d.time}</div>

    <div class="date-done-row">
      <label class="field"><span>Real training date</span><input id="logDate" type="date" value="${d.logDate||todayISO()}" title="Real date you trained"></label>
      <label class="done-row"><input id="doneBox" type="checkbox" ${d.done?'checked':''}/> Done</label>
    </div>

    <div class="field-grid">
      <label class="field"><span>Log time</span><input id="startTime" type="time" value="${d.startTime||''}" title="Log time"></label>
      <label class="field"><span>Training minutes</span><input id="duration" type="number" min="0" placeholder="e.g. 75" value="${d.duration||''}"></label>
      <label class="field"><span>Knee pain (0–10)</span><input id="knee" type="number" min="0" max="10" placeholder="0-10" value="${d.knee||''}"></label>
    </div>

    <label class="field" style="margin-top:8px"><span>What you actually did</span><input id="actual" type="text" placeholder="Short summary" value="${d.actual||''}"></label>
    <label class="field" style="margin-top:8px"><span>Daily log details</span><textarea id="note" class="note" placeholder="Drills, feel, pain notes, what to change">${d.note||''}</textarea></label>
  `;

  const update=(key,val)=>{ s.days[idx][key]=val; save(s); stats(s); renderHistory(); renderDayPicker(s); };
  document.getElementById('doneBox').onchange=e=>update('done',e.target.checked);
  document.getElementById('logDate').oninput=e=>update('logDate',e.target.value);
  document.getElementById('startTime').oninput=e=>update('startTime',e.target.value);
  document.getElementById('duration').oninput=e=>update('duration',e.target.value);
  document.getElementById('knee').oninput=e=>update('knee',e.target.value);
  document.getElementById('actual').oninput=e=>update('actual',e.target.value);
  document.getElementById('note').oninput=e=>update('note',e.target.value);
}

function bindMeta(s){
  [['weekOf'],['sleep','sleep'],['soreness','soreness'],['stress','stress'],['bestJump','bestJump']].forEach(([id,mk])=>{
    const el=document.getElementById(id); el.value=id==='weekOf'?s.weekOf:(s.meta[mk]||'');
    el.oninput=()=>{ if(id==='weekOf') s.weekOf=el.value; else s.meta[mk]=el.value; save(s); renderHistory(); };
  });
}

function isoWeekStart(dateStr){
  const d = new Date((dateStr||todayISO())+'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  d.setDate(diff);
  return d.toISOString().slice(0,10);
}

function saveCurrentDayToHistory(){
  const s = load();
  const d = s.days[selectedDayIndex];
  const entry = {
    weekOf: isoWeekStart(d.logDate || todayISO()),
    templateDay: d.day,
    title: d.title,
    logDate: d.logDate || todayISO(),
    done: !!d.done,
    startTime: d.startTime || '',
    duration: d.duration || '',
    knee: d.knee || '',
    actual: d.actual || '',
    note: d.note || '',
    savedAt: new Date().toISOString()
  };
  const hist = loadDayHist();
  hist.unshift(entry);
  saveDayHist(hist.slice(0, 500));
  alert(`Saved ${d.day} (${entry.logDate}) to day history.`);
  renderHistory();
}

function bindActions(){
  // today button removed by design: user explicitly picks one of 7 frames.
  document.getElementById('saveDay').onclick=saveCurrentDayToHistory;
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
  const hist=loadHist();
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
      const hist=loadHist();
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
  const weekHist=loadHist();
  const dayHist=loadDayHist();
  const all=[current,...weekHist];

  const dailyMins=[]; const weeklyCompletion=[];
  all.forEach(w=>{
    weeklyCompletion.push((w.days.filter(d=>d.done).length/7)*100);
    w.days.forEach(d=>{ const m=Number(d.duration); if(!Number.isNaN(m)&&m>0) dailyMins.push(m); });
  });
  dayHist.forEach(d=>{ const m=Number(d.duration); if(!Number.isNaN(m)&&m>0) dailyMins.push(m); });

  document.getElementById('sumDailyMins').textContent=dailyMins.length?(dailyMins.reduce((a,b)=>a+b,0)/dailyMins.length).toFixed(1):'-';
  document.getElementById('sumWeeklyCompletion').textContent=weeklyCompletion.length?`${(weeklyCompletion.reduce((a,b)=>a+b,0)/weeklyCompletion.length).toFixed(0)}%`:'-';

  const monthCount={};
  all.forEach(w=>{ const m=(w.weekOf||'').slice(0,7)||'unknown'; monthCount[m]=(monthCount[m]||0)+w.days.filter(d=>d.done).length; });
  dayHist.forEach(d=>{ const m=(d.weekOf||'').slice(0,7)||'unknown'; monthCount[m]=(monthCount[m]||0)+(d.done?1:0); });
  const months=Object.entries(monthCount).sort((a,b)=>a[0]<b[0]?1:-1);
  document.getElementById('sumMonthlyWorkouts').textContent=months[0]?.[1]??0;

  const sel=document.getElementById('weekSelect'); const existing=sel.value; sel.innerHTML='';
  all.sort((a,b)=>new Date((b.archivedAt||'')||b.weekOf)-new Date((a.archivedAt||'')||a.weekOf)).forEach((w,i)=>{
    const o=document.createElement('option');
    o.value=String(i);
    o.textContent=`${w.weekOf}${i===0?' (current)':''}`;
    sel.appendChild(o);
  });
  sel.value=[...sel.options].some(o=>o.value===existing)?existing:(sel.options[0]?.value||'0');
  sel.onchange=()=>renderWeekDetails(all[Number(sel.value)]);
  renderWeekDetails(all[Number(sel.value||0)]);

  const weekBuckets={};
  dayHist.forEach(d=>{ if(!weekBuckets[d.weekOf]) weekBuckets[d.weekOf]=[]; weekBuckets[d.weekOf].push(d); });
  const weekRows=Object.entries(weekBuckets)
    .sort((a,b)=>a[0]<b[0]?1:-1)
    .map(([w,arr])=>`<tr><td>${w}</td><td>${arr.length}</td><td>${arr.filter(x=>x.done).length}</td></tr>`)
    .join('') || '<tr><td colspan="3">No day history yet</td></tr>';

  const monthRows=months.map(([m,c])=>`<tr><td>${m}</td><td>${c}</td></tr>`).join('')||'<tr><td colspan="2">No history yet</td></tr>';
  document.getElementById('monthTable').innerHTML=`
    <h3>Weekly Output (from saved days)</h3>
    <table><thead><tr><th>Week (Mon)</th><th>Saved day logs</th><th>Done logs</th></tr></thead><tbody>${weekRows}</tbody></table>
    <h3 style="margin-top:12px">Monthly Summary</h3>
    <table><thead><tr><th>Month</th><th>Completed workouts</th></tr></thead><tbody>${monthRows}</tbody></table>`;
}

function renderWeekDetails(w){
  const wrap=document.getElementById('weekDetails');
  if(!w){wrap.innerHTML='<h3>Week Details</h3><p>No week selected.</p>';return;}
  const rows=w.days.map(d=>`<tr><td>${d.day}</td><td>${d.logDate||''}</td><td>${d.title||''}</td><td>${d.done?'✅':'—'}</td><td>${d.startTime||''}</td><td>${d.duration||''}</td><td>${d.knee||''}</td><td>${d.actual||''}</td><td>${d.note||''}</td></tr>`).join('');
  wrap.innerHTML=`<h3>Week Details: ${w.weekOf}</h3><table><thead><tr><th>Template Day</th><th>Real Date</th><th>Session</th><th>Done</th><th>Log Time</th><th>Minutes</th><th>Knee</th><th>Actual Work</th><th>Daily Log</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function stats(s){ completionEl.textContent=`${Math.round((s.days.filter(d=>d.done).length/7)*100)}% complete`; }
function downloadJson(data, filename){ const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); }

render();