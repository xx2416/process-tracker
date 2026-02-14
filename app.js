const PLAN=[
  {day:'D1',title:'Hoop #1 + Primer',time:'~20–30m lift + 60–120m hoop',moves:'Knee iso 2–3x30–45s; optional broad jump 4x2; push-ups 2–3x8–12; row 2–3x10–12; Pallof/dead bug 2 sets.'},
  {day:'D2',title:'Conditioning #1 + Push',time:'~45–75m court + 45–60m lift',moves:'Decel 6–8 reps; COD 6–10 reps; explosive push 5–6 sets; speed bench 6x2 or landmine 4x6/side; row 3–4x8–12; core/face pull.'},
  {day:'D3',title:'Sprint + Main lower',time:'~20–35m sprint + 45–70m lift',moves:'Sprints 6–10 reps (10–30m, full rest); broad jump 4x2; trap bar DL 4x3; single-leg 3x6/side; hamstrings 3 sets; ankle + core.'},
  {day:'D4',title:'Tempo #1 + Pull',time:'~20–35m run + 35–55m lift',moves:'Tempo run easy/mod; pull-up/pulldown 4x4–6; row 3–4x8–12; rear delts/face pull; back extension or sled; core carries.'},
  {day:'D5',title:'Hoop #2 + Light Primer',time:'~20–30m light lift + 60–120m hoop',moves:'Same as D1 but lighter. Skip jumps if legs heavy.'},
  {day:'D6',title:'Conditioning #2 + Micro full body',time:'~45–75m court + 30–45m lift',moves:'Low-contact agility; COD 6–8 reps; split squat/step-down 2–3x6; hip thrust 3x8–10; core 10–15m; ankle work.'},
  {day:'D7',title:'Tempo #2/Zone2 + Durability',time:'~20–40m cardio + 45–60m lift',moves:'Tempo/bike Zone2; lateral lunge 2–3 sets; band walks; Copenhagen 2x20–30s; posterior chain + core + ankle.'},
];

const KEY='workout-minimal-v4';
const HIST_KEY='workout-history-v1';
const daysEl=document.getElementById('days');
const completionEl=document.getElementById('completion');

const blank=()=>({
  weekOf:new Date().toISOString().slice(0,10),
  days:PLAN.map(p=>({...p,done:false,date:'',duration:'',startTime:'',jump:'',knee:'',energy:'',note:''})),
  meta:{sleep:'',soreness:'',stress:'',bestJump:''}
});

const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||blank()}catch{return blank()}};
const save=(s)=>localStorage.setItem(KEY,JSON.stringify(s));
const loadHist=()=>{try{return JSON.parse(localStorage.getItem(HIST_KEY))||[]}catch{return []}};
const saveHist=(h)=>localStorage.setItem(HIST_KEY,JSON.stringify(h));
const clone=(x)=>JSON.parse(JSON.stringify(x));

function plusDays(isoDate, days){
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

function syncDayDates(state){
  state.days.forEach((d,i)=>{
    if(!d.date) d.date = plusDays(state.weekOf, i);
  });
}

function render(){
  const s=load();
  syncDayDates(s);
  save(s);
  daysEl.innerHTML='';
  s.days.forEach((d,i)=>{
    const card=document.createElement('article'); card.className='day';
    card.innerHTML=`
      <div class="row"><strong>${d.day} · ${d.title}</strong><label><input data-i="${i}" data-k="done" type="checkbox" ${d.done?'checked':''}/> done</label></div>
      <div class="plan"><b>Date:</b> <input data-i="${i}" data-k="date" type="date" value="${d.date||''}" class="inline-date" /></div>
      <div class="plan"><b>Plan time:</b> ${d.time}</div>
      <div class="plan"><b>Key moves:</b> ${d.moves}</div>
      <div class="grid">
        <input data-i="${i}" data-k="startTime" type="time" value="${d.startTime||''}" title="Start time">
        <input data-i="${i}" data-k="duration" type="number" min="0" placeholder="Minutes trained" value="${d.duration}">
        <input data-i="${i}" data-k="jump" type="text" placeholder="Best jump" value="${d.jump}">
        <input data-i="${i}" data-k="knee" type="number" min="0" max="10" placeholder="Knee pain (0-10)" value="${d.knee}">
        <input data-i="${i}" data-k="energy" type="number" min="1" max="10" placeholder="Energy (1-10)" value="${d.energy}">
      </div>
      <textarea class="note" data-i="${i}" data-k="note" placeholder="Quick note">${d.note}</textarea>`;
    daysEl.appendChild(card);
  });

  bindMeta(s);
  bindDayInputs(s);
  bindActions();
  stats(s);
  renderHistory();
}

function bindMeta(s){
  [['weekOf'],['sleep','sleep'],['soreness','soreness'],['stress','stress'],['bestJump','bestJump']].forEach(([id,mk])=>{
    const el=document.getElementById(id); el.value=id==='weekOf'?s.weekOf:(s.meta[mk]||'');
    el.oninput=()=>{
      if(id==='weekOf'){
        s.weekOf=el.value;
        s.days.forEach((d,i)=>{ d.date = plusDays(s.weekOf, i); });
      } else {
        s.meta[mk]=el.value;
      }
      save(s); render();
    };
  });
}

function bindDayInputs(s){
  daysEl.querySelectorAll('[data-k]').forEach(el=>{
    const fn=()=>{const i=+el.dataset.i,k=el.dataset.k; s.days[i][k]=(k==='done')?el.checked:el.value; save(s); stats(s); renderHistory();};
    el.oninput=fn; if(el.type==='checkbox') el.onchange=fn;
  });
}

function bindActions(){
  document.getElementById('reset').onclick=()=>{localStorage.removeItem(KEY); render();};
  document.getElementById('export').onclick=()=>downloadJson(load(), `workout-${load().weekOf}.json`);
  document.getElementById('archive').onclick=archiveCurrentWeek;
  document.getElementById('import').onclick=()=>document.getElementById('importFile').click();
  document.getElementById('importFile').onchange=importWeekFile;

  document.getElementById('tabDaily').onclick=()=>switchTab('daily');
  document.getElementById('tabHistory').onclick=()=>switchTab('history');
}

function switchTab(tab){
  const daily = document.getElementById('dailyView');
  const history = document.getElementById('historyView');
  const tDaily = document.getElementById('tabDaily');
  const tHist = document.getElementById('tabHistory');
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
    }catch(err){ alert('Import failed. Use an exported week JSON file.'); }
    e.target.value='';
  };
  reader.readAsText(f);
}

function renderHistory(){
  const current=clone(load());
  const hist=loadHist();
  const all=[current, ...hist.filter(w=>w.weekOf!==current.weekOf)];

  const dailyMins=[];
  const weeklyCompletion=[];
  all.forEach(w=>{
    const done=w.days.filter(d=>d.done).length;
    weeklyCompletion.push((done/7)*100);
    w.days.forEach(d=>{ const m=Number(d.duration); if(!Number.isNaN(m)&&m>0) dailyMins.push(m); });
  });
  const avgDailyMins = dailyMins.length ? (dailyMins.reduce((a,b)=>a+b,0)/dailyMins.length).toFixed(1) : '-';
  const avgWeeklyComp = weeklyCompletion.length ? `${(weeklyCompletion.reduce((a,b)=>a+b,0)/weeklyCompletion.length).toFixed(0)}%` : '-';

  const monthCount={};
  all.forEach(w=>{
    const month=(w.weekOf||'').slice(0,7)||'unknown';
    monthCount[month]=(monthCount[month]||0)+w.days.filter(d=>d.done).length;
  });
  const months=Object.entries(monthCount).sort((a,b)=>a[0]<b[0]?1:-1);

  document.getElementById('sumDailyMins').textContent=avgDailyMins;
  document.getElementById('sumWeeklyCompletion').textContent=avgWeeklyComp;
  document.getElementById('sumMonthlyWorkouts').textContent=months[0]?.[1] ?? 0;

  const sel=document.getElementById('weekSelect');
  const existing=sel.value;
  sel.innerHTML='';
  all.sort((a,b)=>a.weekOf<b.weekOf?1:-1).forEach(w=>{
    const opt=document.createElement('option'); opt.value=w.weekOf; opt.textContent=w.weekOf + (w===current?' (current)':''); sel.appendChild(opt);
  });
  sel.value = [...sel.options].some(o=>o.value===existing) ? existing : (sel.options[0]?.value||'');
  sel.onchange=()=>renderWeekDetails(all.find(w=>w.weekOf===sel.value));
  renderWeekDetails(all.find(w=>w.weekOf===sel.value));

  const monthRows=months.map(([m,c])=>`<tr><td>${m}</td><td>${c}</td></tr>`).join('') || '<tr><td colspan="2">No history yet</td></tr>';
  document.getElementById('monthTable').innerHTML=`<h3>Monthly Summary</h3><table><thead><tr><th>Month</th><th>Completed workouts</th></tr></thead><tbody>${monthRows}</tbody></table>`;
}

function renderWeekDetails(w){
  const wrap=document.getElementById('weekDetails');
  if(!w){wrap.innerHTML='<h3>Week Details</h3><p>No week selected.</p>'; return;}
  const rows=w.days.map(d=>`<tr><td>${d.day}</td><td>${d.date||''}</td><td>${d.title||''}</td><td>${d.done?'✅':'—'}</td><td>${d.startTime||''}</td><td>${d.duration||''}</td><td>${d.knee||''}</td><td>${d.energy||''}</td><td>${d.jump||''}</td><td>${d.note||''}</td></tr>`).join('');
  wrap.innerHTML=`<h3>Week Details: ${w.weekOf}</h3><table><thead><tr><th>Day</th><th>Date</th><th>Plan</th><th>Done</th><th>Start</th><th>Mins</th><th>Knee</th><th>Energy</th><th>Jump</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function stats(s){
  const done=s.days.filter(d=>d.done).length;
  completionEl.textContent=`${Math.round(done/7*100)}% complete`;
}

function downloadJson(data, filename){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
}

render();
