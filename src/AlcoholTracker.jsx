import { useState } from "react";

const T = {
  bg:"#f5f4f0",sur:"#ffffff",card:"#ffffff",bdr:"#e0ddd6",
  ink:"#1a1814",mid:"#4a4740",dim:"#8a877e",fnt:"#c0bdb5",
  gold:"#b8860b",gBg:"#fef9ec",gBdr:"#f0d060",
  grn:"#1a7a44",gnBg:"#edf7f2",gnBdr:"#6fcf97",
  blu:"#1a5fa8",blBg:"#edf4fc",blBdr:"#90c4f0",
  pur:"#5a3fa8",puBg:"#f2eefa",puBdr:"#b39df0",
  red:"#c02020",rdBg:"#fff0f0",rdBdr:"#f09090",
  org:"#c45000",ogBg:"#fef3ec",ogBdr:"#f0a060",
};
const BC = "'Barlow Condensed',sans-serif";

// Compare metrics on drinking vs sober days
function analyzeImpact(all) {
  const drinkDays = [], soberDays = [];

  for (const [date, day] of Object.entries(all)) {
    if (!day) continue;
    const w = day.watch || {};
    const hasMetrics = w.hrv || w.rhr || w.deep || w.sleep;
    if (!hasMetrics) continue;

    // Check day AFTER drinking vs day after sober
    const prev = new Date(date + "T12:00:00");
    prev.setDate(prev.getDate() - 1);
    const prevStr = prev.getFullYear()+"-"+String(prev.getMonth()+1).padStart(2,"0")+"-"+String(prev.getDate()).padStart(2,"0");
    const prevDay = all[prevStr];
    if (!prevDay) continue;

    const entry = {
      date,
      hrv:   parseFloat(w.hrv)   || null,
      rhr:   parseFloat(w.rhr)   || null,
      deep:  parseFloat(w.deep)  || null,
      sleep: parseFloat(w.sleep) || null,
      energy: day.ci?.energy     || null,
    };

    if (prevDay.sober === false) drinkDays.push(entry);
    else if (prevDay.sober === true) soberDays.push(entry);
  }

  const avg = (arr, key) => {
    const vals = arr.map(d => d[key]).filter(v => v !== null && !isNaN(v));
    return vals.length > 0 ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
  };

  return {
    drinkCount: drinkDays.length,
    soberCount: soberDays.length,
    drink: {
      hrv:    avg(drinkDays, "hrv"),
      rhr:    avg(drinkDays, "rhr"),
      deep:   avg(drinkDays, "deep"),
      sleep:  avg(drinkDays, "sleep"),
      energy: avg(drinkDays, "energy"),
    },
    sober: {
      hrv:    avg(soberDays, "hrv"),
      rhr:    avg(soberDays, "rhr"),
      deep:   avg(soberDays, "deep"),
      sleep:  avg(soberDays, "sleep"),
      energy: avg(soberDays, "energy"),
    },
  };
}

// Weekly drinking trend
function weeklyTrend(all) {
  const weeks = {};
  for (const [date, day] of Object.entries(all)) {
    if (day?.sober === null || day?.sober === undefined) continue;
    const d = new Date(date + "T12:00:00");
    const dow = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (dow===0?6:dow-1));
    const wk = mon.getFullYear()+"-"+String(mon.getMonth()+1).padStart(2,"0")+"-"+String(mon.getDate()).padStart(2,"0");
    if (!weeks[wk]) weeks[wk] = { sober:0, drink:0, total:0 };
    if (day.sober === true)  weeks[wk].sober++;
    if (day.sober === false) weeks[wk].drink++;
    weeks[wk].total++;
  }
  return Object.entries(weeks).sort(([a],[b])=>a<b?-1:1).slice(-8);
}

// Recovery milestones based on sobriety history
function getRecoveryMilestones(totalSoberDays, prevHeavyYears = 5) {
  // Evidence-based recovery timeline for 4-8 drinks/night × 5 years
  return [
    { days:7,   label:"Week 1",      achieved: totalSoberDays >= 7,   marker:"HRV begins rising · sleep architecture starts restoring · liver begins clearing" },
    { days:14,  label:"2 Weeks",     achieved: totalSoberDays >= 14,  marker:"Resting HR measurably lower · cortisol curve normalizing · GABA receptors begin upregulating" },
    { days:30,  label:"1 Month",     achieved: totalSoberDays >= 30,  marker:"Liver fat reduction visible in bloodwork · gut microbiome diversity increasing · dopamine sensitivity improving" },
    { days:60,  label:"2 Months",    achieved: totalSoberDays >= 60,  marker:"Muscle protein synthesis at near-full efficiency · deep sleep restored · HRV approaching baseline normal" },
    { days:90,  label:"3 Months",    achieved: totalSoberDays >= 90,  marker:"Neurological inflammation significantly reduced · VO2 max gains accelerating · cortisol baseline normalized" },
    { days:180, label:"6 Months",    achieved: totalSoberDays >= 180, marker:"Cardiac muscle function restored · GABA receptor density normalizing · fat oxidation at full efficiency" },
    { days:365, label:"1 Year",      achieved: totalSoberDays >= 365, marker:"Full neurological recovery from chronic use · HPA axis normalized · metabolic rate at genetic potential" },
  ];
}

export default function AlcoholTracker({ all, ctx }) {
  const [showScience, setShowScience] = useState(false);

  const impact = analyzeImpact(all);
  const trend  = weeklyTrend(all);
  const totalSober = Object.keys(all).filter(d => all[d]?.sober === true).length;
  const milestones = getRecoveryMilestones(totalSober, 5);

  // Current week drinks
  const now = new Date();
  const dow = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - (dow===0?6:dow-1));
  const wD = Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); });
  const thisWeekDrinks = wD.filter(d => all[d]?.sober === false).length;
  const thisWeekSober  = wD.filter(d => all[d]?.sober === true).length;

  const hasBothData = impact.drinkCount > 0 && impact.soberCount > 0;

  const MetricDiff = ({ label, drinkVal, soberVal, unit, lowerIsBetter }) => {
    if (!drinkVal || !soberVal) return (
      <div style={{ padding:"12px 0", borderBottom:`1px solid ${T.bdr}` }}>
        <div style={{ fontSize:14, color:T.mid, fontWeight:600 }}>{label}</div>
        <div style={{ fontSize:12, color:T.fnt, marginTop:3 }}>Log more Watch data on both drinking and sober days to see your personal impact</div>
      </div>
    );
    const diff = parseFloat(soberVal) - parseFloat(drinkVal);
    const soberBetter = lowerIsBetter ? diff < 0 : diff > 0;
    const absDiff = Math.abs(diff).toFixed(1);
    const pct = Math.abs(diff / parseFloat(drinkVal) * 100).toFixed(0);
    return (
      <div style={{ padding:"14px 0", borderBottom:`1px solid ${T.bdr}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div style={{ fontSize:14, color:T.ink, fontWeight:700 }}>{label}</div>
          {soberBetter
            ? <span style={{ fontSize:11, fontWeight:800, color:T.grn, background:T.gnBg, border:`1px solid ${T.gnBdr}`, borderRadius:20, padding:"2px 8px", fontFamily:BC }}>+{pct}% sober</span>
            : <span style={{ fontSize:11, fontWeight:800, color:T.org, background:T.ogBg, border:`1px solid ${T.ogBdr}`, borderRadius:20, padding:"2px 8px", fontFamily:BC }}>{pct}% impact</span>
          }
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ background:T.rdBg, border:`1.5px solid ${T.rdBdr}`, borderRadius:12, padding:"10px 14px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:T.dim, fontFamily:BC, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>💧 After Drinking</div>
            <div style={{ fontSize:22, fontWeight:900, color:T.red, fontFamily:BC }}>{drinkVal}<span style={{ fontSize:12, color:T.dim, fontWeight:400 }}> {unit}</span></div>
          </div>
          <div style={{ background:T.gnBg, border:`1.5px solid ${T.gnBdr}`, borderRadius:12, padding:"10px 14px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:T.dim, fontFamily:BC, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>🌟 After Sober</div>
            <div style={{ fontSize:22, fontWeight:900, color:T.grn, fontFamily:BC }}>{soberVal}<span style={{ fontSize:12, color:T.dim, fontWeight:400 }}> {unit}</span></div>
          </div>
        </div>
        <div style={{ marginTop:8, fontSize:12, color:T.mid, fontStyle:"italic", fontFamily:"Georgia,serif" }}>
          {label === "HRV" && `${absDiff}ms difference — HRV is your nervous system's recovery score. Alcohol suppresses it directly.`}
          {label === "Resting HR" && `${absDiff}bpm difference — higher RHR after drinking reflects your heart working harder to process alcohol.`}
          {label === "Deep Sleep" && `${absDiff}min difference — alcohol suppresses REM and deep sleep even in small amounts. This is when GH is released.`}
          {label === "Energy" && `${absDiff}/5 difference — this is your 2pm cliff made worse. Lexapro + alcohol × cortisol elevation.`}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:20, padding:18, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.8px", textTransform:"uppercase", fontFamily:BC, marginBottom:14 }}>Alcohol Impact · Your Data</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
          {[
            { label:"This Week", v:thisWeekDrinks, sub:"drink days", c:thisWeekDrinks===0?T.grn:thisWeekDrinks<=2?T.gold:T.red },
            { label:"Sober Days", v:thisWeekSober, sub:"this week", c:thisWeekSober>=5?T.grn:T.gold },
            { label:"Total Sober", v:totalSober, sub:"days logged", c:T.blu },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:"center", background:T.bg, borderRadius:12, padding:"12px 6px" }}>
              <div style={{ fontSize:26, fontWeight:900, color:s.c, fontFamily:BC, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:10, color:T.mid, fontWeight:700, marginTop:4, textTransform:"uppercase", letterSpacing:"0.3px", fontFamily:BC }}>{s.label}</div>
              <div style={{ fontSize:10, color:T.fnt }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Context note */}
        <div style={{ background:T.puBg, border:`1.5px solid ${T.puBdr}`, borderRadius:12, padding:"12px 14px", fontSize:13, color:T.mid, lineHeight:1.65, fontStyle:"italic", fontFamily:"Georgia,serif" }}>
          Baseline: 4–8 glasses/night × 5 years → now ~8 glasses/week. That reduction is significant. This tracker shows what continued reduction does to your body in real data.
        </div>
      </div>

      {/* Weekly trend chart */}
      {trend.length > 0 && (
        <div style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:20, padding:18, marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.8px", textTransform:"uppercase", fontFamily:BC, marginBottom:14 }}>Weekly Drinking Trend</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80, marginBottom:8 }}>
            {trend.map(([wk, data], i) => {
              const drinkPct = data.total > 0 ? (data.drink / 7) * 100 : 0;
              const soberPct = data.total > 0 ? (data.sober / 7) * 100 : 0;
              const isThisWeek = i === trend.length - 1;
              return (
                <div key={wk} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                  <div style={{ width:"100%", display:"flex", flexDirection:"column-reverse", gap:1, height:60 }}>
                    <div style={{ width:"100%", height:`${soberPct}%`, background:T.grn, borderRadius:"2px 2px 0 0", minHeight: soberPct>0?4:0 }}/>
                    <div style={{ width:"100%", height:`${drinkPct}%`, background:T.red, borderRadius:2, minHeight: drinkPct>0?4:0 }}/>
                  </div>
                  <div style={{ fontSize:9, color:isThisWeek?T.gold:T.fnt, fontWeight:isThisWeek?800:400, fontFamily:BC }}>
                    {isThisWeek?"NOW":new Date(wk+"T12:00:00").toLocaleDateString("en-US",{month:"numeric",day:"numeric"})}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10,height:10,background:T.grn,borderRadius:2 }}/><span style={{ fontSize:12, color:T.grn, fontWeight:600 }}>Sober</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:10,height:10,background:T.red,borderRadius:2 }}/><span style={{ fontSize:12, color:T.red, fontWeight:600 }}>Drink</span></div>
          </div>
        </div>
      )}

      {/* Your actual impact data */}
      <div style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:20, padding:18, marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.8px", textTransform:"uppercase", fontFamily:BC, marginBottom:4 }}>Your Personal Impact Data</div>
        <div style={{ fontSize:12, color:T.fnt, marginBottom:14 }}>
          {hasBothData
            ? `Based on ${impact.drinkCount} day${impact.drinkCount!==1?"s":""} after drinking vs ${impact.soberCount} sober day${impact.soberCount!==1?"s":""} in your Apple Watch data`
            : "Log your Apple Watch metrics on both drinking and sober days to unlock your personal impact analysis"
          }
        </div>
        <MetricDiff label="HRV"         drinkVal={impact.drink.hrv}    soberVal={impact.sober.hrv}    unit="ms"    lowerIsBetter={false} />
        <MetricDiff label="Resting HR"  drinkVal={impact.drink.rhr}    soberVal={impact.sober.rhr}    unit="bpm"   lowerIsBetter={true}  />
        <MetricDiff label="Deep Sleep"  drinkVal={impact.drink.deep}   soberVal={impact.sober.deep}   unit="min"   lowerIsBetter={false} />
        <MetricDiff label="Energy"      drinkVal={impact.drink.energy} soberVal={impact.sober.energy} unit="/ 5"   lowerIsBetter={false} />
      </div>

      {/* Recovery milestones */}
      <div style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:20, padding:18, marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.8px", textTransform:"uppercase", fontFamily:BC, marginBottom:4 }}>Recovery Timeline</div>
        <div style={{ fontSize:12, color:T.fnt, marginBottom:14 }}>Based on your history of heavy daily use. These are cumulative sober days — not consecutive.</div>
        {milestones.map((m, i) => (
          <div key={m.days} style={{ display:"flex", gap:14, alignItems:"flex-start", paddingBottom:14, marginBottom:14, borderBottom:i<milestones.length-1?`1px solid ${T.bdr}`:"none" }}>
            <div style={{ flexShrink:0, width:44, height:44, borderRadius:"50%", background:m.achieved?T.grn:T.bg, border:`2.5px solid ${m.achieved?T.gnBdr:T.bdr}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:m.achieved?20:16, color:m.achieved?"#fff":T.fnt }}>
              {m.achieved ? "✓" : m.days}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:15, fontWeight:800, color:m.achieved?T.grn:T.ink, fontFamily:BC }}>{m.label}</span>
                {m.achieved && <span style={{ fontSize:11, fontWeight:700, color:T.grn, background:T.gnBg, border:`1px solid ${T.gnBdr}`, borderRadius:20, padding:"1px 8px", fontFamily:BC }}>REACHED</span>}
                {!m.achieved && <span style={{ fontSize:11, color:T.fnt }}>{m.days - totalSober > 0 ? `${m.days - totalSober} sober days away` : ""}</span>}
              </div>
              <div style={{ fontSize:12, color:T.mid, lineHeight:1.65 }}>{m.marker}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Science toggle */}
      <button onClick={()=>setShowScience(!showScience)} style={{ width:"100%", padding:"13px", background:T.bg, border:`1.5px solid ${T.bdr}`, borderRadius:14, color:T.mid, fontSize:14, cursor:"pointer", fontWeight:600, marginBottom:showScience?12:0 }}>
        {showScience ? "▲ Hide" : "▼ Show"} The Science — What Your History Did to These Systems
      </button>

      {showScience && (
        <div style={{ background:T.blBg, border:`1.5px solid ${T.blBdr}`, borderRadius:16, padding:18, marginBottom:16 }}>
          {[
            { title:"Liver & Fat Metabolism", body:"5 years of 4-8 drinks nightly creates hepatic steatosis (fatty liver) in most people — even without clinical diagnosis. Your liver prioritizes alcohol metabolism over fat oxidation, and this suppression persists even on non-drinking days as the liver recovers. This is why fat loss in early recovery is slower than the calorie math predicts. As drinking reduces, liver function normalizes over 3-12 months and fat oxidation accelerates noticeably." },
            { title:"Cortisol & HPA Axis", body:"Chronic heavy drinking dysregulates the HPA axis — your stress hormone system. This creates a chronically elevated cortisol baseline that doesn't normalize immediately when drinking stops or reduces. Your afternoon Lexapro energy cliff is amplified by this. The good news: consistent exercise, sleep, and reduced alcohol normalizes HPA function over 6-18 months. You're in this window now." },
            { title:"Muscle & Protein Synthesis", body:"Alcohol suppresses mTOR — the master regulator of muscle protein synthesis — for 24-48 hours per drinking episode. At 4-8 drinks nightly for 5 years, your muscles have been in a chronically suppressed anabolic state. This means your starting muscle mass is lower than your training potential — giving you more room to gain than someone who hasn't had this history. Your body will respond strongly to resistance training." },
            { title:"Gut Microbiome", body:"Heavy chronic alcohol use significantly damages gut microbiome diversity, affecting appetite hormones (ghrelin, leptin), serotonin production, and systemic inflammation. High fiber intake — your 30-35g target — is the primary driver of microbiome recovery. This also affects how well Lexapro works, since gut microbiome health and serotonin production are deeply connected." },
            { title:"Neurological Recovery", body:"GABA receptor downregulation from years of alcohol exposure takes 12-24 months to fully normalize. This affects anxiety regulation, sleep architecture, and your reward system's response to exercise and food. You may be noticing that exercise feels increasingly rewarding — that's dopamine sensitivity recovering. This is a real, measurable neurological process that continues for 1-2 years." },
          ].map((s,i) => (
            <div key={i} style={{ marginBottom:i<4?16:0, paddingBottom:i<4?16:0, borderBottom:i<4?`1px solid ${T.blBdr}`:"none" }}>
              <div style={{ fontSize:15, fontWeight:800, color:T.ink, marginBottom:6 }}>{s.title}</div>
              <p style={{ margin:0, fontSize:13, color:T.mid, lineHeight:1.75, fontWeight:500 }}>{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
