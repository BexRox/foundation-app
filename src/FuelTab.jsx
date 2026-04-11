import { useState } from "react";
import { SaveFavoriteModal, FavoritesPanel } from "./FavoritesManager.jsx";

const T = {
  bg:"#f5f4f0",sur:"#ffffff",card:"#ffffff",bdr:"#e0ddd6",bdrDk:"#c8c4bb",
  ink:"#1a1814",mid:"#4a4740",dim:"#8a877e",fnt:"#c0bdb5",
  gold:"#b8860b",gBg:"#fef9ec",gBdr:"#f0d060",
  grn:"#1a7a44",gnBg:"#edf7f2",gnBdr:"#6fcf97",
  blu:"#1a5fa8",blBg:"#edf4fc",blBdr:"#90c4f0",
  pur:"#5a3fa8",puBg:"#f2eefa",puBdr:"#b39df0",
  red:"#c02020",rdBg:"#fff0f0",rdBdr:"#f09090",
};
const BC = "'Barlow Condensed',sans-serif";

const MEALS = [
  { id:"breakfast", label:"Breakfast",       icon:"🌅", time:"7–9am"   },
  { id:"snack1",    label:"Morning Snack",   icon:"🥜", time:"10–11am" },
  { id:"lunch",     label:"Lunch",           icon:"🥗", time:"12–1pm"  },
  { id:"snack2",    label:"Afternoon Snack", icon:"🍎", time:"3–4pm"   },
  { id:"dinner",    label:"Dinner",          icon:"🍽️", time:"6–8pm"   },
];

// Protein quality options for quick logging
const PROTEIN_OPTS = [
  { label:"Low",    value:10, color:T.red,  desc:"<15g — snack only"    },
  { label:"Good",   value:20, color:T.gold, desc:"~20g — on target"     },
  { label:"High",   value:30, color:T.grn,  desc:"25–35g — great meal"  },
];

const CAL_OPTS = [
  { label:"Light",    value:250, desc:"250 cal" },
  { label:"Moderate", value:450, desc:"450 cal" },
  { label:"Full",     value:600, desc:"600+ cal"},
];

function QuickLogModal({ slot, onSave, onClose }) {
  const [proTier, setProTier]   = useState(null); // low/good/high
  const [calTier, setCalTier]   = useState(null);
  const [note,    setNote]      = useState("");
  const [showFav, setShowFav]   = useState(false);

  function save() {
    const pro = PROTEIN_OPTS.find(p=>p.label===proTier);
    const cal = CAL_OPTS.find(c=>c.label===calTier);
    onSave({
      logged: true,
      proTier, calTier,
      pro:  pro?.value  || 0,
      cal:  cal?.value  || 0,
      note,
      ts: Date.now(),
    });
    onClose();
  }

  function applyFav(fav) {
    // Map favorite's actual macros to tiers
    const p = fav.nutrients?.pro || 0;
    const c = fav.nutrients?.cal || 0;
    setProTier(p >= 25 ? "High" : p >= 15 ? "Good" : "Low");
    setCalTier(c >= 500 ? "Full" : c >= 350 ? "Moderate" : "Light");
    setNote(fav.name);
    setShowFav(false);
  }

  const canSave = proTier && calTier;

  if (showFav) return (
    <FavoritesPanel
      onSelectFavorite={applyFav}
      onClose={() => setShowFav(false)}
    />
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:100, display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:T.sur, borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"85vh", overflow:"auto" }}>
        {/* Header */}
        <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${T.bdr}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:19, fontWeight:800, color:T.ink }}>{slot.icon} {slot.label}</div>
            <div style={{ fontSize:13, color:T.dim, marginTop:2 }}>Quick log — tap to record</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:26, color:T.dim, cursor:"pointer", padding:"0 4px" }}>×</button>
        </div>

        <div style={{ padding:"18px 20px 32px" }}>
          {/* Protein */}
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:13, fontWeight:800, color:T.mid, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:BC, marginBottom:12 }}>
              Protein · target 20g/meal
            </div>
            <div style={{ display:"flex", gap:10 }}>
              {PROTEIN_OPTS.map(p => (
                <button key={p.label} onClick={()=>setProTier(p.label)} style={{
                  flex:1, padding:"14px 8px",
                  border:`2.5px solid ${proTier===p.label ? p.color : T.bdr}`,
                  borderRadius:14,
                  background: proTier===p.label ? (p.color===T.grn?T.gnBg:p.color===T.gold?T.gBg:T.rdBg) : T.bg,
                  cursor:"pointer", transition:"all 0.15s",
                }}>
                  <div style={{ fontSize:16, fontWeight:900, color: proTier===p.label ? p.color : T.ink, fontFamily:BC }}>{p.label}</div>
                  <div style={{ fontSize:11, color:T.dim, marginTop:4 }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Calories */}
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:13, fontWeight:800, color:T.mid, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:BC, marginBottom:12 }}>
              Portion size
            </div>
            <div style={{ display:"flex", gap:10 }}>
              {CAL_OPTS.map(c => (
                <button key={c.label} onClick={()=>setCalTier(c.label)} style={{
                  flex:1, padding:"14px 8px",
                  border:`2.5px solid ${calTier===c.label ? T.gold : T.bdr}`,
                  borderRadius:14,
                  background: calTier===c.label ? T.gBg : T.bg,
                  cursor:"pointer", transition:"all 0.15s",
                }}>
                  <div style={{ fontSize:16, fontWeight:900, color: calTier===c.label ? T.gold : T.ink, fontFamily:BC }}>{c.label}</div>
                  <div style={{ fontSize:11, color:T.dim, marginTop:4 }}>{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional note */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:800, color:T.mid, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:BC, marginBottom:10 }}>
              What was it? <span style={{ color:T.fnt, fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span>
            </div>
            <input
              value={note}
              onChange={e=>setNote(e.target.value)}
              placeholder="e.g. Greek yogurt, chicken bowl, protein shake..."
              style={{ width:"100%", padding:"13px 16px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.ink, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
            />
          </div>

          {/* Favorites shortcut */}
          <button onClick={()=>setShowFav(true)} style={{ width:"100%", padding:"11px", marginBottom:14, background:"transparent", border:`1.5px solid ${T.gBdr}`, borderRadius:12, color:T.gold, fontSize:14, fontWeight:700, cursor:"pointer" }}>
            ⭐ Use a Saved Favorite
          </button>

          {/* Save */}
          <button onClick={save} disabled={!canSave} style={{
            width:"100%", padding:"16px", border:"none", borderRadius:14,
            background: canSave ? T.grn : T.bdr,
            color: canSave ? "#fff" : T.dim,
            fontWeight:900, fontSize:17, cursor: canSave ? "pointer" : "default",
            fontFamily:BC, letterSpacing:"1px", textTransform:"uppercase",
            boxShadow: canSave ? `0 2px 12px ${T.grn}40` : "none",
            transition:"all 0.2s",
          }}>
            Log {slot.label}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FuelTab({ day, upd, ctx }) {
  const [openSlot, setOpenSlot]   = useState(null);
  const [saveFavSlot, setSaveFav] = useState(null);
  const meals = day.meals || {};

  function saveSlot(slotId, data) {
    upd("meals", { ...meals, [slotId]: data });
  }

  function clearSlot(slotId) {
    const updated = { ...meals };
    delete updated[slotId];
    upd("meals", updated);
  }

  // Totals from quick-log tiers
  const totals = MEALS.reduce((acc, m) => {
    const slot = meals[m.id];
    if (!slot?.logged) return acc;
    // New quick-log format
    if (slot.pro !== undefined) {
      acc.pro  += slot.pro  || 0;
      acc.cal  += slot.cal  || 0;
    }
    // Legacy items[] format
    if (slot.items?.length > 0) {
      acc.pro  += slot.items.reduce((a,i)=>a+(i.nutrients?.pro||0),0);
      acc.cal  += slot.items.reduce((a,i)=>a+(i.nutrients?.cal||0),0);
    }
    return acc;
  }, { pro:0, cal:0 });

  totals.pro = Math.round(totals.pro * 10) / 10;

  const loggedCount  = MEALS.filter(m => meals[m.id]?.logged).length;
  const onTrackCount = MEALS.filter(m => meals[m.id]?.logged && (meals[m.id]?.proTier === "Good" || meals[m.id]?.proTier === "High")).length;
  const calTotal     = totals.cal;
  const calPct       = Math.min(Math.round(calTotal / 2000 * 100), 100);
  const proPct       = Math.min(Math.round(totals.pro / 100 * 100), 100);

  const activeSlot = openSlot ? MEALS.find(m => m.id === openSlot) : null;

  return (
    <div>
      {/* Daily summary dashboard */}
      <div style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:20, padding:18, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.8px", textTransform:"uppercase", fontFamily:BC, marginBottom:14 }}>Today's Nutrition</div>

        {/* Meals logged */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:900, color: loggedCount >= 5 ? T.grn : loggedCount >= 3 ? T.gold : T.ink, fontFamily:BC, lineHeight:1 }}>{loggedCount}<span style={{ fontSize:16, color:T.dim, fontWeight:400 }}>/5</span></div>
            <div style={{ fontSize:12, color:T.mid, marginTop:4, fontWeight:600 }}>meals eaten</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:900, color: onTrackCount >= 4 ? T.grn : onTrackCount >= 2 ? T.gold : T.ink, fontFamily:BC, lineHeight:1 }}>{onTrackCount}<span style={{ fontSize:16, color:T.dim, fontWeight:400 }}>/5</span></div>
            <div style={{ fontSize:12, color:T.mid, marginTop:4, fontWeight:600 }}>20g+ protein</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:900, color: calPct >= 80 && calPct <= 110 ? T.grn : T.gold, fontFamily:BC, lineHeight:1 }}>{calPct}<span style={{ fontSize:16, color:T.dim, fontWeight:400 }}>%</span></div>
            <div style={{ fontSize:12, color:T.mid, marginTop:4, fontWeight:600 }}>cal target</div>
          </div>
        </div>

        {/* Progress bars */}
        <div style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:13, color:T.mid, fontWeight:600 }}>Est. Calories</span>
            <span style={{ fontSize:13, fontWeight:800, color:T.gold }}>{calTotal} <span style={{ color:T.fnt, fontWeight:400 }}>/ ~2000</span></span>
          </div>
          <div style={{ height:8, background:T.gBg, borderRadius:4, overflow:"hidden", border:`1px solid ${T.gBdr}` }}>
            <div style={{ height:"100%", width:`${calPct}%`, background:T.gold, borderRadius:4, transition:"width 0.6s" }}/>
          </div>
        </div>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:13, color:T.mid, fontWeight:600 }}>Est. Protein</span>
            <span style={{ fontSize:13, fontWeight:800, color:T.pur }}>{totals.pro}g <span style={{ color:T.fnt, fontWeight:400 }}>/ ~100g</span></span>
          </div>
          <div style={{ height:8, background:T.puBg, borderRadius:4, overflow:"hidden", border:`1px solid ${T.puBdr}` }}>
            <div style={{ height:"100%", width:`${proPct}%`, background:T.pur, borderRadius:4, transition:"width 0.6s" }}/>
          </div>
        </div>

        {/* Guidance note */}
        <div style={{ marginTop:14, padding:"10px 14px", background:T.bg, borderRadius:10, fontSize:12, color:T.dim, lineHeight:1.6 }}>
          💡 Goal: 5 meals · ~20g protein each · ~400 cal each · total ~2,000 cal
        </div>
      </div>

      {/* Meal slots */}
      {MEALS.map(meal => {
        const slot = meals[meal.id];
        const logged = slot?.logged;
        const pro = slot?.pro || (slot?.items?.reduce((a,i)=>a+(i.nutrients?.pro||0),0));
        const cal = slot?.cal || (slot?.items?.reduce((a,i)=>a+(i.nutrients?.cal||0),0));
        const proTier = slot?.proTier;
        const proColor = proTier==="High" ? T.grn : proTier==="Good" ? T.gold : proTier==="Low" ? T.red : T.mid;

        return (
          <div key={meal.id} style={{
            background: logged ? T.gnBg : T.card,
            border:`1.5px solid ${logged ? T.gnBdr : T.bdr}`,
            borderRadius:18, padding:16, marginBottom:12,
            transition:"all 0.25s", boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {/* Check circle */}
              <button onClick={() => logged ? clearSlot(meal.id) : setOpenSlot(meal.id)} style={{
                width:38, height:38, borderRadius:"50%", flexShrink:0,
                border:`2.5px solid ${logged ? T.grn : T.bdr}`,
                background: logged ? T.grn : "transparent",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontSize:18, fontWeight:900, transition:"all 0.2s",
              }}>{logged ? "✓" : ""}</button>

              <span style={{ fontSize:26 }}>{meal.icon}</span>

              <div style={{ flex:1 }}>
                <div style={{ fontSize:17, fontWeight:800, color: logged ? T.grn : T.ink }}>{meal.label}</div>
                {logged ? (
                  <div style={{ fontSize:13, marginTop:3 }}>
                    {proTier && <span style={{ color:proColor, fontWeight:700 }}>{proTier} protein</span>}
                    {proTier && cal ? <span style={{ color:T.dim }}> · </span> : null}
                    {cal ? <span style={{ color:T.gold, fontWeight:700 }}>{cal} cal</span> : null}
                    {slot.note ? <span style={{ color:T.dim }}> · {slot.note}</span> : null}
                  </div>
                ) : (
                  <div style={{ fontSize:13, color:T.dim, marginTop:3 }}>{meal.time}</div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                {logged && (
                  <button onClick={()=>setSaveFav({slot:meal, data:slot})} style={{ padding:"7px 10px", background:T.gBg, border:`1.5px solid ${T.gBdr}`, borderRadius:10, color:T.gold, fontSize:15, cursor:"pointer" }} title="Save favorite">⭐</button>
                )}
                <button onClick={()=>setOpenSlot(meal.id)} style={{ padding:"8px 14px", background:T.blBg, border:`1.5px solid ${T.blBdr}`, borderRadius:10, color:T.blu, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:BC }}>
                  {logged ? "EDIT" : "+ LOG"}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Quick log modal */}
      {activeSlot && (
        <QuickLogModal
          slot={activeSlot}
          onSave={(data) => { saveSlot(openSlot, data); setOpenSlot(null); }}
          onClose={() => setOpenSlot(null)}
        />
      )}

      {/* Save favorite modal */}
      {saveFavSlot && (
        <SaveFavoriteModal
          items={saveFavSlot.data.items || [{
            id: Date.now(), name: saveFavSlot.data.note || saveFavSlot.slot.label,
            qty:1, unit:"serving",
            nutrients:{ cal: saveFavSlot.data.cal||0, pro: saveFavSlot.data.pro||0, fib:0 }
          }]}
          slotLabel={saveFavSlot.slot.label}
          onClose={() => setSaveFav(null)}
        />
      )}
    </div>
  );
}
