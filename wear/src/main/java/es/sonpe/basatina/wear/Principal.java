package es.sonpe.basatina.wear;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.text.format.DateFormat;

import java.util.ArrayList;
import java.util.List;

/**
 * ⌚ Pantalla principal del reloj (25 nov. 2026): el tiempo donde estás y los accesos:
 *   🥾 Rutas cerca (seguir una ruta de NA a Pie con el GPS) · ❤️ Actividad libre (registrar sin ruta)
 *   🧭 Brújula · ⚖️ Peso (para calcular las kcal).
 * Los permisos (ubicación, pulsómetro, pasos, notificación) se piden la primera vez que se usan.
 */
public class Principal extends Pantalla {
    long ultima = 0; Runnable pendiente = null;

    @Override protected void onCreate(Bundle b) {super.onCreate(b); pinta(Datos.guardados(this));}
    @Override protected void onResume() {
        super.onResume(); pinta(Datos.guardados(this));
        if (System.currentTimeMillis() - ultima > 10 * 60_000L) {
            ultima = System.currentTimeMillis();
            new Thread(() -> {Datos d = Datos.actualiza(this); runOnUiThread(() -> pinta(d));}).start();
        }
    }

    void pinta(Datos d) {
        limpia(); t("BasatiNA", 13, GRIS, true);
        if (!Double.isNaN(d.temp)) {
            t(Datos.icono(d.codigo, d.dia) + " " + Datos.n0(d.temp) + "°", 36, Color.WHITE, true);
            t(Datos.desc(d.codigo) + (d.aqui ? " · aquí" : " · Pamplona"), 13, Color.WHITE, false);
            if (!Double.isNaN(d.max)) t("↑ " + Datos.n0(d.max) + "°   ↓ " + Datos.n0(d.min) + "°", 13, GRIS, false);
            if (!Double.isNaN(d.lluviaMm) && d.lluviaMm >= 0.1) t("🌧️ " + Datos.n1(d.lluviaMm) + " mm en la próxima hora", 13, AZUL, false);
            else if (d.probLluvia >= 0) t("☂️ Lluvia próxima hora: " + d.probLluvia + " %", 13, d.probLluvia >= 60 ? AZUL : Color.WHITE, false);
            if (!Double.isNaN(d.viento) && d.viento >= 30) t("💨 Viento " + Datos.n0(d.viento) + " km/h", 13, AMARILLO, false);
            t("a las " + DateFormat.format("HH:mm", d.tTiempo), 11, GRIS, false);
        } else t("Cargando el tiempo…", 13, GRIS, false);
        hueco(8);
        if (Grabacion.activo()) boton("▶️ Actividad en curso", 0xFF2E7D32, v -> startActivity(new Intent(this, Seguir.class)));
        else {
            boton("🥾 Rutas cerca", BOTON, v -> conPermisos(() -> startActivity(new Intent(this, RutasCerca.class))));
            boton("❤️ Actividad libre", BOTON, v -> conPermisos(() -> startActivity(new Intent(this, Seguir.class).putExtra("empezar", true))));
        }
        boton("🧭 Brújula", BOTON, v -> startActivity(new Intent(this, Brujula.class)));
        int peso = Datos.sp(this).getInt("peso", 75);
        boton("⚖️ Peso: " + peso + " kg", 0xFF1B2A30, v -> {
            int p = Datos.sp(this).getInt("peso", 75) + 5; if (p > 130) p = 45;             // 45, 50 … 130 kg
            Datos.sp(this).edit().putInt("peso", p).apply(); pinta(Datos.guardados(this));
        }).setTextSize(13);
        t("Toca «Peso» para cambiarlo (sirve para calcular las kcal).", 10, GRIS, false);
        hueco(6); t("Datos: Open‑Meteo, OpenStreetMap e IDENA. App no oficial.", 10, GRIS, false);
    }

    // ---------- permisos ----------
    void conPermisos(Runnable r) {
        List<String> P = new ArrayList<>();
        for (String p : new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.BODY_SENSORS, Manifest.permission.ACTIVITY_RECOGNITION})
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) P.add(p);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) P.add(Manifest.permission.POST_NOTIFICATIONS);
        if (P.isEmpty()) {r.run(); return;}
        pendiente = r; requestPermissions(P.toArray(new String[0]), 1);
    }
    @Override public void onRequestPermissionsResult(int code, String[] p, int[] res) {
        super.onRequestPermissionsResult(code, p, res);
        Runnable r = pendiente; pendiente = null;
        // sin GPS no se puede; sin pulsómetro o pasos, sigue (esos datos salen como «--»)
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            limpia(); t("Sin permiso de ubicación no se puede usar el GPS. Dáselo en Ajustes › Aplicaciones › BasatiNA › Permisos.", 14, AMARILLO, false);
            boton("Volver", BOTON, v -> pinta(Datos.guardados(this))); return;
        }
        if (r != null) r.run();
    }
}
