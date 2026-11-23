"""
🤖 Piezas comunes de la IA de BasatiNA (23 nov. 2026). Lo usan tools/ia_noticias.py y tools/ia_hoy.py.

  llamar(sistema, texto, max_tokens)  -> respuesta de Claude (texto) o lanza IAError
  json_de(texto)                      -> el primer objeto/lista JSON que haya en la respuesta
  avisar(titulo, cuerpo)              -> abre un aviso («issue») en GitHub: GitHub manda un correo a Pedro

La clave va en el secreto de GitHub ANTHROPIC_API_KEY (nunca en el código). Modelo: IA_MODELO (por defecto
el barato, Haiku 4.5). Cada llamada apunta lo que gasta en noticias/ia_gasto.json para vigilar el coste.
OJO: el repositorio es público, así que los avisos NO llevan el texto de las noticias, solo «hay N para revisar».
"""
import json, os, re, time, datetime, urllib.request, urllib.error

MODELO = os.environ.get("IA_MODELO", "claude-haiku-4-5")
PRECIO = {"in": 1.0, "out": 5.0}   # $ por millón de tokens (Haiku 4.5, nov. 2026). Solo para la cuenta aproximada.
GASTO = "noticias/ia_gasto.json"


class IAError(Exception):
    pass


def _apunta(uso):
    try:
        g = json.load(open(GASTO, encoding="utf-8"))
    except Exception:
        g = {}
    mes = datetime.date.today().strftime("%Y-%m")
    m = g.setdefault(mes, {"llamadas": 0, "in": 0, "out": 0, "dolares": 0.0})
    i, o = uso.get("input_tokens", 0), uso.get("output_tokens", 0)
    m["llamadas"] += 1; m["in"] += i; m["out"] += o
    m["dolares"] = round(m["in"] / 1e6 * PRECIO["in"] + m["out"] / 1e6 * PRECIO["out"], 4)
    os.makedirs(os.path.dirname(GASTO), exist_ok=True)
    json.dump(g, open(GASTO, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def llamar(sistema, texto, max_tokens=1200, reintentos=3):
    clave = os.environ.get("ANTHROPIC_API_KEY")
    if not clave:
        raise IAError("sin_clave")
    cuerpo = json.dumps({"model": MODELO, "max_tokens": max_tokens, "system": sistema,
                         "messages": [{"role": "user", "content": texto}]}).encode()
    for n in range(reintentos):
        req = urllib.request.Request("https://api.anthropic.com/v1/messages", data=cuerpo, headers={
            "x-api-key": clave, "anthropic-version": "2023-06-01", "content-type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                j = json.load(r)
            _apunta(j.get("usage", {}))
            return "".join(b.get("text", "") for b in j.get("content", []) if b.get("type") == "text")
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")[:500]
            if e.code == 401:
                raise IAError("clave_mala")
            if "credit balance" in msg.lower() or e.code == 402:
                raise IAError("sin_saldo")
            if e.code in (429, 500, 502, 503, 529) and n < reintentos - 1:
                time.sleep(15 * (n + 1)); continue
            raise IAError(f"http_{e.code}: {msg}")
        except Exception as e:
            if n < reintentos - 1:
                time.sleep(10); continue
            raise IAError(f"red: {e}")


def json_de(t):
    """Saca el JSON de la respuesta (a veces viene con ```json … ``` alrededor)."""
    t = re.sub(r"^```(?:json)?|```$", "", (t or "").strip(), flags=re.M).strip()
    for a, b in (("{", "}"), ("[", "]")):
        i, j = t.find(a), t.rfind(b)
        if i >= 0 and j > i:
            try:
                return json.loads(t[i:j + 1])
            except Exception:
                pass
    raise IAError("respuesta_sin_json")


def avisar(titulo, cuerpo):
    """Abre un aviso en GitHub (o comenta en el que ya esté abierto con el mismo título). GitHub avisa por correo."""
    tok, repo = os.environ.get("GITHUB_TOKEN"), os.environ.get("GITHUB_REPOSITORY")
    if not tok or not repo:
        print("AVISO (sin GitHub):", titulo, "-", cuerpo); return
    h = {"Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json", "User-Agent": "BasatiNA"}
    try:
        q = urllib.request.Request(f"https://api.github.com/repos/{repo}/issues?state=open&labels=ia&per_page=50", headers=h)
        abiertos = json.load(urllib.request.urlopen(q, timeout=30))
        ya = next((x for x in abiertos if x.get("title") == titulo), None)
        if ya:
            url, data = ya["comments_url"], {"body": cuerpo}
        else:
            url, data = f"https://api.github.com/repos/{repo}/issues", {"title": titulo, "body": cuerpo, "labels": ["ia"]}
        r = urllib.request.Request(url, data=json.dumps(data).encode(), headers=dict(h, **{"Content-Type": "application/json"}), method="POST")
        urllib.request.urlopen(r, timeout=30)
        print("Aviso enviado:", titulo)
    except Exception as e:
        print("No se pudo abrir el aviso:", e)


def avisar_error(e):
    """Avisos de la IA que necesitan a Pedro (saldo, clave)."""
    s = str(e)
    if s == "sin_saldo":
        avisar("🤖 IA: se ha acabado el saldo", "La IA de BasatiNA no tiene saldo. Carga crédito en https://platform.claude.com (Billing). Mientras tanto no se escriben noticias ni el «Navarra hoy».")
    elif s == "clave_mala":
        avisar("🤖 IA: la clave no funciona", "La clave de la IA no funciona (puede haber caducado). Crea otra en https://platform.claude.com (API Keys) y cámbiala en GitHub: Settings → Secrets and variables → Actions → ANTHROPIC_API_KEY.")
    elif s == "sin_clave":
        print("Sin ANTHROPIC_API_KEY: la IA no hace nada.")
    else:
        print("Error de la IA:", s)
