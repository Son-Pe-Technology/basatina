package es.sonpe.basatina.wear;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Rect;
import android.graphics.RectF;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.format.DateFormat;
import android.view.GestureDetector;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.view.View;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * ⌚🗺️ Mapa del reloj (26 nov. 2026).
 *  · Mapa del IGN con tu posición (el punto azul y el círculo de precisión). Se mueve con el dedo;
 *    la corona o el bisel acercan y alejan; dos toques seguidos acercan.
 *  · Radar de lluvia de RainViewer encima (botón «Radar»), con la hora de la imagen.
 *  · Si hay una ruta en curso (o se abre desde una ruta), su trazado en naranja y lo que llevas en verde.
 *  · Botón del centro: vuelve a ponerte en el medio y a seguirte.
 * Sin posición, sale Pamplona.
 */
public class Mapa extends Activity implements LocationListener {
    Vista v; LocationManager lm; boolean escuchando = false;
    final Handler h = new Handler(Looper.getMainLooper());

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        v = new Vista(this); v.radar = getIntent().getBooleanExtra("radar", false);
        String id = getIntent().getStringExtra("ruta");
        if (id == null && Grabacion.activo() && Grabacion.E.ruta != null) id = Grabacion.E.ruta.id;
        if (id != null) {
            final String rid = id;
            new Thread(() -> {try {Rutas.Ruta r = Rutas.porId(this, rid); runOnUiThread(() -> {v.ruta = r; v.invalidate();});} catch (Exception ignored) {}}).start();
        }
        Location l = Datos.ultimaPosicion(this);
        if (l != null) {v.pos = l; v.cLa = l.getLatitude(); v.cLo = l.getLongitude();}
        if (v.radar) {v.z = 8; v.seguir = false; if (l == null) {v.cLa = 42.67; v.cLo = -1.65;}}   // Navarra entera
        setContentView(v);
        lm = getSystemService(LocationManager.class);
        if (v.radar) v.cargaRadar();
    }
    @Override protected void onResume() {
        super.onResume(); v.requestFocus(); h.post(tic);
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            try {
                String pr = lm.getAllProviders().contains(LocationManager.FUSED_PROVIDER) ? LocationManager.FUSED_PROVIDER : LocationManager.GPS_PROVIDER;
                lm.requestLocationUpdates(pr, 3000, 0, this, Looper.getMainLooper()); escuchando = true;
            } catch (Exception ignored) {}
        } else requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, 1);
    }
    @Override protected void onPause() {super.onPause(); h.removeCallbacks(tic); if (escuchando) lm.removeUpdates(this); escuchando = false;}
    @Override public void onRequestPermissionsResult(int c, String[] p, int[] r) {super.onRequestPermissionsResult(c, p, r); if (r.length > 0 && r[0] == 0) onResume();}

    @Override public void onLocationChanged(Location l) {if (!Grabacion.activo()) v.nuevaPos(l);}
    /** con una actividad en curso, la posición la da la grabación (el mismo GPS); se mira cada segundo */
    final Runnable tic = new Runnable() {@Override public void run() {
        Grabacion.Estado s = Grabacion.E;
        if (s.activo && !Double.isNaN(s.la)) {Location l = new Location("grab"); l.setLatitude(s.la); l.setLongitude(s.lo); l.setAccuracy((float) s.acc); v.nuevaPos(l);}
        h.postDelayed(this, 1000);
    }};

    /** El mapa en sí */
    static class Vista extends View {
        double cLa = 42.8125, cLo = -1.6458; int z = 15; boolean seguir = true, radar = false;
        Location pos = null; Rutas.Ruta ruta = null;
        String rHost = null, rPath = null; long rHora = 0;
        final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG), pt = new Paint(Paint.ANTI_ALIAS_FLAG);
        final float T;                 // tamaño en pantalla de un cuadro (más grande que 256 para que se lea en el reloj)
        final GestureDetector gd; float giro = 0;
        final Teselas.Listo repinta = () -> postInvalidate();
        RectF bCentro, bRadar; float dn = getResources().getDisplayMetrics().density;

        Vista(Context c) {
            super(c); setFocusable(true); setFocusableInTouchMode(true); setBackgroundColor(0xFF1B2326);
            T = 256 * Math.max(1f, getResources().getDisplayMetrics().density / 1.4f);
            pt.setColor(Color.WHITE); pt.setTextAlign(Paint.Align.CENTER); pt.setShadowLayer(4, 0, 1, Color.BLACK);
            gd = new GestureDetector(c, new GestureDetector.SimpleOnGestureListener() {
                @Override public boolean onDown(MotionEvent e) {return true;}
                @Override public boolean onSingleTapUp(MotionEvent e) {
                    if (bCentro != null && bCentro.contains(e.getX(), e.getY())) {seguir = true; if (pos != null) {cLa = pos.getLatitude(); cLo = pos.getLongitude();} invalidate(); return true;}
                    if (bRadar != null && bRadar.contains(e.getX(), e.getY())) {radar = !radar; if (radar) {if (z > 10) z = 10; cargaRadar();} invalidate(); return true;}
                    return false;
                }
                @Override public boolean onDoubleTap(MotionEvent e) {zoom(1); return true;}
                @Override public boolean onScroll(MotionEvent a, MotionEvent e, float dx, float dy) {
                    double w = T * (1 << z); seguir = false;
                    cLo = Teselas.lon(Teselas.mx(cLo) + dx / w); cLa = Teselas.lat(Teselas.my(cLa) + dy / w); invalidate(); return true;
                }
            });
        }
        void zoom(int d) {z = Math.max(7, Math.min(Teselas.MAX_ZOOM, z + d)); invalidate();}
        void nuevaPos(Location l) {pos = l; if (seguir) {cLa = l.getLatitude(); cLo = l.getLongitude();} invalidate();}

        @Override public boolean onTouchEvent(MotionEvent e) {return gd.onTouchEvent(e) || super.onTouchEvent(e);}
        /** corona o bisel: girar acerca o aleja */
        @Override public boolean onGenericMotionEvent(MotionEvent e) {
            if (e.getAction() == MotionEvent.ACTION_SCROLL && e.isFromSource(InputDevice.SOURCE_ROTARY_ENCODER)) {
                giro += -e.getAxisValue(MotionEvent.AXIS_SCROLL);
                if (giro >= 1) {zoom(1); giro = 0;} else if (giro <= -1) {zoom(-1); giro = 0;}
                return true;
            }
            return super.onGenericMotionEvent(e);
        }

        void cargaRadar() {
            if (rPath != null && System.currentTimeMillis() - rHora < 5 * 60_000L) return;
            new Thread(() -> {
                try {
                    JSONObject j = new JSONObject(Datos.get("https://api.rainviewer.com/public/weather-maps.json"));
                    JSONArray A = j.getJSONObject("radar").getJSONArray("past"); JSONObject u = A.getJSONObject(A.length() - 1);
                    rHost = j.getString("host"); rPath = u.getString("path"); rHora = u.getLong("time") * 1000; postInvalidate();
                } catch (Exception ignored) {}
            }).start();
        }

        /** pasa lat/lon a píxeles de la pantalla */
        float[] px(double la, double lo) {
            double w = T * (1 << z);
            return new float[]{(float) ((Teselas.mx(lo) - Teselas.mx(cLo)) * w + getWidth() / 2f), (float) ((Teselas.my(la) - Teselas.my(cLa)) * w + getHeight() / 2f)};
        }

        @Override protected void onDraw(Canvas cv) {
            int W = getWidth(), H = getHeight(); double w = T * (1 << z);
            double ox = Teselas.mx(cLo) * w - W / 2.0, oy = Teselas.my(cLa) * w - H / 2.0;     // esquina de arriba a la izquierda
            // 1) mapa base del IGN; si un cuadro aún no ha llegado, se usa el de un zoom menos ampliado
            int x0 = (int) Math.floor(ox / T), y0 = (int) Math.floor(oy / T), x1 = (int) Math.floor((ox + W) / T), y1 = (int) Math.floor((oy + H) / T);
            for (int x = x0; x <= x1; x++) for (int y = y0; y <= y1; y++) {
                RectF d = new RectF((float) (x * T - ox), (float) (y * T - oy), (float) ((x + 1) * T - ox), (float) ((y + 1) * T - oy));
                Bitmap b = Teselas.base(getContext(), z, x, y, repinta);
                if (b != null) cv.drawBitmap(b, null, d, null);
                else if (z > 7) {
                    Bitmap pa = Teselas.MEM.get("b" + (z - 1) + "/" + (x >> 1) + "/" + (y >> 1));
                    if (pa != null) {int hx = (x & 1) * 128, hy = (y & 1) * 128; cv.drawBitmap(pa, new Rect(hx, hy, hx + 128, hy + 128), d, null);}
                }
            }
            // 2) radar de lluvia (como mucho zoom 7: más cerca se amplía)
            if (radar && rPath != null) {
                int rz = Math.min(z, Teselas.RADAR_ZOOM); double Tr = T * (1 << (z - rz));
                p.setAlpha(190);
                for (int x = (int) Math.floor(ox / Tr); x <= (int) Math.floor((ox + W) / Tr); x++)
                    for (int y = (int) Math.floor(oy / Tr); y <= (int) Math.floor((oy + H) / Tr); y++) {
                        Bitmap b = Teselas.radar(rHost, rPath, rz, x, y, repinta);
                        if (b != null) cv.drawBitmap(b, null, new RectF((float) (x * Tr - ox), (float) (y * Tr - oy), (float) ((x + 1) * Tr - ox), (float) ((y + 1) * Tr - oy)), p);
                    }
                p.setAlpha(255);
            }
            // 3) la ruta: entera en naranja, lo recorrido en verde
            if (ruta != null) {
                Grabacion.Estado s = Grabacion.E; double hecho = s.activo && s.ruta == ruta ? s.along : -1;
                Path todo = new Path(), recorrido = new Path(); boolean dentro = false;
                for (int i = 0; i < ruta.lin.length; i++) {
                    float[] q = px(ruta.lin[i][0], ruta.lin[i][1]);
                    if (i == 0) {todo.moveTo(q[0], q[1]); recorrido.moveTo(q[0], q[1]);} else todo.lineTo(q[0], q[1]);
                    if (hecho > 0 && ruta.cum[i] <= hecho) {recorrido.lineTo(q[0], q[1]); dentro = true;}
                }
                p.setStyle(Paint.Style.STROKE); p.setStrokeCap(Paint.Cap.ROUND); p.setStrokeJoin(Paint.Join.ROUND);
                p.setColor(0xCC000000); p.setStrokeWidth(7 * dn); cv.drawPath(todo, p);
                p.setColor(0xFFFF8C1A); p.setStrokeWidth(4.5f * dn); cv.drawPath(todo, p);
                if (dentro) {p.setColor(0xFF3CCB5A); cv.drawPath(recorrido, p);}
                float[] a = px(ruta.lin[0][0], ruta.lin[0][1]); p.setStyle(Paint.Style.FILL);
                p.setColor(Color.WHITE); cv.drawCircle(a[0], a[1], 6 * dn, p); p.setColor(0xFF2E7D32); cv.drawCircle(a[0], a[1], 4 * dn, p);
                if (!ruta.circ) {float[] f = px(ruta.lin[ruta.lin.length - 1][0], ruta.lin[ruta.lin.length - 1][1]);
                    p.setColor(Color.WHITE); cv.drawCircle(f[0], f[1], 6 * dn, p); p.setColor(0xFFC62828); cv.drawCircle(f[0], f[1], 4 * dn, p);}
            }
            // 4) tú: círculo de precisión y punto azul
            if (pos != null) {
                float[] q = px(pos.getLatitude(), pos.getLongitude());
                double mPorPx = 156543.03 * Math.cos(Math.toRadians(pos.getLatitude())) / (1 << z) * 256 / T;
                float r = (float) (pos.getAccuracy() / mPorPx);
                p.setStyle(Paint.Style.FILL);
                if (r > 8 * dn) {p.setColor(0x332F7FD8); cv.drawCircle(q[0], q[1], r, p);}
                p.setColor(Color.WHITE); cv.drawCircle(q[0], q[1], 8 * dn, p); p.setColor(0xFF1E88E5); cv.drawCircle(q[0], q[1], 5.5f * dn, p);
            }
            // 5) botones (abajo, dentro del círculo de la pantalla) y textos
            float by = H * 0.80f, bh = 15 * dn;
            bRadar = new RectF(W / 2f - 52 * dn, by - bh, W / 2f - 4 * dn, by + bh);
            bCentro = new RectF(W / 2f + 4 * dn, by - bh, W / 2f + 52 * dn, by + bh);
            p.setStyle(Paint.Style.FILL);
            p.setColor(radar ? 0xEE2F6FD0 : 0xCC263238); cv.drawRoundRect(bRadar, bh, bh, p);
            p.setColor(seguir ? 0xEE2E8B57 : 0xCC263238); cv.drawRoundRect(bCentro, bh, bh, p);
            pt.setTextSize(12 * dn); pt.setFakeBoldText(true);
            cv.drawText("Radar", bRadar.centerX(), by + 4.5f * dn, pt);
            p.setColor(Color.WHITE); p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(2 * dn);
            cv.drawCircle(bCentro.centerX(), by, 6 * dn, p); p.setStyle(Paint.Style.FILL); cv.drawCircle(bCentro.centerX(), by, 2.5f * dn, p);
            pt.setFakeBoldText(false); pt.setTextSize(9 * dn);
            cv.drawText(radar ? "© IGN · RainViewer" : "© IGN", W / 2f, H * 0.91f, pt);
            if (radar) {
                pt.setTextSize(11 * dn); pt.setFakeBoldText(true);
                cv.drawText(rPath == null ? "Cargando el radar…" : "Lluvia a las " + DateFormat.format("HH:mm", rHora), W / 2f, H * 0.12f, pt);
                pt.setFakeBoldText(false);
            } else if (ruta != null && Teselas.total > 0 && ruta.id.equals(Teselas.rutaGuardada)) {
                pt.setTextSize(10 * dn);
                cv.drawText(Teselas.hechas >= Teselas.total ? "Mapa guardado para sin cobertura" : "Guardando el mapa… " + (100 * Teselas.hechas / Teselas.total) + " %", W / 2f, H * 0.12f, pt);
                if (Teselas.hechas < Teselas.total) postInvalidateDelayed(1000);
            }
        }
    }

    @Override public void onStatusChanged(String s, int i, Bundle b) {}
    @Override public void onProviderEnabled(String s) {}
    @Override public void onProviderDisabled(String s) {}
}
