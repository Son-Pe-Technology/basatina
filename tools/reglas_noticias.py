"""
🚫 Temas que BasatiNA NO publica NUNCA (24 nov. 2026, decidido por Pedro).
Lo usan tools/noticias.py (titulares) y tools/ia_noticias.py (noticias propias de la IA).

  - Suicidios: nada, nunca.
  - Agresiones y delitos sexuales: nada. SÍ las concentraciones, manifestaciones o repulsas contra ellas.
  - Curas, la Iglesia como institución y las religiones: nada. Las tradiciones (romerías, procesiones, Javieradas,
    Semana Santa, ermitas, la catedral, San Fermín…) SÍ.
  - Menores: nada, SALVO sus logros (deporte, estudios, premios…) y siempre que no sea un suceso.

prohibida(texto) devuelve el motivo («» si se puede publicar).
Para añadir palabras: sin tildes y en minúsculas (se compara con el texto ya sin tildes), salvo MENORES,
que se mira con mayúsculas y tildes (para no confundir «Niño» de una talla o «en menor medida»).
"""
import re, unicodedata


def nrm(s):
    return "".join(c for c in unicodedata.normalize("NFD", (s or "").lower()) if unicodedata.category(c) != "Mn")


SUICIDIO = re.compile(r"\b(suicid|quitarse la vida|se quito la vida|autolesi)")
SEXUAL = re.compile(r"\b(agresion(es)? sexual|agresor(es)? sexual|abusos? sexual|violaci|violad[oa]s?\b|acoso sexual|"
                    r"delitos? sexual|delitos? contra la libertad sexual|pederast|pornografia infantil|explotacion sexual|"
                    r"tocamientos)")
PROTESTA = re.compile(r"\b(concentraci|manifestaci|protesta|repulsa|minuto de silencio|movilizaci|cadena humana|"
                      r"marcha contra|marcha por|clamor|rechazo a las|rechazo a la|"
                      # campañas y actos de sensibilización (25N, jornadas, charlas): son como las concentraciones
                      r"sensibiliz|campana contra|campana de prevencion|jornadas? contra|dia internacional|25n|25 de noviembre|"
                      r"prevencion|punto violeta|puntos violeta)")
# Religión (24 nov. 2026, Pedro): fuera lo que habla de curas, de la Iglesia como institución o de las religiones.
# SÍ se publican las tradiciones: romerías, procesiones, Semana Santa, Javieradas, ermitas, la catedral, San Fermín…
IGLESIA = re.compile(r"\b(obisp|arzobisp|diocesis|parroco|sacerdot|curas?\b|clero\b|clerig|seminaris|seminario\b|"
                     r"catequesis|monjas?\b|frailes?\b|vaticano|santa sede|el papa\b|papa leon|papa francisco|pontific|"
                     r"cardenal\b|beatific|canoniz|conferencia episcopal|episcopal|religion(es)?\b|confesion religiosa|"
                     r"catolicismo|islam|musulman|mezquita|judaismo|sinagoga|evangelic|testigos de jehova|abusos en la iglesia)")
# «la Iglesia» con mayúscula es la institución; «la iglesia de Ujué» o «Iglesia de San Saturnino» es un edificio (sí se puede)
IGLESIA_INST = re.compile(r"\bIglesia\b(?! de [A-ZÁÉÍÓÚÑ])")
MENORES = re.compile(r"\b(menores de edad|menor de edad|un menor|una menor|los menores|las menores|dos menores|tres menores|"
                     r"[Nn]iñ[oa]s\b|niñ[oa]\b|[Bb]ebés?|[Aa]dolescentes?|"
                     r"categoría (infantil|cadete|alevín|benjamín|juvenil)|[Cc]adetes?\b|[Aa]levines|[Bb]enjamines|[Jj]uveniles)")
LOGRO = re.compile(r"\b(gan[ao]|ganan|gano|ganador|campeon|campeona|subcampeon|medalla|oro\b|plata\b|bronce|premio|premiad|"
                   r"galardon|record|clasific|seleccionad|convocad|beca|olimpiada|concurso|primer puesto|podio|mencion|"
                   r"reconocimiento|logro|titulo|triunf|brilla|destaca)")
SUCESO = re.compile(r"\b(accident|atropell|herid|fallec|muer|detenid|detenci|arrest|agresi|agred|robo|robad|hurto|"
                    r"incendi|desaparec|rescat|juicio|juzgad|condena|denunci|policia|guardia civil|maltrat|acos)")


def prohibida(texto):
    n, t = nrm(texto), texto or ""
    if SUICIDIO.search(n): return "suicidio (nunca se publica)"
    if SEXUAL.search(n) and not PROTESTA.search(n): return "agresión o delito sexual (nunca; solo las concentraciones contra ellas)"
    if IGLESIA.search(n) or IGLESIA_INST.search(t): return "curas, Iglesia o religiones (nunca se publica)"
    if MENORES.search(t):
        if SUCESO.search(n) or not LOGRO.search(n): return "menores (solo se publican sus logros)"
    return ""


if __name__ == "__main__":
    for x in ["Un vecino de Burlada se suicida", "Concentración en Pamplona contra la agresión sexual del fin de semana",
              "Detenido por una agresión sexual en Tudela", "El arzobispo de Pamplona preside la misa", "Una niña de Tafalla gana el campeonato de España de ajedrez",
              "Herido un niño en un atropello", "Los colegios de Pamplona cierran por la nieve", "Osasuna gana al Málaga", "Recuperan una virgen románica robada", "Miles de personas en la romería de Ujué", "La procesión de San Fermín recorre el Casco Viejo",
              "La Iglesia navarra critica la ley", "Restauran la iglesia de San Saturnino", "Restauran la Iglesia de San Saturnino", "Nuevo párroco en Estella", "El Papa saluda a Indurain",
              "En menor medida subirá el IPC", "La cadete navarra Ane logra la medalla de oro"]:
        print(f"{x[:70]:70} → {prohibida(x) or 'se publica'}")
