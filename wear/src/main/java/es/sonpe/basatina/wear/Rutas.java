package es.sonpe.basatina.wear;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * ⌚🥾 Rutas de NA a Pie en el reloj (25 nov. 2026).
 * Son las mismas de la app del móvil: web/rutas.js (las genera tools/rutas.py con OpenStreetMap + IDENA).
 * El reloj las descarga de GitHub y las guarda (rutas.json, ~1 MB): así funcionan en el monte sin cobertura.
 * Se vuelven a bajar si tienen más de 7 días.
 * La geometría (tramo más cercano, km recorridos, desnivel que falta, tiempo DIN 33466) es la misma
 * que web/ruta-gps.js del móvil, pasada a Java.
 */
public class Rutas {
    static final String URL = "https://raw.githubusercontent.com/Son-Pe-Technology/basatina/main/web/rutas.js";

    /** Una ruta */
    static class Ruta {
        String id, n, zona, pueblo, dif; double km; int up, dn; boolean circ;
        double[][] lin;   // [lat, lon]
        int[] pf;         // perfil: altitudes repartidas a lo largo de la ruta
        double[] cum;     // km acumulados en cada punto de lin
        double tot() { return cum[cum.length - 1]; }
    }

    static List<Ruta> CACHE = null;

    /** Carga las rutas (de lo guardado o de internet). Fuera del hilo principal. Lanza excepción si no hay ninguna. */
    static synchronized List<Ruta> todas(Context c) throws Exception {
        if (CACHE != null) return CACHE;
        File f = new File(c.getFilesDir(), "rutas.json");
        String js = null;
        if (!f.exists() || System.currentTimeMillis() - f.lastModified() > 7 * 86400_000L) {
            try {
                String s = new String(Datos.bytes(URL), StandardCharsets.UTF_8);
                js = s.substring(s.indexOf('{'), s.lastIndexOf('}') + 1);     // quita «window.RUTAS=» y el «;»
                new JSONObject(js);                                           // comprobar que está entero
                try (FileOutputStream o = new FileOutputStream(f)) {o.write(js.getBytes(StandardCharsets.UTF_8));}
            } catch (Exception e) {js = null;}
        }
        if (js == null) {
            if (!f.exists()) throw new Exception("Sin conexión: la primera vez hay que descargar las rutas con internet.");
            byte[] b = new byte[(int) f.length()];
            try (FileInputStream in = new FileInputStream(f)) {int o = 0, n; while (o < b.length && (n = in.read(b, o, b.length - o)) > 0) o += n;}
            js = new String(b, StandardCharsets.UTF_8);
        }
        JSONArray A = new JSONObject(js).getJSONArray("rutas"); List<Ruta> L = new ArrayList<>();
        for (int i = 0; i < A.length(); i++) {
            JSONObject o = A.getJSONObject(i); Ruta r = new Ruta();
            r.id = o.optString("id"); r.n = o.optString("n"); r.zona = o.optString("zona"); r.pueblo = o.optString("pueblo");
            r.dif = o.optString("dif"); r.km = o.optDouble("km", 0); r.up = o.optInt("up"); r.dn = o.optInt("dn"); r.circ = o.optInt("circ") == 1;
            JSONArray li = o.getJSONArray("lin"); r.lin = new double[li.length()][2];
            for (int k = 0; k < li.length(); k++) {JSONArray p = li.getJSONArray(k); r.lin[k][0] = p.getDouble(0); r.lin[k][1] = p.getDouble(1);}
            JSONArray pf = o.optJSONArray("pf"); r.pf = new int[pf == null ? 0 : pf.length()];
            for (int k = 0; k < r.pf.length; k++) r.pf[k] = pf.optInt(k);
            r.cum = new double[r.lin.length];
            for (int k = 1; k < r.lin.length; k++) r.cum[k] = r.cum[k - 1] + dist(r.lin[k - 1][0], r.lin[k - 1][1], r.lin[k][0], r.lin[k][1]) / 1000;
            if (r.lin.length > 1) L.add(r);
        }
        CACHE = L; return L;
    }
    static Ruta porId(Context c, String id) throws Exception {for (Ruta r : todas(c)) if (r.id.equals(id)) return r; return null;}

    // ---------- geometría ----------
    static final double KLA = 110540;
    static double klo(double la) {return 111320 * Math.cos(Math.toRadians(la));}
    /** distancia en metros (plana: de sobra para una ruta) */
    static double dist(double la1, double lo1, double la2, double lo2) {
        double y = (la2 - la1) * KLA, x = (lo2 - lo1) * klo((la1 + la2) / 2); return Math.hypot(x, y);
    }
    /** rumbo en grados (0 = norte, 90 = este) */
    static double rumbo(double la1, double lo1, double la2, double lo2) {
        double y = (la2 - la1) * KLA, x = (lo2 - lo1) * klo(la1); return (Math.toDegrees(Math.atan2(x, y)) + 360) % 360;
    }
    /** distancia (m) desde un punto al camino (el tramo más cercano) */
    static double aLaRuta(Ruta r, double la, double lo) {return cercano(r, la, lo, -1).d;}

    static class Cerca { double d, km, la, lo; }
    /**
     * Tramo más cercano. Si la ruta pasa dos veces por el mismo sitio (ida y vuelta), se elige el paso
     * más cercano a lo ya recorrido («antes»), para que no salte del principio al final. antes < 0: el primero.
     */
    static Cerca cercano(Ruta r, double la, double lo, double antes) {
        double la0 = r.lin[0][0], lo0 = r.lin[0][1], k = klo(la0);
        double px = (lo - lo0) * k, py = (la - la0) * KLA;
        int n = r.lin.length - 1; double[] D = new double[n], KM = new double[n], QX = new double[n], QY = new double[n]; double min = 1e18;
        for (int i = 0; i < n; i++) {
            double ax = (r.lin[i][1] - lo0) * k, ay = (r.lin[i][0] - la0) * KLA, bx = (r.lin[i + 1][1] - lo0) * k, by = (r.lin[i + 1][0] - la0) * KLA;
            double dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; if (l2 == 0) l2 = 1;
            double t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
            QX[i] = ax + t * dx; QY[i] = ay + t * dy; D[i] = Math.hypot(px - QX[i], py - QY[i]);
            KM[i] = r.cum[i] + t * (r.cum[i + 1] - r.cum[i]); if (D[i] < min) min = D[i];
        }
        int best = -1; double lim = Math.max(min + 15, 30);
        for (int i = 0; i < n; i++) {
            if (D[i] > lim) continue;
            if (best < 0) {best = i; continue;}
            if (antes < 0 ? KM[i] < KM[best] : Math.abs(KM[i] - antes) < Math.abs(KM[best] - antes)) best = i;
        }
        Cerca c = new Cerca(); c.d = D[best]; c.km = KM[best]; c.la = la0 + QY[best] / KLA; c.lo = lo0 + QX[best] / k; return c;
    }
    /** punto del camino en el km indicado */
    static double[] punto(Ruta r, double km) {
        km = Math.max(0, Math.min(r.tot(), km));
        for (int i = 1; i < r.cum.length; i++) if (r.cum[i] >= km) {
            double l = r.cum[i] - r.cum[i - 1], t = l > 0 ? (km - r.cum[i - 1]) / l : 0;
            return new double[]{r.lin[i - 1][0] + t * (r.lin[i][0] - r.lin[i - 1][0]), r.lin[i - 1][1] + t * (r.lin[i][1] - r.lin[i - 1][1])};
        }
        return r.lin[r.lin.length - 1];
    }
    /** metros de subida y bajada entre dos km, con el perfil */
    static int[] desnivel(Ruta r, double km0, double km1) {
        int n = r.pf.length; if (n < 2 || r.km <= 0) return new int[]{0, 0};
        int i0 = (int) Math.max(0, Math.round(km0 / r.km * (n - 1))), i1 = (int) Math.min(n - 1, Math.round(km1 / r.km * (n - 1)));
        int up = 0, dn = 0; for (int i = i0 + 1; i <= i1; i++) {int d = r.pf[i] - r.pf[i - 1]; if (d > 0) up += d; else dn -= d;}
        return new int[]{up, dn};
    }
    /** horas según la norma DIN 33466 (4 km/h en llano, 300 m/h subiendo, 500 m/h bajando) */
    static double din(double km, double up, double dn) {double h = km / 4, v = up / 300 + dn / 500; return Math.max(h, v) + Math.min(h, v) / 2;}
    static String punto8(double grados) {
        String[] P = {"N", "NE", "E", "SE", "S", "SO", "O", "NO"}; return P[(int) Math.round(((grados % 360) + 360) % 360 / 45) % 8];
    }
}
