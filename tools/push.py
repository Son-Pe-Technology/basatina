"""
📲 Avisos push de BasatiNA (21 nov. 2026) — Firebase Cloud Messaging (API HTTP v1), por TEMAS.

  Mandar un aviso a mano (lo usa .github/workflows/push.yml):
      python3 tools/push.py --tema avisos --titulo "…" --texto "…" [--tab agenda] [--prueba]
  Desde otro robot (tools/noticias.py): from push import enviar; enviar('desaparecidos', titulo, texto, 'desaparecidos')

Por qué temas: el móvil se apunta a «desaparecidos» o «avisos» desde Ajustes, y Firebase entrega el aviso.
NO guardamos tokens ni ningún identificador de los móviles.

Necesita el secreto de GitHub FIREBASE_SA (la clave de la cuenta de servicio de Firebase, la misma que usa
tools/cuentas_limpieza.py). Sin el secreto no hace nada (y no falla).
Los temas deben ser iguales que PushService.TEMAS (Java) y PU_T (web/push.js).
Con --prueba (o PUSH_PRUEBA=1) se manda al tema «<tema>-prueba»: así se puede probar sin molestar a nadie.
"""
import json, os, sys, urllib.request

PROYECTO = "basatina-9a8b5"
TEMAS = ("desaparecidos", "avisos")


def _token(sa):
    from google.oauth2 import service_account
    import google.auth.transport.requests
    c = service_account.Credentials.from_service_account_info(sa, scopes=["https://www.googleapis.com/auth/firebase.messaging"])
    c.refresh(google.auth.transport.requests.Request())
    return c.token


def enviar(tema, titulo, texto, tab="", prueba=None):
    """Manda un aviso a todos los móviles apuntados a `tema`. Devuelve True si Firebase lo aceptó."""
    if tema not in TEMAS:
        print("Tema desconocido:", tema); return False
    sa = os.environ.get("FIREBASE_SA")
    if not sa:
        print("Sin el secreto FIREBASE_SA: no se manda el aviso push."); return False
    if prueba is None:
        prueba = os.environ.get("PUSH_PRUEBA") == "1"
    destino = tema + ("-prueba" if prueba else "")
    titulo, texto = (titulo or "BasatiNA")[:110], (texto or "")[:400]
    msg = {"message": {
        "topic": destino,
        # solo datos: el móvil (PushService) pinta el aviso con su canal y abre la pantalla `tab`
        "data": {"tema": tema, "titulo": titulo, "texto": texto, "tab": tab or ""},
        "android": {"priority": "high", "ttl": "21600s"},   # si el móvil está apagado, se entrega durante 6 h
    }}
    try:
        tok = _token(json.loads(sa))
        r = urllib.request.Request("https://fcm.googleapis.com/v1/projects/%s/messages:send" % PROYECTO,
                                   data=json.dumps(msg).encode(), method="POST",
                                   headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
        with urllib.request.urlopen(r, timeout=30) as f:
            print("Aviso enviado a «%s»: %s" % (destino, json.loads(f.read()).get("name", "")))
        return True
    except Exception as e:
        cuerpo = getattr(e, "read", lambda: b"")()
        print("No se pudo mandar el aviso:", e, cuerpo[:300])
        return False


def enviar_equipo(topic, tipo, titulo, texto, prueba=None):
    """⚽ Aviso a los que siguen un equipo. topic = «eq-xxxxxxxx» (ver tema_equipo); tipo = partido | resultado.
    En el móvil sale con su sonido: bombos y trompetas (partido) u ovación y aplausos (resultado)."""
    import re
    if tipo not in ("partido", "resultado") or not re.fullmatch(r"eq-[0-9a-f]{8}", topic or ""):
        print("Aviso de equipo no válido:", topic, tipo); return False
    sa = os.environ.get("FIREBASE_SA")
    if not sa:
        print("Sin el secreto FIREBASE_SA: no se manda el aviso push."); return False
    if prueba is None:
        prueba = os.environ.get("PUSH_PRUEBA") == "1"
    destino = topic + ("-prueba" if prueba else "")
    msg = {"message": {"topic": destino,
        "data": {"tema": tipo, "eq": topic, "titulo": (titulo or "")[:110], "texto": (texto or "")[:400], "tab": "misdep"},
        "android": {"priority": "high", "ttl": "21600s" if tipo == "partido" else "43200s"}}}
    try:
        tok = _token(json.loads(sa))
        r = urllib.request.Request("https://fcm.googleapis.com/v1/projects/%s/messages:send" % PROYECTO,
                                   data=json.dumps(msg).encode(), method="POST",
                                   headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
        with urllib.request.urlopen(r, timeout=30) as f:
            f.read()
        return True
    except Exception as e:
        print("No se pudo mandar el aviso del equipo:", e, getattr(e, "read", lambda: b"")()[:200])
        return False


def tema_equipo(dep, comp, equipo):
    """El mismo resumen que dpTema() en web/mejoras.js: FNV-1a de 32 bits de «deporte|liga|equipo» en UTF-8."""
    h = 0x811c9dc5
    for b in ("%s|%s|%s" % (dep, comp, equipo)).encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xffffffff
    return "eq-%08x" % h


if __name__ == "__main__":
    import argparse
    a = argparse.ArgumentParser()
    a.add_argument("--tema", default="avisos", choices=TEMAS)
    a.add_argument("--titulo", required=True)
    a.add_argument("--texto", default="")
    a.add_argument("--tab", default="")
    a.add_argument("--prueba", action="store_true")
    o = a.parse_args()
    ok = enviar(o.tema, o.titulo, o.texto, o.tab, prueba=o.prueba or None)
    sys.exit(0 if ok else 1)
