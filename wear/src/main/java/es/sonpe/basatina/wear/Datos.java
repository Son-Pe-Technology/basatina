package es.sonpe.basatina.wear;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ⌚ Datos del reloj (25 nov. 2026): el tiempo en Pamplona (Open‑Meteo) y el Arga en Burlada + el embalse
 * de Eugui (SAIH Ebro), las mismas fuentes que la app del móvil (RiverJob.java).
 * Lo último que se leyó se guarda en el reloj: si no hay conexión, se enseña eso con su hora.
 */
public class Datos {
    static final double LA = 42.8125, LO = -1.6458;          // Pamplona
    static final String SAIH = "https://www.saihebro.com/api/ficha/procesarTablaValoresActuales?estacion=";
    static final double Q_AMARILLO = 150, Q_ROJO = 300;       // m³/s, los mismos umbrales por defecto que el móvil

    // lo que se enseña (NaN = no hay dato)
    double temp = Double.NaN, max = Double.NaN, min = Double.NaN, lluviaMm = Double.NaN, viento = Double.NaN;
    int codigo = -1, probLluvia = -1; boolean dia = true;
    double caudal = Double.NaN, subidaHora = Double.NaN, eugui = Double.NaN;
    long tTiempo = 0, tRio = 0;

    static SharedPreferences sp(Context c) { return c.getSharedPreferences("reloj", Context.MODE_PRIVATE); }

    /** Lo último guardado (al momento, sin internet) */
    static Datos guardados(Context c) {
        SharedPreferences s = sp(c); Datos d = new Datos();
        d.temp = s.getFloat("temp", Float.NaN); d.max = s.getFloat("max", Float.NaN); d.min = s.getFloat("min", Float.NaN);
        d.lluviaMm = s.getFloat("lluviaMm", Float.NaN); d.viento = s.getFloat("viento", Float.NaN);
        d.codigo = s.getInt("codigo", -1); d.probLluvia = s.getInt("probLluvia", -1); d.dia = s.getBoolean("dia", true);
        d.caudal = s.getFloat("caudal", Float.NaN); d.subidaHora = s.getFloat("subidaHora", Float.NaN); d.eugui = s.getFloat("eugui", Float.NaN);
        d.tTiempo = s.getLong("tTiempo", 0); d.tRio = s.getLong("tRio", 0);
        return d;
    }

    /** Lee de internet lo que pueda y lo guarda. Hay que llamarlo fuera del hilo principal. */
    static Datos actualiza(Context c) {
        Datos d = guardados(c); SharedPreferences.Editor e = sp(c).edit(); long ahora = System.currentTimeMillis();
        // 1) el tiempo
        try {
            JSONObject o = new JSONObject(get(String.format(Locale.US,
                "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f"
                + "&current=temperature_2m,weather_code,is_day,wind_speed_10m"
                + "&minutely_15=precipitation&forecast_minutely_15=4"
                + "&hourly=precipitation_probability&forecast_hours=2"
                + "&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=Europe%%2FMadrid", LA, LO)));
            JSONObject cu = o.getJSONObject("current");
            d.temp = cu.getDouble("temperature_2m"); d.codigo = cu.optInt("weather_code", -1);
            d.dia = cu.optInt("is_day", 1) == 1; d.viento = cu.optDouble("wind_speed_10m", Double.NaN);
            JSONObject dl = o.getJSONObject("daily");
            d.max = dl.getJSONArray("temperature_2m_max").getDouble(0); d.min = dl.getJSONArray("temperature_2m_min").getDouble(0);
            double mm = 0; JSONArray p = o.getJSONObject("minutely_15").getJSONArray("precipitation");
            for (int i = 0; i < p.length(); i++) mm += p.optDouble(i, 0);       // lluvia de la próxima hora (4 × 15 min)
            d.lluviaMm = mm;
            JSONArray pp = o.getJSONObject("hourly").getJSONArray("precipitation_probability");
            int mx = -1; for (int i = 0; i < pp.length(); i++) mx = Math.max(mx, pp.optInt(i, -1));
            d.probLluvia = mx; d.tTiempo = ahora;
            e.putFloat("temp", (float) d.temp).putFloat("max", (float) d.max).putFloat("min", (float) d.min)
             .putFloat("lluviaMm", (float) d.lluviaMm).putFloat("viento", (float) d.viento)
             .putInt("codigo", d.codigo).putInt("probLluvia", d.probLluvia).putBoolean("dia", d.dia).putLong("tTiempo", ahora);
        } catch (Exception ignored) {}
        // 2) el río y el embalse
        try {
            double q = valor(new JSONObject(get(SAIH + "A313")).optString("VALORES_ACTUALES"), "CAUDAL");
            if (!Double.isNaN(q)) {
                // ¿cuánto ha subido en la última hora? se guarda una referencia cada hora (como el móvil)
                SharedPreferences s = sp(c); long refT = s.getLong("refT", 0); float refQ = s.getFloat("refQ", Float.NaN);
                if (refT > 0 && !Float.isNaN(refQ) && ahora - refT < 3 * 3600_000L)
                    d.subidaHora = (q - refQ) / Math.max(0.25, (ahora - refT) / 3600_000.0);
                if (refT == 0 || ahora - refT > 3600_000L) e.putLong("refT", ahora).putFloat("refQ", (float) q);
                d.caudal = q; d.tRio = ahora;
                e.putFloat("caudal", (float) q).putFloat("subidaHora", (float) d.subidaHora).putLong("tRio", ahora);
            }
        } catch (Exception ignored) {}
        try {
            double pct = valor(new JSONObject(get(SAIH + "E025")).optString("VALORES_ACTUALES"), "% VOLUMEN");
            if (!Double.isNaN(pct)) {d.eugui = pct; e.putFloat("eugui", (float) pct);}
        } catch (Exception ignored) {}
        e.apply();
        return d;
    }

    // ---------- textos ----------
    static String desc(int c) {
        if (c < 0) return "";
        if (c == 0) return "Despejado"; if (c <= 2) return "Algo nuboso"; if (c == 3) return "Cubierto";
        if (c == 45 || c == 48) return "Niebla"; if (c <= 57) return "Llovizna"; if (c <= 67) return "Lluvia";
        if (c <= 77) return "Nieve"; if (c <= 82) return "Chubascos"; if (c <= 86) return "Chubascos de nieve";
        return "Tormenta";
    }
    static String icono(int c, boolean dia) {
        if (c < 0) return ""; if (c == 0) return dia ? "☀️" : "🌙"; if (c <= 2) return dia ? "⛅" : "☁️"; if (c == 3) return "☁️";
        if (c == 45 || c == 48) return "🌫️"; if (c <= 67 || (c >= 80 && c <= 82)) return "🌧️"; if (c <= 77 || c == 85 || c == 86) return "❄️";
        return "⛈️";
    }
    /** 0 normal, 1 amarillo, 2 rojo */
    int nivelRio() { return Double.isNaN(caudal) ? 0 : caudal >= Q_ROJO ? 2 : caudal >= Q_AMARILLO ? 1 : 0; }
    static String n1(double x) { return String.format(new Locale("es", "ES"), "%.1f", x); }
    static String n0(double x) { return String.valueOf(Math.round(x)); }

    // ---------- red ----------
    static String get(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(15000); c.setReadTimeout(20000);
        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android; Wear OS) BasatiNA-reloj/1.0");
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream b = new ByteArrayOutputStream(); byte[] buf = new byte[8192]; int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return b.toString(StandardCharsets.UTF_8.name());
        } finally { c.disconnect(); }
    }
    /** Busca en la tabla de la ficha del SAIH la fila cuyo nombre contiene «clave» (igual que RiverJob.value) */
    static double valor(String html, String clave) {
        for (String row : html.split("<tr>")) {
            Matcher n = Pattern.compile("aria-label='Señal ([^']*)'").matcher(row);
            Matcher v = Pattern.compile("aria-label='Valor (-?[\\d.,]+)").matcher(row);
            if (n.find() && v.find() && n.group(1).toUpperCase().contains(clave))
                return Double.parseDouble(v.group(1).replace(".", "").replace(",", "."));
        }
        return Double.NaN;
    }
}
