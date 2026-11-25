package es.sonpe.basatina.wear;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * ⌚ El tiempo en el reloj (25 nov. 2026), de Open‑Meteo, como en el móvil.
 * Donde estés (última posición conocida del reloj) o, si no la hay, en Pamplona.
 * Lo último que se leyó se guarda: sin conexión, se enseña eso con su hora.
 */
public class Datos {
    static final double LA = 42.8125, LO = -1.6458;          // Pamplona

    double temp = Double.NaN, max = Double.NaN, min = Double.NaN, lluviaMm = Double.NaN, viento = Double.NaN;
    int codigo = -1, probLluvia = -1; boolean dia = true, aqui = false;
    long tTiempo = 0;

    static SharedPreferences sp(Context c) { return c.getSharedPreferences("reloj", Context.MODE_PRIVATE); }

    static Datos guardados(Context c) {
        SharedPreferences s = sp(c); Datos d = new Datos();
        d.temp = s.getFloat("temp", Float.NaN); d.max = s.getFloat("max", Float.NaN); d.min = s.getFloat("min", Float.NaN);
        d.lluviaMm = s.getFloat("lluviaMm", Float.NaN); d.viento = s.getFloat("viento", Float.NaN);
        d.codigo = s.getInt("codigo", -1); d.probLluvia = s.getInt("probLluvia", -1); d.dia = s.getBoolean("dia", true);
        d.aqui = s.getBoolean("aqui", false); d.tTiempo = s.getLong("tTiempo", 0);
        return d;
    }

    /** Última posición que conoce el reloj (sin encender el GPS), o null */
    static Location ultimaPosicion(Context c) {
        if (c.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
            && c.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) return null;
        try {
            LocationManager lm = (LocationManager) c.getSystemService(Context.LOCATION_SERVICE); Location best = null;
            for (String p : lm.getProviders(true)) {Location l = lm.getLastKnownLocation(p); if (l != null && (best == null || l.getTime() > best.getTime())) best = l;}
            return best;
        } catch (Exception e) {return null;}
    }

    /** Lee de internet y lo guarda. Fuera del hilo principal. */
    static Datos actualiza(Context c) {
        Datos d = guardados(c); long ahora = System.currentTimeMillis();
        double la = LA, lo = LO; boolean aqui = false;
        Location l = ultimaPosicion(c);
        if (l != null && ahora - l.getTime() < 6 * 3600_000L) {la = l.getLatitude(); lo = l.getLongitude(); aqui = true;}
        try {
            JSONObject o = new JSONObject(get(String.format(Locale.US,
                "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f"
                + "&current=temperature_2m,weather_code,is_day,wind_speed_10m"
                + "&minutely_15=precipitation&forecast_minutely_15=4"
                + "&hourly=precipitation_probability&forecast_hours=2"
                + "&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=Europe%%2FMadrid", la, lo)));
            JSONObject cu = o.getJSONObject("current");
            d.temp = cu.getDouble("temperature_2m"); d.codigo = cu.optInt("weather_code", -1);
            d.dia = cu.optInt("is_day", 1) == 1; d.viento = cu.optDouble("wind_speed_10m", Double.NaN);
            JSONObject dl = o.getJSONObject("daily");
            d.max = dl.getJSONArray("temperature_2m_max").getDouble(0); d.min = dl.getJSONArray("temperature_2m_min").getDouble(0);
            double mm = 0; JSONArray p = o.getJSONObject("minutely_15").getJSONArray("precipitation");
            for (int i = 0; i < p.length(); i++) mm += p.optDouble(i, 0);
            d.lluviaMm = mm;
            JSONArray pp = o.getJSONObject("hourly").getJSONArray("precipitation_probability");
            int mx = -1; for (int i = 0; i < pp.length(); i++) mx = Math.max(mx, pp.optInt(i, -1));
            d.probLluvia = mx; d.tTiempo = ahora; d.aqui = aqui;
            sp(c).edit().putFloat("temp", (float) d.temp).putFloat("max", (float) d.max).putFloat("min", (float) d.min)
             .putFloat("lluviaMm", (float) d.lluviaMm).putFloat("viento", (float) d.viento)
             .putInt("codigo", d.codigo).putInt("probLluvia", d.probLluvia).putBoolean("dia", d.dia)
             .putBoolean("aqui", aqui).putLong("tTiempo", ahora).apply();
        } catch (Exception ignored) {}
        return d;
    }

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
    static final Locale ES = new Locale("es", "ES");
    static String n1(double x) { return String.format(ES, "%.1f", x); }
    static String n0(double x) { return String.valueOf(Math.round(x)); }

    static String get(String url) throws Exception { return new String(bytes(url), StandardCharsets.UTF_8); }
    static byte[] bytes(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(15000); c.setReadTimeout(60000);
        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android; Wear OS) BasatiNA-reloj/1.0");
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream b = new ByteArrayOutputStream(); byte[] buf = new byte[16384]; int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return b.toByteArray();
        } finally { c.disconnect(); }
    }
}
