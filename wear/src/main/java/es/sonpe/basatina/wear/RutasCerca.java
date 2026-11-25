package es.sonpe.basatina.wear;

import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;

import java.util.ArrayList;
import java.util.List;

/**
 * ⌚🥾 Rutas cerca de ti (25 nov. 2026): el reloj busca su posición con el GPS, carga las rutas de NA a Pie
 * (Rutas.todas) y enseña las 15 cuyo camino queda más cerca. Al tocar una, empieza a seguirla (Seguir + Grabacion).
 */
public class RutasCerca extends Pantalla {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        limpia(); t("🥾 Rutas cerca", 16, AZUL, true); t("📡 Buscando tu posición…", 14, GRIS, false);
        Location ult = Datos.ultimaPosicion(this);
        if (ult != null && System.currentTimeMillis() - ult.getTime() < 2 * 60_000L) {busca(ult); return;}
        try {
            getSystemService(LocationManager.class).getCurrentLocation(LocationManager.GPS_PROVIDER, null, getMainExecutor(), l -> {
                if (l != null) busca(l);
                else {Location u = Datos.ultimaPosicion(this); if (u != null) busca(u); else error("No se ha podido saber dónde estás. Sal a cielo abierto y vuelve a probar.");}
            });
        } catch (SecurityException e) {error("BasatiNA no tiene permiso para usar la ubicación del reloj.");}
    }

    void busca(Location l) {
        limpia(); t("🥾 Rutas cerca", 16, AZUL, true); t("Cargando las rutas…", 14, GRIS, false);
        new Thread(() -> {
            try {
                List<Rutas.Ruta> L = Rutas.todas(this); List<double[]> D = new ArrayList<>();   // [índice, metros]
                for (int i = 0; i < L.size(); i++) {
                    Rutas.Ruta r = L.get(i);
                    // primero la salida (rápido); el camino entero solo si la salida está a menos de 40 km
                    double ds = Rutas.dist(l.getLatitude(), l.getLongitude(), r.lin[0][0], r.lin[0][1]);
                    D.add(new double[]{i, ds > 40000 ? ds : Rutas.aLaRuta(r, l.getLatitude(), l.getLongitude())});
                }
                D.sort((a, c) -> Double.compare(a[1], c[1]));
                runOnUiThread(() -> lista(L, D));
            } catch (Exception e) {runOnUiThread(() -> error(e.getMessage()));}
        }).start();
    }

    void lista(List<Rutas.Ruta> L, List<double[]> D) {
        limpia(); t("🥾 Rutas cerca", 16, AZUL, true); t("Toca una para seguirla con el GPS", 12, GRIS, false);
        for (int k = 0; k < Math.min(15, D.size()); k++) {
            final Rutas.Ruta r = L.get((int) D.get(k)[0]); double m = D.get(k)[1];
            boton(r.n + "\n" + (m < 150 ? "📍 Estás en ella" : "a " + Seguir.metros(m)) + " · " + Datos.n1(r.km) + " km · ↗ " + r.up + " m · " + r.dif,
                BOTON, v -> {
                    if (Grabacion.activo()) {startActivity(new Intent(this, Seguir.class)); return;}   // ya hay una en curso
                    startActivity(new Intent(this, Seguir.class).putExtra("ruta", r.id).putExtra("empezar", true)); finish();
                }).setTextSize(13);
        }
    }
    void error(String s) {limpia(); t("🥾 Rutas cerca", 16, AZUL, true); t(s, 14, AMARILLO, false); boton("Volver", BOTON, v -> finish());}
}
