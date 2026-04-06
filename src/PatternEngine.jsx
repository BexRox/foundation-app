import { useState, useEffect, useRef } from "react";

const T = {
  bg:"#f5f4f0",sur:"#ffffff",card:"#ffffff",bdr:"#e0ddd6",
  ink:"#1a1814",mid:"#4a4740",dim:"#8a877e",fnt:"#c0bdb5",
  gold:"#b8860b",gBg:"#fef9ec",gBdr:"#f0d060",
  grn:"#1a7a44",gnBg:"#edf7f2",gnBdr:"#6fcf97",
  blu:"#1a5fa8",blBg:"#edf4fc",blBdr:"#90c4f0",
  pur:"#5a3fa8",puBg:"#f2eefa",puBdr:"#b39df0",
  org:"#c45000",ogBg:"#fef3ec",ogBdr:"#f0a060",
  red:"#c02020",rdBg:"#fff0f0",rdBdr:"#f09090",
};
const BC = "'Barlow Condensed',sans-serif";

async function getPatternInsight(prompt) {
  try {
    const res = await fetch("/.netlify/functions/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 250,
        system: `You are Rebecca's brutally honest fitness coach. She's 45F, 196lbs (goal 151), Lexapro (suppresses hunger, 2pm crash), suppressed cycle, VO2 max 23.5 climbing. Push/Pull/Legs + Full Body 4x/week. 1800-2000cal, 120g protein, plant-forward. Known patterns: skips snacks → dinner blowup, inconsistent lifting, under-eats when stressed. Sober — sobriety is core identity.

You watch her log data in real time and provide PROACTIVE pattern recognition. Be direct, specific, and occasionally tough. Never generic. 2-3 sentences max. Call out patterns by name. Reference her specific data. If something is good, say exactly why it's good physiologically. If something is a problem, name it clearly and tell her what to do about it right now.`,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch { return null; }
}

// Detect meaningful patterns from current day data
function detectPatterns(dayData, allData, prevInsight) {
  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const ci = dayData.ci || {};
  const meals = dayData.meals || {};
  const cardio = dayData.cardio || [];
  const lift = dayData.lift || {};
  const sober = dayData.sober;

  // Calculate nutrition
  const MEAL_MACROS = { breakfast:{cal:400,pro:25,fib:8}, snack1:{cal:200,pro:15,fib:5}, lunch:{cal:500,pro:30,fib:10}, snack2:{cal:200,pro:15,fib:5}, dinner:{cal:550,pro:35,fib:10} };
  
  // Check real food items first (new tracking), fall back to legacy
  let totalCal = 0, totalPro = 0;
  const mealIds = ["breakfast","snack1","lunch","snack2","dinner"];
  for (const id of mealIds) {
    const slot = meals[id];
    if (slot?.items?.length > 0) {
      for (const item of slot.items) {
        totalCal += item.nutrients?.cal || 0;
        totalPro += (item.nutrients?.pro || 0);
      }
    } else if (slot?.logged) {
      totalCal += MEAL_MACROS[id]?.cal || 0;
      totalPro += MEAL_MACROS[id]?.pro || 0;
    }
  }

  const hasBreakfast = meals.breakfast?.logged || (meals.breakfast?.items||[]).length > 0;
  const hasSnack1    = meals.snack1?.logged    || (meals.snack1?.items||[]).length > 0;
  const hasLunch     = meals.lunch?.logged     || (meals.lunch?.items||[]).length > 0;
  const hasSnack2    = meals.snack2?.logged    || (meals.snack2?.items||[]).length > 0;
  const hasDinner    = meals.dinner?.logged    || (meals.dinner?.items||[]).length > 0;

  const cardioMin = cardio.reduce((a,e) => a+parseInt(e.dur||0), 0);
  const liftSets  = Object.values(lift.ex||{}).reduce((a,ex) => a+(ex.sets?.filter(s=>s.done).length||0), 0);

  // Historical patterns (last 14 days)
  const recent = Object.keys(allData).sort().slice(-14).map(d => allData[d]).filter(Boolean);
  const avgSnackDays = recent.filter(d => (d.meals?.snack1?.logged || (d.meals?.snack1?.items||[]).length > 0) || (d.meals?.snack2?.logged || (d.meals?.snack2?.items||[]).length > 0)).length;
  const recentSoberDays = recent.filter(d => d.sober === true).length;
  const recentLiftDays = recent.filter(d => Object.values(d.lift?.ex||{}).some(ex => ex.sets?.some(s=>s.done))).length;
  const recentWeights = recent.map(d => parseFloat(d.ci?.weight)).filter(Boolean);
  const weightTrend = recentWeights.length >= 3 ? recentWeights[recentWeights.length-1] - recentWeights[0] : null;
  const recentSleepScores = recent.map(d => d.ci?.sleep).filter(Boolean);
  const avgSleep = recentSleepScores.length > 0 ? (recentSleepScores.reduce((a,b)=>a+b,0)/recentSleepScores.length).toFixed(1) : null;

  const triggers = [];

  // === PATTERN TRIGGERS (ordered by priority) ===

  // SNACK SKIP PATTERN — most important
  if (hasBreakfast && hasLunch && !hasSnack1 && !hasSnack2 && hour >= 14) {
    const skippedBefore = avgSnackDays < 5; // skips snacks most days
    triggers.push({
      id: "snack_skip_afternoon",
      priority: 10,
      prompt: `It's ${hour}:00. Rebecca has logged breakfast and lunch but ZERO snacks today. She skips snacks ${14 - avgSnackDays}/14 recent days. Current protein: ${totalPro.toFixed(0)}g of 120g goal. She's at her Lexapro 2pm energy cliff right now. Call this pattern out specifically — name it, explain the cortisol-ghrelin cascade that's building right now, and tell her exactly what to eat in the next 20 minutes and why it will prevent the dinner blowup.`,
    });
  }

  // DINNER BLOWUP DETECTION
  if (hasDinner && totalCal > 1600 && !hasSnack1 && !hasSnack2) {
    triggers.push({
      id: "dinner_blowup",
      priority: 9,
      prompt: `Rebecca just logged dinner and hit ${totalCal.toFixed(0)} calories for the day, with ${totalPro.toFixed(0)}g protein. She skipped both snacks. This is the dinner blowup pattern — call it out directly. Tell her what happened hormonally (ghrelin spike from skipping snacks, cortisol from Lexapro crash), and what ONE change would break this cycle tomorrow.`,
    });
  }

  // MORNING WEIGHT + TREND
  if (ci.weight && recentWeights.length >= 3 && weightTrend !== null) {
    const wt = parseFloat(ci.weight);
    const toGoal = (wt - 151).toFixed(1);
    if (Math.abs(weightTrend) > 1) {
      triggers.push({
        id: "weight_trend",
        priority: 7,
        prompt: `Rebecca weighed in at ${ci.weight}lbs today. Over the last ${recentWeights.length} weigh-ins, her weight has ${weightTrend > 0 ? "increased" : "decreased"} by ${Math.abs(weightTrend).toFixed(1)}lbs. She's ${toGoal}lbs from her 151lb goal. Give her a specific, honest read on this trend — is it fat loss, muscle gain, water, or a problem? What does the training and nutrition data suggest is driving it?`,
      });
    }
  }

  // LOW ENERGY + NO MOVEMENT YET
  if (ci.energy && ci.energy <= 2 && cardioMin === 0 && liftSets === 0 && hour >= 10) {
    triggers.push({
      id: "low_energy_no_movement",
      priority: 8,
      prompt: `Rebecca rated her energy ${ci.energy}/5 this morning and has logged zero movement at ${hour}:00. She's on Lexapro which can suppress motivation alongside the 2pm crash coming. Be direct: is rest the right call today or is she avoiding? Tell her the physiological difference between genuine recovery need and avoidance, and give her a specific minimum-viable workout for today that won't overtax her.`,
    });
  }

  // SKIPPING LIFT ON SCHEDULED DAY
  const dayOfWeek = new Date().toLocaleDateString("en-US",{weekday:"long"});
  const scheduledDays = ["Monday","Wednesday","Friday","Saturday"];
  if (scheduledDays.includes(dayOfWeek) && liftSets === 0 && hour >= 16 && cardioMin < 20) {
    triggers.push({
      id: "skipped_scheduled_lift",
      priority: 8,
      prompt: `Today is ${dayOfWeek} — a scheduled strength session day. It's ${hour}:00 and Rebecca has logged zero lifting sets and minimal movement. She's lifted ${recentLiftDays}/14 recent days. Be honest: this is a missed session. Tell her exactly what she can still do tonight (even a 20-min version of the session), and name the cost of repeatedly skipping scheduled sessions on her body composition goals at 45.`,
    });
  }

  // STRONG SESSION — specific positive feedback
  if (liftSets >= 12) {
    triggers.push({
      id: "strong_lift",
      priority: 6,
      prompt: `Rebecca just logged ${liftSets} strength sets today — a complete or near-complete session. Protein so far: ${totalPro.toFixed(0)}g. She's lifted ${recentLiftDays} of the last 14 days. Tell her specifically what's happening in her muscles right now (mTOR activation, protein synthesis window, DOMS timeline) and the ONE most important thing to do in the next 90 minutes to maximize this session's adaptation.`,
    });
  }

  // PROTEIN ON TRACK — but only if meaningful
  if (totalPro >= 100 && hour <= 18 && hasSnack1) {
    triggers.push({
      id: "protein_on_track",
      priority: 4,
      prompt: `Rebecca has hit ${totalPro.toFixed(0)}g protein by ${hour}:00 and has been consistent with snacks today. Average snack consistency: ${avgSnackDays}/14 recent days. Tell her specifically why today's pattern (eating on schedule despite Lexapro appetite suppression) is physiologically different from her usual pattern, and what this does to her cortisol and muscle protein synthesis compared to snack-skipping days.`,
    });
  }

  // SOBER LOGGING
  if (sober === true && recentSoberDays >= 5) {
    triggers.push({
      id: "sober_streak",
      priority: 5,
      prompt: `Rebecca just marked today as alcohol-free. She's been sober ${recentSoberDays}/14 recent days. Her VO2 max is 23.5, up from 19.6. Connect her sobriety streak to a specific, measurable physiological change that's happening in her body right now — something she can actually feel or see on her Apple Watch. Be specific about the mechanism, not generic about "health benefits."`,
    });
  }

  // POOR SLEEP + TRAINING
  if (ci.sleep && ci.sleep <= 2 && liftSets > 0) {
    triggers.push({
      id: "poor_sleep_lifting",
      priority: 9,
      prompt: `Rebecca rated last night's sleep ${ci.sleep}/5 and still went to the gym (${liftSets} sets). Her avg sleep score is ${avgSleep}/5 over recent days. Tell her two things: (1) what actually happens to strength, coordination risk, and cortisol when you lift on poor sleep — the real physiology, not "take it easy", and (2) the one thing she can do tonight to break the poor sleep cycle.`,
    });
  }

  // FIRST LOG OF THE DAY — morning check-in
  if (ci.sleep && ci.energy && !ci.weight && hour < 10 && liftSets === 0) {
    triggers.push({
      id: "morning_checkin",
      priority: 3,
      prompt: `Rebecca just completed her morning check-in: sleep=${ci.sleep}/5, energy=${ci.energy}/5. It's ${hour}:00. Today is ${dayOfWeek}${scheduledDays.includes(dayOfWeek)?` — a scheduled lift day`:" — a cardio/recovery day"}. Recent pattern: ${recentLiftDays}/14 lift days, ${recentSoberDays}/14 sober days, avg sleep ${avgSleep||"unknown"}/5. Give her a specific, personalized read on what today should look like based on these exact numbers — not a generic "have a great day."`,
    });
  }

  // MORNING MOVEMENT RECOMMENDATION
  // Fires early morning - recommends walk vs Pilates based on yesterday's training
  if (hour >= 5 && hour < 9 && cardioMin === 0 && liftSets === 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ydStr = (yesterday.getFullYear()+"-"+String(yesterday.getMonth()+1).padStart(2,"0")+"-"+String(yesterday.getDate()).padStart(2,"0"));
    const ydData = allData[ydStr] || {};
    const ydSets = Object.values(ydData.lift?.ex||{}).reduce((a,ex) => a+(ex.sets?.filter(s=>s.done).length||0), 0);
    const ydCardio = (ydData.cardio||[]).reduce((a,e) => a+parseInt(e.dur||0), 0);
    const ydSession = ydData.lift?.session;
    const wasHeavyYesterday = ydSets >= 12; // full or near-full session
    const wasLegsYesterday  = ydSession === "Friday" || (ydData.lift?.session && allData[ydStr]?.lift?.session === "Friday");

    // Check actual session type from stored session key
    const ydDayName = yesterday.toLocaleDateString("en-US",{weekday:"long"});
    const ydProg = { Monday:"PUSH", Wednesday:"PULL", Friday:"LEGS+CORE", Saturday:"FULL BODY" }[ydDayName];
    const isLegsSession = ydProg === "LEGS+CORE" || ydProg === "FULL BODY";

    if (wasHeavyYesterday && isLegsSession) {
      // Legs/Full Body yesterday = hip flexors, glutes, hamstrings will be stiff → Pilates
      triggers.push({
        id: "morning_post_legs_pilates",
        priority: 8,
        prompt: `It's ${hour}:00 and Rebecca hasn't logged any movement yet. Yesterday she did ${ydSets} strength sets (${ydProg} session — legs and glutes). Her hip flexors, glutes, and hamstrings will be in early-stage DOMS right now. Tell her specifically: (1) why Pilates or yoga is the better morning choice TODAY over walking — the specific recovery mechanism, not generic advice, and (2) what 15 minutes of morning Pilates does to DOMS recovery compared to walking on sore legs. Be direct about the physiology.`,
      });
    } else if (wasHeavyYesterday) {
      // Heavy upper body yesterday = still walk, but note soreness
      triggers.push({
        id: "morning_post_upper_walk",
        priority: 7,
        prompt: `It's ${hour}:00 and Rebecca hasn't logged movement yet. Yesterday she completed ${ydSets} sets (${ydProg||"strength"} session). Her upper body will have some DOMS but her legs are fresh. Tell her: walking is the right call this morning because her lower body is recovered and ready for Zone 2 fat oxidation — the DOMS in her upper body won't be worsened by walking. Give her the specific VO2 max math: at 23.5 climbing to 28+, every morning walk is compounding at a rate that matters right now.`,
      });
    } else if (ydSets === 0 && ydCardio === 0) {
      // Rest day yesterday - fresh, walk is high priority
      triggers.push({
        id: "morning_fresh_walk",
        priority: 6,
        prompt: `It's ${hour}:00 and Rebecca has logged no movement yet today. Yesterday was a rest day — she's fully recovered. Tell her: this is the highest-value morning walk window of her week. Fresh legs, morning fasted state, cortisol curve just starting — the fat oxidation and VO2 max benefits of a 15-20 minute walk right now are at their peak. Give her the specific mechanism: fasted Zone 2 preferentially oxidizes fat and the cardiovascular adaptation signal is strongest when glycogen is partially depleted.`,
      });
    } else {
      // Default morning nudge - walk recommendation
      triggers.push({
        id: "morning_walk_nudge",
        priority: 5,
        prompt: `It's ${hour}:00 and Rebecca hasn't moved yet today. Yesterday: ${ydSets > 0 ? ydSets+" strength sets" : "no lifting"}, ${ydCardio > 0 ? ydCardio+"min cardio" : "no cardio"}. Recommend walk vs Pilates for this morning based on her recovery state. VO2 max is 23.5 climbing to 28+ — every Zone 2 minute right now compounds disproportionately because she's on the steep part of the adaptation curve. Be specific about why the choice matters this particular morning.`,
      });
    }
  }

  // Sort by priority and return highest
  triggers.sort((a,b) => b.priority - a.priority);
  return triggers[0] || null;
}

export default function PatternEngine({ dayData, allData }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const dismissedAtRef = useRef(null);
  const [lastTriggerKey, setLastTriggerKey] = useState(null);
  const debounceRef = useRef(null);
  const cooldownRef = useRef(null);

  // Build a stable key from day data to detect meaningful changes
  const dataKey = JSON.stringify({
    ci: dayData.ci,
    meals: Object.keys(dayData.meals||{}).map(k => ({
      id: k,
      logged: dayData.meals[k]?.logged,
      items: (dayData.meals[k]?.items||[]).length,
    })),
    cardioMin: (dayData.cardio||[]).reduce((a,e)=>a+parseInt(e.dur||0),0),
    liftSets: Object.values(dayData.lift?.ex||{}).reduce((a,ex)=>a+(ex.sets?.filter(s=>s.done).length||0),0),
    sober: dayData.sober,
  });

  useEffect(() => {
    // Debounce: wait 2s after last change before firing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const trigger = detectPatterns(dayData, allData, insight);
      if (!trigger) return;
      // Don't re-fire same trigger within 10 minutes
      if (trigger.id === lastTriggerKey && cooldownRef.current && Date.now() - cooldownRef.current < 600000) return;
      // Don't fire if dismissed in last 5 minutes
      if (dismissedAtRef.current && Date.now() - dismissedAtRef.current < 300000) return;

      setLastTriggerKey(trigger.id);
      cooldownRef.current = Date.now();
      setDismissed(false);
      dismissedAtRef.current = null;
      setLoading(true);
      const msg = await getPatternInsight(trigger.prompt);
      if (msg) setInsight({ msg, id: trigger.id, ts: Date.now() });
      setLoading(false);
    }, 2000);
    return () => clearTimeout(debounceRef.current);
  }, [dataKey]);

  if (dismissed || (!insight && !loading)) return null;

  const typeColors = {
    snack_skip_afternoon: { bg:T.rdBg, bdr:T.rdBdr, l:T.red },
    dinner_blowup:        { bg:T.rdBg, bdr:T.rdBdr, l:T.red },
    low_energy_no_movement:{ bg:T.gBg, bdr:T.gBdr,  l:T.gold },
    skipped_scheduled_lift:{ bg:T.gBg, bdr:T.gBdr,  l:T.gold },
    poor_sleep_lifting:   { bg:T.gBg, bdr:T.gBdr,  l:T.gold },
    strong_lift:          { bg:T.gnBg, bdr:T.gnBdr, l:T.grn  },
    protein_on_track:     { bg:T.gnBg, bdr:T.gnBdr, l:T.grn  },
    sober_streak:         { bg:T.gnBg, bdr:T.gnBdr, l:T.grn  },
    morning_checkin:      { bg:T.blBg, bdr:T.blBdr, l:T.blu  },
    weight_trend:         { bg:T.puBg, bdr:T.puBdr, l:T.pur  },
  };
  const col = typeColors[insight?.id] || { bg:T.puBg, bdr:T.puBdr, l:T.pur };

  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:50, padding:"0 12px 16px", maxWidth:480, margin:"0 auto" }}>
      <div style={{
        background:loading?T.sur:col.bg,
        border:`1.5px solid ${loading?T.bdr:col.bdr}`,
        borderLeft:`4px solid ${loading?T.bdr:col.l}`,
        borderRadius:16,
        padding:"14px 16px",
        boxShadow:"0 -2px 20px rgba(0,0,0,0.12)",
        position:"relative",
      }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:loading?0:8 }}>
          <span style={{ fontSize:10, fontWeight:800, color:col.l, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:BC }}>
            {loading ? "⏳ Analyzing pattern..." : "🧠 Pattern Recognized"}
          </span>
          {!loading && (
            <button onClick={()=>{ setDismissed(true); dismissedAtRef.current = Date.now(); setInsight(null); }} style={{ background:"none", border:"none", color:T.fnt, fontSize:20, cursor:"pointer", padding:"4px 8px", lineHeight:1, minWidth:32, textAlign:"center" }}>×</button>
          )}
        </div>
        {!loading && insight && (
          <p style={{ margin:0, fontSize:14, color:T.ink, fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:1.75, paddingRight:8 }}>
            {insight.msg}
          </p>
        )}
      </div>
    </div>
  );
}
