package es.sonpe.basatina.wear;

import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.os.Bundle;
import android.widget.TextView;

/**
 * ⌚🧭 Brújula (25 nov. 2026): sensor de rotación del reloj (brújula + giroscopio), corregida al norte
 * geográfico con la declinación magnética del sitio donde estás (en Navarra, ~1°).
 * La flecha roja apunta siempre al norte; arriba, hacia dónde miras en grados y en palabras.
 */
public class Brujula extends Pantalla implements SensorEventListener {
    SensorManager sm; TextView flecha, grados, nota; float decl = 0; int precision = 3;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        sm = getSystemService(SensorManager.class);
        t("🧭 Brújula", 16, AZUL, true);
        grados = t("--", 28, android.graphics.Color.WHITE, true);
        flecha = t("⬆", 80, ROJO, true); t("la flecha roja apunta al norte", 11, GRIS, false);
        nota = t("", 12, AMARILLO, false);
        Location l = Datos.ultimaPosicion(this);
        if (l != null) decl = new GeomagneticField((float) l.getLatitude(), (float) l.getLongitude(), (float) l.getAltitude(), System.currentTimeMillis()).getDeclination();
        if (sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR) == null) nota.setText("Este reloj no tiene brújula.");
    }
    @Override protected void onResume() {
        super.onResume(); Sensor r = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (r != null) sm.registerListener(this, r, SensorManager.SENSOR_DELAY_UI);
        Sensor m = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD); if (m != null) sm.registerListener(this, m, SensorManager.SENSOR_DELAY_NORMAL);
    }
    @Override protected void onPause() {super.onPause(); sm.unregisterListener(this);}

    @Override public void onSensorChanged(SensorEvent ev) {
        if (ev.sensor.getType() != Sensor.TYPE_ROTATION_VECTOR) return;
        float[] R = new float[9], o = new float[3]; SensorManager.getRotationMatrixFromVector(R, ev.values); SensorManager.getOrientation(R, o);
        double az = (Math.toDegrees(o[0]) + decl + 360) % 360;
        grados.setText(Math.round(az) % 360 + "° " + Rutas.punto8(az));
        flecha.setRotation((float) -az);
    }
    @Override public void onAccuracyChanged(Sensor s, int a) {
        if (s.getType() == Sensor.TYPE_MAGNETIC_FIELD) {precision = a;
            nota.setText(a <= SensorManager.SENSOR_STATUS_ACCURACY_LOW ? "Poco precisa: mueve el reloj dibujando un 8 en el aire para calibrarla, lejos de metales." : "");}
    }
}
