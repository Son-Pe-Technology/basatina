package es.sonpe.basatina.wear;

import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.format.DateFormat;
import android.widget.TextView;

/**
 * ⌚🥾 Pantalla de la actividad en curso (25 nov. 2026): con ruta (seguirla) o libre (solo registrar).
 * Lee el estado de Grabacion.E cada segundo. La flecha usa la brújula del reloj: apunta hacia el camino
 * si te has salido (o aún no has llegado a él) y hacia 80 m más adelante si vas por él.
 */
public class Seguir extends Pantalla implements SensorEventListener {
    final Handler h = new Handler(Looper.getMainLooper());
    SensorManager sm; double rumboReloj = Double.NaN; long confirmar = 0; boolean resumen = false;
    long tFin = 0; boolean empezando = false; long tEmp = 0;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        String id = getIntent().getStringExtra("ruta");
        if (!Grabacion.activo() && getIntent().getBooleanExtra("empezar", false)) {Grabacion.empieza(this, id); empezando = true; tEmp = System.currentTimeMillis();}
        sm = getSystemService(SensorManager.class);
    }
    @Override protected void onResume() {
        super.onResume();
        Sensor r = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (r != null) sm.registerListener(this, r, SensorManager.SENSOR_DELAY_UI);
        h.post(tic);
    }
    @Override protected void onPause() {super.onPause(); sm.unregisterListener(this); h.removeCallbacks(tic);}

    final Runnable tic = new Runnable() {@Override public void run() {pinta(); h.postDelayed(this, 1000);}};

    @Override public void onSensorChanged(SensorEvent ev) {
        float[] R = new float[9], o = new float[3]; SensorManager.getRotationMatrixFromVector(R, ev.values); SensorManager.getOrientation(R, o);
        double az = Math.toDegrees(o[0]); Grabacion.Estado s = Grabacion.E;
        if (!Double.isNaN(s.la)) az += new GeomagneticField((float) s.la, (float) s.lo, 0, System.currentTimeMillis()).getDeclination();
        rumboReloj = (az + 360) % 360;
    }
    @Override public void onAccuracyChanged(Sensor sensor, int a) {}

    void pinta() {
        Grabacion.Estado s = Grabacion.E; double peso = Datos.sp(this).getInt("peso", 75);
        // recién pulsado «empezar»: el servicio tarda un momento en arrancar
        if (empezando) {
            if (s.activo) empezando = false;
            else if (System.currentTimeMillis() - tEmp < 6000) {limpia(); t("Empezando…", 15, GRIS, false); return;}
            else {empezando = false; if (s.error == null) s.error = "No se pudo empezar la grabación";}
        }
        if (!s.activo && !resumen) {
            if (s.t0 == 0) {limpia(); t("No hay ninguna actividad en curso", 14, GRIS, false); boton("Volver", BOTON, v -> finish()); return;}
            resumen = true;
        }
        limpia(); Rutas.Ruta r = s.ruta;
        if (r != null && s.activo) Teselas.guardaZona(this, r);      // 🗺️ baja el mapa de la zona para usarlo sin cobertura
        t(r != null ? r.n : "Actividad libre", 12, GRIS, true);
        if (s.error != null) t("⚠️ " + s.error, 13, AMARILLO, false);
        if (resumen) {t("🏁 Actividad terminada", 16, VERDE, true);}
        else if (Double.isNaN(s.la)) t("📡 Buscando el GPS… Sal a cielo abierto.", 14, GRIS, false);
        else if (r != null) {
            // estado y flecha
            if (s.fin) t("🏁 ¡Has llegado!", 18, VERDE, true);
            else if (!s.enRuta) t("Aún no estás en la ruta: el camino está a " + metros(s.d), 14, AMARILLO, false);
            else if (s.aviso) t("⚠️ Te has salido del camino: " + metros(s.d), 15, ROJO, true);
            else t("✅ En el camino", 15, VERDE, true);
            if (!s.fin && !Double.isNaN(s.objLa)) {
                double rb = Rutas.rumbo(s.la, s.lo, s.objLa, s.objLo);
                TextView f = t("⬆", 54, s.aviso ? ROJO : !s.enRuta ? AMARILLO : VERDE, true);
                if (!Double.isNaN(rumboReloj)) f.setRotation((float) (rb - rumboReloj));
                else {f.setRotation((float) rb); t("(sin brújula: el norte arriba) " + Rutas.punto8(rb), 11, GRIS, false);}
            }
            // lo que queda
            if (s.enRuta) {
                double hecho = Math.max(0, s.along), queda = Math.max(0, r.tot() - hecho); int[] dq = Rutas.desnivel(r, hecho, r.tot());
                double f = 1; long mov = System.currentTimeMillis() - s.t0; double kmH = hecho - s.a0;
                if (kmH >= 0.5 && mov > 8 * 60_000L) {int[] dh = Rutas.desnivel(r, s.a0, hecho); double esp = Rutas.din(kmH, dh[0], dh[1]); if (esp > 0) f = Math.max(0.6, Math.min(2, mov / 3600_000.0 / esp));}
                double hq = Rutas.din(queda, dq[0], dq[1]) * f;
                hueco(4);
                t("Quedan " + Datos.n1(queda) + " km · ↗ " + dq[0] + " m", 15, android.graphics.Color.WHITE, true);
                if (!s.fin) t("Llegada ≈ " + DateFormat.format("HH:mm", System.currentTimeMillis() + (long) (hq * 3600_000)) + " (" + dur((long) (hq * 3600_000)) + ")", 13, GRIS, false);
            }
        }
        // la actividad
        hueco(8);
        long ms = (resumen ? (tFin > 0 ? tFin : System.currentTimeMillis()) : System.currentTimeMillis()) - s.t0;
        if (resumen && tFin == 0) tFin = System.currentTimeMillis();
        t("⏱️ " + dur(ms) + "   📏 " + Datos.n1(s.km) + " km", 15, android.graphics.Color.WHITE, true);
        t("❤️ " + (s.hr > 0 ? s.hr + " ppm" : "--") + (s.hrN > 0 ? "  (media " + (s.hrSum / s.hrN) + ", máx " + s.hrMax + ")" : ""), 14, 0xFFFF8A80, false);
        t("👣 " + String.format(Datos.ES, "%,d", s.pasos) + " pasos   🔥 " + Math.round(s.kcal(peso)) + " kcal", 14, android.graphics.Color.WHITE, false);
        if (!resumen && !Double.isNaN(s.la)) t("GPS ±" + Math.round(s.acc) + " m", 11, s.acc <= 15 ? VERDE : s.acc <= 40 ? AMARILLO : ROJO, false);
        hueco(6);
        if (!resumen) boton("🗺️ Ver en el mapa", 0xFF2E8B57, v -> startActivity(new android.content.Intent(this, Mapa.class)));
        if (resumen) boton("Volver", BOTON, v -> finish());
        else boton(System.currentTimeMillis() - confirmar < 4000 ? "Toca otra vez para terminar" : "⏹ Terminar", 0xFF8E2A2A, v -> {
            if (System.currentTimeMillis() - confirmar < 4000) {Grabacion.para(this); resumen = true; tFin = System.currentTimeMillis();}
            else confirmar = System.currentTimeMillis();
            pinta();
        });
        t("Kcal aproximadas (peso " + (int) peso + " kg). Ante cualquier duda, haz caso a las señales del camino. Emergencias: 112.", 10, GRIS, false);
    }
    static String metros(double m) {return Double.isNaN(m) ? "--" : m >= 1000 ? Datos.n1(m / 1000) + " km" : Math.round(m) + " m";}
}
