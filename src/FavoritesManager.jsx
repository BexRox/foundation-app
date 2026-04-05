import { useState } from "react";

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
const FAV_KEY = "fnd_favorites_v1";

export function loadFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
}

export function saveFavorites(favs) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch {}
}

export function SaveFavoriteModal({ items, slotLabel, onClose }) {
  const [name, setName] = useState(slotLabel || "");
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState(false);

  const totalNutrients = items.reduce((a, item) => ({
    cal:  a.cal  + (item.nutrients?.cal  || 0),
    pro:  a.pro  + (item.nutrients?.pro  || 0),
    fib:  a.fib  + (item.nutrients?.fib  || 0),
    carb: a.carb + (item.nutrients?.carb || 0),
    fat:  a.fat  + (item.nutrients?.fat  || 0),
  }), { cal:0, pro:0, fib:0, carb:0, fat:0 });

  function save() {
    const favs = loadFavorites();
    favs.unshift({
      id: Date.now(),
      name: name || slotLabel,
      url: url || null,
      items,
      nutrients: totalNutrients,
      savedAt: new Date().toISOString(),
    });
    saveFavorites(favs);
    setSaved(true);
    setTimeout(onClose, 800);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:T.sur, borderRadius:20, padding:24, width:"100%", maxWidth:400 }}>
        <div style={{ fontSize:18, fontWeight:800, color:T.ink, marginBottom:4 }}>Save as Favorite</div>
        <div style={{ fontSize:13, color:T.dim, marginBottom:16 }}>{items.length} item{items.length!==1?"s":""} · {totalNutrients.cal} cal · {totalNutrients.pro.toFixed(0)}g protein</div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:13, color:T.mid, fontWeight:600, marginBottom:6 }}>Meal name</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Post-workout Greek yogurt bowl"
            style={{ width:"100%", padding:"12px 14px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.ink, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
          />
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, color:T.mid, fontWeight:600, marginBottom:6 }}>Recipe URL <span style={{ color:T.fnt, fontWeight:400 }}>(optional)</span></div>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."
            style={{ width:"100%", padding:"12px 14px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.ink, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
          />
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={save} style={{ flex:1, padding:"14px", border:"none", borderRadius:12, background:saved?T.grn:T.gold, color:saved?"#fff":T.ink, fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:BC, letterSpacing:"0.5px", transition:"all 0.3s" }}>
            {saved ? "✓ SAVED!" : "SAVE FAVORITE"}
          </button>
          <button onClick={onClose} style={{ padding:"14px 18px", background:T.bg, border:`2px solid ${T.bdr}`, borderRadius:12, color:T.mid, fontSize:15, cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function FavoritesPanel({ onSelectFavorite, onClose }) {
  const [favs, setFavs] = useState(loadFavorites);
  const [confirmDelete, setConfirmDelete] = useState(null);

  function deleteFav(id) {
    const updated = favs.filter(f => f.id !== id);
    saveFavorites(updated);
    setFavs(updated);
    setConfirmDelete(null);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:T.sur, borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 18px 12px", borderBottom:`1px solid ${T.bdr}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:18, fontWeight:800, color:T.ink }}>⭐ Favorite Meals</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:24, color:T.dim, cursor:"pointer" }}>×</button>
        </div>

        <div style={{ overflowY:"auto", padding:16, flex:1 }}>
          {favs.length === 0 ? (
            <div style={{ textAlign:"center", padding:"30px 20px", color:T.dim }}>
              <div style={{ fontSize:36, marginBottom:12 }}>⭐</div>
              <div style={{ fontSize:15, fontWeight:600 }}>No favorites yet</div>
              <div style={{ fontSize:13, marginTop:6 }}>Log a meal and tap "Save as Favorite" to add it here</div>
            </div>
          ) : favs.map(fav => (
            <div key={fav.id} style={{ background:T.card, border:`1.5px solid ${T.bdr}`, borderRadius:16, padding:16, marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:16, fontWeight:800, color:T.ink }}>{fav.name}</div>
                  <div style={{ fontSize:12, color:T.dim, marginTop:2 }}>{fav.items?.length||0} items</div>
                </div>
                <button onClick={()=>setConfirmDelete(fav.id)} style={{ background:"none", border:"none", color:T.fnt, fontSize:18, cursor:"pointer", padding:"0 4px" }}>×</button>
              </div>

              {/* Macros */}
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                {[
                  {l:"Cal", v:fav.nutrients?.cal||0, c:T.gold},
                  {l:"Pro", v:(fav.nutrients?.pro||0).toFixed(0)+"g", c:T.pur},
                  {l:"Fib", v:(fav.nutrients?.fib||0).toFixed(0)+"g", c:T.grn},
                  {l:"Carb",v:(fav.nutrients?.carb||0).toFixed(0)+"g",c:T.blu},
                ].map(m=>(
                  <div key={m.l} style={{ flex:1, textAlign:"center", background:T.bg, borderRadius:8, padding:"6px 2px" }}>
                    <div style={{ fontSize:14, fontWeight:800, color:m.c }}>{m.v}</div>
                    <div style={{ fontSize:10, color:T.dim, fontFamily:BC, fontWeight:700 }}>{m.l}</div>
                  </div>
                ))}
              </div>

              {/* Items list */}
              <div style={{ marginBottom:10 }}>
                {(fav.items||[]).map((item,i) => (
                  <div key={i} style={{ fontSize:12, color:T.mid, paddingBottom:2 }}>
                    {item.qty} {item.unit} {item.name}
                  </div>
                ))}
              </div>

              {/* Recipe link */}
              {fav.url && (
                <a href={fav.url} target="_blank" rel="noopener noreferrer" style={{ display:"block", fontSize:12, color:T.blu, textDecoration:"none", marginBottom:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  🔗 {fav.url}
                </a>
              )}

              {confirmDelete === fav.id ? (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>deleteFav(fav.id)} style={{ flex:1, padding:"10px", background:T.red, border:"none", borderRadius:10, color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer" }}>Delete</button>
                  <button onClick={()=>setConfirmDelete(null)} style={{ flex:1, padding:"10px", background:T.bg, border:`1.5px solid ${T.bdr}`, borderRadius:10, color:T.mid, fontSize:13, cursor:"pointer" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={()=>onSelectFavorite(fav)} style={{ width:"100%", padding:"11px", background:T.gnBg, border:`1.5px solid ${T.gnBdr}`, borderRadius:10, color:T.grn, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:BC, letterSpacing:"0.5px" }}>
                  + ADD TO MEAL
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
