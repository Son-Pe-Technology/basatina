package es.sonpe.basatina.wear;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

/**
 * ⌚ Base de todas las pantallas del reloj (25 nov. 2026): una columna que se mueve con el dedo o con la
 * corona/bisel, fondo negro (gasta menos en pantallas OLED) y márgenes grandes para las pantallas redondas.
 * Sin librerías de diseño: solo Android.
 */
public abstract class Pantalla extends Activity {
    static final int VERDE = 0xFF6FCF7C, AMARILLO = 0xFFFFC94A, ROJO = 0xFFFF6B6B, GRIS = 0xFFB0B8B4, AZUL = 0xFF7CC4FF, BOTON = 0xFF263238;
    LinearLayout caja; ScrollView sv;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        sv = new ScrollView(this); sv.setBackgroundColor(Color.BLACK); sv.setFillViewport(true); sv.setVerticalScrollBarEnabled(false);
        caja = new LinearLayout(this); caja.setOrientation(LinearLayout.VERTICAL); caja.setGravity(Gravity.CENTER_HORIZONTAL);
        int w = getResources().getDisplayMetrics().widthPixels, m = (int) (w * 0.14);
        caja.setPadding(m, (int) (w * 0.12), m, (int) (w * 0.22));
        sv.addView(caja); setContentView(sv);
    }
    @Override protected void onResume() {super.onResume(); sv.requestFocus();}   // la corona/bisel mueve la pantalla

    void limpia() {caja.removeAllViews();}
    TextView t(String s, int sp, int color, boolean negrita) {
        TextView v = new TextView(this); v.setText(s); v.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp); v.setTextColor(color);
        v.setGravity(Gravity.CENTER_HORIZONTAL); if (negrita) v.setTypeface(Typeface.DEFAULT_BOLD);
        caja.addView(v, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        return v;
    }
    TextView boton(String s, int color, View.OnClickListener cl) {
        TextView v = t(s, 15, Color.WHITE, true); v.setPadding(dp(10), dp(11), dp(10), dp(11));
        GradientDrawable g = new GradientDrawable(); g.setColor(color); g.setCornerRadius(dp(24)); v.setBackground(g);
        LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) v.getLayoutParams(); lp.topMargin = dp(6); v.setLayoutParams(lp);
        v.setOnClickListener(cl); return v;
    }
    /** Pone una vista (el paisaje animado) detrás de la columna, que pasa a ser transparente */
    void conFondo(View fondo) {
        ((android.view.ViewGroup) sv.getParent()).removeView(sv);
        android.widget.FrameLayout f = new android.widget.FrameLayout(this); f.setBackgroundColor(Color.BLACK);
        f.addView(fondo); sv.setBackgroundColor(Color.TRANSPARENT); f.addView(sv); setContentView(f);
    }
    /** Texto con sombra, para que se lea encima del paisaje */
    TextView ts(String s, int sp, int color, boolean negrita) {TextView v = t(s, sp, color, negrita); v.setShadowLayer(dp(3), 0, dp(1), 0xCC000000); return v;}
    /** Una fila de accesos: icono en cuadrado de color con el nombre debajo */
    LinearLayout fila() {
        LinearLayout f = new LinearLayout(this); f.setOrientation(LinearLayout.HORIZONTAL); f.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.topMargin = dp(8); caja.addView(f, lp); return f;
    }
    Icono acceso(LinearLayout fila, int tipo, int color, String nombre, View.OnClickListener cl) {
        LinearLayout a = new LinearLayout(this); a.setOrientation(LinearLayout.VERTICAL); a.setGravity(Gravity.CENTER_HORIZONTAL);
        Icono i = new Icono(this, tipo, color); a.addView(i, new LinearLayout.LayoutParams(dp(52), dp(52)));
        TextView n = new TextView(this); n.setText(nombre); n.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11); n.setTextColor(Color.WHITE);
        n.setGravity(Gravity.CENTER_HORIZONTAL); n.setShadowLayer(dp(2), 0, dp(1), 0xCC000000); n.setPadding(0, dp(3), 0, 0); a.addView(n);
        a.setOnClickListener(cl);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dp(74), LinearLayout.LayoutParams.WRAP_CONTENT); fila.addView(a, lp);
        return i;
    }
    void hueco(int d) {View v = new View(this); caja.addView(v, new LinearLayout.LayoutParams(1, dp(d)));}
    int dp(int d) {return (int) (d * getResources().getDisplayMetrics().density);}
    static String dur(long ms) {long m = Math.max(0, ms / 60000); return m < 60 ? m + " min" : (m / 60) + " h " + String.format(Datos.ES, "%02d", m % 60) + " min";}
}
