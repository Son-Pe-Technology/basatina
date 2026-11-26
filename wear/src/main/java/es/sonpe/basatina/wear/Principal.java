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
 * ⌚ Pantalla principal del reloj. 26 nov. 2026: Inicio «Navarra viva» (paisaje animado con la hora, el tiempo y
 * la estación reales) y accesos en cuadrados de color: Mapa · Radar · Rutas · Actividad · Brújula · Peso.
 * (25 nov. 2026, primera versión: el tiempo donde estás y los accesos:
 *   🥾 Rutas cerca (seguir una ruta de NA a Pie con el GPS) · ❤️ Actividad libre (registrar sin ruta)
 *   🧭 Brújula · ⚖️ Peso (para calcular las kcal).
 *  … ) Los permisos (ubicación, pulsómetro, pasos, notificación) se piden la primera vez que se usan.
 */
public class Principal extends Pantalla {
    long ultima = 0; Runnable pendiente = null; Fondo fondo;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b); fondo = new Fondo(this); conFondo(fondo); pinta(Datos.guardados(this));
    }
    @Override protected void onPause() {super.onPause(); fondo.anima(false);}    // al bajar la muñeca se para
    @Override protected void onResume() {
        super.onResume(); fondo.anima(true); pinta(Datos.guardados(this));
        if (System.currentTimeMillis() - ultima > 10 * 60_000L) {
            ultima = System.currentTimeMillis();
            new Thread(() -> {Datos d = Datos.actualiza(this); runOnUiThread(() -> pinta(d));}).start();
        }
    }

    void pinta(Datos d) {
        fondo.pon(d); limpia();
        // primera vista: la hora, la temperatura grande y el paisaje (ocupa la pantalla entera)
        int alto = getResources().getDisplayMetrics().heightPixels;
        hueco((int) (alto * 0.02f / getResources().getDisplayMetrics().density));
        ts(DateFormat.format("HH:mm", System.currentTimeMillis()) + "  ·  BasatiNA", 12, Color.WHITE, true);
        if (!Double.isNaN(d.temp)) {
            ts(Datos.n0(d.temp) + "°", 48, Color.WHITE, true);
            ts(Datos.desc(d.codigo) + (d.aqui ? " · aquí" : " · Pamplona"), 13, Color.WHITE, true);
            if (!Double.isNaN(d.max)) ts("↑ " + Datos.n0(d.max) + "°   ↓ " + Datos.n0(d.min) + "°", 13, Color.WHITE, false);
            if (!Double.isNaN(d.lluviaMm) && d.lluviaMm >= 0.1) ts(Datos.n1(d.lluviaMm) + " mm de lluvia en la próxima hora", 12, AZUL, true);
            else if (d.probLluvia >= 0) ts("Lluvia próxima hora: " + d.probLluvia + " %", 12, d.probLluvia >= 60 ? AZUL : Color.WHITE, false);
            if (!Double.isNaN(d.viento) && d.viento >= 30) ts("Viento " + Datos.n0(d.viento) + " km/h", 12, AMARILLO, true);
        } else ts("Cargando el tiempo…", 13, Color.WHITE, false);
        hueco((int) (alto * 0.16f / getResources().getDisplayMetrics().density));   // deja ver los montes

        // accesos, en cuadrados de color (gira la corona o desliza para verlos)
        android.widget.LinearLayout f1 = fila();
        acceso(f1, Icono.MAPA, 0xFF2E8B57, "Mapa", v -> abreMapa(false));
        acceso(f1, Icono.RADAR, 0xFF2F6FD0, "Radar", v -> abreMapa(true));
        android.widget.LinearLayout f2 = fila();
        if (Grabacion.activo()) acceso(f2, Icono.EN_CURSO, 0xFF2E7D32, "En curso", v -> startActivity(new Intent(this, Seguir.class)));
        else acceso(f2, Icono.RUTAS, 0xFFE0782F, "Rutas", v -> conPermisos(() -> startActivity(new Intent(this, RutasCerca.class))));
        acceso(f2, Icono.ACTIVIDAD, 0xFFD8434F, "Actividad", v -> {
            if (Grabacion.activo()) startActivity(new Intent(this, Seguir.class));
            else conPermisos(() -> startActivity(new Intent(this, Seguir.class).putExtra("empezar", true)));
        });
        android.widget.LinearLayout f3 = fila();
        acceso(f3, Icono.BRUJULA, 0xFF5B5FC7, "Brújula", v -> startActivity(new Intent(this, Brujula.class)));
        int peso = Datos.sp(this).getInt("peso", 75);
        Icono ip = acceso(f3, Icono.PESO, 0xFF607D8B, "Tu peso", v -> {
            int p = Datos.sp(this).getInt("peso", 75) + 5; if (p > 130) p = 45;             // 45, 50 … 130 kg
            Datos.sp(this).edit().putInt("peso", p).apply(); pinta(Datos.guardados(this));
        });
        ip.texto = String.valueOf(peso);
        hueco(6); t("Toca «Tu peso» para cambiarlo: sirve para calcular las kcal.", 10, GRIS, false);
        if (d.tTiempo > 0) t("Tiempo de las " + DateFormat.format("HH:mm", d.tTiempo), 10, GRIS, false);
        hueco(4); t("Datos: Open‑Meteo, IGN, RainViewer, OpenStreetMap e IDENA. App no oficial.", 10, GRIS, false);
    }

    void abreMapa(boolean radar) {
        Intent i = new Intent(this, Mapa.class).putExtra("radar", radar);
        if (Grabacion.activo() && Grabacion.E.ruta != null) i.putExtra("ruta", Grabacion.E.ruta.id);
        startActivity(i);
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
