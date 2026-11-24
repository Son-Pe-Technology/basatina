"""
☀️🤖 «Navarra hoy»: resumen de la mañana escrito con IA (23 nov. 2026). Lo ejecuta .github/workflows/ia.yml a las 7:20.

  python3 tools/ia_hoy.py   ->  noticias/navarra_hoy.json

La IA SOLO usa los datos que se le pasan (no inventa): el tiempo de hoy (Open-Meteo), los titulares
(titular y medio, que siempre se puede), las noticias de BasatiNA ya publicadas, la agenda cultural y
los partidos de hoy. Sin política. La app lo enseña arriba de «Ahora en Navarra».
(El aviso al móvil a las 7:30 llegará con la próxima versión de la app: hace falta un tema push nuevo.)
"""
import json, os, sys, datetime, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from ia import llamar, json_de, avisar_error, IAError

SITIOS = [("Pamplona", 42.8125, -1.6458), ("Tudela", 42.0617, -1.6045), ("Estella", 42.6714, -2.0300), ("Pirineo (Isaba)", 42.8606, -0.9214)]
WMO = {0: "despejado", 1: "casi despejado", 2: "nubes y claros", 3: "nublado", 45: "niebla", 48: "niebla con escarcha", 51: "llovizna", 53: "llovizna",
       55: "llovizna fuerte", 61: "lluvia débil", 63: "lluvia", 65: "lluvia fuerte", 71: "nieve débil", 73: "nieve", 75: "nieve fuerte", 80: "chubascos",
       81: "chubascos", 82: "chubascos fuertes", 85: "chubascos de nieve", 86: "chubascos de nieve", 95: "tormenta", 96: "tormenta con granizo", 99: "tormenta con granizo"}
SIS = """Eres BasatiNA, una app de Navarra. Escribe el resumen de la mañana «Navarra hoy» con los DATOS que te paso.
Reglas: usa SOLO esos datos (nada inventado), sin política, tono cercano y claro, frases cortas.
De 4 a 6 líneas, cada una de una cosa: el tiempo (temperaturas y si llueve o nieva, con el sitio), 1-3 noticias,
y un plan (agenda o partido) si lo hay. Sin emojis. No pongas nombres de particulares.
Nunca: suicidios, agresiones o delitos sexuales, los curas, la Iglesia como institución o las religiones (las romerías, procesiones y fiestas SÍ), ni menores (salvo sus logros).
Responde SOLO con JSON: {"titulo":"frase de 6-10 palabras que resuma el día","lineas":["…","…"]}"""


def get(u):
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "BasatiNA/1.0"}), timeout=30))


def main():
    hoy = datetime.date.today().isoformat()
    datos = ["TIEMPO DE HOY:"]
    for n, la, lo in SITIOS:
        try:
            j = get(f"https://api.open-meteo.com/v1/forecast?latitude={la}&longitude={lo}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,snowfall_sum&forecast_days=1&timezone=Europe%2FMadrid")
            d = j["daily"]
            datos.append(f"- {n}: {WMO.get(d['weather_code'][0], 'variable')}, {round(d['temperature_2m_min'][0])}° a {round(d['temperature_2m_max'][0])}°, "
                         f"probabilidad de lluvia {d['precipitation_probability_max'][0]}%, lluvia {d['precipitation_sum'][0]} mm, nieve {d['snowfall_sum'][0]} cm")
        except Exception as e:
            print("tiempo", n, e)
    try:
        P = json.load(open("noticias/ia_publicadas.json", encoding="utf-8")).get("items", [])[:3]
        if P: datos += ["NOTICIAS DE BASATINA:"] + [f"- {x['titulo']}: {x['texto'][:300]}" for x in P]
    except Exception: pass
    try:
        T = [x for x in json.load(open("noticias/noticias.json", encoding="utf-8")).get("items", []) if x.get("c") != "Sucesos"][:8]
        datos += ["TITULARES (solo titular):"] + [f"- {x['t']} ({x['f']})" for x in T]
    except Exception: pass
    try:
        A = [e for e in json.load(open("agenda/cultura.json", encoding="utf-8")).get("eventos", []) if e.get("f") == hoy][:5]
        if A: datos += ["AGENDA DE HOY:"] + [f"- {e['t']} · {e.get('h','')} · {e.get('lugar','')} {e.get('pueblo','')}" for e in A]
    except Exception: pass
    try:
        # 24 nov. 2026: fuera los partidos mal apuntados (sin los dos equipos: «Liga…, jornada 1» contra «Estadio…»)
        raro = lambda x: any(w in (x or "").lower() for w in ("liga", "jornada", "estadio", "polideportivo", "pabellón", "campo de"))
        D = [p for p in json.load(open("deporte/partidos.json", encoding="utf-8")).get("partidos", [])
             if p.get("f") == hoy and not raro(p.get("loc")) and not raro(p.get("vis"))][:4]
        if D: datos += ["PARTIDOS DE HOY:"] + [f"- {p['loc']} – {p['vis']} ({p.get('comp','')}) {p.get('h','')}" for p in D]
    except Exception: pass
    try:
        R = json_de(llamar(SIS, "\n".join(datos), 600))
    except IAError as e:
        avisar_error(e); return
    if not R.get("lineas"): print("Sin líneas"); return
    os.makedirs("noticias", exist_ok=True)
    json.dump({"f": hoy, "t": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
               "titulo": R.get("titulo", "Navarra hoy")[:90], "lineas": [str(x)[:220] for x in R["lineas"][:6]]},
              open("noticias/navarra_hoy.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(R)


if __name__ == "__main__":
    main()
