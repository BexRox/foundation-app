import { useState } from "react";

const T = {
  bg:"#f5f4f0",sur:"#ffffff",card:"#ffffff",bdr:"#e0ddd6",
  ink:"#1a1814",mid:"#4a4740",dim:"#8a877e",fnt:"#c0bdb5",
  gold:"#b8860b",gBg:"#fef9ec",gBdr:"#f0d060",
  grn:"#1a7a44",gnBg:"#edf7f2",gnBdr:"#6fcf97",
  blu:"#1a5fa8",blBg:"#edf4fc",blBdr:"#90c4f0",
  pur:"#5a3fa8",puBg:"#f2eefa",puBdr:"#b39df0",
  org:"#c45000",ogBg:"#fef3ec",ogBdr:"#f0a060",
};
const BC = "'Barlow Condensed',sans-serif";

// Get Monday of current week
function getMondayKey() {
  const now = new Date();
  const dow = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  return mon.toISOString().split("T")[0];
}

// Calculate smart defaults from history
function getSmartDefaults(allData) {
  const dates = Object.keys(allData).sort().slice(-14);
  const strengthDays = dates.filter(d => allData[d]?.lift?.ex && Object.values(allData[d].lift.ex).some(ex => ex.sets?.some(s => s.done))).length;
  const cardioDays   = dates.filter(d => (allData[d]?.cardio||[]).length > 0).length;
  const soberDays    = dates.filter(d => allData[d]?.sober === true).length;
  const weights      = dates.map(d => parseFloat(allData[d]?.ci?.weight)).filter(Boolean);
  const avgWeight    = weights.length > 0 ? (weights.reduce((a,b)=>a+b,0)/weights.length).toFixed(1) : 196;
  const avgCardio    = dates.length > 0
    ? Math.round(dates.reduce((a,d) => a + (allData[d]?.cardio||[]).reduce((b,e)=>b+parseInt(e.dur||0),0), 0) / Math.max(dates.length,1))
    : 0;

  return {
    strengthSessions: Math.min(Math.max(Math.round(strengthDays/2) + 1, 3), 4),
    cardioMinutes:    Math.max(avgCardio > 0 ? avgCardio + 10 : 30, 30) * 5,
    proteinTarget:    120,
    soberDays:        Math.min(soberDays > 0 ? Math.round(soberDays/2) + 1 : 5, 7),
    weightGoal:       Math.max(parseFloat(avgWeight) - 0.5, 151).toFixed(1),
    sleepScore:       3,
  };
}

const GOAL_DEFS = [
  { key:"strengthSessions", label:"Strength Sessions",  icon:"💪", unit:"sessions", color:T.org, min:1, max:6, step:1,  desc:"Target lifting sessions this week" },
  { key:"cardioMinutes",    label:"Total Cardio",        icon:"🚴", unit:"min",      color:T.blu, min:30,max:300,step:15, desc:"Total Zone 2 movement minutes" },
  { key:"proteinTarget",    label:"Avg Daily Protein",   icon:"🥗", unit:"g/day",   color:T.pur, min:80, max:160,step:5,  desc:"Average daily protein grams" },
  { key:"soberDays",        label:"Sober Days",          icon:"🌟", unit:"days",    color:T.grn, min:1, max:7, step:1,  desc:"Days alcohol-free this week" },
  { key:"weightGoal",       label:"Weight Target",       icon:"⚖️", unit:"lbs",     color:T.gold,min:151,max:200,step:0.5,desc:"End-of-week weight goal" },
  { key:"sleepScore",       label:"Sleep Quality",       icon:"😴", unit:"/ 5",     color:T.pur, min:1, max:5, step:1,  desc:"Average nightly sleep rating" },
];

export default function WeeklyGoals({ allData, weekGoals, onSave }) {
  const monday = getMondayKey();
  const defaults = getSmartDefaults(allData);
  const existing = weekGoals?.[monday];
  const [goals, setGoals] = useState(existing || defaults);
  const [saved, setSaved] = useState(!!existing);
  const [editing, setEditing] = useState(!existing);

  function handleSave() {
    onSave(monday, goals);
    setSaved(true);
    setEditing(false);
  }

  // Calculate current week progress
  const now = new Date();
  const dow = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  const weekDates = Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d.toISOString().split("T")[0]; });

  const progress = {
    strengthSessions: weekDates.filter(d => allData[d]?.lift?.ex && Object.values(allData[d].lift.ex).some(ex => ex.sets?.some(s=>s.done))).length,
    cardioMinutes:    weekDates.reduce((a,d) => a + (allData[d]?.cardio||[]).reduce((b,e)=>b+parseInt(e.dur||0),0), 0),
    proteinTarget:    (() => { const days = weekDates.filter(d=>allData[d]); if(!days.length) return 0; const tots = days.map(d=>{ const lg=([{pro:25},{pro:15},{pro:30},{pro:15},{pro:35}]).filter((_,i)=>allData[d]?.meals?.[["breakfast","snack1","lunch","snack2","dinner"][i]]?.logged); return lg.reduce((a,m)=>a+m.pro,0); }); return Math.round(tots.reduce((a,b)=>a+b,0)/days.length); })(),
    soberDays:        weekDates.filter(d => allData[d]?.sober === true).length,
    weightGoal:       (() => { const ws = weekDates.map(d=>parseFloat(allData[d]?.ci?.weight)).filter(Boolean); return ws.length>0?ws[ws.length-1]:null; })(),
    sleepScore:       (() => { const scores = weekDates.map(d=>allData[d]?.ci?.sleep).filter(Boolean); return scores.length>0?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null; })(),
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background:T.gBg, border:`1.5px solid ${T.gBdr}`, borderRadius:20, padding:18, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:T.ink, fontFamily:BC, letterSpacing:"0.5px" }}>WEEKLY GOALS</div>
            <div style={{ fontSize:12, color:T.dim, marginTop:2 }}>
              Week of {new Date(monday+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric"})}
              {saved && !editing && <span style={{ color:T.grn, marginLeft:8, fontWeight:700 }}>✓ Set</span>}
            </div>
          </div>
          {saved && !editing && (
            <button onClick={()=>setEditing(true)} style={{ padding:"8px 14px", background:T.bg, border:`1.5px solid ${T.bdr}`, borderRadius:10, color:T.mid, fontSize:13, cursor:"pointer", fontWeight:600 }}>Edit</button>
          )}
        </div>
      </div>

      {/* Goal cards with progress */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
        {GOAL_DEFS.map(def => {
          const goal = parseFloat(goals[def.key]) || 0;
          const prog = progress[def.key];
          const pct = prog !== null && prog !== undefined ? Math.min(prog / goal * 100, 100) : 0;
          const achieved = prog !== null && prog !== undefined && prog >= goal;
          const isWeight = def.key === "weightGoal";
          const weightOk = isWeight && prog !== null && prog <= goal;

          return (
            <div key={def.key} style={{ background:T.card, border:`1.5px solid ${achieved||weightOk ? def.color+"55" : T.bdr}`, borderRadius:16, padding:16, transition:"all 0.3s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:editing?10:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:20 }}>{def.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:T.ink }}>{def.label}</div>
                    <div style={{ fontSize:11, color:T.dim }}>{def.desc}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:18, fontWeight:900, color: achieved||weightOk ? T.grn : def.color, fontFamily:BC }}>
                    {isWeight ? `${goal} lbs` : `${goal} ${def.unit}`}
                  </div>
                  {achieved||weightOk ? <div style={{ fontSize:11, color:T.grn, fontWeight:700 }}>✓ On track</div> : null}
                </div>
              </div>

              {/* Progress bar (not for weight) */}
              {!isWeight && prog !== null && prog !== undefined && (
                <div style={{ marginBottom: editing ? 10 : 0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11, color:T.dim }}>Progress</span>
                    <span style={{ fontSize:11, fontWeight:700, color:def.color }}>{prog} / {goal} {def.unit}</span>
                  </div>
                  <div style={{ height:6, background:T.bdr, borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:def.color, borderRadius:3, transition:"width 0.6s" }}/>
                  </div>
                </div>
              )}

              {/* Weight progress */}
              {isWeight && prog !== null && (
                <div style={{ fontSize:12, color: weightOk ? T.grn : T.mid, fontWeight:600, marginBottom: editing ? 10 : 0 }}>
                  Current: {prog} lbs {weightOk ? "✓" : `(${(prog - goal).toFixed(1)} above target)`}
                </div>
              )}

              {/* Editor */}
              {editing && (
                <div>
                  <input type="range" min={def.min} max={def.max} step={def.step}
                    value={goals[def.key] || def.min}
                    onChange={e => setGoals({...goals, [def.key]: parseFloat(e.target.value)})}
                    style={{ width:"100%", accentColor: def.color }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:T.fnt }}>
                    <span>{def.min} {def.unit}</span>
                    <span style={{ color:def.color, fontWeight:800 }}>{goals[def.key]} {def.unit}</span>
                    <span>{def.max} {def.unit}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <button onClick={handleSave} style={{ width:"100%", padding:"16px", border:"none", borderRadius:14, background:T.gold, color:T.ink, fontWeight:900, fontSize:16, cursor:"pointer", fontFamily:BC, letterSpacing:"1px", textTransform:"uppercase", boxShadow:`0 2px 12px ${T.gold}40` }}>
          {saved ? "UPDATE GOALS" : "SET THIS WEEK'S GOALS"}
        </button>
      )}
    </div>
  );
}
