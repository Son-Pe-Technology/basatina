package es.sonpe.basatina.wear;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.LruCache;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * ⌚🗺️ Los cuadros («teselas») del mapa del reloj (26 nov. 2026).
 *
 * MAPA: el mapa base del IGN (Instituto Geográfico Nacional), el mismo que usa el móvil. Es abierto
 * (CC BY 4.0, «© IGN») y deja guardar zonas para usarlas sin conexión.
 * RADAR: RainViewer, como en el móvil (gratis hasta el nivel de zoom 7; más cerca se amplía el de 7).
 *
 * Cómo se guardan: en memoria (lo que estás viendo) y en el disco del reloj (carpeta «teselas»).
 * Al empezar una ruta se bajan de una vez los cuadros de su zona (zoom 12 a 15): así el mapa funciona
 * en el monte sin cobertura. Si la carpeta pasa de 80 MB se borran los cuadros más viejos.
 */
public class Teselas {
    static final String IGN = "https://www.ign.es/wmts/ign-base?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=IGNBaseTodo"
        + "&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=%d&TILEROW=%d&TILECOL=%d&FORMAT=image/jpeg";
    static final int MAX_ZOOM = 17, RADAR_ZOOM = 7;

    static final LruCache<String, Bitmap> MEM = new LruCache<String, Bitmap>(24 * 1024 * 1024) {
        @Override protected int sizeOf(String k, Bitmap b) {return b.getByteCount();}
    };
    static final Set<String> PIDIENDO = new HashSet<>();
    static final java.util.Map<String, Long> FALLO = new java.util.HashMap<>();   // sin conexión: no reintentar hasta 30 s después
    static final ExecutorService RED = Executors.newFixedThreadPool(3);

    interface Listo {void listo();}

    static File dir(Context c) {File d = new File(c.getFilesDir(), "teselas"); d.mkdirs(); return d;}
    static File archivo(Context c, int z, int x, int y) {return new File(dir(c), z + "_" + x + "_" + y + ".jpg");}

    /** Cuadro del mapa base: lo devuelve si ya está; si no, lo pide (del disco o de internet) y avisa al tenerlo */
    static Bitmap base(Context c, int z, int x, int y, Listo l) {
        String k = "b" + z + "/" + x + "/" + y; Bitmap b = MEM.get(k); if (b != null) return b;
        synchronized (PIDIENDO) {
            Long f = FALLO.get(k); if (f != null && System.currentTimeMillis() - f < 30_000L) return null;
            if (!PIDIENDO.add(k)) return null;
        }
        RED.execute(() -> {
            try {
                File f = archivo(c, z, x, y); Bitmap bm = null;
                if (f.exists()) bm = BitmapFactory.decodeFile(f.getPath());
                if (bm == null) {
                    byte[] by = Datos.bytes(String.format(Locale.US, IGN, z, y, x));
                    bm = BitmapFactory.decodeByteArray(by, 0, by.length);
                    if (bm != null) try (FileOutputStream o = new FileOutputStream(f)) {o.write(by);}
                } else f.setLastModified(System.currentTimeMillis());
                if (bm != null) MEM.put(k, bm);
            } catch (Exception ignored) {}
            synchronized (PIDIENDO) {PIDIENDO.remove(k); if (MEM.get(k) == null) FALLO.put(k, System.currentTimeMillis()); else FALLO.remove(k);}
            l.listo();
        });
        return null;
    }

    /** Cuadro del radar (solo en memoria: caduca enseguida) */
    static Bitmap radar(String host, String path, int z, int x, int y, Listo l) {
        String k = "r" + path + "/" + z + "/" + x + "/" + y; Bitmap b = MEM.get(k); if (b != null) return b;
        synchronized (PIDIENDO) {
            Long f = FALLO.get(k); if (f != null && System.currentTimeMillis() - f < 30_000L) return null;
            if (!PIDIENDO.add(k)) return null;
        }
        RED.execute(() -> {
            try {
                byte[] by = Datos.bytes(host + path + "/256/" + z + "/" + x + "/" + y + "/2/1_1.png");
                Bitmap bm = BitmapFactory.decodeByteArray(by, 0, by.length); if (bm != null) MEM.put(k, bm);
            } catch (Exception ignored) {}
            synchronized (PIDIENDO) {PIDIENDO.remove(k); if (MEM.get(k) == null) FALLO.put(k, System.currentTimeMillis()); else FALLO.remove(k);}
            l.listo();
        });
        return null;
    }

    // ---------- guardar la zona de una ruta para usarla sin cobertura ----------
    static volatile int hechas = 0, total = 0; static volatile String rutaGuardada = null;

    static void guardaZona(Context c, Rutas.Ruta r) {
        if (r == null || r.id.equals(rutaGuardada)) return;
        rutaGuardada = r.id;
        new Thread(() -> {
            limpia(c);
            double la0 = 90, la1 = -90, lo0 = 180, lo1 = -180;
            for (double[] p : r.lin) {la0 = Math.min(la0, p[0]); la1 = Math.max(la1, p[0]); lo0 = Math.min(lo0, p[1]); lo1 = Math.max(lo1, p[1]);}
            double m = 0.008;                                     // ~800 m de margen alrededor de la ruta
            List<int[]> L = new ArrayList<>();
            for (int z = 12; z <= 15; z++) {
                int x0 = tx(lo0 - m, z), x1 = tx(lo1 + m, z), y0 = ty(la1 + m, z), y1 = ty(la0 - m, z);
                for (int x = x0; x <= x1; x++) for (int y = y0; y <= y1; y++) L.add(new int[]{z, x, y});
                if (L.size() > 600) break;                         // rutas muy largas: hasta donde llegue
            }
            total = L.size(); hechas = 0; int fallos = 0;
            for (int[] t : L) {
                File f = archivo(c, t[0], t[1], t[2]);
                if (!f.exists()) try {
                    byte[] by = Datos.bytes(String.format(Locale.US, IGN, t[0], t[2], t[1]));
                    try (FileOutputStream o = new FileOutputStream(f)) {o.write(by);}
                    fallos = 0;
                } catch (Exception e) {if (++fallos >= 5) {rutaGuardada = null; break;}}   // sin conexión: se reintenta otra vez
                hechas++;
            }
        }).start();
    }
    /** si la carpeta pasa de 80 MB, borra los cuadros más viejos hasta dejarla en 60 MB */
    static void limpia(Context c) {
        File[] F = dir(c).listFiles(); if (F == null) return;
        long tam = 0; for (File f : F) tam += f.length();
        if (tam < 80L << 20) return;
        java.util.Arrays.sort(F, (a, b) -> Long.compare(a.lastModified(), b.lastModified()));
        for (File f : F) {if (tam < 60L << 20) break; tam -= f.length(); f.delete();}
    }

    // ---------- proyección (la de Google Maps / OpenStreetMap) ----------
    static double mx(double lon) {return (lon + 180) / 360;}                               // 0..1
    static double my(double lat) {double s = Math.sin(Math.toRadians(lat)); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);}
    static double lon(double mx) {return mx * 360 - 180;}
    static double lat(double my) {return Math.toDegrees(Math.atan(Math.sinh(Math.PI * (1 - 2 * my))));}
    static int tx(double lon, int z) {return (int) Math.floor(mx(lon) * (1 << z));}
    static int ty(double lat, int z) {return (int) Math.floor(my(lat) * (1 << z));}
}
