package es.pedrito.controlarga;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONObject;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Trabajo en segundo plano: cada 15 minutos (aunque la app esté cerrada) Android lo despierta,
 * lee del SAIH el caudal del Arga en Burlada y el embalse de Eugui, actualiza el widget
 * y, si los avisos están activados, manda una notificación cuando el río pasa de los umbrales.
 */
public class RiverJob extends JobService {
    static final int JOB_ID = 2611, JOB_NOW = 2612;
    static final String SAIH = "https://www.saihebro.com/api/ficha/procesarTablaValoresActuales?estacion=";
    static final String CHANNEL = "avisos_rio_2";   // 22 nov. 2026: canales «_2» con sonido propio de BasatiNA (ver canal())

    /** Programa la comprobación periódica (Android no deja menos de 15 minutos) */
    static void schedule(Context c) {
        try { schedule0(c); } catch (Exception ignored) {}   // si falla, la app sigue funcionando
    }
    static void schedule0(Context c) {
        JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js.getPendingJob(JOB_ID) != null) return;
        js.schedule(new JobInfo.Builder(JOB_ID, new ComponentName(c, RiverJob.class))
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setPeriodic(15 * 60 * 1000L)
                .setPersisted(true)          // sigue funcionando después de reiniciar el móvil
                .build());
    }

    /** Una comprobación ahora mismo (al poner el widget o abrir la app) */
    static void runNow(Context c) {
        try { runNow0(c); } catch (Exception ignored) {}
    }
    static void runNow0(Context c) {
        JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        js.schedule(new JobInfo.Builder(JOB_NOW, new ComponentName(c, RiverJob.class))
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setOverrideDeadline(5000)
                .build());
    }

    @Override
    public boolean onStartJob(final JobParameters p) {
        new Thread(() -> {
            try { check(this); } catch (Exception ignored) {}
            try { checkRoads(this); } catch (Exception ignored) {}
            try { checkSnow(this); } catch (Exception ignored) {}
            try { checkFinde(this); } catch (Exception ignored) {}
            try { checkDato(this); } catch (Exception ignored) {}
            try { checkSismo(this); } catch (Exception ignored) {}
            try { checkCuriosa(this); } catch (Exception ignored) {}
            try { checkLluvia(this); } catch (Exception ignored) {}
            try { checkViento(this); } catch (Exception ignored) {}
            try { checkTiempo(this); } catch (Exception ignored) {}
            jobFinished(p, false);
        }).start();
        return true;   // el trabajo sigue en otro hilo
    }

    @Override
    public boolean onStopJob(JobParameters p) { return true; }

    static String get(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(20000); c.setReadTimeout(30000);
        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android) ControlRioArga/2.0");
        InputStream in = c.getInputStream();
        return MainActivity.readAll(in);
    }

    /** Busca en la tabla de la ficha la fila cuyo nombre contiene "clave" y devuelve su valor */
    static double value(String html, String clave) {
        for (String row : html.split("<tr>")) {
            Matcher n = Pattern.compile("aria-label='Señal ([^']*)'").matcher(row);
            Matcher v = Pattern.compile("aria-label='Valor (-?[\\d.,]+)").matcher(row);
            if (n.find() && v.find() && n.group(1).toUpperCase().contains(clave))
                return Double.parseDouble(v.group(1).replace(".", "").replace(",", "."));
        }
        return Double.NaN;
    }

    static void check(Context c) throws Exception {
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        String burlada = new JSONObject(get(SAIH + "A313")).optString("VALORES_ACTUALES");
        double q = value(burlada, "CAUDAL");
        double pct = Double.NaN;
        try { pct = value(new JSONObject(get(SAIH + "E025")).optString("VALORES_ACTUALES"), "% VOLUMEN"); } catch (Exception ignored) {}
        if (Double.isNaN(q)) return;
        long now = System.currentTimeMillis();

        // ¿cuánto ha subido en la última hora? guardamos una referencia cada hora
        long refT = sp.getLong("refT", 0);
        double refQ = sp.getFloat("refQ", (float) q);
        double subida = q - refQ;
        SharedPreferences.Editor e = sp.edit();
        if (now - refT > 60 * 60 * 1000L) { e.putLong("refT", now); e.putFloat("refQ", (float) q); }
        e.putFloat("q", (float) q).putLong("qT", now);
        if (!Double.isNaN(pct)) e.putFloat("pct", (float) pct);
        e.apply();
        RiverWidget.updateAll(c);

        // avisos
        JSONObject cfg;
        try { cfg = new JSONObject(sp.getString("alerts", "{}")); } catch (Exception ex) { cfg = new JSONObject(); }
        if (!cfg.optBoolean("on", false)) return;
        double qAma = cfg.optDouble("qAma", 150), qRoj = cfg.optDouble("qRoj", 300), qSub = cfg.optDouble("subida", 30);
        int level = q >= qRoj ? 2 : q >= qAma ? 1 : 0;
        int last = sp.getInt("lastLevel", 0);
        String fq = String.format(java.util.Locale.forLanguageTag("es-ES"), "%.0f", q);
        if (level > last) {
            notify(c, level == 2 ? "🔴 Arga en Burlada: " + fq + " m³/s" : "🟡 Arga en Burlada: " + fq + " m³/s",
                    level == 2 ? "Ha pasado de " + (int) qRoj + " m³/s. Sigue los avisos oficiales (112, CHE)." : "Ha pasado de " + (int) qAma + " m³/s. Atento a la evolución.", 1);
        } else if (level < last) {
            notify(c, "🟢 El Arga baja: " + fq + " m³/s en Burlada", "Ha bajado del umbral de aviso.", 1);
        }
        sp.edit().putInt("lastLevel", level).apply();
        long lastRise = sp.getLong("lastRise", 0);
        if (subida >= qSub && now - lastRise > 3 * 60 * 60 * 1000L) {
            notify(c, "📈 El Arga sube rápido en Burlada", String.format(java.util.Locale.forLanguageTag("es-ES"), "+%.0f m³/s en la última hora (ahora %s m³/s).", subida, fq), 2);
            sp.edit().putLong("lastRise", now).apply();
        }
    }

    static JSONObject cfg(Context c) {
        try { return new JSONObject(c.getSharedPreferences("rio", MODE_PRIVATE).getString("alerts", "{}")); } catch (Exception ex) { return new JSONObject(); }
    }

    /** Avisa de las incidencias nuevas (cortes, obras, accidentes…) en las carreteras que ha elegido el usuario */
    static void checkRoads(Context c) throws Exception {
        JSONObject cfg = cfg(c);
        org.json.JSONArray roads = cfg.optJSONArray("roads");
        if (!cfg.optBoolean("on", false) || roads == null || roads.length() == 0) return;
        java.util.Set<String> mine = new java.util.HashSet<>();
        for (int i = 0; i < roads.length(); i++) mine.add(roads.optString(i).toUpperCase().replace(" ", ""));
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        boolean first = !sp.contains("incSeen");
        String seen = sp.getString("incSeen", ",");
        org.json.JSONArray L = new JSONObject(get("https://administracionelectronica.navarra.es/IncCarreteras/api/incidents")).getJSONArray("incidencia");
        StringBuilder now = new StringBuilder(",");
        int n = 0;
        for (int i = 0; i < L.length(); i++) {
            JSONObject x = L.getJSONObject(i);
            if (!x.optBoolean("publicable", true)) continue;
            String road = x.optString("cod_carretera_actual").toUpperCase().replace(" ", "");
            if (!mine.contains(road)) continue;
            String id = x.optString("id_incidencia");
            now.append(id).append(",");
            if (first || seen.contains("," + id + ",")) continue;
            String tit = x.optString("titulo").trim(), des = x.optString("descripcion").trim();
            if (tit.isEmpty()) tit = x.optString("tipo");
            notify(c, "🚧 " + road + ": " + tit, des.isEmpty() ? x.optString("afeccion") : des, 300 + (n++ % 20));
        }
        sp.edit().putString("incSeen", now.toString()).apply();
    }

    /** La víspera (desde las 17:00) avisa si mañana se espera nieve en los puertos elegidos */
    static void checkSnow(Context c) throws Exception {
        JSONObject cfg = cfg(c);
        org.json.JSONArray P = cfg.optJSONArray("snow");
        if (!cfg.optBoolean("on", false) || P == null || P.length() == 0) return;
        java.util.Calendar cal = java.util.Calendar.getInstance();
        if (cal.get(java.util.Calendar.HOUR_OF_DAY) < 17) return;
        String today = String.format(java.util.Locale.US, "%tF", cal);
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        if (today.equals(sp.getString("snowDay", ""))) return;
        StringBuilder la = new StringBuilder(), lo = new StringBuilder();
        for (int i = 0; i < P.length(); i++) { org.json.JSONArray q = P.getJSONArray(i); if (i > 0) { la.append(','); lo.append(','); } la.append(q.optDouble(1)); lo.append(q.optDouble(2)); }
        String body = get("https://api.open-meteo.com/v1/forecast?latitude=" + la + "&longitude=" + lo + "&daily=snowfall_sum&forecast_days=2&timezone=Europe%2FMadrid");
        org.json.JSONArray arr = body.trim().startsWith("[") ? new org.json.JSONArray(body) : new org.json.JSONArray().put(new JSONObject(body));
        StringBuilder txt = new StringBuilder();
        for (int i = 0; i < arr.length() && i < P.length(); i++) {
            double cm = arr.getJSONObject(i).getJSONObject("daily").getJSONArray("snowfall_sum").optDouble(1, 0);
            if (cm >= 1) txt.append(txt.length() > 0 ? " · " : "").append(P.getJSONArray(i).optString(0)).append(String.format(java.util.Locale.forLanguageTag("es-ES"), " %.0f cm", cm));
        }
        sp.edit().putString("snowDay", today).apply();
        if (txt.length() > 0) notify(c, "❄️ Mañana se espera nieve en los puertos", txt + ". Antes de salir, mira el estado de las carreteras (848 423 500).", 400);
    }

    /** Los jueves desde las 18:00: ¿viene buen fin de semana para el monte en el pueblo elegido? */
    static void checkFinde(Context c) throws Exception {
        JSONObject cfg = cfg(c);
        org.json.JSONArray f = cfg.optJSONArray("finde");
        if (!cfg.optBoolean("on", false) || f == null || f.length() < 3) return;
        java.util.Calendar cal = java.util.Calendar.getInstance();
        if (cal.get(java.util.Calendar.DAY_OF_WEEK) != java.util.Calendar.THURSDAY || cal.get(java.util.Calendar.HOUR_OF_DAY) < 18) return;
        String today = String.format(java.util.Locale.US, "%tF", cal);
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        if (today.equals(sp.getString("findeDay", ""))) return;
        JSONObject d = new JSONObject(get("https://api.open-meteo.com/v1/forecast?latitude=" + f.optDouble(1) + "&longitude=" + f.optDouble(2)
                + "&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,wind_gusts_10m_max&forecast_days=4&timezone=Europe%2FMadrid")).getJSONObject("daily");
        sp.edit().putString("findeDay", today).apply();
        // índices 2 y 3 = sábado y domingo (hoy es jueves)
        boolean bueno = true; StringBuilder t = new StringBuilder();
        String[] dias = {"Sábado", "Domingo"};
        for (int k = 0; k < 2; k++) {
            int i = k + 2;
            double ll = d.getJSONArray("precipitation_sum").optDouble(i, 0), pr = d.getJSONArray("precipitation_probability_max").optDouble(i, 0);
            double tx = d.getJSONArray("temperature_2m_max").optDouble(i, 15), tn = d.getJSONArray("temperature_2m_min").optDouble(i, 5), ra = d.getJSONArray("wind_gusts_10m_max").optDouble(i, 0);
            if (ll >= 1 || pr >= 40 || tx > 32 || tx < 4 || ra > 60) bueno = false;
            t.append(k > 0 ? " · " : "").append(dias[k]).append(String.format(java.util.Locale.forLanguageTag("es-ES"), " %.0f°/%.0f°%s", tx, tn, ll >= 0.5 ? String.format(java.util.Locale.forLanguageTag("es-ES"), ", %.0f mm", ll) : ""));
        }
        if (bueno) notify(c, "🥾 Buen finde para el monte en " + f.optString(0), t + ". ¡A disfrutarlo!", 410);
    }

    /* ---------- 📜 Dato del día ----------
       Cada mañana (a la hora elegida en Ajustes) manda un dato histórico o curioso de Navarra.
       Lee efemerides/navarra.json de GitHub (si no hay internet, usa la última copia guardada).
       Misma lógica que web/efemerides.js: dato del día (MM-DD) o, si no hay, una curiosidad. */
    static final String DATO_URL = "https://raw.githubusercontent.com/Son-Pe-Technology/basatina/main/efemerides/navarra.json";
    static final String CH_DATO = "dato_dia_2";
    // OJO: la misma lista que EF_NO en web/efemerides.js. MAYÚSCULAS = siglas.
    static final String[] NO_DATO = {"elecci", "electoral", "partido politico", "parlament", "gobierno", "diputacion", "congreso de los diputados", "senado", "ministr", "alcald", "concejal",
            "presidente del", "presidenta del", "votacion", "referendum", "guerra", "batalla", "atentad", "terroris", "franquis", "dictadura", "golpe de estado", "fusilad",
            "carlis", "requete", "republica", "independentis", "nacionalis", "huelga", "manifestacion", "ETA", "UPN", "PSN", "PSOE", "PNV", "EH Bildu", "Bildu", "Geroa", "Podemos", "Vox", "PP"};

    static String nrm(String s) {
        return java.text.Normalizer.normalize(s == null ? "" : s, java.text.Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(java.util.Locale.ROOT);
    }

    static boolean datoMalo(JSONObject x, org.json.JSONArray extra) {
        String txt = x.optString("t") + " " + x.optString("txt"), n = nrm(txt);
        java.util.List<String> L = new java.util.ArrayList<>(java.util.Arrays.asList(NO_DATO));
        if (extra != null) for (int i = 0; i < extra.length(); i++) L.add(extra.optString(i));
        for (String w : L) {
            if (w == null || w.isEmpty()) continue;
            boolean siglas = w.equals(w.toUpperCase(java.util.Locale.ROOT)) && w.matches(".*[A-Z].*");
            if (siglas) { if (Pattern.compile("(^|[^A-Za-z])" + Pattern.quote(w) + "([^A-Za-z]|$)").matcher(txt).find()) return true; }
            else if (Pattern.compile("(^|[^a-z])" + Pattern.quote(nrm(w))).matcher(n).find()) return true;
        }
        return false;
    }

    static void checkDato(Context c) throws Exception {
        JSONObject cfg = cfg(c);
        if (!cfg.optBoolean("dato", false)) return;
        java.util.Calendar cal = java.util.Calendar.getInstance();
        if (cal.get(java.util.Calendar.HOUR_OF_DAY) < cfg.optInt("datoH", 9)) return;
        String today = String.format(java.util.Locale.US, "%tF", cal);
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        if (today.equals(sp.getString("datoDay", ""))) return;
        String body;
        try {
            body = get(DATO_URL + "?t=" + (System.currentTimeMillis() / 3600000L));
            new JSONObject(body);                       // comprobamos que es un JSON válido antes de guardarlo
            sp.edit().putString("datoJson", body).apply();
        } catch (Exception ex) {
            body = sp.getString("datoJson", "");
            if (body.isEmpty()) return;                  // sin internet y sin copia: ya lo intentará en 15 minutos
        }
        JSONObject D = new JSONObject(body);
        org.json.JSONArray ex = D.optJSONArray("prohibidas");
        String k = String.format(java.util.Locale.US, "%02d-%02d", cal.get(java.util.Calendar.MONTH) + 1, cal.get(java.util.Calendar.DAY_OF_MONTH));
        java.util.List<JSONObject> L = new java.util.ArrayList<>();
        JSONObject dias = D.optJSONObject("dias");
        org.json.JSONArray hoy = dias == null ? null : dias.optJSONArray(k);
        if (hoy != null) for (int i = 0; i < hoy.length(); i++) { JSONObject x = hoy.optJSONObject(i); if (x != null && !x.optString("t").isEmpty() && !datoMalo(x, ex)) L.add(x); }
        String titulo; JSONObject x = null; String sem = null;
        // 1º «Personaje de la semana»: semanas = [{desde:"AAAA-MM-DD" (sábado), personaje, dias:[7 datos]}]
        org.json.JSONArray S = D.optJSONArray("semanas");
        java.util.Calendar hoy0 = java.util.Calendar.getInstance();
        hoy0.set(cal.get(java.util.Calendar.YEAR), cal.get(java.util.Calendar.MONTH), cal.get(java.util.Calendar.DAY_OF_MONTH), 12, 0, 0);
        if (S != null) for (int j = 0; j < S.length() && x == null; j++) {
            JSONObject s = S.optJSONObject(j); if (s == null) continue;
            Matcher m = Pattern.compile("^(\\d{4})-(\\d\\d)-(\\d\\d)$").matcher(s.optString("desde"));
            if (!m.find()) continue;
            java.util.Calendar ini = java.util.Calendar.getInstance();
            ini.set(Integer.parseInt(m.group(1)), Integer.parseInt(m.group(2)) - 1, Integer.parseInt(m.group(3)), 12, 0, 0);
            long i = Math.round((hoy0.getTimeInMillis() - ini.getTimeInMillis()) / 86400000.0);
            if (i < 0 || i > 6) continue;
            org.json.JSONArray sd = s.optJSONArray("dias");
            JSONObject y = sd == null ? null : sd.optJSONObject((int) i);
            String per = s.optString("personaje");
            if (y != null && !y.optString("t").isEmpty() && !datoMalo(y, ex) && !datoMalo(new JSONObject().put("t", per), ex)) { x = y; sem = per + " (" + (i + 1) + "/7)"; }
        }
        if (x != null) {
            titulo = "⭐ " + sem + ": " + x.optString("t");
        } else if (!L.isEmpty()) {
            x = L.get(cal.get(java.util.Calendar.YEAR) % L.size());
            titulo = "📜 Tal día como hoy" + (x.has("a") ? " (" + x.optInt("a") + ")" : "") + ": " + x.optString("t");
        } else {
            org.json.JSONArray cu = D.optJSONArray("curiosidades");
            if (cu != null) for (int i = 0; i < cu.length(); i++) { JSONObject y = cu.optJSONObject(i); if (y != null && !y.optString("t").isEmpty() && !datoMalo(y, ex)) L.add(y); }
            if (L.isEmpty()) return;
            x = L.get(cal.get(java.util.Calendar.DAY_OF_YEAR) % L.size());
            titulo = "💡 Dato curioso de Navarra: " + x.optString("t");
        }
        sp.edit().putString("datoDay", today).apply();
        notifyDato(c, titulo, x.optString("txt"));
    }

    /** Canal propio y más discreto que el de los avisos del río (no suena como una alarma) */
    static void notifyDato(Context c, String title, String text) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        canal(c, CH_DATO, "Dato del día", "Un dato histórico o curioso de Navarra cada mañana", NotificationManager.IMPORTANCE_DEFAULT, R.raw.suave);
        PendingIntent pi = PendingIntent.getActivity(c, 0, new Intent(c, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new android.app.Notification.Builder(c, CH_DATO) : new android.app.Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_river).setContentTitle(title).setContentText(text)
                .setStyle(new android.app.Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi).setAutoCancel(true);
        try { nm.notify(500, b.build()); } catch (SecurityException ignored) {}
    }

    /* ---------- 😄 Noticia curiosa (APK 4.6 / código 26) ----------
       A las 9, 15 y 21 h (hora de Madrid) manda la noticia curiosa elegida para ese turno.
       Lee noticias/curiosas.json (robot tools/curiosas.py): dest = [{k:"AAAA-MM-DD-m|t|n", t, u, f}].
       Mismo turno que turno_de() del robot y cuTurno() de web/curiosas.js. Al tocar el aviso se abre la noticia.
       Se activa en Ajustes → «😄 Noticia curiosa» (cfg.curiosa). */
    static final String CUR_URL = "https://raw.githubusercontent.com/Son-Pe-Technology/basatina/main/noticias/curiosas.json";
    static final String CH_CUR = "noticia_curiosa_2";

    static void checkCuriosa(Context c) throws Exception {
        if (!cfg(c).optBoolean("curiosa", false)) return;
        java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Europe/Madrid"));
        int h = cal.get(java.util.Calendar.HOUR_OF_DAY);
        // solo dentro de cada turno, desde su hora: mañana 9-12, tarde 15-18, noche 21-23 (de madrugada no se avisa)
        String t = h >= 9 && h < 13 ? "m" : h >= 15 && h < 19 ? "t" : h >= 21 ? "n" : null;
        if (t == null) return;
        String k = String.format(java.util.Locale.US, "%04d-%02d-%02d-%s", cal.get(java.util.Calendar.YEAR), cal.get(java.util.Calendar.MONTH) + 1, cal.get(java.util.Calendar.DAY_OF_MONTH), t);
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        if (k.equals(sp.getString("curK", ""))) return;           // ya avisado en este turno
        JSONObject D = new JSONObject(get(CUR_URL + "?t=" + (System.currentTimeMillis() / 600000L)));
        org.json.JSONArray dest = D.optJSONArray("dest");
        JSONObject x = null;
        if (dest != null) for (int i = 0; i < dest.length(); i++) { JSONObject y = dest.optJSONObject(i); if (y != null && k.equals(y.optString("k"))) x = y; }
        if (x == null || x.optString("t").isEmpty()) return;      // el robot aún no la ha elegido: se mira otra vez en 15 min
        sp.edit().putString("curK", k).apply();
        String cuando = t.equals("m") ? "de la mañana" : t.equals("t") ? "de la tarde" : "de la noche";
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        canal(c, CH_CUR, "Noticia curiosa", "Una noticia simpática por la mañana, por la tarde y por la noche", NotificationManager.IMPORTANCE_DEFAULT, R.raw.suave);
        Intent it;
        String u = x.optString("u");
        if (u.startsWith("https://") || u.startsWith("http://")) it = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(u));
        else it = new Intent(c, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(c, 501, it, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        String text = x.optString("t") + " (" + x.optString("f") + ")";
        android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new android.app.Notification.Builder(c, CH_CUR) : new android.app.Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_river).setContentTitle("😄 La noticia curiosa " + cuando).setContentText(text)
                .setStyle(new android.app.Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi).setAutoCancel(true);
        try { nm.notify(510, b.build()); } catch (SecurityException ignored) {}
    }

    /** Avisa de los terremotos nuevos en Navarra y alrededores (datos del IGN a través del EMSC).
     *  Se activa en Ajustes → «Aviso de terremotos» (por defecto sí, desde magnitud 2,5). */
    static final String CH_SISMO = "avisos_sismo_2";
    static void checkSismo(Context c) throws Exception {
        JSONObject cfg = cfg(c);
        if (!cfg.optBoolean("sismo", true)) return;
        double minM = cfg.optDouble("sismoM", 2.5);
        java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US);
        f.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
        String t0 = f.format(new java.util.Date(System.currentTimeMillis() - 3 * 3600 * 1000L));
        String url = "https://www.seismicportal.eu/fdsnws/event/1/query?format=json&starttime=" + t0
                + "&minlat=41.9&maxlat=43.4&minlon=-2.6&maxlon=-0.6&minmag=" + minM + "&limit=20";
        org.json.JSONArray F = new JSONObject(get(url)).optJSONArray("features");
        if (F == null) return;
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        boolean first = !sp.contains("sisSeen");
        String seen = sp.getString("sisSeen", ",");
        StringBuilder keep = new StringBuilder(",");
        int n = 0;
        for (int i = 0; i < F.length(); i++) {
            JSONObject x = F.getJSONObject(i), p = x.optJSONObject("properties");
            if (p == null) continue;
            String id = p.optString("unid", p.optString("source_id", "" + i));
            keep.append(id).append(",");
            if (first || seen.contains("," + id + ",")) continue;
            double mag = p.optDouble("mag", Double.NaN);
            if (Double.isNaN(mag) || mag < minM) continue;
            org.json.JSONArray g = x.optJSONObject("geometry") != null ? x.getJSONObject("geometry").optJSONArray("coordinates") : null;
            String donde = "";
            if (g != null && g.length() >= 2) {
                double lo = g.optDouble(0), la = g.optDouble(1), prof = g.length() > 2 ? Math.abs(g.optDouble(2)) : Double.NaN;
                double dy = (la - 42.8125) * 111.2, dx = (lo + 1.6458) * 111.2 * Math.cos(Math.toRadians(42.8));
                donde = String.format(java.util.Locale.forLanguageTag("es-ES"), "A %.0f km de Pamplona", Math.hypot(dx, dy))
                        + (Double.isNaN(prof) ? "" : String.format(java.util.Locale.forLanguageTag("es-ES"), ", %.0f km de profundidad", prof)) + ". ";
            }
            String mg = String.format(java.util.Locale.forLanguageTag("es-ES"), "%.1f", mag);
            notifyCh(c, CH_SISMO, "Actividad sísmica", "Aviso cuando hay un terremoto en Navarra o alrededores",
                    "🌍 Terremoto de magnitud " + mg,
                    donde + (mag < 3 ? "Casi nadie lo habrá notado." : mag < 4 ? "Se ha podido notar cerca del epicentro." : "Se ha notado en una zona amplia.")
                            + " Datos: IGN / EMSC. Toca para verlo en la app.", 600 + (n++ % 10));
        }
        sp.edit().putString("sisSeen", keep.toString()).apply();
    }

    /* ---------- 🌧️ Aviso de lluvia (APK 4.9 / código 29, 20 nov. 2026; radar en la 5.0 / código 30) ----------
       Primero mira el RADAR de RainViewer (lluvia que ya cae, como Rain Alarm); si no hay, la PREVISIÓN (abajo).
       Cada vez que corre el trabajo (unos 15 minutos) mira si en los próximos 30 minutos va a llover dentro de la
       zona que vigila el usuario: un círculo de «r» km alrededor de donde estaba el móvil la última vez que se abrió
       la app (o del pueblo elegido). Se miran 17 puntos (el centro y dos anillos de 8) con Open‑Meteo (lluvia cada
       15 minutos y probabilidad por horas). Avisa si en algún punto llueve de verdad (0,4 mm/h o más) y la
       probabilidad es igual o mayor que la elegida (0–100 %). Dice la intensidad, a qué distancia y hacia dónde.
       No repite mientras siga lloviendo en la zona, salvo que la lluvia sea más fuerte. Respeta las horas de silencio.
       cfg.lluvia = {on, prob, r, sil:[desde,hasta] o null, pos:[lat,lon,nombre]} */
    static final String CH_LLUVIA = "aviso_lluvia";              // canal antiguo sin sonido propio (se borra en la 5.1)
    // 22 nov. 2026 (5.4): sonidos más cortos y más bajos. Android guarda el sonido en el canal y no deja cambiarlo,
    // así que van en canales nuevos («_2») y los de antes se borran (CH_VIEJOS).
    static final String CH_LLUVIA_S = "aviso_lluvia_sonido_2", CH_TORMENTA = "aviso_tormenta_sonido_2", CH_VIENTO = "aviso_viento_sonido_2";
    static final String CH_HELADA = "aviso_helada_sonido_2", CH_CALOR = "aviso_calor_sonido_2", CH_NIEBLA = "aviso_niebla_sonido_2";
    static final String[] CH_VIEJOS = {"aviso_lluvia", "aviso_lluvia_sonido", "aviso_tormenta_sonido", "aviso_viento_sonido",
            "aviso_helada_sonido", "aviso_calor_sonido", "aviso_niebla_sonido",
            "avisos_rio", "dato_dia", "noticia_curiosa", "avisos_sismo", "push_avisos", "push_desaparecidos"};

    /** 22 nov. 2026: TODOS los avisos suenan con un sonido de BasatiNA (antes unos sonaban con el del móvil y otros con
        los de la app). Sonidos cortos y suaves, por el volumen de notificaciones: aviso (río, carreteras, monte, avisos
        de BasatiNA), alerta (terremotos y personas desaparecidas), suave (dato del día y noticia curiosa) y los del tiempo.
        Android guarda el sonido en el canal al crearlo: si se cambia un sonido, hay que cambiar el nombre del canal. */
    static void canal(Context c, String id, String name, String desc, int imp, int raw) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        for (String v : CH_VIEJOS) try { if (nm.getNotificationChannel(v) != null) nm.deleteNotificationChannel(v); } catch (Exception ignored) {}
        if (nm.getNotificationChannel(id) != null) return;
        NotificationChannel nc = new NotificationChannel(id, name, imp);
        nc.setDescription(desc);
        nc.setSound(android.net.Uri.parse("android.resource://" + c.getPackageName() + "/" + raw), new android.media.AudioAttributes.Builder()
                .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
        nm.createNotificationChannel(nc);
    }
    /** Crea los canales al abrir la app (los avisos push que llegan con la app cerrada usan «push_avisos_2») */
    static void canales(Context c) {
        try {
            canal(c, CHANNEL, "Avisos del río", "Avisos cuando el Arga pasa de los umbrales que elijas", NotificationManager.IMPORTANCE_HIGH, R.raw.aviso);
            canal(c, "push_avisos_2", "Avisos de BasatiNA", "Avisos importantes de BasatiNA", NotificationManager.IMPORTANCE_DEFAULT, R.raw.aviso);
            canal(c, "push_desaparecidos_2", "Personas desaparecidas", "Alertas de personas desaparecidas en Navarra, en cuanto salen", NotificationManager.IMPORTANCE_HIGH, R.raw.alerta);
        } catch (Exception ignored) {}
    }

    /* ---------- 🥶 Helada · 🥵 Calor y UV · 🌫️ Niebla (APK 5.2 / código 32, 20 nov. 2026) ----------
       cfg.tiempo = {pos:[lat,lon,nombre], helada:{on,t (°C),h}, calor:{on,t (°C),uv (bool),h}, niebla:{on,m (metros),h}}.
       Cada aviso sale una vez al día, a partir de la hora h que elige el usuario (y hasta 3 horas después,
       por si Android retrasa el trabajo). Datos: Open‑Meteo (un punto: donde está el móvil).
       - Helada: la temperatura más baja desde ahora hasta mañana a las 11:00 es igual o menor que t.
       - Calor: la máxima de hoy es igual o mayor que t; y/o el índice UV máximo de hoy es 8 o más (muy alto).
       - Niebla: la visibilidad prevista en las próximas 3 horas baja de m metros. */
    static void checkTiempo(Context c) throws Exception {
        JSONObject cf = cfg(c).optJSONObject("tiempo");
        if (cf == null) return;
        org.json.JSONArray pos = cf.optJSONArray("pos");
        if (pos == null || pos.length() < 2) return;
        JSONObject he = cf.optJSONObject("helada"), ca = cf.optJSONObject("calor"), ni = cf.optJSONObject("niebla");
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        java.util.Locale US = java.util.Locale.US, ES = java.util.Locale.forLanguageTag("es-ES");
        java.util.Calendar cal = java.util.Calendar.getInstance();
        int hora = cal.get(java.util.Calendar.HOUR_OF_DAY);
        String hoy = String.format(US, "%1$tY-%1$tm-%1$td", cal.getTime());
        boolean dHe = toca(he, hora, sp, "tHelada", hoy, 20), dCa = toca(ca, hora, sp, "tCalor", hoy, 9), dNi = toca(ni, hora, sp, "tNiebla", hoy, 7);
        if (!dHe && !dCa && !dNi) return;
        double la = pos.optDouble(0), lo = pos.optDouble(1);
        String sitio = pos.optString(2, "tu zona");
        JSONObject o = new JSONObject(get(String.format(US, "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f", la, lo)
                + "&hourly=temperature_2m,visibility&daily=temperature_2m_max,uv_index_max&forecast_days=2&timezone=Europe%2FMadrid"));
        JSONObject H = o.getJSONObject("hourly"), D = o.getJSONObject("daily");
        org.json.JSONArray ht = H.getJSONArray("time"), tt = H.getJSONArray("temperature_2m"), vis = H.getJSONArray("visibility");
        String ahora = String.format(US, "%1$tY-%1$tm-%1$tdT%1$tH:00", cal.getTime());
        if (dHe) {
            java.util.Calendar m = (java.util.Calendar) cal.clone(); m.add(java.util.Calendar.DAY_OF_MONTH, 1);
            String hasta = String.format(US, "%1$tY-%1$tm-%1$tdT11:00", m.getTime());
            double tmin = 99; String cuando = "";
            for (int i = 0; i < ht.length(); i++) { String t = ht.optString(i); if (t.compareTo(ahora) < 0 || t.compareTo(hasta) > 0) continue;
                double v = tt.optDouble(i, 99); if (v < tmin) { tmin = v; cuando = t.substring(11, 16); } }
            sp.edit().putString("tHelada", hoy).apply();
            if (tmin <= he.optDouble("t", 0))
                notifySonido(c, CH_HELADA, "Aviso de helada", "Cuando va a helar esta noche donde estás (suena a hielo)",
                        String.format(ES, "🥶 Helada esta noche en %s: hasta %.0f °C", sitio, tmin),
                        String.format(ES, "La temperatura más baja será de unos %.0f °C hacia las %s. Protege las plantas y las tuberías, y cuidado con el hielo en la carretera por la mañana. Tu aviso: %s °C o menos.",
                                tmin, cuando, fmt1(he.optDouble("t", 0))), 620, es.pedrito.controlarga.R.raw.helada);
        }
        if (dCa) {
            double tmax = D.getJSONArray("temperature_2m_max").optDouble(0, -99), uv = D.getJSONArray("uv_index_max").optDouble(0, 0);
            boolean calor = tmax >= ca.optDouble("t", 35), uvAlto = ca.optBoolean("uv", true) && uv >= 8;
            sp.edit().putString("tCalor", hoy).apply();
            if (calor || uvAlto) {
                String tit = calor ? String.format(ES, "🥵 Calor fuerte hoy en %s: hasta %.0f °C", sitio, tmax)
                                   : String.format(ES, "☀️ Índice UV muy alto hoy en %s: %.0f", sitio, uv);
                String txt = (calor ? String.format(ES, "Máxima de unos %.0f °C. Bebe agua, evita el sol de las horas centrales y no dejes a nadie (ni mascotas) dentro del coche. ", tmax) : "")
                        + (uv >= 8 ? String.format(ES, "Índice UV de %.0f (%s): protector solar, gorra y gafas.", uv, uv >= 11 ? "extremo" : "muy alto") : "");
                notifySonido(c, CH_CALOR, "Aviso de calor y UV", "Calor fuerte o índice UV muy alto donde estás (suena a chicharras)", tit, txt.trim(), 621, es.pedrito.controlarga.R.raw.calor);
            }
        }
        if (dNi) {
            java.util.Calendar m = (java.util.Calendar) cal.clone(); m.add(java.util.Calendar.HOUR_OF_DAY, 3);
            String hasta = String.format(US, "%1$tY-%1$tm-%1$tdT%1$tH:00", m.getTime());
            double vmin = 1e9; String fin = "";
            for (int i = 0; i < ht.length(); i++) { String t = ht.optString(i); if (t.compareTo(ahora) < 0 || t.compareTo(hasta) > 0) continue;
                double v = vis.optDouble(i, 1e9); if (v < vmin) vmin = v; if (v < ni.optDouble("m", 500)) fin = t.substring(11, 16); }
            sp.edit().putString("tNiebla", hoy).apply();
            if (vmin < ni.optDouble("m", 500))
                notifySonido(c, CH_NIEBLA, "Aviso de niebla", "Niebla por la mañana donde estás (suena a sirena de niebla)",
                        String.format(ES, "🌫️ Niebla en %s: visibilidad de unos %s", sitio, vmin < 1000 ? String.format(ES, "%.0f m", Math.max(50, Math.round(vmin / 50.0) * 50.0)) : String.format(ES, "%.1f km", vmin / 1000)),
                        String.format(ES, "Previsión para las próximas 3 horas (al menos hasta las %s). Si coges el coche: luces de cruce o antiniebla, más distancia y menos velocidad.", fin), 622, es.pedrito.controlarga.R.raw.niebla);
        }
    }
    static String fmt1(double v) { return v == Math.rint(v) ? String.valueOf((int) v) : String.format(java.util.Locale.forLanguageTag("es-ES"), "%.1f", v); }
    /** ¿Toca mirar este aviso? Activado, a partir de su hora (hasta 3 h después) y aún no mirado hoy */
    static boolean toca(JSONObject a, int hora, SharedPreferences sp, String clave, String hoy, int hPorDefecto) {
        if (a == null || !a.optBoolean("on", false)) return false;
        int h = a.optInt("h", hPorDefecto);
        boolean enHora = hora >= h && hora < h + 3;
        return enHora && !hoy.equals(sp.getString(clave, ""));
    }

    /** Horas de silencio: sil = [desde, hasta] (puede pasar de medianoche) */
    static boolean silencio(JSONObject l) {
        org.json.JSONArray sil = l.optJSONArray("sil");
        if (sil == null || sil.length() != 2) return false;
        int h = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY), a = sil.optInt(0), b = sil.optInt(1);
        if (a == b) return false;
        return a < b ? (h >= a && h < b) : (h >= a || h < b);
    }

    /* ---------- 💨 Aviso de viento (APK 5.1 / código 31, 20 nov. 2026) ----------
       cfg.viento = {on, kmh (rachas mínimas), r (km), sil:[desde,hasta] o null, pos:[lat,lon,nombre]}.
       Mira con Open‑Meteo las rachas de la próxima hora (cada 15 min) en el centro y dos anillos de 8 puntos.
       Avisa si alguna racha llega al mínimo elegido; vuelve a avisar solo si va a más (+20 km/h) o tras 3 horas. */
    static void checkViento(Context c) throws Exception {
        JSONObject v = cfg(c).optJSONObject("viento");
        if (v == null || !v.optBoolean("on", false) || silencio(v)) return;
        org.json.JSONArray pos = v.optJSONArray("pos");
        if (pos == null || pos.length() < 2) return;
        double la0 = pos.optDouble(0), lo0 = pos.optDouble(1);
        String sitio = pos.optString(2, "tu zona");
        int min = Math.max(20, v.optInt("kmh", 60)), r = Math.max(0, Math.min(50, v.optInt("r", 10)));
        java.util.Locale US = java.util.Locale.US, ES = java.util.Locale.forLanguageTag("es-ES");
        java.util.List<double[]> P = new java.util.ArrayList<>();
        P.add(new double[]{la0, lo0, 0, -1});
        if (r > 0) for (double d : new double[]{r / 2.0, r}) for (int k = 0; k < 8; k++) {
            double ang = Math.toRadians(k * 45);
            P.add(new double[]{la0 + (d / 111.32) * Math.cos(ang), lo0 + (d / (111.32 * Math.cos(Math.toRadians(la0)))) * Math.sin(ang), d, k});
        }
        StringBuilder LA = new StringBuilder(), LO = new StringBuilder();
        for (int i = 0; i < P.size(); i++) { if (i > 0) { LA.append(','); LO.append(','); } LA.append(String.format(US, "%.4f", P.get(i)[0])); LO.append(String.format(US, "%.4f", P.get(i)[1])); }
        String body = get("https://api.open-meteo.com/v1/forecast?latitude=" + LA + "&longitude=" + LO
                + "&minutely_15=wind_gusts_10m,wind_speed_10m,wind_direction_10m&forecast_minutely_15=8&wind_speed_unit=kmh&timezone=Europe%2FMadrid");
        org.json.JSONArray arr = body.trim().startsWith("[") ? new org.json.JSONArray(body) : new org.json.JSONArray().put(new JSONObject(body));
        String desde = String.format(US, "%1$tY-%1$tm-%1$tdT%1$tH:%1$tM", new java.util.Date(System.currentTimeMillis() - 15 * 60 * 1000L));
        String hasta = String.format(US, "%1$tY-%1$tm-%1$tdT%1$tH:%1$tM", new java.util.Date(System.currentTimeMillis() + 60 * 60 * 1000L));
        double maxG = 0, med = 0, dir = 0, dist = 0; int k8 = -1;
        for (int i = 0; i < arr.length() && i < P.size(); i++) {
            JSONObject m = arr.getJSONObject(i).getJSONObject("minutely_15");
            org.json.JSONArray t = m.getJSONArray("time"), g = m.getJSONArray("wind_gusts_10m"), w = m.getJSONArray("wind_speed_10m"), dd = m.getJSONArray("wind_direction_10m");
            for (int j = 0; j < t.length(); j++) {
                String tt = t.optString(j);
                if (tt.compareTo(desde) <= 0 || tt.compareTo(hasta) > 0) continue;
                double gj = g.optDouble(j, 0);
                if (gj > maxG) { maxG = gj; med = w.optDouble(j, 0); dir = dd.optDouble(j, 0); dist = P.get(i)[2]; k8 = (int) P.get(i)[3]; }
            }
        }
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        long now = System.currentTimeMillis();
        int antes = sp.getInt("vientoMax", 0);
        if (maxG < min) { if (now - sp.getLong("vientoT", 0) > 60 * 60 * 1000L) sp.edit().putInt("vientoMax", 0).apply(); return; }
        if (antes > 0 && maxG < antes + 20 && now - sp.getLong("vientoT", 0) < 3 * 60 * 60 * 1000L) return;   // ya avisado
        sp.edit().putInt("vientoMax", (int) maxG).putLong("vientoT", now).apply();
        String[] rumbo = {"norte", "nordeste", "este", "sudeste", "sur", "sudoeste", "oeste", "noroeste"};
        String fuerza = maxG >= 100 ? "Rachas muy fuertes" : maxG >= 70 ? "Rachas fuertes" : "Rachas de viento";
        String donde = dist < 2 ? "en " + sitio : String.format(ES, "a %.0f km al %s de %s", dist, rumbo[Math.max(0, k8)], sitio);
        String tit = String.format(ES, "💨 %s de %.0f km/h%s %s", fuerza, maxG, antes > 0 ? " (va a más)" : "", donde);
        String zona = r == 0 ? "solo " + sitio : r + " km alrededor de " + sitio;
        String txt = String.format(ES, "Previsión para la próxima hora: viento del %s de unos %.0f km/h con rachas de hasta %.0f km/h. Tu mínimo: %d km/h. Zona vigilada: %s.",
                rumbo[(int) Math.round(((dir % 360) + 360) % 360 / 45.0) % 8], med, maxG, min, zona);
        notifySonido(c, CH_VIENTO, "Aviso de viento", "Rachas de viento fuertes en la zona que eliges (suena a viento)", tit, txt, 610, R.raw.viento);
    }

    /** Notificación con sonido propio (lluvia, tormenta o viento). En Android 8+ el sonido va en el canal y no se puede
        cambiar después: por eso cada sonido tiene su canal. El usuario puede cambiarlo o silenciarlo en los ajustes del móvil. */
    static void notifySonido(Context c, String ch, String chName, String chDesc, String title, String text, int id, int raw) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        android.net.Uri snd = android.net.Uri.parse("android.resource://" + c.getPackageName() + "/" + raw);
        if (Build.VERSION.SDK_INT >= 26) {
            for (String v : CH_VIEJOS) try { if (nm.getNotificationChannel(v) != null) nm.deleteNotificationChannel(v); } catch (Exception ignored) {}
            if (nm.getNotificationChannel(ch) == null) {
                NotificationChannel nc = new NotificationChannel(ch, chName, NotificationManager.IMPORTANCE_HIGH);
                nc.setDescription(chDesc);
                nc.setSound(snd, new android.media.AudioAttributes.Builder()
                        .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
                nm.createNotificationChannel(nc);
            }
        }
        PendingIntent pi = PendingIntent.getActivity(c, 0, new Intent(c, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new android.app.Notification.Builder(c, ch) : new android.app.Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_river).setContentTitle(title).setContentText(text)
                .setStyle(new android.app.Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi).setAutoCancel(true);
        if (Build.VERSION.SDK_INT < 26) b.setSound(snd);
        try { nm.notify(id, b.build()); } catch (SecurityException ignored) {}
    }
    static void checkLluvia(Context c) throws Exception {
        JSONObject l = cfg(c).optJSONObject("lluvia");
        if (l == null || !l.optBoolean("on", false)) return;
        org.json.JSONArray pos = l.optJSONArray("pos");
        if (pos == null || pos.length() < 2) return;
        double la0 = pos.optDouble(0), lo0 = pos.optDouble(1);
        String sitio = pos.optString(2, "tu zona");
        int prob = l.optInt("prob", 60), r = Math.max(0, Math.min(50, l.optInt("r", 10)));
        SharedPreferences sp = c.getSharedPreferences("rio", MODE_PRIVATE);
        java.util.Calendar cal = java.util.Calendar.getInstance();
        org.json.JSONArray sil = l.optJSONArray("sil");
        if (sil != null && sil.length() == 2) {
            int h = cal.get(java.util.Calendar.HOUR_OF_DAY), a = sil.optInt(0), b = sil.optInt(1);
            boolean callado = a < b ? (h >= a && h < b) : (h >= a || h < b);
            if (a != b && callado) return;
        }
        String[] rumbo = {"norte", "nordeste", "este", "sudeste", "sur", "sudoeste", "oeste", "noroeste"};
        java.util.Locale ES = java.util.Locale.forLanguageTag("es-ES");
        // 1) RADAR en directo (lluvia que ya está cayendo), 2) si no hay, PREVISIÓN de la próxima media hora
        double[] R = null; boolean deRadar = false;
        if (l.optBoolean("radar", true)) try { R = radar(la0, lo0, Math.max(2, r)); deRadar = R != null; } catch (Exception ignored) {}
        if (R == null && l.optBoolean("prev", true)) R = prevision(la0, lo0, r, prob);
        long now = System.currentTimeMillis();
        int nivel = R == null ? 0 : R[0] < 2 ? 1 : R[0] < 10 ? 2 : R[0] < 30 ? 3 : 4;
        int antes = sp.getInt("lluviaNivel", 0);
        sp.edit().putInt("lluviaNivel", nivel).apply();
        if (nivel == 0 || nivel <= antes) return;     // sin lluvia, o ya avisado de una igual o más fuerte
        if (antes > 0 && now - sp.getLong("lluviaT", 0) < 30 * 60 * 1000L) return;
        sp.edit().putLong("lluviaT", now).apply();
        boolean nieve = R.length > 5 && R[5] > 0;
        String[] nom = nieve ? new String[]{"", "Nieve débil", "Nieve moderada", "Nieve fuerte", "Nieve muy fuerte"}
                             : new String[]{"", "Lluvia débil", "Lluvia moderada", "Lluvia fuerte", "Lluvia muy fuerte"};
        String[] ico = nieve ? new String[]{"", "🌨️", "🌨️", "❄️", "❄️"} : new String[]{"", "🌦️", "🌧️", "🌧️", "⛈️"};
        double d = R[1];
        String donde = d < 2 ? "en " + sitio : String.format(ES, "a %.0f km al %s de %s", d, rumbo[(int) R[2]], sitio);
        String tit = ico[nivel] + " " + nom[nivel] + (antes > 0 ? " (va a más)" : "") + " " + donde;
        String zona = r == 0 ? "solo " + sitio : r + " km alrededor de " + sitio;
        String txt;
        if (deRadar) {
            String mov = R[4] > 3 ? String.format(ES, " Se acerca a unos %.0f km/h%s.", R[4], d >= 2 ? String.format(ES, ": llegaría en unos %.0f minutos", d / R[4] * 60) : "")
                       : R[4] < -3 ? " Se está alejando." : "";
            txt = String.format(ES, "Radar en directo (RainViewer): unos %.1f mm/h.%s Zona vigilada: %s.", R[0], mov, zona);
        } else {
            txt = String.format(ES, "Previsión: probabilidad %.0f %% · unos %.1f mm/h · en la próxima media hora. Zona vigilada: %s.", R[3], R[0], zona);
        }
        // 🔊 APK 5.1: con sonido propio. Lluvia fuerte o muy fuerte (10 mm/h o más) → lluvia con truenos
        if (nivel >= 3 && !nieve)
            notifySonido(c, CH_TORMENTA, "Aviso de lluvia fuerte", "Lluvia fuerte o muy fuerte en la zona que eliges (suena a tormenta)", tit, txt, 600, es.pedrito.controlarga.R.raw.tormenta);
        else
            notifySonido(c, CH_LLUVIA_S, "Aviso de lluvia", "Cuando va a llover en la zona que eliges (suena a lluvia)", tit, txt, 600, es.pedrito.controlarga.R.raw.lluvia);
    }

    /* Radar de RainViewer (gratis citando la fuente; se actualiza cada 10 minutos). Se pide una tesela de 256 px a
       zoom 7 centrada en el móvil (cada píxel ≈ 0,9 km) del último fotograma y del de hace 20 minutos. El color de cada
       píxel se traduce a dBZ con la tabla oficial de colores «Universal Blue» y los dBZ a mm/h (Marshall‑Palmer).
       Devuelve {mm/h máx., km a la lluvia más cercana, rumbo 0‑7, -, km/h a los que se acerca, 1 si es nieve} o null. */
    static final int[][] RV_LLUVIA = {{15,0x88ddee},{16,0x6cd1eb},{17,0x51c5e8},{18,0x36bae5},{19,0x1baee2},{20,0x00a3e0},{21,0x009ad5},{22,0x0091ca},{23,0x0088bf},
        {24,0x007fb4},{25,0x0077aa},{26,0x0070a3},{27,0x00699c},{28,0x006295},{29,0x005b8e},{30,0x005588},{31,0x005180},{32,0x004e78},{33,0x004a70},{34,0x004768},
        {35,0xffee00},{36,0xffe000},{37,0xffd200},{38,0xffc500},{39,0xffb700},{40,0xffaa00},{41,0xff9f00},{42,0xff9500},{43,0xff8b00},{44,0xff8100},
        {45,0xff4400},{46,0xf23600},{47,0xe62800},{48,0xd91b00},{49,0xcd0d00},{50,0xc10000},{51,0xa80000},{52,0x8f0000},{53,0x760000},{54,0x5d0000},
        {55,0xffaaff},{58,0xff8bff},{61,0xff6cff},{64,0xff4eff},{65,0xffffff}};
    static final int[][] RV_NIEVE = {{10,0xbfffff},{15,0x9fdfff},{20,0x7fbfff},{25,0x5f9fff},{30,0x4f8fff},{35,0x3f7fff},{40,0x2f6fff},{45,0x1f5fff},{50,0x0f4fff},{55,0x003fff},{65,0x001fff},{75,0x0000ff}};
    static int[] dbz(int px) {   // {dBZ, 1 si nieve} o null si no hay precipitación
        if (((px >>> 24) & 0xff) < 200) return null;          // transparente o casi: nada (o llovizna por debajo de 15 dBZ)
        int r = (px >> 16) & 0xff, g = (px >> 8) & 0xff, b = px & 0xff, best = -1, bd = Integer.MAX_VALUE, sn = 0;
        for (int k = 0; k < 2; k++) for (int[] e : k == 0 ? RV_LLUVIA : RV_NIEVE) {
            int er = (e[1] >> 16) & 0xff, eg = (e[1] >> 8) & 0xff, eb = e[1] & 0xff, dd = (r - er) * (r - er) + (g - eg) * (g - eg) + (b - eb) * (b - eb);
            if (dd < bd) { bd = dd; best = e[0]; sn = k; }
        }
        return bd > 2500 ? null : new int[]{best, sn};
    }
    static double mmh(int dbz) { return Math.pow(Math.pow(10, dbz / 10.0) / 200.0, 1 / 1.6); }
    /** {mm/h máx., km al píxel con lluvia más cercano, rumbo, nieve} dentro del círculo, o null */
    static double[] radarTesela(String host, String path, double la, double lo, double rKm) throws Exception {
        java.util.Locale US = java.util.Locale.US;
        HttpURLConnection c = (HttpURLConnection) new URL(host + path + String.format(US, "/256/7/%.4f/%.4f/2/0_1.png", la, lo)).openConnection();
        c.setConnectTimeout(20000); c.setReadTimeout(30000); c.setRequestProperty("User-Agent", "BasatiNA");
        if (c.getResponseCode() != 200) return null;
        android.graphics.Bitmap bm = android.graphics.BitmapFactory.decodeStream(c.getInputStream());
        if (bm == null) return null;
        int W = bm.getWidth(), H = bm.getHeight(); int[] px = new int[W * H]; bm.getPixels(px, 0, W, 0, 0, W, H); bm.recycle();
        double kmPx = 156543.03 * Math.cos(Math.toRadians(la)) / 128 / 1000 * (256.0 / W);   // ≈ 0,9 km por píxel en Navarra
        int cx = W / 2, cy = H / 2, rp = (int) Math.ceil(rKm / kmPx);
        double max = 0, best = 1e9; int bx = 0, by = 0, nieve = 0;
        for (int y = Math.max(0, cy - rp); y <= Math.min(H - 1, cy + rp); y++) for (int x = Math.max(0, cx - rp); x <= Math.min(W - 1, cx + rp); x++) {
            double dk = Math.hypot(x - cx, y - cy) * kmPx; if (dk > rKm) continue;
            int[] z = dbz(px[y * W + x]); if (z == null || z[0] < 17) continue;   // 17 dBZ ≈ 0,4 mm/h: lluvia de verdad
            double v = mmh(z[0]); if (v > max) { max = v; nieve = z[1]; }
            if (dk < best) { best = dk; bx = x - cx; by = y - cy; }
        }
        if (max <= 0) return null;
        double ang = (Math.toDegrees(Math.atan2(bx, -by)) + 360) % 360;   // 0 = norte, 90 = este
        return new double[]{max, best, Math.round(ang / 45) % 8, nieve};
    }
    static double[] radar(double la, double lo, double rKm) throws Exception {
        JSONObject j = new JSONObject(get("https://api.rainviewer.com/public/weather-maps.json"));
        String host = j.getString("host"); org.json.JSONArray past = j.getJSONObject("radar").getJSONArray("past");
        if (past.length() == 0) return null;
        JSONObject f = past.getJSONObject(past.length() - 1);
        double[] a = radarTesela(host, f.getString("path"), la, lo, rKm);
        if (a == null) return null;
        double vel = 0;   // ¿se acerca? comparamos con el fotograma de hace unos 20 minutos, mirando un círculo más grande
        try {
            JSONObject f0 = past.getJSONObject(Math.max(0, past.length() - 3));
            double[] b = radarTesela(host, f0.getString("path"), la, lo, rKm + 30);
            double min = (f.getLong("time") - f0.getLong("time")) / 60.0;
            if (b != null && min > 0) vel = (b[1] - a[1]) / min * 60;
        } catch (Exception ignored) {}
        return new double[]{a[0], a[1], a[2], 0, vel, a[3]};
    }

    /** Previsión de Open‑Meteo (17 puntos, próxima media hora): {mm/h, km, rumbo, probabilidad} o null */
    static double[] prevision(double la0, double lo0, int r, int prob) throws Exception {
        java.util.Locale US = java.util.Locale.US;
        java.util.List<double[]> P = new java.util.ArrayList<>();
        P.add(new double[]{la0, lo0, 0, -1});
        if (r > 0) for (double d : new double[]{r / 2.0, r}) for (int k = 0; k < 8; k++) {
            double ang = Math.toRadians(k * 45);
            double la = la0 + (d / 111.32) * Math.cos(ang), lo = lo0 + (d / (111.32 * Math.cos(Math.toRadians(la0)))) * Math.sin(ang);
            P.add(new double[]{la, lo, d, k});
        }
        StringBuilder LA = new StringBuilder(), LO = new StringBuilder();
        for (int i = 0; i < P.size(); i++) { if (i > 0) { LA.append(','); LO.append(','); } LA.append(String.format(US, "%.4f", P.get(i)[0])); LO.append(String.format(US, "%.4f", P.get(i)[1])); }
        String body = get("https://api.open-meteo.com/v1/forecast?latitude=" + LA + "&longitude=" + LO
                + "&minutely_15=precipitation&hourly=precipitation_probability&forecast_minutely_15=8&forecast_hours=2&timezone=Europe%2FMadrid");
        org.json.JSONArray arr = body.trim().startsWith("[") ? new org.json.JSONArray(body) : new org.json.JSONArray().put(new JSONObject(body));
        double best = -1, bestD = 1e9, maxMmh = 0; int bestK = -1, bestP = 0;
        for (int i = 0; i < arr.length() && i < P.size(); i++) {
            JSONObject o = arr.getJSONObject(i);
            JSONObject m15 = o.getJSONObject("minutely_15");
            org.json.JSONArray m = m15.getJSONArray("precipitation"), mt = m15.getJSONArray("time");
            // solo los cuartos de hora de ahora a dentro de 30 minutos (la hora viene en hora de Madrid, igual que «ahora»)
            String desde = String.format(US, "%1$tY-%1$tm-%1$tdT%1$tH:%1$tM", new java.util.Date(System.currentTimeMillis() - 15 * 60 * 1000L));
            String hasta = String.format(US, "%1$tY-%1$tm-%1$tdT%1$tH:%1$tM", new java.util.Date(System.currentTimeMillis() + 30 * 60 * 1000L));
            double mm = 0;
            for (int j = 0; j < m.length(); j++) { String t = mt.optString(j); if (t.compareTo(desde) > 0 && t.compareTo(hasta) <= 0) mm = Math.max(mm, m.optDouble(j, 0)); }
            double mmh = mm * 4;
            org.json.JSONArray pp = o.getJSONObject("hourly").getJSONArray("precipitation_probability");
            int pr = Math.max(pp.optInt(0, 0), pp.optInt(1, 0));
            if (mmh < 0.4 || pr < prob) continue;
            maxMmh = Math.max(maxMmh, mmh);
            if (P.get(i)[2] < bestD) { bestD = P.get(i)[2]; bestK = (int) P.get(i)[3]; bestP = pr; best = mmh; }
        }
        return best < 0 ? null : new double[]{maxMmh, bestD, Math.max(0, bestK), bestP};
    }

    static void notifyCh(Context c, String ch, String chName, String chDesc, String title, String text, int id) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        canal(c, ch, chName, chDesc, NotificationManager.IMPORTANCE_HIGH, CH_SISMO.equals(ch) ? R.raw.alerta : R.raw.aviso);
        PendingIntent pi = PendingIntent.getActivity(c, 0, new Intent(c, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new android.app.Notification.Builder(c, ch) : new android.app.Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_river).setContentTitle(title).setContentText(text)
                .setStyle(new android.app.Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi).setAutoCancel(true);
        try { nm.notify(id, b.build()); } catch (SecurityException ignored) {}
    }

    static void notify(Context c, String title, String text, int id) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        canal(c, CHANNEL, "Avisos del río", "Avisos cuando el Arga pasa de los umbrales que elijas", NotificationManager.IMPORTANCE_HIGH, R.raw.aviso);
        PendingIntent pi = PendingIntent.getActivity(c, 0, new Intent(c, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new android.app.Notification.Builder(c, CHANNEL) : new android.app.Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_river).setContentTitle(title).setContentText(text)
                .setStyle(new android.app.Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi).setAutoCancel(true);
        try { nm.notify(id, b.build()); } catch (SecurityException ignored) {}
    }
}
