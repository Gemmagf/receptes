import streamlit as st
from receptes_data import RECEPTES, CATEGORIES, DIFICULTATS

st.set_page_config(
    page_title="Receptes de Cuina",
    page_icon="🍽️",
    layout="wide",
)

# CSS personalitzat
st.markdown("""
<style>
    .recepta-card {
        background: #fff8f0;
        border-radius: 12px;
        padding: 1rem 1.2rem;
        margin-bottom: 0.8rem;
        border-left: 4px solid #d97706;
        cursor: pointer;
    }
    .recepta-card:hover {
        background: #fef3c7;
    }
    .recepta-num {
        font-size: 0.75rem;
        color: #92400e;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .recepta-nom {
        font-size: 1.05rem;
        font-weight: 700;
        color: #1c1917;
        margin: 0.2rem 0;
    }
    .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 4px;
    }
    .badge-cat { background: #e0f2fe; color: #0369a1; }
    .badge-facil { background: #dcfce7; color: #166534; }
    .badge-mitjana { background: #fef9c3; color: #854d0e; }
    .badge-dificil { background: #fee2e2; color: #991b1b; }
    .badge-temps { background: #f3e8ff; color: #6b21a8; }
    .badge-persones { background: #fce7f3; color: #9d174d; }
    .detall-seccio {
        background: #fffbeb;
        border-radius: 10px;
        padding: 1.2rem;
        margin-top: 0.8rem;
    }
    .ingredient-item {
        padding: 4px 0;
        border-bottom: 1px solid #fde68a;
        color: #44403c;
    }
    h1 { color: #92400e !important; }
</style>
""", unsafe_allow_html=True)

# --- Capçalera ---
st.title("🍽️ 1080 Receptes de Cuina")
st.caption("Basat en el clàssic de Simone Ortega · Cercat i filtrat en català")

st.divider()

# --- Sidebar: Filtres ---
with st.sidebar:
    st.header("🔍 Cerca i filtres")

    cerca = st.text_input("Cerca per nom", placeholder="p. ex. truita, pollastre...")

    st.subheader("Categoria")
    cats_sel = st.multiselect(
        "Selecciona categories",
        options=CATEGORIES,
        default=[],
        placeholder="Totes les categories",
    )

    st.subheader("Dificultat")
    difs_sel = st.multiselect(
        "Selecciona dificultat",
        options=DIFICULTATS,
        default=[],
        placeholder="Totes les dificultats",
    )

    st.subheader("Persones")
    max_persones = max(r["persones"] for r in RECEPTES)
    persones_rang = st.slider(
        "Nombre de persones",
        min_value=1,
        max_value=max_persones,
        value=(1, max_persones),
    )

    st.divider()
    st.caption(f"Total receptes al dataset: **{len(RECEPTES)}**")

# --- Filtrar receptes ---
def filtrar(receptes, cerca, cats, difs, persones_rang):
    resultat = receptes
    if cerca:
        terme = cerca.lower()
        resultat = [
            r for r in resultat
            if terme in r["nom"].lower()
            or any(terme in ing.lower() for ing in r["ingredients"])
        ]
    if cats:
        resultat = [r for r in resultat if r["categoria"] in cats]
    if difs:
        resultat = [r for r in resultat if r["dificultat"] in difs]
    resultat = [r for r in resultat if persones_rang[0] <= r["persones"] <= persones_rang[1]]
    return resultat

receptes_filtrades = filtrar(RECEPTES, cerca, cats_sel, difs_sel, persones_rang)

# --- Columnes principals ---
col_llista, col_detall = st.columns([1, 1.3], gap="large")

# Selecció de recepta
if "recepta_sel" not in st.session_state:
    st.session_state.recepta_sel = None

with col_llista:
    n = len(receptes_filtrades)
    if n == 0:
        st.warning("Cap recepta coincideix amb els filtres aplicats.")
    else:
        st.markdown(f"**{n} recepta{'es' if n != 1 else ''} trobada{'es' if n != 1 else ''}**")
        for r in receptes_filtrades:
            badge_dif = {
                "Fàcil": "facil", "Mitjana": "mitjana", "Difícil": "dificil"
            }.get(r["dificultat"], "facil")

            if st.button(
                f"**#{r['num']}** {r['nom']}",
                key=f"btn_{r['num']}",
                use_container_width=True,
            ):
                st.session_state.recepta_sel = r["num"]

            meta = (
                f"<span class='badge badge-cat'>{r['categoria']}</span>"
                f"<span class='badge badge-{badge_dif}'>{r['dificultat']}</span>"
                f"<span class='badge badge-temps'>⏱ {r['temps']}</span>"
                f"<span class='badge badge-persones'>👥 {r['persones']} p.</span>"
            )
            st.markdown(meta, unsafe_allow_html=True)
            st.markdown("---")

# --- Detall de la recepta seleccionada ---
with col_detall:
    sel = st.session_state.recepta_sel
    if sel is None:
        st.info("👈 Fes clic sobre una recepta per veure'n els detalls.")
    else:
        r = next((x for x in RECEPTES if x["num"] == sel), None)
        if r:
            badge_dif = {
                "Fàcil": "facil", "Mitjana": "mitjana", "Difícil": "dificil"
            }.get(r["dificultat"], "facil")

            st.markdown(f"### #{r['num']} — {r['nom']}")
            meta = (
                f"<span class='badge badge-cat'>{r['categoria']}</span>"
                f"<span class='badge badge-{badge_dif}'>{r['dificultat']}</span>"
                f"<span class='badge badge-temps'>⏱ {r['temps']}</span>"
                f"<span class='badge badge-persones'>👥 {r['persones']} persones</span>"
            )
            st.markdown(meta, unsafe_allow_html=True)

            st.markdown("#### 🧾 Ingredients")
            with st.container():
                for ing in r["ingredients"]:
                    st.markdown(
                        f"<div class='ingredient-item'>• {ing}</div>",
                        unsafe_allow_html=True,
                    )

            st.markdown("#### 👨‍🍳 Preparació")
            st.markdown(
                f"<div class='detall-seccio'>{r['instruccions']}</div>",
                unsafe_allow_html=True,
            )
