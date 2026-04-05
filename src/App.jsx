import { useState, useCallback } from "react";
import FuelTab from "./FuelTab.jsx";
const T = {
  bg:"#f5f4f0", sur:"#ffffff", card:"#ffffff", bdr:"#e0ddd6", bdrDk:"#c8c4bb",
  ink:"#1a1814", mid:"#4a4740", dim:"#8a877e", fnt:"#c0bdb5",
  gold:"#b8860b", gBg:"#fef9ec", gBdr:"#f0d060",
  grn:"#1a7a44",  gnBg:"#edf7f2", gnBdr:"#6fcf97",
  blu:"#1a5fa8",  blBg:"#edf4fc", blBdr:"#90c4f0",
  pur:"#5a3fa8",  puBg:"#f2eefa", puBdr:"#b39df0",
  org:"#c45000",  ogBg:"#fef3ec", ogBdr:"#f0a060",
  red:"#c02020",  rdBg:"#fff0f0", rdBdr:"#f09090",
};
const KEY = "fnd_v5";
const BC="'Barlow Condensed',sans-serif",BW="'Barlow','Helvetica Neue',sans-serif",GS="Georgia,serif";
const GOAL = 151, START = 196;
const PROG = {
  Monday:    { label:"PUSH",       color:T.org, bg:T.ogBg, bdr:T.ogBdr, icon:"🔺",
    focus:"Chest · Shoulders · Triceps",
    duration:"45–50 min",
    warmup:[
      {name:"Arm Circles",        dur:"30s each direction", note:"Loosen shoulder joint"},
      {name:"Band Pull-Aparts",   dur:"15 reps",            note:"Activate rear delts before pressing"},
      {name:"Wall Slides",        dur:"10 reps",            note:"Scapular mobility"},
      {name:"Light Chest Press",  dur:"15 reps @ 50% weight",note:"Prime pec/delt pattern"},
    ],
    ex:[
      {n:"Dumbbell Chest Press",     s:3,r:12,w:15},
      {n:"Dumbbell Shoulder Press",  s:3,r:12,w:10},
      {n:"Incline Dumbbell Press",   s:3,r:12,w:12},
      {n:"Lateral Raises",           s:3,r:15,w:8 },
      {n:"Tricep Pushdown (Cable)",  s:3,r:12,w:20},
    ]},
  Wednesday: { label:"PULL",       color:T.blu, bg:T.blBg, bdr:T.blBdr, icon:"🔻",
    focus:"Back · Biceps · Rear Delts",
    duration:"45–50 min",
    warmup:[
      {name:"Cat-Cow",               dur:"10 reps",            note:"Mobilize thoracic spine"},
      {name:"Band Pull-Aparts",      dur:"15 reps",            note:"Activate rhomboids"},
      {name:"Scapular Retractions",  dur:"10 reps",            note:"Prime the pulling muscles"},
      {name:"Light Lat Pulldown",    dur:"15 reps @ 50% weight",note:"Groove the lat path"},
    ],
    ex:[
      {n:"Seated Cable Row",          s:3,r:12,w:40},
      {n:"Lat Pulldown",              s:3,r:12,w:45},
      {n:"Dumbbell Row (each side)",  s:3,r:12,w:20},
      {n:"Face Pulls",                s:3,r:15,w:25},
      {n:"Dumbbell Bicep Curl",       s:3,r:12,w:12},
    ]},
  Friday:    { label:"LEGS+CORE",  color:T.grn, bg:T.gnBg, bdr:T.gnBdr, icon:"⬆️",
    focus:"Quads · Glutes · Hamstrings · Core",
    duration:"50–55 min",
    warmup:[
      {name:"Glute Bridges",         dur:"15 reps",            note:"Wake up glutes before squatting"},
      {name:"Bodyweight Squat",      dur:"10 reps",            note:"Groove squat pattern"},
      {name:"Hip Flexor Stretch",    dur:"30s each side",      note:"Open hips for deep squat depth"},
      {name:"Lateral Band Walk",     dur:"10 steps each way",  note:"Activate abductors"},
    ],
    ex:[
      {n:"Goblet Squat",             s:3,r:12,w:25},
      {n:"Romanian Deadlift",        s:3,r:12,w:30},
      {n:"Leg Press",                s:3,r:12,w:90},
      {n:"Hip Thrust",               s:3,r:15,w:25},
      {n:"Dead Bug (bodyweight)",    s:3,r:10,w:0 },
    ]},
  Saturday:  { label:"FULL BODY",  color:T.pur, bg:T.puBg, bdr:T.puBdr, icon:"⭐",
    focus:"Compound Movements · Power · Stability",
    duration:"50–55 min",
    warmup:[
      {name:"World's Greatest Stretch", dur:"5 reps each side", note:"Full body mobility in one move"},
      {name:"Bodyweight Squat",         dur:"10 reps",          note:"Prime lower body"},
      {name:"Arm Circles + Shoulder Rolls", dur:"30s",          note:"Open upper body"},
      {name:"Dead Bug",                 dur:"8 reps",           note:"Activate deep core before loading"},
    ],
    ex:[
      {n:"Dumbbell Deadlift",        s:3,r:10,w:30},
      {n:"Dumbbell Chest Press",     s:3,r:10,w:15},
      {n:"Dumbbell Reverse Lunge",   s:3,r:10,w:15},
      {n:"Dumbbell Row (each side)", s:3,r:10,w:20},
      {n:"Overhead Press",           s:3,r:10,w:10},
      {n:"Plank Hold",               s:3,r:30,w:0 },
    ]},
};
const MEALS = [
  {id:"breakfast", label:"Breakfast",       icon:"🌅", cal:400, pro:25, fib:8 },
  {id:"snack1",    label:"Morning Snack",   icon:"🥜", cal:200, pro:15, fib:5 },
  {id:"lunch",     label:"Lunch",           icon:"🥗", cal:500, pro:30, fib:10},
  {id:"snack2",    label:"Afternoon Snack", icon:"🍎", cal:200, pro:15, fib:5 },
  {id:"dinner",    label:"Dinner",          icon:"🍽️", cal:550, pro:35, fib:10},
];
const MOVES = [
  {id:"walk",    label:"Walk",            icon:"🚶‍♀️"},
  {id:"tmil",    label:"Treadmill Break", icon:"🏃‍♀️"},
  {id:"bike",    label:"Bike/Elliptical", icon:"🚴‍♀️"},
  {id:"yoga",    label:"Yoga",            icon:"🧘‍♀️"},
  {id:"pilates", label:"Pilates",         icon:"💫"},
  {id:"class",   label:"Fitness Class",   icon:"🏋️‍♀️"},
  {id:"stairs",  label:"Stair Stepper",   icon:"🪜"},
  {id:"other",   label:"Other",           icon:"✨"},
];
const tod = () => new Date().toISOString().split("T")[0];
const dn  = (ds) => { const d = ds ? new Date(ds+"T12:00:00") : new Date(); return d.toLocaleDateString("en-US",{weekday:"long"}); };
const ld  = () => { try { return JSON.parse(localStorage.getItem(KEY)||"{}"); } catch { return {}; } };
const sd  = d  => { try { localStorage.setItem(KEY,JSON.stringify(d)); } catch {} };
function initDay(data, date) {
  if (!data[date]) data[date] = { ci:{}, meals:{}, cardio:[], lift:{ex:{},session:null}, watch:{}, sober:null, notes:"" };
  return data[date];
}
function buildContext(all) {
  const today = tod();
  const day = all[today] || {};
  const ci = day.ci || {};
  const meals = day.meals || {};
  const loggedMeals = MEALS.filter(m => meals[m.id]?.logged);
  const cal  = loggedMeals.reduce((a,m) => a+m.cal, 0);
  const pro  = loggedMeals.reduce((a,m) => a+m.pro, 0);
  const fib  = loggedMeals.reduce((a,m) => a+m.fib, 0);
  const cardioMin = (day.cardio||[]).reduce((a,e) => a+parseInt(e.dur||0), 0);
  const liftSets  = Object.values(day.lift?.ex||{}).reduce((a,ex) => a+(ex.sets?.filter(s=>s.done).length||0), 0);
  const watchData = day.watch || {};
  let streak = 0;
  for (const d of Object.keys(all).sort().reverse()) {
    if (all[d]?.sober === true) streak++;
    else if (all[d]?.sober === false) break;
    else if (d < today) break;
  }
  const weights = Object.keys(all).sort().map(d => parseFloat(all[d]?.ci?.weight)).filter(Boolean);
  const curWeight = weights.length > 0 ? weights[weights.length-1] : START;
  const lostLbs   = (START - curWeight).toFixed(1);
  const now = new Date();
  const dow = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - (dow===0?6:dow-1));
  const weekDates = Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d.toISOString().split("T")[0]; });
  const weekSets   = weekDates.reduce((a,d) => a+Object.values(all[d]?.lift?.ex||{}).reduce((b,ex)=>b+(ex.sets?.filter(s=>s.done).length||0),0), 0);
  const weekCardio = weekDates.reduce((a,d) => a+(all[d]?.cardio||[]).reduce((b,e)=>b+parseInt(e.dur||0),0), 0);
  const soberDaysWeek = weekDates.filter(d => all[d]?.sober===true).length;
  const totalSober = Object.keys(all).filter(d => all[d]?.sober===true).length;
  const liftHistory = Object.keys(all).sort().slice(-14).map(d => {
    const liftDay = all[d]?.lift;
    if (!liftDay?.session || !liftDay?.ex) return null;
    const prog = PROG[liftDay.session];
    if (!prog) return null;
    const doneSets = Object.entries(liftDay.ex).map(([name,ex]) => {
      const done = (ex.sets||[]).filter(s=>s.done);
      if (!done.length) return null;
      return `${name}: ${done.map(s=>`${s.w}lbs×${s.r}`).join(",")}`;
    }).filter(Boolean).join("; ");
    return `${d} ${prog.label}: ${doneSets}`;
  }).filter(Boolean).join(" | ");
  return {
    today: dn(),
    sleep: ci.sleep ? `${ci.sleep}/5` : "not logged",
    energy: ci.energy ? `${ci.energy}/5` : "not logged",
    weight: ci.weight ? `${ci.weight}lbs` : "not logged",
    goalWeight: `${GOAL}lbs`,
    lostLbs,
    cal, pro, fib,
    cardioMin,
    liftSets,
    soberStreak: streak,
    totalSober,
    soberToday: day.sober,
    weekSets,
    weekCardio,
    soberDaysWeek,
    watchData,
    liftHistory,
    notes: day.notes || "",
    mealsLogged: loggedMeals.map(m => meals[m.id]?.note ? `${m.label}(${meals[m.id].note})` : m.label).join(", ") || "none",
    snacksSkipped: !meals.snack1?.logged && !meals.snack2?.logged && loggedMeals.length >= 2,
    scheduledSession: PROG[dn()]?.label || "none",
    chosenSession: day.lift?.session ? (PROG[day.lift.session]?.label || "none") : "none",
  };
}
async function ai(systemAddendum, userPrompt) {
  try {
    const res = await fetch("/.netlify/functions/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Rebecca's coach. 45F 5'10" 196lb goal 151lb. Sober (core identity+health strategy). Lexapro (appetite suppression, 2pm crash — eat on schedule not hunger). Suppressed cycle BC (consistent hormones = training advantage). VO2 19.6→23.5 target 28+. Push/Pull/Legs + any-day flexibility. 1800-2000cal 115-125g protein 30-35g fiber plant-forward. Skips snacks→dinner blowup. Apple Watch user. Direct warm evidence-based mechanism-specific coaching. 3-5 sentences. ${systemAddendum||""}`,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "Coach unavailable right now.";
  } catch {
    return "Could not reach coach — check your connection.";
  }
}
function Bubble({ msg, type = "info", loading }) {
  const map = {
    info:    { bg:T.blBg,  bdr:T.blBdr,  l:T.blu  },
    success: { bg:T.gnBg,  bdr:T.gnBdr,  l:T.grn  },
    warn:    { bg:T.gBg,   bdr:T.gBdr,   l:T.gold },
    push:    { bg:T.puBg,  bdr:T.puBdr,  l:T.pur  },
    alert:   { bg:T.rdBg,  bdr:T.rdBdr,  l:T.red  },
  };
  const s = map[type] || map.info;
  return (
    <div style={{ background:s.bg, border:`1.5px solid ${s.bdr}`, borderLeft:`4px solid ${s.l}`, borderRadius:"0 14px 14px 14px", padding:"15px 17px" }}>
      {loading
        ? <p style={{ margin:0, fontSize:15, color:T.dim, fontStyle:"italic" }}>Coach is thinking<span style={{animation:"blink 1.2s infinite"}}>…</span></p>
        : <p style={{ margin:0, fontSize:15, color:T.ink, fontFamily:GS, fontStyle:"italic", lineHeight:1.75 }}>{msg}</p>
      }
    </div>
  );
}
function AIBlock({ label, prompt, context, addendum, type = "push", color = T.pur, btnColor }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  async function ask() {
    setLoading(true);
    const full = context ? `CURRENT DATA:\n${Object.entries(context).map(([k,v])=>`${k}: ${v}`).join("\n")}\n\n${prompt}` : prompt;
    const m = await ai(addendum || "", full);
    setMsg(m);
    setLoading(false);
  }
  return (
    <div style={{ background: msg ? T.puBg : T.card, border:`1.5px solid ${msg ? T.puBdr : T.bdr}`, borderRadius:20, padding:20, marginBottom:16 }}>
      <span style={{ display:"block", fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.8px", textTransform:"uppercase", fontFamily:BC, marginBottom:12 }}>
        {label}
      </span>
      {msg
        ? <><Bubble msg={msg} type={type}/><button onClick={ask} style={{ marginTop:10, background:"none", border:"none", color:T.dim, fontSize:13, cursor:"pointer", textDecoration:"underline" }}>Refresh</button></>
        : loading
          ? <Bubble msg="" type={type} loading />
          : <div style={{ textAlign:"center", padding:"6px 0 12px" }}>
              <button onClick={ask} style={{ padding:"15px 28px", border:"none", borderRadius:12, background:btnColor||color, color: (btnColor||color)===T.gold?T.ink:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", fontFamily:BC, letterSpacing:"0.8px", textTransform:"uppercase", boxShadow:`0 2px 8px ${btnColor||color}40` }}>
                Ask Coach
              </button>
            </div>
      }
    </div>
  );
}
function Ring({ v, max, size=72, stroke=7, color=T.gold, colorBg, label, sub }) {
  const r=(size-stroke*2)/2, circ=2*Math.PI*r;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colorBg||T.bdr} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ*(1-Math.min(v/max,1))}
          strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.7s" }}/>
      </svg>
      {label && <span style={{ fontSize:13, fontWeight:700, color:T.mid }}>{label}</span>}
      {sub   && <span style={{ fontSize:12, color:T.dim }}>{sub}</span>}
    </div>
  );
}
function Card({ children, bg, bdr, pad=20 }) {
  return <div style={{ background:bg||T.card, border:`1.5px solid ${bdr||T.bdr}`, borderRadius:20, padding:pad, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>{children}</div>;
}
function SLabel({ children }) {
  return <span style={{ display:"block", fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.8px", textTransform:"uppercase", fontFamily:BC, marginBottom:12 }}>{children}</span>;
}
function Chip({ children, c, bg, bdr }) {
  return <span style={{ display:"inline-block", padding:"5px 13px", background:bg, border:`1.5px solid ${bdr}`, borderRadius:20, fontSize:13, fontWeight:800, color:c, fontFamily:BC }}>{children}</span>;
}
function Bar({ v, max, c, bg }) {
  return <div style={{ height:7, background:bg||T.bdr, borderRadius:4, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min(v/max*100,100)}%`, background:c, borderRadius:4, transition:"width 0.6s" }}/></div>;
}
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", background:T.sur, borderRadius:20, padding:5, marginBottom:24, gap:3, border:`1.5px solid ${T.bdr}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
      {tabs.map(t => {
        const on = active===t.id;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 2px", border:"none", borderRadius:15, background:on?T.bg:"transparent", cursor:"pointer", transition:"all 0.2s" }}>
            <span style={{ fontSize:22, lineHeight:1 }}>{t.icon}</span>
            <span style={{ fontSize:11, fontWeight:on?800:500, color:on?T.ink:T.mid, marginTop:4, fontFamily:BC, textTransform:"uppercase" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
function TodayTab({ day, upd, ctx }) {
  const ci = day.ci || {};
  const prog = PROG[dn()];
  const lg = MEALS.filter(m => (day.meals||{})[m.id]?.logged);
  const cal = lg.reduce((a,m)=>a+m.cal,0), pro = lg.reduce((a,m)=>a+m.pro,0);
  const min = (day.cardio||[]).reduce((a,e)=>a+parseInt(e.dur||0),0);
  const sets = Object.values(day.lift?.ex||{}).reduce((a,ex)=>a+(ex.sets?.filter(s=>s.done).length||0),0);
  const EE=["💀","😴","😐","⚡","🔥"], SE=["💩","😞","😐","😊","🌟"];
  const todayPrompt = `Real-time body insight based on today's data. Tell her:
1. What's happening in her body RIGHT NOW from sleep (${ctx.sleep}), energy (${ctx.energy}), food (${ctx.mealsLogged}, ${cal}cal, ${pro}g protein)
2. Physiological changes from ${ctx.liftSets} strength sets and ${ctx.cardioMin}min movement
3. What to do in the next few hours to optimize today
Be specific: hormones, neurotransmitters, protein synthesis, fat oxidation.`;
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:24, fontWeight:900, color:T.ink, fontFamily:BC }}>
          {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </div>
        <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
          {prog ? <Chip c={prog.color} bg={prog.bg} bdr={prog.bdr}>{prog.icon} {prog.label} Day</Chip>
                : dn()==="Tuesday"||dn()==="Thursday" ? <Chip c={T.blu} bg={T.blBg} bdr={T.blBdr}>🚴 Zone 2 Cardio Day</Chip>
                : dn()==="Sunday" ? <Chip c={T.dim} bg={T.bg} bdr={T.bdr}>🛌 Rest Day</Chip>
                : <Chip c={T.blu} bg={T.blBg} bdr={T.blBdr}>🌿 Active Recovery</Chip>}
          {ctx.soberStreak>0 && <Chip c={T.grn} bg={T.gnBg} bdr={T.gnBdr}>🌟 {ctx.soberStreak} Day{ctx.soberStreak!==1?"s":""} Sober</Chip>}
          {ci.weight && <Chip c={T.pur} bg={T.puBg} bdr={T.puBdr}>⚖️ {ci.weight} lbs</Chip>}
        </div>
      </div>
      <Card>
        <SLabel>Morning Check-In</SLabel>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:15, color:T.mid, marginBottom:8, fontWeight:600 }}>Sleep quality</div>
          <div style={{ display:"flex", gap:8 }}>
            {SE.map((e,i) => <button key={i} onClick={()=>upd("ci",{...ci,sleep:i+1})} style={{ flex:1, padding:"11px 2px", border:`2px solid ${ci.sleep===i+1?T.blu:T.bdr}`, borderRadius:12, background:ci.sleep===i+1?T.blBg:T.bg, fontSize:22, cursor:"pointer", transition:"all 0.15s" }}>{e}</button>)}
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:15, color:T.mid, marginBottom:8, fontWeight:600 }}>Energy level</div>
          <div style={{ display:"flex", gap:8 }}>
            {EE.map((e,i) => <button key={i} onClick={()=>upd("ci",{...ci,energy:i+1})} style={{ flex:1, padding:"11px 2px", border:`2px solid ${ci.energy===i+1?T.gold:T.bdr}`, borderRadius:12, background:ci.energy===i+1?T.gBg:T.bg, fontSize:22, cursor:"pointer", transition:"all 0.15s" }}>{e}</button>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:15, color:T.mid, marginBottom:8, fontWeight:600 }}>Morning weight <span style={{ color:T.fnt, fontWeight:400 }}>(optional)</span></div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <input type="number" step="0.1" placeholder="lbs" value={ci.weight||""} onChange={e=>upd("ci",{...ci,weight:e.target.value})}
              style={{ width:100, padding:"12px 16px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.ink, fontSize:18, fontFamily:"inherit", outline:"none", fontWeight:700 }}
            />
            {ci.weight && <span style={{ fontSize:15, color:T.grn, fontWeight:700 }}>↓ {Math.max(0,parseFloat(ci.weight)-GOAL).toFixed(1)} to goal</span>}
          </div>
        </div>
      </Card>
      <Card>
        <SLabel>Today at a Glance</SLabel>
        <div style={{ display:"flex", justifyContent:"space-around" }}>
          <Ring v={min}  max={30}   color={T.grn}  colorBg={T.gnBg} label="Move"    sub={`${min}/30m`}  />
          <Ring v={sets} max={15}   color={prog?.color||T.fnt} colorBg={prog?.bg||T.bdr} label="Lift" sub={`${sets}/15`} />
          <Ring v={cal}  max={2000} color={T.gold} colorBg={T.gBg}  label="Cals"    sub={`${cal}/2k`}   />
          <Ring v={pro}  max={120}  color={T.pur}  colorBg={T.puBg} label="Protein" sub={`${pro}/120g`} />
        </div>
      </Card>
      <AIBlock
        label="🔬 What's Happening Now"
        prompt={todayPrompt}
        context={ctx}
        type="push"
        color={T.gold}
        btnColor={T.gold}
      />
      {/* Daily Directive */}
      <Card bg={T.gBg} bdr={T.gBdr}>
        <SLabel>📋 Today's Directive</SLabel>
        {(()=>{
          const plan={
            Monday:    {type:"strength",label:"PUSH Day",    color:T.org, directive:"Warm up 5 min → 5 exercises × 3 sets · ~45 min total. Focus: chest, shoulders, triceps. Progressive overload — beat last week's weights.",              cardio:""},
            Tuesday:   {type:"cardio",  label:"Zone 2 Day",  color:T.blu, directive:"35 min Zone 2 cardio — walk, bike, or elliptical at conversational pace. This is your VO2 max session. Optional: add Pilates class for core + mobility.", cardio:"Zone 2 · 35 min"},
            Wednesday: {type:"strength",label:"PULL Day",    color:T.blu, directive:"Warm up 5 min → 5 exercises × 3 sets · ~45 min total. Focus: back, biceps, rear delts. Pull with your elbows, not your hands.",                          cardio:""},
            Thursday:  {type:"cardio",  label:"Zone 2 Day",  color:T.grn, directive:"35 min Zone 2 at 2pm to break the Lexapro energy cliff. Walk or bike at a pace where you can hold a conversation. This resets cortisol and focus.",       cardio:"Zone 2 · 35 min"},
            Friday:    {type:"strength",label:"LEGS+CORE Day",color:T.grn, directive:"Warm up 5 min → 5 exercises × 3 sets · ~50 min total. Focus: quads, glutes, hamstrings, deep core. Biggest muscle groups = biggest metabolic impact.",    cardio:""},
            Saturday:  {type:"strength",label:"FULL BODY Day",color:T.pur, directive:"Warm up 5 min → 6 compound exercises × 3 sets · ~50 min total. Lower volume, full body stimulus. Builds work capacity and movement quality.",              cardio:""},
            Sunday:    {type:"rest",    label:"Rest Day",    color:T.dim, directive:"Complete rest or a gentle walk under 30 min. This is mandatory — muscle adaptation happens during recovery, not during training. Protect this day.",          cardio:""},
          };
          const today=plan[dn()];
          if(!today) return null;
          return (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ padding:"4px 12px", background:today.type==="strength"?T.ogBg:today.type==="cardio"?T.blBg:T.bg, border:`1.5px solid ${today.type==="strength"?T.ogBdr:today.type==="cardio"?T.blBdr:T.bdr}`, borderRadius:20, fontSize:13, fontWeight:800, color:today.color, fontFamily:BC }}>{today.label}</span>
              </div>
              <p style={{ margin:0, fontSize:14, color:T.mid, lineHeight:1.75, fontWeight:500 }}>{today.directive}</p>
            </div>
          );
        })()}
      </Card>

      <Card>
        <SLabel>Notes</SLabel>
        <textarea value={day.notes||""} onChange={e=>upd("notes",e.target.value)}
          placeholder="How are you feeling? Anything notable..."
          style={{ width:"100%", minHeight:80, padding:"13px 16px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:14, color:T.ink, fontSize:15, fontFamily:"inherit", resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.6 }}
        />
      </Card>
    </div>
  );
}
function LiftTab({ day, upd, all, ctx }) {
  const lift = day.lift || { ex:{}, session:null };
  const scheduledKey = Object.keys(PROG).find(k => k === dn()) || null;
  const activeKey = lift.session || scheduledKey;
  const prog = activeKey ? PROG[activeKey] : null;
  function selectSession(key) { upd("lift", {...lift, session:key, ex:{}}); }
  function getPrev(name) {
    for (const d of Object.keys(all).sort().reverse()) {
      if (d===tod()) continue;
      if (all[d]?.lift?.ex?.[name]?.sets?.some(s=>s.done)) return all[d].lift.ex[name];
    }
    return null;
  }
  function updSet(name,i,field,val) {
    const u = {...lift, ex:{...lift.ex}};
    if (!u.ex[name]) u.ex[name]={sets:[]};
    while (u.ex[name].sets.length<=i) u.ex[name].sets.push({w:"",r:"",done:false});
    u.ex[name].sets[i] = {...u.ex[name].sets[i],[field]:val};
    upd("lift",u);
  }
  function tog(name,i) {
    const u = {...lift, ex:{...lift.ex}};
    if (!u.ex[name]) u.ex[name]={sets:[]};
    while (u.ex[name].sets.length<=i) u.ex[name].sets.push({w:"",r:"",done:false});
    u.ex[name].sets[i] = {...u.ex[name].sets[i], done:!u.ex[name].sets[i].done};
    upd("lift",u);
  }
  const done  = prog ? prog.ex.reduce((a,ex)=>a+(lift.ex?.[ex.n]?.sets?.filter(s=>s.done).length||0),0) : 0;
  const total = prog ? prog.ex.length*3 : 0;
  const liftSummary = prog ? prog.ex.map(ex => {
    const sets = (lift.ex?.[ex.n]?.sets||[]).filter(s=>s.done);
    return `${ex.n}: ${sets.length>0 ? sets.map(s=>`${s.w||"?"}lbs×${s.r||"?"}`).join(",") : "not started"}`;
  }).join(" | ") : "";
  const liftPrompt = `Rebecca just completed (or is mid-way through) her ${prog?.label} session (${prog?.focus}).
Session data: ${liftSummary}
Previous 2 weeks of training: ${ctx.liftHistory || "no history yet"}
Sleep last night: ${ctx.sleep} Energy: ${ctx.energy} Protein today: ${ctx.pro}g
Tell her:
1. What's happening in her muscles RIGHT NOW — muscle damage, protein synthesis signaling, adaptation physiology
2. Progressive overload recommendation per exercise based on logged numbers
3. What she'll feel tomorrow and why (DOMS timeline)
4. One recovery action in the next 60 minutes`;
  return (
    <div>
      <Card>
        <SLabel>Choose Your Session</SLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {Object.entries(PROG).map(([key,p]) => {
            const on = activeKey===key;
            const sched = key===scheduledKey;
            return (
              <button key={key} onClick={()=>selectSession(key)} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:on?p.bg:T.bg, border:`2px solid ${on?p.bdr:T.bdr}`, borderRadius:16, cursor:"pointer", textAlign:"left" }}>
                <span style={{ fontSize:28 }}>{p.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18, fontWeight:900, color:on?p.color:T.ink, fontFamily:BC }}>{p.label}</span>
                    {sched && <span style={{ fontSize:11, fontWeight:800, color:p.color, background:p.bg, border:`1.5px solid ${p.bdr}`, borderRadius:20, padding:"2px 8px", fontFamily:BC }}>SCHEDULED</span>}
                  </div>
                  <div style={{ fontSize:13, color:T.mid, marginTop:2 }}>{p.focus}</div>
                </div>
                {on && <span style={{ fontSize:20, color:p.color }}>✓</span>}
              </button>
            );
          })}
        </div>
      </Card>
      {prog && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <div style={{ fontSize:30, fontWeight:900, color:prog.color, fontFamily:BC }}>{prog.icon} {prog.label}</div>
              <div style={{ fontSize:15, color:T.mid, marginTop:2, fontWeight:600 }}>{prog.focus}</div>
              {prog.duration && <div style={{ fontSize:12, color:T.gold, marginTop:4, fontWeight:700 }}>⏱ {prog.duration}</div>}
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:30, fontWeight:900, color:done===total?T.grn:T.ink }}>{done}<span style={{ fontSize:18, color:T.dim, fontWeight:400 }}>/{total}</span></div>
              <div style={{ fontSize:12, color:T.dim, textTransform:"uppercase", fontFamily:BC }}>sets done</div>
            </div>
          </div>
          <div style={{ height:8, background:T.bdr, borderRadius:4, marginBottom:20, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${total>0?(done/total)*100:0}%`, background:`linear-gradient(90deg,${prog.color},${T.grn})`, borderRadius:4, transition:"width 0.5s" }}/>
          </div>

          {/* WARMUP */}
          {prog.warmup && (
            <div style={{ background:T.gBg, border:`1.5px solid ${T.gBdr}`, borderRadius:14, padding:16, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:800, color:T.gold, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:BC }}>🔥 Warmup · ~5 min</span>
                <span style={{ fontSize:12, color:T.dim }}>Complete before lifting</span>
              </div>
              {prog.warmup.map((w,wi) => (
                <div key={wi} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom:wi<prog.warmup.length-1?10:0, marginBottom:wi<prog.warmup.length-1?10:0, borderBottom:wi<prog.warmup.length-1?`1px solid ${T.bdr}`:"none" }}>
                  <span style={{ fontSize:14, fontWeight:900, color:T.gold, fontFamily:BC, minWidth:18 }}>{wi+1}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:T.ink }}>{w.name} <span style={{ color:T.gold, fontWeight:800, fontSize:14 }}>· {w.dur}</span></div>
                    <div style={{ fontSize:12, color:T.dim, marginTop:3 }}>{w.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {prog.ex.map(ex => {
            const prev = getPrev(ex.n);
            const sets = lift.ex?.[ex.n]?.sets||[];
            const allDone = sets.length>=3 && sets.filter(s=>s.done).length>=3;
            let hint = `Start ~${ex.w>0?ex.w+"lbs":"bodyweight"}`;
            if (prev?.sets?.length>=3) {
              const pd = prev.sets.filter(s=>s.done);
              if (pd.length>0) {
                const w=parseFloat(pd[0].w), r=parseInt(pd[0].r);
                hint = pd.length>=3&&r>=ex.r ? `🔺 Try ${w+(w<=15?2.5:5)}lbs — hit ${w}lbs×${r} last session` : `Last: ${w}lbs×${r}`;
              }
            }
            return (
              <div key={ex.n} style={{ background:allDone?T.gnBg:T.card, border:`1.5px solid ${allDone?T.gnBdr:T.bdr}`, borderRadius:18, padding:18, marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ fontSize:17, fontWeight:800, color:allDone?T.grn:T.ink }}>{ex.n}{allDone?" ✓":""}</div>
                  <div style={{ fontSize:14, color:T.mid, fontFamily:BC, fontWeight:700 }}>{ex.s}×{ex.r}</div>
                </div>
                <div style={{ fontSize:13, color:T.dim, marginBottom:14 }}>{hint}</div>
                <div style={{ display:"flex", gap:10 }}>
                  {[0,1,2].map(i => {
                    const s = sets[i]||{};
                    return (
                      <div key={i} style={{ flex:1, background:s.done?T.gnBg:T.bg, border:`1.5px solid ${s.done?T.gnBdr:T.bdr}`, borderRadius:14, padding:"10px 8px", display:"flex", flexDirection:"column", gap:8 }}>
                        <div style={{ fontSize:11, color:T.dim, textAlign:"center", textTransform:"uppercase", fontFamily:BC, fontWeight:700 }}>SET {i+1}</div>
                        <input type="number" placeholder="lbs" value={s.w||""} onChange={e=>updSet(ex.n,i,"w",e.target.value)}
                          style={{ width:"100%", background:"transparent", border:"none", borderBottom:`2px solid ${T.bdr}`, color:T.ink, fontSize:17, padding:"4px 0 6px", fontFamily:"inherit", outline:"none", textAlign:"center", fontWeight:800 }}/>
                        <input type="number" placeholder="reps" value={s.r||""} onChange={e=>updSet(ex.n,i,"r",e.target.value)}
                          style={{ width:"100%", background:"transparent", border:"none", borderBottom:`2px solid ${T.bdr}`, color:T.ink, fontSize:17, padding:"4px 0 6px", fontFamily:"inherit", outline:"none", textAlign:"center", fontWeight:800 }}/>
                        <button onClick={()=>tog(ex.n,i)} style={{ width:"100%", padding:"11px 0", border:"none", borderRadius:10, background:s.done?T.grn:T.bdr, color:s.done?"#fff":T.mid, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:BC }}>
                          {s.done?"✓ DONE":"LOG"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <AIBlock
            label="🔬 Muscle Physiology"
            prompt={liftPrompt}
            context={ctx}
            addendum="Focus on muscle physiology: protein synthesis signaling, DOMS, adaptation. Reference logged weights."
            type="push"
            color={T.pur}
          />
        </div>
      )}
    </div>
  );
}
function MoveTab({ day, upd, ctx }) {
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState({ type:"", dur:"", notes:"" });
  const cardio = day.cardio||[];
  const total = cardio.reduce((a,e)=>a+parseInt(e.dur||0),0);
  function add() {
    if (!entry.type||!entry.dur) return;
    upd("cardio",[...cardio,{...entry,id:Date.now()}]);
    setEntry({type:"",dur:"",notes:""}); setOpen(false);
  }
  const movePrompt = `Rebecca has logged ${total} minutes of movement today: ${cardio.map(e=>`${MOVES.find(m=>m.id===e.type)?.label||e.type} ${e.dur}min${e.notes?` (${e.notes})`:""}`).join(", ")||"none yet"}.
Her VO2 max is 23.5 (improved from 19.6, target 28+). Weekly cardio so far: ${ctx.weekCardio} minutes.
Tell her:
1. What's happening to her cardiovascular system and mitochondria RIGHT NOW — zone 2 vs higher intensity adaptations
2. How today's movement moves her VO2 max needle specifically
3. What her body does overnight from today's cardio
4. Add more movement or protect recovery today?`;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:26, fontWeight:900, color:T.ink, fontFamily:BC }}>Movement</div>
          <div style={{ fontSize:15, color:T.mid, marginTop:2, fontWeight:600 }}>{total} min · goal: 30+ min</div>
        </div>
        <Ring v={total} max={30} size={72} color={total>=30?T.grn:T.gold} colorBg={total>=30?T.gnBg:T.gBg} label={total>=30?"✓ Done":`${total}m`}/>
      </div>
      {cardio.map(e => {
        const mt = MOVES.find(m=>m.id===e.type);
        return (
          <div key={e.id} style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:18, padding:"16px 18px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:28 }}>{mt?.icon||"🏃"}</span>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:T.ink }}>{mt?.label||e.type}</div>
                <div style={{ fontSize:14, color:T.mid, marginTop:2 }}>{e.dur} min{e.notes?` · ${e.notes}`:""}</div>
              </div>
            </div>
            <button onClick={()=>upd("cardio",cardio.filter(c=>c.id!==e.id))} style={{ background:"none", border:"none", color:T.fnt, fontSize:24, cursor:"pointer" }}>×</button>
          </div>
        );
      })}
      {open ? (
        <Card bg={T.gnBg} bdr={T.gnBdr}>
          <SLabel>Log Movement</SLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
            {MOVES.map(m => (
              <button key={m.id} onClick={()=>setEntry({...entry,type:m.id})} style={{ padding:"10px 14px", border:`2px solid ${entry.type===m.id?T.grn:T.bdr}`, borderRadius:12, background:entry.type===m.id?T.gnBg:T.bg, color:entry.type===m.id?T.grn:T.mid, fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:18 }}>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
          <input type="number" placeholder="Duration (minutes)" value={entry.dur} onChange={e=>setEntry({...entry,dur:e.target.value})}
            style={{ width:"100%", padding:"13px 16px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.ink, fontSize:16, fontFamily:"inherit", outline:"none", marginBottom:10, boxSizing:"border-box" }}/>
          <input placeholder="Notes (optional)" value={entry.notes} onChange={e=>setEntry({...entry,notes:e.target.value})}
            style={{ width:"100%", padding:"13px 16px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.ink, fontSize:16, fontFamily:"inherit", outline:"none", marginBottom:14, boxSizing:"border-box" }}/>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={add} style={{ flex:1, padding:"15px", border:"none", borderRadius:12, background:T.grn, color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:BC, letterSpacing:"0.8px" }}>LOG IT</button>
            <button onClick={()=>setOpen(false)} style={{ padding:"15px 20px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.mid, fontSize:15, cursor:"pointer" }}>Cancel</button>
          </div>
        </Card>
      ) : (
        <button onClick={()=>setOpen(true)} style={{ width:"100%", padding:"18px", background:"transparent", border:`2px dashed ${T.bdrDk}`, borderRadius:18, color:T.mid, fontSize:16, cursor:"pointer", marginBottom:16 }}>
          + Log Movement
        </button>
      )}
      <AIBlock
        label="🫀 Cardiovascular Adaptation"
        prompt={movePrompt}
        context={ctx}
        addendum="Detail mitochondrial and cardiovascular adaptations. Reference VO2 23.5 baseline and 28+ target."
        type="info"
        color={T.grn}
      />
    </div>
  );
}

function WatchTab({ day, upd, all, ctx }) {
  const w = day.watch||{};
  const dates = Object.keys(all).sort().slice(-14);
  const vo2H = dates.map(d=>({d,v:parseFloat(all[d]?.watch?.vo2)})).filter(x=>x.v&&!isNaN(x.v));
  const latV = vo2H.length>0 ? vo2H[vo2H.length-1].v : 23.5;
  const watchPrompt = `Apple Watch biometrics logged today:
VO2 max: ${w.vo2||latV} (baseline 19.6, current trend ${latV}, target 28+)
Resting Heart Rate: ${w.rhr||"not logged"} bpm
HRV: ${w.hrv||"not logged"} ms
Active Calories: ${w.cal||"not logged"}
Steps: ${w.steps||"not logged"}
Total Sleep: ${w.sleep||"not logged"} hours
Deep Sleep: ${w.deep||"not logged"} minutes
Training today: ${ctx.liftSets} strength sets, ${ctx.cardioMin} min cardio
Nutrition: ${ctx.cal}cal, ${ctx.pro}g protein
Sobriety streak: ${ctx.soberStreak} days
Tell her:
1. What these biometric numbers mean for HER body specifically today
2. What HRV and RHR trend says about recovery and adaptation
3. How deep sleep quality is affecting fat loss hormones (GH, cortisol, leptin, ghrelin)
4. Specific 30/60/90 day projection for these numbers based on her trajectory`;
  const fields = [
    {key:"vo2",   label:"VO₂ Max",          ph:"e.g. 23.5", unit:"ml/kg/min", c:T.blu,  note:"19.6→28+ target"},
    {key:"rhr",   label:"Resting HR",ph:"e.g. 68",   unit:"bpm",      c:T.grn,  note:"Lower = fitter"},
    {key:"hrv",   label:"HRV",              ph:"e.g. 42",   unit:"ms",       c:T.pur,  note:"Higher = recovered"},
    {key:"cal",   label:"Active Cal",  ph:"e.g. 380",  unit:"kcal",     c:T.org,  note:"Goal: 300–500"},
    {key:"steps", label:"Steps",            ph:"e.g. 8200", unit:"steps",    c:T.gold, note:"Goal: 8–10k"},
    {key:"sleep", label:"Sleep",      ph:"e.g. 7.2",  unit:"hrs",      c:T.blu,  note:"Target: 7–9"},
    {key:"deep",  label:"Deep Sleep",       ph:"e.g. 72",   unit:"min",      c:T.pur,  note:"Target: 60–90"},
  ];
  return (
    <div>
      <div style={{ fontSize:26, fontWeight:900, color:T.ink, fontFamily:BC, marginBottom:6 }}>⌚ Apple Watch</div>
      <div style={{ fontSize:15, color:T.mid, marginBottom:20 }}>Log today's biometrics from the Health app</div>
      <Card bg={T.blBg} bdr={T.blBdr}>
        <SLabel>VO₂ Max Journey</SLabel>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ textAlign:"center" }}><div style={{ fontSize:13, color:T.mid }}>Start</div><div style={{ fontSize:32, fontWeight:900, color:T.red, fontFamily:BC }}>19.6</div></div>
          <div style={{ flex:1, margin:"0 14px" }}><div style={{ height:6, background:T.bdr, borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min(((latV-19.6)/(35-19.6))*100,100)}%`, background:`linear-gradient(90deg,${T.red},${T.grn})`, borderRadius:3 }}/></div></div>
          <div style={{ textAlign:"center" }}><div style={{ fontSize:13, color:T.mid }}>Now</div><div style={{ fontSize:32, fontWeight:900, color:T.blu, fontFamily:BC }}>{latV}</div></div>
          <div style={{ textAlign:"center" }}><div style={{ fontSize:13, color:T.mid }}>Goal</div><div style={{ fontSize:32, fontWeight:900, color:T.grn, fontFamily:BC }}>28+</div></div>
        </div>
        <div style={{ fontSize:12, color:T.grn, textAlign:"center", fontWeight:700 }}>+{(latV-19.6).toFixed(1)} improvement · {((latV-19.6)/(28-19.6)*100).toFixed(0)}% to goal</div>
      </Card>
      {vo2H.length>=2 && (
        <Card>
          <SLabel>VO₂ Trend</SLabel>
          <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:60 }}>
            {vo2H.map((pt,i)=>{
              const vals=vo2H.map(x=>x.v), mn=Math.min(...vals), mx=Math.max(...vals);
              const h=mx===mn?44:((pt.v-mn)/(mx-mn))*44+12;
              const last=i===vo2H.length-1;
              return <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                <div style={{ fontSize:10, color:last?T.blu:T.fnt, fontWeight:last?800:400 }}>{pt.v}</div>
                <div style={{ width:"100%", height:h, background:last?T.blu:`${T.blu}55`, borderRadius:"2px 2px 0 0" }}/>
              </div>;
            })}
          </div>
        </Card>
      )}
      <Card>
        <SLabel>Today's Readings</SLabel>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontSize:15, color:T.ink, fontWeight:600 }}>{f.label}</div>
              <div style={{ fontSize:12, color:T.fnt }}>{f.note}</div>
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input type="number" step="0.1" placeholder={f.ph} value={w[f.key]||""}
                onChange={e=>upd("watch",{...w,[f.key]:e.target.value})}
                style={{ flex:1, padding:"13px 16px", background:T.bg, border:`2px solid ${w[f.key]?f.c+"66":T.bdr}`, borderRadius:12, color:w[f.key]?f.c:T.ink, fontSize:17, fontFamily:"inherit", outline:"none", fontWeight:w[f.key]?800:400 }}
              />
              <span style={{ fontSize:13, color:T.mid, minWidth:55 }}>{f.unit}</span>
            </div>
          </div>
        ))}
      </Card>
      <AIBlock
        label="📊 Biometric Analysis"
        prompt={watchPrompt}
        context={ctx}
        addendum="Interpret biometrics systemically. Connect HRV/RHR/sleep to specific adaptations. Give 30/60/90 day projections."
        type="info"
        color={T.blu}
      />
    </div>
  );
}
function SoberTab({ all, upd, day, ctx }) {
  const now = new Date();
  const year=now.getFullYear(), month=now.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const todayStr=tod();
  const totalSober=Object.keys(all).filter(d=>all[d]?.sober===true).length;
  const totalLogged=Object.keys(all).filter(d=>all[d]?.sober!==null&&all[d]?.sober!==undefined).length;
  const WDAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];
  const soberPrompt = `Sobriety status: ${ctx.soberStreak} day current streak. Total sober days logged: ${totalSober}. Today marked as: ${day.sober===true?"sober":day.sober===false?"had a drink":"not logged yet"}.
Training context: ${ctx.liftSets} strength sets this week, ${ctx.weekCardio} min cardio this week, VO2 max ${ctx.watchData?.vo2||23.5}.
Sleep last night: ${ctx.sleep}. HRV: ${ctx.watchData?.hrv||"not logged"}.
Tell her:
1. What's happening in her body RIGHT NOW from ${ctx.soberStreak} consecutive sober days — hormonal, neurological, metabolic changes
2. How sobriety is directly affecting her fitness metrics (VO2 max, muscle adaptation, fat loss)
3. What changes biologically at 7/30/90 days/1 year — things she'll feel and see on Apple Watch
4. Lexapro + sobriety neurochemical interaction
${day.sober===false?"5. After logging a drink: what specifically happens in the next 24-72 hours physiologically, and how to minimize the impact on training.":""}`;
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${T.gnBg},${T.sur})`, border:`1.5px solid ${T.gnBdr}`, borderRadius:20, padding:22, marginBottom:16, textAlign:"center" }}>
        <div style={{ fontSize:13, fontWeight:800, color:T.grn, letterSpacing:"2px", textTransform:"uppercase", fontFamily:BC, marginBottom:4 }}>Current Streak</div>
        <div style={{ fontSize:72, fontWeight:900, color:T.grn, fontFamily:BC, lineHeight:1 }}>{ctx.soberStreak}</div>
        <div style={{ fontSize:18, color:T.mid, fontWeight:600, marginTop:4 }}>day{ctx.soberStreak!==1?"s":""} alcohol-free</div>
        <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:16 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:900, color:T.ink, fontFamily:BC }}>{totalSober}</div>
            <div style={{ fontSize:12, color:T.dim, fontWeight:600 }}>Total Sober Days</div>
          </div>
          <div style={{ width:1, background:T.bdr }}/>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:900, color:T.ink, fontFamily:BC }}>{totalLogged>0?Math.round(totalSober/totalLogged*100):0}%</div>
            <div style={{ fontSize:12, color:T.dim, fontWeight:600 }}>Sober Rate</div>
          </div>
        </div>
      </div>
      <Card>
        <SLabel>Log Today</SLabel>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>upd("sober",true)} style={{ flex:1, padding:"16px", border:`2.5px solid ${day.sober===true?T.grn:T.bdr}`, borderRadius:14, background:day.sober===true?T.gnBg:T.bg, cursor:"pointer" }}>
            <div style={{ fontSize:28, marginBottom:6 }}>🌟</div>
            <div style={{ fontSize:16, fontWeight:800, color:day.sober===true?T.grn:T.mid, fontFamily:BC }}>ALCOHOL FREE</div>
            <div style={{ fontSize:12, color:T.dim, marginTop:3 }}>I stayed sober today</div>
          </button>
          <button onClick={()=>upd("sober",false)} style={{ flex:1, padding:"16px", border:`2.5px solid ${day.sober===false?T.red:T.bdr}`, borderRadius:14, background:day.sober===false?T.rdBg:T.bg, cursor:"pointer" }}>
            <div style={{ fontSize:28, marginBottom:6 }}>📝</div>
            <div style={{ fontSize:16, fontWeight:800, color:day.sober===false?T.red:T.mid, fontFamily:BC }}>HAD A DRINK</div>
            <div style={{ fontSize:12, color:T.dim, marginTop:3 }}>Logging without judgment</div>
          </button>
        </div>
      </Card>
      <Card>
        <SLabel>{now.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</SLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
          {WDAYS.map(w=><div key={w} style={{ textAlign:"center", fontSize:12, fontWeight:700, color:T.dim, fontFamily:BC, padding:"4px 0" }}>{w}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {Array.from({length:firstDay},(_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const dayNum=i+1;
            const ds=new Date(year,month,dayNum).toISOString().split("T")[0];
            const sv=all[ds]?.sober;
            const isToday=ds===todayStr, isFuture=ds>todayStr;
            let bg=T.bg,bdr=T.bdr,tc=T.dim,dot=null;
            if(sv===true){bg=T.gnBg;bdr=T.gnBdr;tc=T.grn;dot="🌟";}
            else if(sv===false){bg=T.rdBg;bdr=T.rdBdr;tc=T.red;dot="💧";}
            return <div key={dayNum} style={{ textAlign:"center", padding:"8px 2px", background:isToday?T.gBg:isFuture?T.bg:bg, border:`${isToday?"2.5":"1.5"}px solid ${isToday?T.gold:isFuture?T.bdr:bdr}`, borderRadius:10, opacity:isFuture?0.3:1 }}>
              <div style={{ fontSize:13, fontWeight:isToday?900:600, color:isToday?T.gold:isFuture?T.fnt:tc }}>{dayNum}</div>
              {dot&&!isFuture&&<div style={{ fontSize:10 }}>{dot}</div>}
            </div>;
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:12, justifyContent:"center" }}>
          {[{dot:"🌟",l:"Sober",c:T.grn},{dot:"💧",l:"Drink",c:T.red}].map(x=><div key={x.l} style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:12 }}>{x.dot}</span><span style={{ fontSize:12, color:x.c, fontWeight:600 }}>{x.l}</span></div>)}
        </div>
      </Card>
      <AIBlock
        label="🧠 Sobriety Physiology"
        prompt={soberPrompt}
        context={ctx}
        addendum="Detail sobriety neuroscience: GABA, dopamine, cortisol, HRV. Connect to fitness goals with timeline projections."
        type="success"
        color={T.grn}
      />
    </div>
  );
}
function WeekTab({ all, ctx }) {
  const now=new Date(), dow=now.getDay();
  const mon=new Date(now); mon.setDate(now.getDate()-(dow===0?6:dow-1));
  const wD=Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d.toISOString().split("T")[0]; });
  const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const FDYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const DAY_PLAN={
    Monday:    {type:"strength",label:"PUSH",      color:T.org,note:"Chest · Shoulders · Triceps · ~45 min"},
    Tuesday:   {type:"cardio",  label:"ZONE 2",    color:T.blu,note:"35 min walk/bike + optional Pilates"},
    Wednesday: {type:"strength",label:"PULL",      color:T.blu,note:"Back · Biceps · Rear Delts · ~45 min"},
    Thursday:  {type:"cardio",  label:"ZONE 2",    color:T.grn,note:"35 min walk/bike · best at 2pm"},
    Friday:    {type:"strength",label:"LEGS+CORE", color:T.grn,note:"Quads · Glutes · Core · ~50 min"},
    Saturday:  {type:"strength",label:"FULL BODY", color:T.pur,note:"Compound movements · ~50 min"},
    Sunday:    {type:"rest",    label:"REST",      color:T.dim,note:"Active recovery or gentle walk"},
  };
  let wCal=0,wPro=0;
  wD.forEach(d=>{ const day=all[d]; if(!day) return;
    const lg=MEALS.filter(m=>day.meals?.[m.id]?.logged);
    wCal+=lg.reduce((a,m)=>a+m.cal,0); wPro+=lg.reduce((a,m)=>a+m.pro,0);
  });
  const act=wD.filter(d=>all[d]).length, avgPro=act>0?Math.round(wPro/act):0;
  const allD=Object.keys(all).sort();
  const totStr=allD.filter(d=>all[d]?.lift?.ex&&Object.values(all[d].lift.ex).some(ex=>ex.sets?.some(s=>s.done))).length;
  const totCard=allD.filter(d=>all[d]?.cardio?.length>0).length;
  const totSober=allD.filter(d=>all[d]?.sober===true).length;
  const ws=allD.map(d=>parseFloat(all[d]?.ci?.weight)).filter(Boolean);
  const curW=ws.length>0?ws[ws.length-1]:START, lost=START-curW;
  let streak=0;
  const cd=new Date();
  for(let i=0;i<60;i++){
    const ds=cd.toISOString().split("T")[0],d=all[ds];
    if(d&&((d.cardio?.length>0)||(d.lift?.ex&&Object.values(d.lift.ex).some(ex=>ex.sets?.some(s=>s.done))))) streak++;
    else if(i>0) break;
    cd.setDate(cd.getDate()-1);
  }
  const weekPrompt = `Full week data:
${wD.map((d,i)=>{
  const day=all[d]; if(!day) return `${DAYS[i]}: no data`;
  const lg=MEALS.filter(m=>day.meals?.[m.id]?.logged);
  const c=lg.reduce((a,m)=>a+m.cal,0), p=lg.reduce((a,m)=>a+m.pro,0);
  const cm=(day.cardio||[]).reduce((a,e)=>a+parseInt(e.dur||0),0);
  const prog=PROG[FDYS[i]];
  const sets=day.lift?.ex?Object.values(day.lift.ex).reduce((a,ex)=>a+(ex.sets?.filter(s=>s.done).length||0),0):0;
  return `${DAYS[i]}: ${c}cal, ${p}g protein, ${cm}min movement${prog||day.lift?.session?`, ${sets} strength sets`:""}${day.sober===true?", SOBER":day.sober===false?", HAD DRINK":""}`;
}).join("\n")}
All-time: ${totStr} lift sessions, ${totCard} cardio days, ${totSober} sober days, ${lost.toFixed(1)}lbs lost of 45lb goal. Current day streak: ${streak}.
Weight: ${curW}lbs (goal ${GOAL}lbs, started ${START}lbs).
Weekly cardio: ${ctx.weekCardio}min. Weekly strength sets: ${ctx.weekSets}. Avg daily protein: ${avgPro}g.
Give a comprehensive weekly coaching review:
1. What physiological adaptations occurred this week from her specific training and nutrition
2. What the data pattern reveals — what's working, what recurring issue needs fixing
3. What's changing in body composition now (even if scale is flat) — fat loss vs muscle gain timeline
4. Her highest-leverage adjustment for next week and the mechanism why
5. 4-week projection: VO2 max, RHR, weight, energy if she continues this trajectory`;
  return (
    <div>
      <Card bg={T.gBg} bdr={T.gBdr}>
        <SLabel>Weight Journey · 196 → 151 lbs</SLabel>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          {[{l:"Current",v:curW.toFixed(1)+" lbs",c:T.ink},{l:"Lost",v:(lost>0?"-":"")+lost.toFixed(1)+" lbs",c:lost>0?T.grn:T.dim},{l:"To Go",v:Math.max(0,curW-GOAL).toFixed(1)+" lbs",c:T.gold}].map(s=>(
            <div key={s.l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:s.c, fontFamily:BC }}>{s.v}</div>
              <div style={{ fontSize:12, color:T.dim, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <Bar v={Math.max(0,lost)} max={START-GOAL} c={T.grn} bg={T.gnBg}/>
        <div style={{ fontSize:13, color:T.dim, textAlign:"right", marginTop:6, fontWeight:600 }}>{Math.max(0,(lost/(START-GOAL)*100)).toFixed(1)}% of 45-lb goal</div>
      </Card>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:16 }}>
        {[{icon:"🔥",val:streak,label:"Streak",color:T.gold},{icon:"💪",val:totStr,label:"Lift",color:T.org},{icon:"🏃",val:totCard,label:"Cardio",color:T.blu},{icon:"🌟",val:totSober,label:"Sober",color:T.grn}].map(s=>(
          <div key={s.label} style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:16, padding:"14px 8px", textAlign:"center" }}>
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div style={{ fontSize:24, fontWeight:900, color:s.color, fontFamily:BC }}>{s.val}</div>
            <div style={{ fontSize:11, color:T.dim, fontWeight:700, textTransform:"uppercase", fontFamily:BC }}>{s.label}</div>
          </div>
        ))}
      </div>
      <Card>
        <SLabel>This Week</SLabel>
        {wD.map((d,i)=>{
          const day=all[d], isToday=d===tod(), isFuture=d>tod();
          const prog=PROG[FDYS[i]];
          const hasStr=day?.lift?.ex&&Object.values(day.lift.ex).some(ex=>ex.sets?.some(s=>s.done));
          const hasCard=day?.cardio?.length>0;
          const lg=day?MEALS.filter(m=>day.meals?.[m.id]?.logged):[];
          const dc=lg.reduce((a,m)=>a+m.cal,0);
          const sv=day?.sober;
          return (
            <div key={d} style={{ padding:"12px 0", borderBottom:i<6?`1px solid ${T.bdr}`:"none", opacity:isFuture?0.3:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, fontSize:15, fontWeight:isToday?900:600, color:isToday?T.gold:T.mid, fontFamily:BC, flexShrink:0 }}>{DAYS[i]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, color:DAY_PLAN[FDYS[i]]?.color||T.dim, fontWeight:700, fontFamily:BC }}>
                    {DAY_PLAN[FDYS[i]]?.type==="strength"?"💪 ":DAY_PLAN[FDYS[i]]?.type==="cardio"?"🚴 ":"🛌 "}{DAY_PLAN[FDYS[i]]?.label}
                  </div>
                  <div style={{ fontSize:11, color:T.dim, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{DAY_PLAN[FDYS[i]]?.note}</div>
                </div>
                <div style={{ display:"flex", gap:4, alignItems:"center", flexShrink:0 }}>
                  {hasStr&&<span style={{ padding:"2px 8px", background:prog?.bg||T.puBg, border:`1px solid ${prog?.bdr||T.puBdr}`, borderRadius:20, fontSize:11, fontWeight:700, color:prog?.color||T.pur, fontFamily:BC }}>✓ LIFT</span>}
                  {hasCard&&<span style={{ padding:"2px 8px", background:T.gnBg, border:`1px solid ${T.gnBdr}`, borderRadius:20, fontSize:11, fontWeight:700, color:T.grn, fontFamily:BC }}>✓ MOVE</span>}
                  {sv===true&&<span style={{ fontSize:14 }}>🌟</span>}
                  {sv===false&&<span style={{ fontSize:14 }}>💧</span>}
                  {isToday&&<span style={{ padding:"2px 8px", background:T.gBg, border:`1px solid ${T.gBdr}`, borderRadius:20, fontSize:11, fontWeight:800, color:T.gold, fontFamily:BC }}>NOW</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ display:"flex", justifyContent:"space-between", paddingTop:14, marginTop:4, borderTop:`1px solid ${T.bdr}` }}>
          {[{l:"Cardio",v:ctx.weekCardio+"m",c:T.grn},{l:"Sets",v:ctx.weekSets,c:T.org},{l:"Avg Pro",v:avgPro+"g",c:T.pur},{l:"Cal",v:wCal,c:T.gold}].map(s=>(
            <div key={s.l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:900, color:s.c, fontFamily:BC }}>{s.v}</div>
              <div style={{ fontSize:12, color:T.dim, fontWeight:600, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>
      <AIBlock
        label="🔬 Weekly Analysis + Projection"
        prompt={weekPrompt}
        context={ctx}
        addendum="Comprehensive weekly physiology review. What adaptations occurred. Connect sobriety to fitness. Give 4-week biological projection."
        type="push"
        color={T.gold}
        btnColor={T.gold}
      />
    </div>
  );
}
export default function App() {
  const [all, setAll] = useState(() => ld());
  const [tab, setTab] = useState("today");
  const today = tod();
  const dayData = (() => { const c={...all}; return initDay(c, today); })();
  const ctx = buildContext(all);
  function upd(field, value) {
    setAll(prev => {
      const u = {...prev};
      if (!u[today]) u[today] = { ci:{}, meals:{}, cardio:[], lift:{ex:{},session:null}, watch:{}, sober:null, notes:"" };
      u[today] = {...u[today], [field]:value};
      sd(u); return u;
    });
  }
  const prog = PROG[dn()];
  const meals = dayData.meals||{};
  const lg = MEALS.filter(m=>meals[m.id]?.logged);
  const cal = lg.reduce((a,m)=>a+m.cal,0), pro = lg.reduce((a,m)=>a+m.pro,0);
  const min = (dayData.cardio||[]).reduce((a,e)=>a+parseInt(e.dur||0),0);
  const TABS = [
    {id:"today", label:"Today",  icon:"☀️"},
    {id:"lift",  label:"Lift",   icon:"💪"},
    {id:"move",  label:"Move",   icon:"🏃"},
    {id:"fuel",  label:"Fuel",   icon:"🥗"},
    {id:"sober", label:"Sober",  icon:"🌟"},
    {id:"week",  label:"Week",   icon:"📊"},
  ];
  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.ink, maxWidth:480, margin:"0 auto", fontFamily:BW }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,textarea,button{font-family:inherit;}
        input::placeholder,textarea::placeholder{color:#c0bdb5;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#e0ddd6;border-radius:2px;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        input[type=number]::-webkit-inner-spin-button{opacity:0.4;}
        textarea{line-height:1.6;}
      `}</style>
      {/* HEADER */}
      <div style={{ padding:"18px 18px 14px", background:T.sur, borderBottom:`1.5px solid ${T.bdr}`, position:"sticky", top:0, zIndex:10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:26, fontWeight:900, letterSpacing:"2px", fontFamily:BC, textTransform:"uppercase", color:T.ink, lineHeight:1 }}>FOUNDATION</div>
            <div style={{ fontSize:11, color:T.dim, letterSpacing:"2px", textTransform:"uppercase", marginTop:3, fontFamily:BC, fontWeight:700 }}>Rebecca · Training OS</div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
            {ctx.soberStreak>0 && <span style={{ padding:"4px 10px", background:T.gnBg, border:`1.5px solid ${T.gnBdr}`, borderRadius:20, fontSize:12, fontWeight:800, color:T.grn, fontFamily:BC }}>🌟 {ctx.soberStreak}d</span>}
            {min>=30 && <span style={{ padding:"4px 10px", background:T.gnBg, border:`1.5px solid ${T.gnBdr}`, borderRadius:20, fontSize:12, fontWeight:800, color:T.grn, fontFamily:BC }}>Move ✓</span>}
            {prog && <span style={{ padding:"4px 10px", background:prog.bg, border:`1.5px solid ${prog.bdr}`, borderRadius:20, fontSize:12, fontWeight:800, color:prog.color, fontFamily:BC }}>{prog.icon} {prog.label}</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[{v:min,max:30,c:T.grn,bg:T.gnBg,l:"Move"},{v:cal,max:2000,c:T.gold,bg:T.gBg,l:"Cal"},{v:pro,max:120,c:T.pur,bg:T.puBg,l:"Protein"}].map((b,i)=>(
            <div key={i} style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:10, color:T.dim, fontFamily:BC, textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:700 }}>{b.l}</span>
                <span style={{ fontSize:10, color:b.v>0?b.c:T.fnt, fontWeight:800 }}>{b.v>0?`${Math.round(b.v/b.max*100)}%`:""}</span>
              </div>
              <div style={{ height:6, background:b.bg, borderRadius:3, overflow:"hidden", border:`1px solid ${T.bdr}` }}>
                <div style={{ height:"100%", width:`${Math.min(b.v/b.max*100,100)}%`, background:b.c, borderRadius:3, transition:"width 0.5s" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"20px 16px 120px" }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab}/>
        {tab==="today" && <TodayTab day={dayData} upd={upd} ctx={ctx}/>}
        {tab==="lift"  && <LiftTab  day={dayData} upd={upd} all={all} ctx={ctx}/>}
        {tab==="move"  && <MoveTab  day={dayData} upd={upd} ctx={ctx}/>}
        {tab==="fuel"  && <FuelTab  day={dayData} upd={upd} ctx={ctx}/>}
        {tab==="sober" && <SoberTab all={all} upd={upd} day={dayData} ctx={ctx}/>}
        {tab==="week"  && <WeekTab  all={all} ctx={ctx}/>}
      </div>
    </div>
  );
}
