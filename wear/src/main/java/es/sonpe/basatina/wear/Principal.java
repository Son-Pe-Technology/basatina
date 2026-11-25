package es.sonpe.basatina.wear;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.format.DateFormat;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

/**
 * ⌚ Pantalla del reloj (25 nov. 2026). Una sola pantalla que se mueve con el dedo o con la corona/bisel:
 *   el tiempo en Pamplona · lluvia de la próxima hora · el Arga en Burlada · el embalse de Eugui.
 * Primero enseña lo guardado (al momento) y luego lo actualiza de internet.
 * Hecha sin librerías de diseño (solo Android): pesa poco y se compila sin sorpresas.
 * Los márgenes grandes (15 %) son para que nada se corte en las pantallas redondas.
 */
public class Principal extends Activity {
    static final int VERDE = 0xFF6FCF7C, AMARILLO = 0xFFFFC94A, ROJO = 0xFFFF6B6B, GRIS = 0xFFB0B8B4, AZUL = 0xFF7CC4FF;
    LinearLayout caja; ScrollView sv; long ultima = 0;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        sv = new ScrollView(this); sv.setBackgroundColor(Color.BLACK); sv.setFillViewport(true);
        sv.setVerticalScrollBarEnabled(false);
        caja = new LinearLayout(this); caja.setOrientation(LinearLayout.VERTICAL); caja.setGravity(Gravity.CENTER_HORIZONTAL);
        int w = getResources().getDisplayMetrics().widthPixels, m = (int) (w * 0.15);
        caja.setPadding(m, (int) (w * 0.12), m, (int) (w * 0.22));
        sv.addView(caja); setContentView(sv);
        pinta(Datos.guardados(this));
    }

    @Override protected void onResume() {
        super.onResume();
        sv.requestFocus();     // para que la corona o el bisel giratorio muevan la pantalla
        if (System.currentTimeMillis() - ultima > 5 * 60_000L) actualiza();
    }

    void actualiza() {
        ultima = System.currentTimeMillis();
        new Thread(() -> {final Datos d = Datos.actualiza(this); runOnUiThread(() -> pinta(d));}).start();
    }

    // ---------- dibujo ----------
    void pinta(Datos d) {
        caja.removeAllViews();
        t("BasatiNA", 13, GRIS, true);
        // el tiempo
        if (!Double.isNaN(d.temp)) {
            t(Datos.icono(d.codigo, d.dia) + " " + Datos.n0(d.temp) + "°", 40, Color.WHITE, true);
            t(Datos.desc(d.codigo) + " · Pamplona", 14, Color.WHITE, false);
            if (!Double.isNaN(d.max)) t("↑ " + Datos.n0(d.max) + "°   ↓ " + Datos.n0(d.min) + "°", 14, GRIS, false);
            hueco(8);
            String ll;
            if (!Double.isNaN(d.lluviaMm) && d.lluviaMm >= 0.1) ll = "🌧️ " + Datos.n1(d.lluviaMm) + " mm en la próxima hora";
            else if (d.probLluvia >= 0) ll = "☂️ Lluvia próxima hora: " + d.probLluvia + " %";
            else ll = "";
            if (!ll.isEmpty()) t(ll, 14, d.probLluvia >= 60 || d.lluviaMm >= 1 ? AZUL : Color.WHITE, false);
            if (!Double.isNaN(d.viento) && d.viento >= 30) t("💨 Viento " + Datos.n0(d.viento) + " km/h", 14, AMARILLO, false);
        } else t("Sin datos del tiempo todavía", 14, GRIS, false);
        // el río
        hueco(14); t("Río Arga · Burlada", 13, GRIS, true);
        if (!Double.isNaN(d.caudal)) {
            int nv = d.nivelRio(); int col = nv == 2 ? ROJO : nv == 1 ? AMARILLO : VERDE;
            String fl = Double.isNaN(d.subidaHora) ? "" : d.subidaHora > 2 ? " ↗" : d.subidaHora < -2 ? " ↘" : " →";
            t(Datos.n1(d.caudal) + " m³/s" + fl, 26, col, true);
            t(nv == 2 ? "⚠️ Crecida: sigue los avisos oficiales (112)" : nv == 1 ? "Caudal alto: atento" : "Caudal normal", 13, col, false);
            if (!Double.isNaN(d.subidaHora) && Math.abs(d.subidaHora) >= 2)
                t((d.subidaHora > 0 ? "Sube " : "Baja ") + Datos.n0(Math.abs(d.subidaHora)) + " m³/s por hora", 13, GRIS, false);
        } else t("Sin datos del río todavía", 14, GRIS, false);
        if (!Double.isNaN(d.eugui)) {hueco(8); t("💧 Embalse de Eugui: " + Datos.n0(d.eugui) + " %", 14, Color.WHITE, false);}
        // pie
        hueco(14);
        long tt = Math.max(d.tTiempo, d.tRio);
        t(tt > 0 ? "Actualizado a las " + DateFormat.format("HH:mm", tt) : "Buscando datos…", 12, GRIS, false);
        TextView bt = t("↻ Actualizar", 15, AZUL, true); bt.setPadding(0, dp(10), 0, dp(10));
        bt.setOnClickListener(v -> {bt.setText("Actualizando…"); actualiza();});
        t("Datos: Open‑Meteo y SAIH Ebro. App no oficial: ante el riesgo, haz caso siempre a los avisos oficiales.", 11, GRIS, false);
    }

    TextView t(String s, int sp, int color, boolean negrita) {
        TextView v = new TextView(this); v.setText(s); v.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp); v.setTextColor(color);
        v.setGravity(Gravity.CENTER_HORIZONTAL); if (negrita) v.setTypeface(Typeface.DEFAULT_BOLD);
        caja.addView(v, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        return v;
    }
    void hueco(int d) {View v = new View(this); caja.addView(v, new LinearLayout.LayoutParams(1, dp(d)));}
    int dp(int d) {return (int) (d * getResources().getDisplayMetrics().density);}
}
