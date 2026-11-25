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
    void hueco(int d) {View v = new View(this); caja.addView(v, new LinearLayout.LayoutParams(1, dp(d)));}
    int dp(int d) {return (int) (d * getResources().getDisplayMetrics().density);}
    static String dur(long ms) {long m = Math.max(0, ms / 60000); return m < 60 ? m + " min" : (m / 60) + " h " + String.format(Datos.ES, "%02d", m % 60) + " min";}
}
