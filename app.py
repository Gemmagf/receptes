import json
import re
from datetime import datetime
from pathlib import Path

import streamlit as st

from receptes_data import CATEGORIES, DIFICULTATS, RECEPTES, TIPUS_INGREDIENTS

st.set_page_config(
    page_title="Receptes de Cuina",
    page_icon="🍽️",
    layout="wide",
)

# ── CSS ──────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 4px;
        margin-bottom: 2px;
    }
    .badge-cat     { background: #e0f2fe; color: #0369a1; }
    .badge-facil   { background: #dcfce7; color: #166534; }
    .badge-mitjana { background: #fef9c3; color: #854d0e; }
    .badge-dificil { background: #fee2e2; color: #991b1b; }
    .badge-temps   { background: #f3e8ff; color: #6b21a8; }
    .badge-persones{ background: #fce7f3; color: #9d174d; }
    .badge-tipus   { background: #fff7ed; color: #c2410c; }
    .ing-original  { color: #44403c; padding: 3px 0; border-bottom: 1px solid #fde68a; }
    .ing-escalat   { color: #065f46; font-weight: 600; padding: 3px 0; border-bottom: 1px solid #a7f3d0; }
    .ing-noescala  { color: #78716c; font-style: italic; padding: 3px 0; border-bottom: 1px solid #e7e5e4; }
    .detall-seccio { background: #fffbeb; border-radius: 10px; padding: 1.2rem; }
    .log-entry     { background: #f0fdf4; border-radius: 8px; padding: 0.8rem 1rem;
                     margin-bottom: 0.5rem; border-left: 3px solid #16a34a; }
    .log-data      { font-size: 0.75rem; color: #6b7280; }
    .log-nota      { margin-top: 4px; color: #1c1917; }
    .estrella      { color: #f59e0b; font-size: 1rem; }
    h1 { color: #92400e !important; }
</style>
""", unsafe_allow_html=True)

# ── Log persistent ────────────────────────────────────────────────────────────
LOG_FILE = Path(__file__).parent / "log_modificacions.json"

def carregar_log() -> dict:
    if LOG_FILE.exists():
        try:
            with open(LOG_FILE, encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return {}
    return {}

def desar_log(log: dict) -> None:
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

if "log" not in st.session_state:
    st.session_state.log = carregar_log()

# ── Escalat d'ingredients ────────────────────────────────────────────────────
def _formatar_num(n: float) -> str:
    """Formata un número de manera llegible: evita decimals innecessaris."""
    if n <= 0:
        return "?"
    if n >= 10:
        return str(round(n))
    # Arrodonir a la mitja unitat més propera per nombres petits
    arrodonit = round(n * 2) / 2
    if arrodonit == int(arrodonit):
        return str(int(arrodonit))
    return str(arrodonit)

def escalar_ingredient(ingredient: str, factor: float) -> tuple[str, bool]:
    """
    Retorna (ingredient_escalat, s'ha_pogut_escalar).
    Intenta detectar el número inicial i multiplicar-lo pel factor.
    """
    if abs(factor - 1.0) < 0.01:
        return ingredient, True

    m = re.match(r'^(\d+(?:[.,]\d+)?)\s*(.*)', ingredient.strip())
    if not m:
        return ingredient, False  # sense número → no es pot escalar

    num = float(m.group(1).replace(",", "."))
    resta = m.group(2)
    escalat = num * factor
    return f"{_formatar_num(escalat)} {resta}".strip(), True

# ── Filtres ───────────────────────────────────────────────────────────────────
def filtrar(receptes, cerca, cats, difs, persones_rang, tipus_sel):
    res = receptes
    if cerca:
        terme = cerca.lower()
        res = [
            r for r in res
            if terme in r["nom"].lower()
            or any(terme in ing.lower() for ing in r["ingredients"])
        ]
    if cats:
        res = [r for r in res if r["categoria"] in cats]
    if difs:
        res = [r for r in res if r["dificultat"] in difs]
    res = [r for r in res if persones_rang[0] <= r["persones"] <= persones_rang[1]]
    if tipus_sel:
        res = [r for r in res if any(t in r["tipus_ingredients"] for t in tipus_sel)]
    return res

# ── Helpers de badges ─────────────────────────────────────────────────────────
def badge_dif_class(dif):
    return {"Fàcil": "facil", "Mitjana": "mitjana", "Difícil": "dificil"}.get(dif, "facil")

def badges_meta(r):
    bd = badge_dif_class(r["dificultat"])
    tipus_html = "".join(f"<span class='badge badge-tipus'>{t}</span>" for t in r["tipus_ingredients"])
    return (
        f"<span class='badge badge-cat'>{r['categoria']}</span>"
        f"<span class='badge badge-{bd}'>{r['dificultat']}</span>"
        f"<span class='badge badge-temps'>⏱ {r['temps']}</span>"
        f"<span class='badge badge-persones'>👥 {r['persones']} p.</span><br>"
        + tipus_html
    )

# ── Capçalera ─────────────────────────────────────────────────────────────────
st.title("🍽️ 1080 Receptes de Cuina")
st.caption("Basat en el clàssic de Simone Ortega · En català")
st.divider()

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.header("🔍 Cerca i filtres")

    cerca = st.text_input("Cerca per nom o ingredient",
                          placeholder="p. ex. truita, pollastre, tonyina...")

    st.subheader("Categoria")
    cats_sel = st.multiselect("Categories", options=CATEGORIES, default=[],
                              placeholder="Totes")

    st.subheader("Tipus d'ingredient")
    tipus_sel = st.multiselect("Conté...", options=TIPUS_INGREDIENTS, default=[],
                               placeholder="Tots els tipus")

    st.subheader("Dificultat")
    difs_sel = st.multiselect("Dificultat", options=DIFICULTATS, default=[],
                              placeholder="Totes")

    st.subheader("Persones (recepta original)")
    max_p = max(r["persones"] for r in RECEPTES)
    persones_rang = st.slider("Rang", min_value=1, max_value=max_p,
                              value=(1, max_p))

    st.divider()
    st.caption(f"Total al dataset: **{len(RECEPTES)}** receptes")

# ── Estat de sessió ───────────────────────────────────────────────────────────
if "recepta_sel" not in st.session_state:
    st.session_state.recepta_sel = None

# ── Filtrar ───────────────────────────────────────────────────────────────────
receptes_filtrades = filtrar(
    RECEPTES, cerca, cats_sel, difs_sel, persones_rang, tipus_sel
)

# ── Layout principal ──────────────────────────────────────────────────────────
col_llista, col_detall = st.columns([1, 1.4], gap="large")

# ── Llista de receptes ────────────────────────────────────────────────────────
with col_llista:
    n = len(receptes_filtrades)
    if n == 0:
        st.warning("Cap recepta coincideix amb els filtres.")
    else:
        st.markdown(f"**{n} recepta{'es' if n != 1 else ''} trobada{'es' if n != 1 else ''}**")
        for r in receptes_filtrades:
            has_notes = bool(st.session_state.log.get(str(r["num"])))
            label = f"**#{r['num']}** {r['nom']}" + (" 📝" if has_notes else "")
            if st.button(label, key=f"btn_{r['num']}", use_container_width=True):
                st.session_state.recepta_sel = r["num"]
            st.markdown(badges_meta(r), unsafe_allow_html=True)
            st.markdown("---")

# ── Detall ────────────────────────────────────────────────────────────────────
with col_detall:
    sel = st.session_state.recepta_sel
    if sel is None:
        st.info("👈 Fes clic sobre una recepta per veure'n els detalls.")
        st.stop()

    r = next((x for x in RECEPTES if x["num"] == sel), None)
    if r is None:
        st.stop()

    st.markdown(f"### #{r['num']} — {r['nom']}")
    st.markdown(badges_meta(r), unsafe_allow_html=True)
    st.markdown("")

    # ── Adaptació per comensals ───────────────────────────────────────────────
    with st.expander("👥 Adaptar a un altre nombre de comensals", expanded=True):
        comensals = st.number_input(
            "Comensals",
            min_value=1, max_value=50,
            value=r["persones"],
            step=1,
            key=f"comensals_{r['num']}",
        )
        factor = comensals / r["persones"]

        if abs(factor - 1.0) > 0.01:
            st.caption(
                f"Factor: ×{factor:.2f} — recepta original per {r['persones']} persones"
            )

        st.markdown("**Ingredients adaptats:**")
        no_escalats = []
        for ing in r["ingredients"]:
            ing_escalat, ok = escalar_ingredient(ing, factor)
            if ok and abs(factor - 1.0) > 0.01:
                st.markdown(
                    f"<div class='ing-escalat'>✓ {ing_escalat}</div>",
                    unsafe_allow_html=True,
                )
            elif not ok:
                no_escalats.append(ing)
                st.markdown(
                    f"<div class='ing-noescala'>~ {ing}</div>",
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    f"<div class='ing-original'>• {ing}</div>",
                    unsafe_allow_html=True,
                )
        if no_escalats and abs(factor - 1.0) > 0.01:
            st.caption("~ Els ingredients en cursiva no porten quantitat i no s'han escalat.")

    # ── Preparació ───────────────────────────────────────────────────────────
    st.markdown("#### 👨‍🍳 Preparació")
    st.markdown(
        f"<div class='detall-seccio'>{r['instruccions']}</div>",
        unsafe_allow_html=True,
    )

    st.divider()

    # ── Log de modificacions ──────────────────────────────────────────────────
    st.markdown("#### 📝 El meu registre de proves")

    key = str(r["num"])
    entrades = st.session_state.log.get(key, [])

    # Mostrar entrades existents
    if entrades:
        for e in reversed(entrades):
            estrelles = "★" * e.get("valoracio", 0) + "☆" * (5 - e.get("valoracio", 0))
            st.markdown(
                f"<div class='log-entry'>"
                f"<div class='log-data'>{e['data']} &nbsp;·&nbsp; "
                f"<span class='estrella'>{estrelles}</span></div>"
                f"<div class='log-nota'>{e['nota']}</div>"
                f"</div>",
                unsafe_allow_html=True,
            )
    else:
        st.caption("Encara no hi ha cap nota per aquesta recepta.")

    # Formulari per afegir nota
    with st.form(key=f"form_nota_{r['num']}", clear_on_submit=True):
        st.markdown("**Afegir nova nota**")
        nova_nota = st.text_area(
            "Què has provat? Quines modificacions has fet?",
            placeholder="p. ex. he afegit romaní i el resultat ha estat molt millor...",
            height=90,
        )
        valoracio = st.select_slider(
            "Valoració",
            options=[1, 2, 3, 4, 5],
            value=4,
            format_func=lambda x: "★" * x + "☆" * (5 - x),
        )
        enviar = st.form_submit_button("Desar nota", use_container_width=True)

    if enviar and nova_nota.strip():
        nova_entrada = {
            "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "nota": nova_nota.strip(),
            "valoracio": valoracio,
        }
        if key not in st.session_state.log:
            st.session_state.log[key] = []
        st.session_state.log[key].append(nova_entrada)
        desar_log(st.session_state.log)
        st.success("Nota desada!")
        st.rerun()
    elif enviar:
        st.warning("Escriu alguna cosa abans de desar.")

    # Opció d'esborrar tot el log d'aquesta recepta
    if entrades:
        if st.button("🗑️ Esborrar totes les notes d'aquesta recepta",
                     key=f"del_{r['num']}"):
            st.session_state.log.pop(key, None)
            desar_log(st.session_state.log)
            st.rerun()
