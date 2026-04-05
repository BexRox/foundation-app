import { useState, useRef } from "react";

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

const MEAL_SLOTS = [
  { id:"breakfast", label:"Breakfast",       icon:"🌅", timeHint:"7–9am"  },
  { id:"snack1",    label:"Morning Snack",   icon:"🥜", timeHint:"10–11am"},
  { id:"lunch",     label:"Lunch",           icon:"🥗", timeHint:"12–1pm" },
  { id:"snack2",    label:"Afternoon Snack", icon:"🍎", timeHint:"3–4pm"  },
  { id:"dinner",    label:"Dinner",          icon:"🍽️", timeHint:"6–8pm"  },
];

const TARGETS = { cal: 2000, pro: 120, fib: 35, carb: 200, fat: 65 };

// Convert USDA per-100g data to actual serving
function scaleNutrients(per100g, servingSize, servingUnit, qty, unit) {
  // Approximate unit conversions to grams
  const unitToG = {
    g: 1, oz: 28.3, cup: 240, tbsp: 15, tsp: 5,
    piece: servingSize || 100, serving: servingSize || 100, slice: 30,
  };
  const grams = (qty || 1) * (unitToG[unit] || unitToG[servingUnit] || servingSize || 100);
  const factor = grams / 100;
  return {
    cal:  Math.round((per100g.cal  || 0) * factor),
    pro:  Math.round((per100g.pro  || 0) * factor * 10) / 10,
    fib:  Math.round((per100g.fib  || 0) * factor * 10) / 10,
    carb: Math.round((per100g.carb || 0) * factor * 10) / 10,
    fat:  Math.round((per100g.fat  || 0) * factor * 10) / 10,
  };
}

async function searchFood(query) {
  const res = await fetch("/.netlify/functions/nutrition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "search", query }),
  });
  const data = await res.json();
  return data.foods || [];
}

async function parseNaturalLanguage(text) {
  const res = await fetch("/.netlify/functions/nutrition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "parse", query: text }),
  });
  return await res.json();
}

function MacroBar({ label, value, max, color, bg }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:13, color:T.mid, fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:800, color }}>
          {value}<span style={{ color:T.fnt, fontWeight:400 }}>/{max}{label==="Calories"?"":"g"}</span>
        </span>
      </div>
      <div style={{ height:8, background:bg||T.bdr, borderRadius:4, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${Math.min(value/max*100,100)}%`, background:color, borderRadius:4, transition:"width 0.5s" }}/>
      </div>
    </div>
  );
}

function FoodSearchModal({ slotId, slotLabel, onAdd, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("serving");
  const inputRef = useRef(null);

  async function doSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSelected(null);
    try {
      const foods = await searchFood(query);
      setResults(foods);
    } catch { setResults([]); }
    setSearching(false);
  }

  async function doSmartAdd() {
    // Natural language: "2 eggs and a cup of greek yogurt"
    setParsing(true);
    try {
      const parsed = await parseNaturalLanguage(query);
      const items = parsed.items || [];
      for (const item of items) {
        const foods = await searchFood(item.query);
        if (foods.length > 0) {
          const food = foods[0];
          const nutrients = scaleNutrients(food.per100g, food.servingSize, food.servingUnit, item.qty, item.unit);
          onAdd({
            id: Date.now() + Math.random(),
            name: item.displayName || food.name,
            brand: food.brand,
            qty: item.qty,
            unit: item.unit,
            nutrients,
          });
        }
      }
      onClose();
    } catch (e) { console.error(e); }
    setParsing(false);
  }

  function confirmAdd() {
    if (!selected) return;
    const nutrients = scaleNutrients(selected.per100g, selected.servingSize, selected.servingUnit, parseFloat(qty) || 1, unit);
    onAdd({
      id: Date.now(),
      name: selected.name,
      brand: selected.brand,
      qty: parseFloat(qty) || 1,
      unit,
      nutrients,
    });
    setSelected(null);
    setQuery("");
    setResults([]);
    setQty("1");
    setUnit("serving");
  }

  const units = ["serving","g","oz","cup","tbsp","tsp","piece","slice"];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:T.sur, borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ padding:"16px 18px 12px", borderBottom:`1px solid ${T.bdr}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:T.ink }}>Add Food</div>
            <div style={{ fontSize:13, color:T.dim }}>{slotLabel}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:24, color:T.dim, cursor:"pointer" }}>×</button>
        </div>

        <div style={{ padding:"16px 18px", overflowY:"auto", flex:1 }}>
          {/* Search input */}
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="Search food or describe what you ate..."
              style={{ flex:1, padding:"13px 16px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.ink, fontSize:15, fontFamily:"inherit", outline:"none" }}
            />
            <button onClick={doSearch} disabled={searching} style={{ padding:"13px 18px", background:T.blu, border:"none", borderRadius:12, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>
              {searching ? "..." : "SEARCH"}
            </button>
          </div>

          {/* Smart add button */}
          <button onClick={doSmartAdd} disabled={parsing || !query.trim()} style={{ width:"100%", padding:"12px", marginBottom:16, background:parsing?T.bdr:T.gnBg, border:`1.5px solid ${T.gnBdr}`, borderRadius:12, color:parsing?T.dim:T.grn, fontSize:14, fontWeight:700, cursor:parsing?"default":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {parsing ? "⏳ Parsing your meal..." : "✨ Smart Add — describe what you ate naturally"}
          </button>

          {/* Selected food detail */}
          {selected && (
            <div style={{ background:T.gnBg, border:`1.5px solid ${T.gnBdr}`, borderRadius:14, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:15, fontWeight:800, color:T.ink, marginBottom:2 }}>{selected.name}</div>
              {selected.brand && <div style={{ fontSize:12, color:T.dim, marginBottom:10 }}>{selected.brand}</div>}
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <input type="number" step="0.5" min="0.1" value={qty} onChange={e => setQty(e.target.value)}
                  style={{ width:70, padding:"10px 12px", background:T.sur, border:`2px solid ${T.bdr}`, borderRadius:10, color:T.ink, fontSize:16, fontFamily:"inherit", outline:"none", fontWeight:700, textAlign:"center" }}
                />
                <select value={unit} onChange={e => setUnit(e.target.value)} style={{ flex:1, padding:"10px 12px", background:T.sur, border:`2px solid ${T.bdr}`, borderRadius:10, color:T.ink, fontSize:15, fontFamily:"inherit", outline:"none" }}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {/* Live nutrient preview */}
              {(() => {
                const n = scaleNutrients(selected.per100g, selected.servingSize, selected.servingUnit, parseFloat(qty)||1, unit);
                return (
                  <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                    {[{l:"Cal",v:n.cal,c:T.gold},{l:"Pro",v:n.pro+"g",c:T.pur},{l:"Fib",v:n.fib+"g",c:T.grn},{l:"Carb",v:n.carb+"g",c:T.blu},{l:"Fat",v:n.fat+"g",c:T.org}].map(m=>(
                      <div key={m.l} style={{ flex:1, textAlign:"center", background:T.sur, borderRadius:8, padding:"6px 2px" }}>
                        <div style={{ fontSize:14, fontWeight:800, color:m.c }}>{m.v}</div>
                        <div style={{ fontSize:10, color:T.dim, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700 }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={confirmAdd} style={{ flex:1, padding:"12px", background:T.grn, border:"none", borderRadius:10, color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.5px" }}>ADD TO LOG</button>
                <button onClick={()=>setSelected(null)} style={{ padding:"12px 16px", background:T.bg, border:`1.5px solid ${T.bdr}`, borderRadius:10, color:T.mid, fontSize:15, cursor:"pointer" }}>✕</button>
              </div>
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && !selected && (
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"'Barlow Condensed',sans-serif", marginBottom:8 }}>
                {results.length} results — tap to add
              </div>
              {results.map(food => (
                <button key={food.fdcId} onClick={() => { setSelected(food); setUnit(food.servingUnit==="g"?"serving":food.servingUnit||"serving"); }} style={{ width:"100%", padding:"12px 14px", marginBottom:8, background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:12, textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{food.name}</div>
                    <div style={{ fontSize:11, color:T.dim, marginTop:2 }}>{food.brand || food.dataType} · per {food.servingSize||100}{food.servingUnit||"g"}</div>
                  </div>
                  <div style={{ textAlign:"right", marginLeft:10, flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:T.gold }}>{food.per100g.cal||0}<span style={{ fontSize:10, color:T.dim }}>cal</span></div>
                    <div style={{ fontSize:11, color:T.pur }}>{food.per100g.pro||0}g pro</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.length === 0 && !searching && query && (
            <div style={{ textAlign:"center", padding:"20px 0", color:T.dim, fontSize:14 }}>
              No results. Try a simpler search term or use Smart Add.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FuelTab({ day, upd, ctx }) {
  const [openSlot, setOpenSlot] = useState(null);
  const mealData = day.meals || {};

  function addFoodToSlot(slotId, foodEntry) {
    const slot = mealData[slotId] || { items: [] };
    const updated = { ...mealData, [slotId]: { ...slot, items: [...(slot.items||[]), foodEntry] } };
    upd("meals", updated);
  }

  function removeFoodFromSlot(slotId, itemId) {
    const slot = mealData[slotId] || { items: [] };
    const updated = { ...mealData, [slotId]: { ...slot, items: (slot.items||[]).filter(i => i.id !== itemId) } };
    upd("meals", updated);
  }

  // Calculate totals
  const totals = { cal:0, pro:0, fib:0, carb:0, fat:0 };
  for (const slot of Object.values(mealData)) {
    for (const item of (slot.items||[])) {
      totals.cal  += item.nutrients?.cal  || 0;
      totals.pro  += item.nutrients?.pro  || 0;
      totals.fib  += item.nutrients?.fib  || 0;
      totals.carb += item.nutrients?.carb || 0;
      totals.fat  += item.nutrients?.fat  || 0;
    }
  }
  totals.pro  = Math.round(totals.pro  * 10) / 10;
  totals.fib  = Math.round(totals.fib  * 10) / 10;
  totals.carb = Math.round(totals.carb * 10) / 10;
  totals.fat  = Math.round(totals.fat  * 10) / 10;

  const snacking = (mealData.snack1?.items||[]).length === 0 && (mealData.snack2?.items||[]).length === 0
    && ((mealData.breakfast?.items||[]).length > 0 || (mealData.lunch?.items||[]).length > 0);

  return (
    <div>
      {/* Daily macros dashboard */}
      <div style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:20, padding:18, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:11, fontWeight:800, color:T.dim, letterSpacing:"1.8px", textTransform:"uppercase", fontFamily:"'Barlow Condensed',sans-serif", marginBottom:14 }}>Daily Totals</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { l:"Calories", v:totals.cal,  max:TARGETS.cal,  c:T.gold, bg:T.gBg  },
            { l:"Protein",  v:totals.pro,  max:TARGETS.pro,  c:T.pur,  bg:T.puBg },
            { l:"Fiber",    v:totals.fib,  max:TARGETS.fib,  c:T.grn,  bg:T.gnBg },
          ].map(m => (
            <div key={m.l} style={{ background:m.v>=m.max?m.bg:T.bg, border:`1.5px solid ${m.v>=m.max?T.gnBdr:T.bdr}`, borderRadius:14, padding:"12px 10px", textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:900, color:m.c, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1 }}>{m.v}</div>
              <div style={{ fontSize:10, color:T.mid, textTransform:"uppercase", letterSpacing:"0.5px", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, marginTop:3 }}>{m.l}</div>
              <div style={{ fontSize:10, color:T.fnt, marginBottom:6 }}>/{m.max}{m.l==="Calories"?"":""}</div>
              <div style={{ height:4, background:T.bdr, borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(m.v/m.max*100,100)}%`, background:m.c, borderRadius:2, transition:"width 0.5s" }}/>
              </div>
            </div>
          ))}
        </div>
        <MacroBar label="Carbs" value={totals.carb} max={TARGETS.carb} color={T.blu} bg={T.blBg}/>
        <MacroBar label="Fat"   value={totals.fat}  max={TARGETS.fat}  color={T.org} bg={T.ogBg}/>

        {/* Remaining */}
        <div style={{ display:"flex", gap:8, marginTop:4, paddingTop:12, borderTop:`1px solid ${T.bdr}` }}>
          {[
            { l:"Cal left",  v: Math.max(0, TARGETS.cal - totals.cal),  c:T.gold },
            { l:"Pro left",  v: Math.max(0, TARGETS.pro - totals.pro).toFixed(0)+"g",  c:T.pur  },
            { l:"Fib left",  v: Math.max(0, TARGETS.fib - totals.fib).toFixed(0)+"g",  c:T.grn  },
          ].map(s => (
            <div key={s.l} style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:800, color:s.c, fontFamily:"'Barlow Condensed',sans-serif" }}>{s.v}</div>
              <div style={{ fontSize:10, color:T.dim, fontWeight:600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Snack warning */}
      {snacking && (
        <div style={{ background:T.rdBg, border:`1.5px solid ${T.rdBdr}`, borderLeft:`4px solid ${T.red}`, borderRadius:"0 14px 14px 14px", padding:"13px 16px", marginBottom:16 }}>
          <p style={{ margin:0, fontSize:14, color:T.ink, fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:1.7 }}>
            No snacks logged yet. This is your known pattern — Lexapro suppresses hunger signals. Log a snack now to prevent the dinner blowup.
          </p>
        </div>
      )}

      {/* Meal slots */}
      {MEAL_SLOTS.map(slot => {
        const slotItems = mealData[slot.id]?.items || [];
        const slotTotals = slotItems.reduce((a, item) => ({
          cal:  a.cal  + (item.nutrients?.cal  || 0),
          pro:  a.pro  + (item.nutrients?.pro  || 0),
          fib:  a.fib  + (item.nutrients?.fib  || 0),
        }), { cal:0, pro:0, fib:0 });
        const hasFood = slotItems.length > 0;

        return (
          <div key={slot.id} style={{ background:hasFood?T.gnBg:T.card, border:`1.5px solid ${hasFood?T.gnBdr:T.bdr}`, borderRadius:18, padding:16, marginBottom:12, transition:"all 0.3s", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            {/* Slot header */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:hasFood?10:0 }}>
              <span style={{ fontSize:26 }}>{slot.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:17, fontWeight:800, color:hasFood?T.grn:T.ink }}>{slot.label}</div>
                <div style={{ fontSize:12, color:T.dim }}>
                  {hasFood ? `${slotTotals.cal} cal · ${slotTotals.pro.toFixed(1)}g protein · ${slotTotals.fib.toFixed(1)}g fiber` : slot.timeHint}
                </div>
              </div>
              <button onClick={() => setOpenSlot(slot.id)} style={{ padding:"8px 14px", background:T.blBg, border:`1.5px solid ${T.blBdr}`, borderRadius:10, color:T.blu, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif" }}>
                + ADD
              </button>
            </div>

            {/* Food items */}
            {slotItems.map(item => (
              <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderTop:`1px solid ${T.bdr}` }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:T.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {item.qty} {item.unit} {item.name}
                  </div>
                  {item.brand && <div style={{ fontSize:11, color:T.dim }}>{item.brand}</div>}
                  <div style={{ fontSize:12, color:T.mid, marginTop:1 }}>
                    <span style={{ color:T.gold, fontWeight:700 }}>{item.nutrients?.cal||0}</span> cal ·{" "}
                    <span style={{ color:T.pur, fontWeight:700 }}>{item.nutrients?.pro||0}g</span> pro ·{" "}
                    <span style={{ color:T.grn, fontWeight:700 }}>{item.nutrients?.fib||0}g</span> fib
                  </div>
                </div>
                <button onClick={() => removeFoodFromSlot(slot.id, item.id)} style={{ background:"none", border:"none", color:T.fnt, fontSize:20, cursor:"pointer", padding:"0 4px", flexShrink:0 }}>×</button>
              </div>
            ))}
          </div>
        );
      })}

      {/* Food search modal */}
      {openSlot && (
        <FoodSearchModal
          slotId={openSlot}
          slotLabel={MEAL_SLOTS.find(s => s.id === openSlot)?.label || ""}
          onAdd={(food) => addFoodToSlot(openSlot, food)}
          onClose={() => setOpenSlot(null)}
        />
      )}
    </div>
  );
}
