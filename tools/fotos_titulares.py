"""📷 Fotos propias para los titulares (24 nov. 2026, lo pidió Pedro)

En el Drive de Son&Pe (BasatiNA → Titulares) hay una carpeta por tema: campo, lluvia, osasuna, pamplona…
Este programa coge esas fotos (ya bajadas a una carpeta con la misma estructura), las recorta en 4:3,
las pasa a .webp pequeñas y escribe web/tit-*.webp y web/titulares-fotos.json, que es lo que lee la app.

Uso:  python3 tools/fotos_titulares.py /ruta/a/Titulares
      (dentro: campo/foto1.jpg, lluvia/foto2.jpg …; los nombres de carpeta son los temas de TEMAS)

Cómo elige la app la foto de un titular (web/titulares-fotos.js):
  1. Mira las palabras del titular y busca el primer tema de TEMAS que encaje (en orden: lo más concreto primero).
  2. Si ese tema tiene fotos, escoge una según el enlace de la noticia (siempre la misma para la misma noticia,
     y distintas noticias del mismo tema suelen llevar fotos distintas).
  3. Si no encaja ningún tema o el tema aún no tiene fotos, el titular va sin foto.
Para que un tema tenga fotos: subirlas a su carpeta del Drive y pedir a Claude que las pase.
"""
import json, os, sys, hashlib
from PIL import Image, ImageOps

# tema → palabras (en minúscula; la app quita tildes y signos; trozos de palabra valen: «inunda» cubre inundación…;
# con espacios alrededor, palabra entera: « gol » no coge «golpe»). El orden importa: gana el primer tema que encaje.
TEMAS = {
 "osasuna": ["osasuna", "el sadar", "rojillo", "budimir", "lisci"],
 "pelota": ["pelota", "pelotari", "frontón", "fronton", "mano parejas", "manomanista", "remonte"],
 "balonmano-baloncesto": ["balonmano", "baloncesto", "helvetia anaitasuna", "basket", " acb "],
 "ciclismo-carreras": ["ciclis", "ciclista", "vuelta a", "carrera popular", "maraton", "maratón", "san silvestre", "trail", "duatlon", "triatlon"],
 "deporte": ["futbol", "fútbol", " liga", "copa", "partido", " gol", "deport", "atleta", "campeon", "torneo", "tenis", "padel", "pádel", "pamplona-iruña", "ardoi", "mutilvera"],
 "sanfermines": ["sanfermin", "san fermin", "sanfermín", "san fermín", "encierro", "chupinazo", "pobre de mi", "pañuelico"],
 "fiestas-pueblo": ["fiestas", "fiesta", "gigantes", "comparsa", "verbena", "romeria", "romería", "carnaval", "olentzero", "cabalgata"],
 "concierto": ["concierto", "festival", "musica", "música", "orquesta", "banda", "coro", "cantante", " gira "],
 "teatro": ["teatro", "baluarte", "gayarre", "obra de", "danza", "espectaculo", "espectáculo", "zarzuela", "cine"],
 "museo": ["museo", "exposicion", "exposición", "muestra", "patrimonio", " arte ", "pintur"],
 "libros": ["libro", "biblioteca", "escritor", "escritora", "novela", "poeta", "poesia", "poesía", "lectura", "feria del libro"],
 "rescate-monte": ["rescate", "rescatad", "montañero", "montañera", "senderista", "extraviad"],
 "bomberos-incendio": ["bombero", "incendio", "fuego", "llamas", "humo", " arde "],
 "policia": ["policia", "policía", "guardia civil", "detenid", "detencion", "agente", "robo", "estafa", "denuncia"],
 "ambulancia-hospital": ["hospital", "ambulancia", "urgencias", "herid", "sanidad", "osasunbidea", "salud", "medico", "médico", "sanitari", " chn ", "clinica", "clínica"],
 "carretera": ["carretera", "accidente", "trafico", "tráfico", "autovia", "autovía", "autopista", "a-15", "ap-15", "a-21", "n-121", " pk ", "conductor", "camion", "camión", "atasco", " dgt ", "obras en la"],
 "rio-crecida": ["crecida", "inunda", "desbord", "riada", "caudal", "rio arga", "río arga", "el arga", "el ega", "el aragon", "el ebro", "irati", "embalse", "pantano"],
 "nieve": ["nieve", "nevada", "nevad", "quitanieves", "cadenas", "belagua", "larra"],
 "niebla-frio": ["niebla", "helada", "frio", "frío", "bajo cero", "temperaturas bajas", "escarcha"],
 "viento-temporal": ["viento", "temporal", "rachas", "borrasca", "vendaval", "tormenta", "granizo"],
 "lluvia": ["lluvia", "llueve", "lloviendo", "aguacero", "chubasco", "precipitacion", "precipitación", "aviso amarillo", "aviso naranja", "aemet"],
 "calor-sol": ["calor", "ola de calor", "sequia", "sequía", "verano", "temperaturas altas", "piscina"],
 "campo": ["agricult", "ganader", "campo", "cosecha", "vendimia", "cereal", "trigo", "regadio", "regadío", "uagn", "ehne", "vino", "olivo", "esparrago", "espárrago", "pimiento", "alcachofa", "tractor"],
 "iglesia": ["iglesia", "catedral", "arzobispo", "parroquia", "obispo", "misa", "javierada", "ermita", "monasterio"],
 "parlamento-gobierno": ["parlamento", "gobierno de navarra", "consejer", "presidenta", "chivite", " ley ", "decreto", "pleno", "boletin oficial"],
 "universidad": ["universidad", "upna", "unav", "campus", "estudiantes universitarios", "investigador", "investigacion", "investigación"],
 "colegio": ["colegio", "escuela", "instituto", "alumn", "profesor", "educacion", "educación", "ikastola", "aula"],
 "vivienda": ["vivienda", "piso", "alquiler", "hipoteca", "inmobiliari", "promocion de", "promoción de", "nasuvinsa", " vpo "],
 "dinero": ["euros", "millones", "presupuesto", "impuesto", "hacienda", "subvencion", "subvención", "ayuda", "precio", " ipc ", "pension", "pensión", "salario", "banco", "caixa"],
 "empresa-industria": ["empresa", "fabrica", "fábrica", "industria", "planta", "volkswagen", " vw ", "landaben", "empleo", "trabajador", "erte", "huelga", "despido", " ere "],
 "comercio": ["comercio", "tienda", "hostelería", "hosteleria", " bar ", "restaurante", "black friday", "rebajas", "mercado", "compras", "navidad"],
 "tudela": ["tudela", "ribera", "tudelano", "tudelana"],
 "estella": ["estella", "lizarra", "tierra estella"],
 "pamplona": ["pamplona", "iruña", "ayuntamiento de pamplona", "asiron", "asirón", "casco viejo", "txantrea", "rochapea", "san jorge", "mendillorri", "ermitagaña", "iturrama", "milagrosa", "sanduzelai", "villava", "burlada", "barañain", "barañáin", "ansoain", "ansoáin"],
 "pueblo": ["concejo", "valle", "pueblo", "localidad", "vecinos de", "ayuntamiento de", "mancomunidad"],
}

def recorta(src, dst):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    W, H = im.size
    r = 4 / 3
    if W / H > r:            # más ancha: se recorta a los lados
        w = int(H * r); x0 = (W - w) // 2; im = im.crop((x0, 0, x0 + w, H))
    else:                    # más alta: se coge la zona central, sin el pie (donde suelen ir las firmas)
        h = int(W / r); y0 = int((H - h) * 0.55); y0 = min(y0, int(H * 0.88) - h) if int(H * 0.88) - h > 0 else y0
        im = im.crop((0, max(0, y0), W, max(0, y0) + h))
    im.resize((360, 270), Image.LANCZOS).save(dst, "WEBP", quality=76)

def main(base):
    out_dir = os.path.join(os.path.dirname(__file__), "..", "web")   # suelto en web/: la actualización de la app solo baja archivos sueltos
    fotos = {}
    try: viejo = json.load(open(os.path.join(out_dir, "titulares-fotos.json"), encoding="utf-8"))
    except Exception: viejo = {}
    cred = viejo.get("creditos", {})
    for tema in sorted(os.listdir(base)):
        d = os.path.join(base, tema)
        if not os.path.isdir(d): continue
        if tema not in TEMAS: print("⚠️ carpeta sin tema conocido:", tema)
        vistos, L = set(), []
        for f in sorted(os.listdir(d)):
            p = os.path.join(d, f)
            if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")): continue
            h = hashlib.sha1(open(p, "rb").read()).hexdigest()[:10]
            if h in vistos: continue          # fotos repetidas en la carpeta: solo una
            vistos.add(h)
            nombre = f"tit-{tema}-{h}.webp"
            recorta(p, os.path.join(out_dir, nombre)); L.append(nombre)
        if L: fotos[tema] = L; print(tema, len(L))
    # las fotos libres (tools/fotos_titulares_libres.py) se conservan: la app solo las usa en temas sin fotos propias
    json.dump({"temas": {k: v for k, v in TEMAS.items()}, "fotos": fotos, "libres": viejo.get("libres", {}), "creditos": cred,
               "_info": "Lo genera tools/fotos_titulares.py. Fotos propias por tema para los titulares."},
              open(os.path.join(out_dir, "titulares-fotos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main(sys.argv[1])
