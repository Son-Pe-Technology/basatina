package es.sonpe.basatina.wear;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

/**
 * ⌚🥾 Grabación de la actividad (25 nov. 2026): sigue funcionando con la pantalla apagada (servicio en primer plano,
 * como las apps de deporte; Android enseña una notificación fija mientras dura).
 * Lee: GPS (posición, km), pulsómetro (pulsaciones), podómetro (pasos). Calcula kcal aproximadas.
 * Si hay ruta: compara cada posición con el camino (Rutas.cercano) y vibra al salirte (> 40 m, dos lecturas
 * seguidas y con buena precisión), al volver y al llegar. El estado está en E (lo lee la pantalla Seguir).
 */
public class Grabacion extends Service implements LocationListener, SensorEventListener {
    static final String CANAL = "ruta", PARAR = "parar";
    static final int NOTI = 71;
    static final double SALIDA = 40, VUELTA = 25;

    /** Estado de la grabación (uno solo: solo se graba una actividad a la vez) */
    static class Estado {
        boolean activo = false, enRuta = false, aviso = false, fin = false; Rutas.Ruta ruta = null; String error = null;
        long t0 = 0; double la = Double.NaN, lo = Double.NaN, acc = 999, km = 0, d = Double.NaN, along = -1, a0 = 0;
        double objLa = Double.NaN, objLo = Double.NaN;          // hacia dónde apunta la flecha
        int fuera = 0, pasos = 0, hr = 0, hrMax = 0; long hrSum = 0, hrN = 0; int pasoBase = -1;
        double kcal(double peso) {
            double k = peso * km * 1.0;                                     // andar: ~1 kcal por kg y km
            if (ruta != null && along > 0) k += peso * Rutas.desnivel(ruta, a0, along)[0] * 0.0094;   // + lo subido
            return k;
        }
    }
    static final Estado E = new Estado();
    static boolean activo() {return E.activo;}

    LocationManager lm; SensorManager sm; PowerManager.WakeLock wl; Location ultima = null;

    static void empieza(Context c, String idRuta) {
        Intent i = new Intent(c, Grabacion.class); if (idRuta != null) i.putExtra("ruta", idRuta);
        c.startForegroundService(i);
    }
    static void para(Context c) {c.startService(new Intent(c, Grabacion.class).setAction(PARAR));}

    @Override public int onStartCommand(Intent it, int flags, int id) {
        if (it != null && PARAR.equals(it.getAction())) {termina(); return START_NOT_STICKY;}
        if (E.activo) return START_NOT_STICKY;
        // 1) notificación fija (obligatoria para seguir con la pantalla apagada)
        NotificationManager nm = getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel(CANAL, "Ruta en curso", NotificationManager.IMPORTANCE_LOW));
        PendingIntent abre = PendingIntent.getActivity(this, 3, new Intent(this, Seguir.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(this, CANAL).setSmallIcon(R.drawable.ic_stat_river)
            .setContentTitle("BasatiNA").setContentText("Grabando la actividad").setOngoing(true).setContentIntent(abre)
            .setCategory(Notification.CATEGORY_WORKOUT).build();
        int tipos = 0;
        boolean gps = ok(Manifest.permission.ACCESS_FINE_LOCATION), pulso = ok(Manifest.permission.BODY_SENSORS), pasos = ok(Manifest.permission.ACTIVITY_RECOGNITION);
        if (gps) tipos |= ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION;
        if (Build.VERSION.SDK_INT >= 34 && (pulso || pasos)) tipos |= ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH;
        try {startForeground(NOTI, n, tipos);} catch (Exception e) {E.error = "No se pudo empezar: faltan permisos"; stopSelf(); return START_NOT_STICKY;}
        // 2) estado nuevo
        Estado s = E; s.activo = true; s.enRuta = s.aviso = s.fin = false; s.ruta = null; s.error = null; s.t0 = System.currentTimeMillis();
        s.la = s.lo = s.d = s.objLa = s.objLo = Double.NaN; s.acc = 999; s.km = 0; s.along = -1; s.a0 = 0; s.fuera = 0;
        s.pasos = 0; s.hr = 0; s.hrMax = 0; s.hrSum = 0; s.hrN = 0; s.pasoBase = -1; ultima = null;
        // 3) CPU despierta mientras se graba (para que los sensores sigan llegando), como mucho 12 h
        wl = getSystemService(PowerManager.class).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "basatina:ruta"); wl.acquire(12 * 3600_000L);
        // 4) la ruta (si hay) se carga aparte, sin parar el GPS
        final String idRuta = it == null ? null : it.getStringExtra("ruta");
        if (idRuta != null) new Thread(() -> {try {E.ruta = Rutas.porId(this, idRuta);} catch (Exception e) {E.error = e.getMessage();}}).start();
        // 5) GPS y sensores
        lm = getSystemService(LocationManager.class); sm = getSystemService(SensorManager.class);
        try {if (gps) lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 2000, 0, this, Looper.getMainLooper());} catch (Exception e) {E.error = "GPS no disponible";}
        if (pulso) {Sensor h = sm.getDefaultSensor(Sensor.TYPE_HEART_RATE); if (h != null) sm.registerListener(this, h, SensorManager.SENSOR_DELAY_NORMAL);}
        if (pasos) {Sensor p = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER); if (p != null) sm.registerListener(this, p, SensorManager.SENSOR_DELAY_NORMAL);}
        return START_NOT_STICKY;
    }
    boolean ok(String p) {return checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED;}

    void termina() {
        try {if (lm != null) lm.removeUpdates(this);} catch (Exception ignored) {}
        try {if (sm != null) sm.unregisterListener(this);} catch (Exception ignored) {}
        try {if (wl != null && wl.isHeld()) wl.release();} catch (Exception ignored) {}
        E.activo = false; stopForeground(STOP_FOREGROUND_REMOVE); stopSelf();
    }
    @Override public void onDestroy() {if (E.activo) termina(); super.onDestroy();}
    @Override public IBinder onBind(Intent i) {return null;}

    // ---------- GPS ----------
    @Override public void onLocationChanged(Location l) {
        Estado s = E; s.la = l.getLatitude(); s.lo = l.getLongitude(); s.acc = l.hasAccuracy() ? l.getAccuracy() : 999;
        // km: se suman los tramos con buena precisión (el «baile» del GPS parado no suma)
        if (s.acc <= 30) {
            if (ultima != null) {double m = ultima.distanceTo(l); if (m >= Math.max(3, s.acc * 0.5) && m < 500) {s.km += m / 1000; ultima = l;}}
            else ultima = l;
        }
        Rutas.Ruta r = s.ruta; if (r == null) return;
        Rutas.Cerca c = Rutas.cercano(r, s.la, s.lo, s.along); s.d = c.d;
        if (c.d <= SALIDA) {
            if (!s.enRuta) {s.enRuta = true; s.a0 = c.km; vibra(new long[]{0, 120});}
            if (s.along < 0 || c.km >= s.along - 0.15) s.along = c.km;      // solo avanza (o retrocede poco)
        }
        boolean fiable = s.acc <= 60;
        if (s.enRuta && fiable) {
            if (c.d - s.acc * 0.5 > SALIDA) {s.fuera++; if (s.fuera >= 2 && !s.aviso) {s.aviso = true; vibra(new long[]{0, 500, 200, 500, 200, 500});}}
            else if (c.d < VUELTA) {if (s.aviso) vibra(new long[]{0, 150, 100, 150}); s.fuera = 0; s.aviso = false;}
        }
        if (s.enRuta && !s.fin && s.along >= r.tot() - 0.06 && c.d <= SALIDA && System.currentTimeMillis() - s.t0 > 3 * 60_000L) {
            s.fin = true; vibra(new long[]{0, 200, 100, 200, 100, 700});
        }
        // flecha: fuera de la ruta (o antes de entrar), hacia el camino; en ella, hacia 80 m más adelante
        if (!s.enRuta || s.aviso) {s.objLa = c.la; s.objLo = c.lo;}
        else {double[] p = Rutas.punto(r, Math.max(s.along, 0) + 0.08); s.objLa = p[0]; s.objLo = p[1];}
    }
    @Override public void onStatusChanged(String p, int st, Bundle b) {}
    @Override public void onProviderEnabled(String p) {}
    @Override public void onProviderDisabled(String p) {}

    // ---------- pulsaciones y pasos ----------
    @Override public void onSensorChanged(SensorEvent ev) {
        Estado s = E;
        if (ev.sensor.getType() == Sensor.TYPE_HEART_RATE) {
            int v = Math.round(ev.values[0]); if (v < 30 || v > 230) return;          // lecturas sin contacto o erróneas
            s.hr = v; s.hrSum += v; s.hrN++; if (v > s.hrMax) s.hrMax = v;
        } else if (ev.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int v = Math.round(ev.values[0]); if (s.pasoBase < 0) s.pasoBase = v; s.pasos = v - s.pasoBase;
        }
    }
    @Override public void onAccuracyChanged(Sensor sensor, int a) {}

    void vibra(long[] patron) {
        try {
            Vibrator v = Build.VERSION.SDK_INT >= 31 ? getSystemService(VibratorManager.class).getDefaultVibrator() : getSystemService(Vibrator.class);
            v.vibrate(VibrationEffect.createWaveform(patron, -1));
        } catch (Exception ignored) {}
    }
}
