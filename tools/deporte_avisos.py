"""
⚽ Avisos de «mis equipos» (21 nov. 2026)
  python3 tools/deporte_avisos.py dia        → la mañana del partido: «📣 ¡Hoy juega X!» (bombos y trompetas)
  python3 tools/deporte_avisos.py resultado  → cuando aparece el resultado: «🏆 Final: X 3 – 1 Y» (ovación y aplausos)

Cada equipo seguido es un tema push «eq-xxxxxxxx» (tema_equipo en tools/push.py = dpTema en web/mejoras.js).
Se manda al tema de los dos equipos del partido; a quien no siga a ninguno no le llega nada.
Lo ya avisado se apunta en deporte/avisos_enviados.json para no repetir.
Los resultados solo se avisan si el partido es de los últimos 3 días (así no salta nada viejo).
"""
import datetime as dt, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from push import enviar_equipo, tema_equipo

RAIZ = os.path.join(os.path.dirname(__file__), "..")
PARTIDOS = os.path.join(RAIZ, "deporte", "partidos.json")
ESTADO = os.path.join(RAIZ, "deporte", "avisos_enviados.json")
ICO = {"futbol": "⚽", "balonc": "🏀", "balonm": "🤾", "pelota": "🔴", "fsala": "⚽"}
MAX = 400   # tope de avisos por pasada (por si algo se descontrola)


def hoy():
    try:
        from zoneinfo import ZoneInfo
        return dt.datetime.now(ZoneInfo("Europe/Madrid")).date()
    except Exception:
        return dt.date.today()


def equipos(x):
    return [e for e in (x.get("loc"), x.get("vis")) if e and e.strip().lower() != "descanso"]


def main(modo):
    if not os.environ.get("FIREBASE_SA"):
        print("Sin el secreto FIREBASE_SA: no se mandan avisos de equipos (y no se apunta nada como enviado)."); return
    P = json.load(open(PARTIDOS, encoding="utf-8")).get("partidos", [])
    try:
        E = json.load(open(ESTADO, encoding="utf-8"))
    except Exception:
        E = {}
    E.setdefault("dia", {}); E.setdefault("res", {})
    d0 = hoy(); hs = d0.isoformat(); n = 0
    for x in P:
        if n >= MAX: break
        ico = ICO.get(x.get("dep"), "🏆")
        if modo == "dia" and x.get("f") == hs and not x.get("res") and x["id"] not in E["dia"]:
            txt = "%s – %s%s%s · %s" % (x["loc"], x["vis"], " · " + x["h"] + " h" if x.get("h") else "",
                                        " · " + x["lugar"] if x.get("lugar") else "", x.get("comp", ""))
            for e in equipos(x):
                n += enviar_equipo(tema_equipo(x["dep"], x["comp"], e), "partido", "📣 ¡Hoy juega %s! %s" % (e, ico), txt)
            E["dia"][x["id"]] = hs
        if modo == "resultado" and x.get("res") and x["id"] not in E["res"]:
            try:
                f = dt.date.fromisoformat(x["f"])
            except Exception:
                continue
            if (d0 - f).days > 3 or f > d0:
                E["res"][x["id"]] = x["res"]      # viejo: se apunta para no avisarlo nunca
                continue
            tit = "🏆 Final: %s %s %s" % (x["loc"], x["res"], x["vis"])
            for e in equipos(x):
                n += enviar_equipo(tema_equipo(x["dep"], x["comp"], e), "resultado", tit, "%s %s" % (ico, x.get("comp", "")))
            E["res"][x["id"]] = x["res"]
    # limpiar lo de hace más de 40 días (los id de partidos viejos ya no vuelven)
    vivos = {x["id"] for x in P}
    for k in ("dia", "res"):
        E[k] = {i: v for i, v in E[k].items() if i in vivos}
    json.dump(E, open(ESTADO, "w", encoding="utf-8"), ensure_ascii=False, indent=0, sort_keys=True)
    print("Avisos de equipos (%s): %d enviados" % (modo, n))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "dia")
