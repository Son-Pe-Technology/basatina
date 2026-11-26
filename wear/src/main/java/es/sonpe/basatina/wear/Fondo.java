package es.sonpe.basatina.wear;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.os.SystemClock;
import android.view.View;

import java.util.Calendar;
import java.util.Random;

/**
 * ⌚🌄 «Navarra viva» en el reloj (26 nov. 2026): el fondo del Inicio, como en el móvil.
 * El cielo cambia con la HORA REAL (noche, amanecer, día, atardecer) y con el TIEMPO REAL de Open‑Meteo
 * (sol o luna, nubes, lluvia, nieve, niebla, tormenta). Abajo, tres capas de montes (tipo Pirineo navarro)
 * con el color de la ESTACIÓN (verde en primavera, dorado en verano, ocre en otoño, frío en invierno).
 *
 * Batería: solo se mueve cuando la app está en pantalla (al bajar la muñeca la actividad se pausa y
 * se para) y va a pocos fotogramas: 15 por segundo con lluvia o nieve y 5 si solo se mueven las nubes.
 */
public class Fondo extends View {
    Datos d = new Datos();
    final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
    final long t0 = SystemClock.uptimeMillis();
    final float[][] estrellas = new float[60][3];      // x, y (0..1) y brillo
    final float[][] gotas = new float[70][3];          // x, y (0..1) y velocidad
    boolean vivo = false;

    public Fondo(Context c) {
        super(c);
        Random r = new Random(7);
        for (float[] e : estrellas) {e[0] = r.nextFloat(); e[1] = r.nextFloat() * 0.6f; e[2] = 0.3f + r.nextFloat() * 0.7f;}
        for (float[] g : gotas) {g[0] = r.nextFloat(); g[1] = r.nextFloat(); g[2] = 0.6f + r.nextFloat() * 0.8f;}
    }

    void pon(Datos nuevos) {d = nuevos; invalidate();}
    void anima(boolean si) {vivo = si; if (si) invalidate();}

    // ---------- tipo de tiempo según el código de Open‑Meteo (el mismo que usa el móvil) ----------
    boolean lluvia() {int c = d.codigo; return (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95;}
    boolean nieve() {int c = d.codigo; return (c >= 71 && c <= 77) || c == 85 || c == 86;}
    boolean niebla() {return d.codigo == 45 || d.codigo == 48;}
    boolean tormenta() {return d.codigo >= 95;}
    int nubes() {int c = d.codigo; if (c <= 0) return 0; if (c == 1) return 1; if (c == 2) return 2; return 4;}   // cuántas nubes

    @Override protected void onDraw(Canvas cv) {
        int w = getWidth(), h = getHeight(); if (w == 0) return;
        float s = (SystemClock.uptimeMillis() - t0) / 1000f;                 // segundos desde que se abrió
        Calendar cal = Calendar.getInstance();
        float hora = cal.get(Calendar.HOUR_OF_DAY) + cal.get(Calendar.MINUTE) / 60f;
        int mes = cal.get(Calendar.MONTH);                                     // 0 = enero
        boolean gris = nubes() >= 4 || lluvia() || nieve() || niebla();       // cielo tapado: colores apagados

        // 1) el cielo: degradado de arriba abajo según la hora
        int[] cielo = cielo(hora);
        if (gris) {cielo[0] = mezcla(cielo[0], 0xFF4A535C, 0.55f); cielo[1] = mezcla(cielo[1], 0xFF8A949C, 0.55f);}
        p.setShader(new LinearGradient(0, 0, 0, h * 0.8f, cielo[0], cielo[1], Shader.TileMode.CLAMP));
        cv.drawRect(0, 0, w, h, p); p.setShader(null);

        boolean noche = hora < 7 || hora >= 19.5f;
        // 2) estrellas (de noche y sin nubes), que parpadean un poco
        if (noche && !gris) for (float[] e : estrellas) {
            float a = e[2] * (0.6f + 0.4f * (float) Math.sin(s * 1.5 + e[0] * 20));
            p.setColor(Color.argb((int) (a * 220), 255, 255, 255)); cv.drawCircle(e[0] * w, e[1] * h, w * 0.004f + e[2] * w * 0.003f, p);
        }
        // 3) sol o luna, que recorren un arco a lo largo del día / la noche
        if (!gris || nubes() < 4) {
            float f = noche ? ((hora >= 19.5f ? hora - 19.5f : hora + 4.5f) / 11.5f) : (hora - 7) / 12.5f;   // 0..1
            float x = w * (0.12f + 0.76f * f), y = h * (0.52f - 0.36f * (float) Math.sin(Math.PI * f));
            float r = w * 0.075f;
            if (noche) {
                p.setShader(new RadialGradient(x, y, r * 3, 0x55DDE6FF, 0x00DDE6FF, Shader.TileMode.CLAMP)); cv.drawCircle(x, y, r * 3, p); p.setShader(null);
                p.setColor(0xFFF1F3F8); cv.drawCircle(x, y, r * 0.8f, p);
                p.setColor(0x22000000); cv.drawCircle(x - r * 0.25f, y - r * 0.15f, r * 0.18f, p); cv.drawCircle(x + r * 0.2f, y + r * 0.25f, r * 0.12f, p);
            } else {
                boolean bajo = hora < 9 || hora > 17.5f;
                int c = bajo ? 0xFFFFB347 : 0xFFFFE27A;
                p.setShader(new RadialGradient(x, y, r * 3.2f, (c & 0x00FFFFFF) | 0x66000000, c & 0x00FFFFFF, Shader.TileMode.CLAMP)); cv.drawCircle(x, y, r * 3.2f, p); p.setShader(null);
                p.setColor(c); cv.drawCircle(x, y, r, p);
            }
        }
        // 4) nubes que se mueven despacio de izquierda a derecha
        int n = nubes();
        for (int i = 0; i < n; i++) {
            float vel = 0.006f + i * 0.003f;
            float x = (((i * 0.37f + s * vel) % 1.4f) - 0.2f) * w, y = h * (0.14f + 0.09f * i);
            int c = gris ? (noche ? 0xFF3A4048 : 0xFFB9C0C6) : (noche ? 0xFF47506A : 0xFFFFFFFF);
            nube(cv, x, y, w * (0.16f + 0.03f * (i % 2)), (c & 0x00FFFFFF) | ((gris ? 0xE6 : 0xD9) << 24));
        }
        // 5) relámpago de vez en cuando
        if (tormenta() && (int) (s * 10) % 70 < 2) {p.setColor(0x66FFFFFF); cv.drawRect(0, 0, w, h, p);}

        // 6) los montes, en tres capas, con el color de la estación y oscurecidos de noche
        int[] monte = montes(mes, nieve());
        float osc = noche ? 0.62f : (hora < 8.5f || hora > 18f) ? 0.3f : 0f;
        for (int k = 0; k < 3; k++) {
            int c = mezcla(monte[k], 0xFF0A1020, osc);
            if (gris) c = mezcla(c, 0xFF6B747C, 0.25f);
            p.setColor(c); cv.drawPath(perfil(w, h, k), p);
        }
        // nieve en las cumbres del fondo en invierno o si nieva
        if (mes == 11 || mes <= 2 || nieve()) {p.setColor(mezcla(0xFFF4F7FA, 0xFF0A1020, osc)); cv.drawPath(cumbres(w, h), p);}

        // 7) niebla: bandas blancas que se mueven
        if (niebla()) for (int i = 0; i < 3; i++) {
            float y = h * (0.55f + 0.1f * i), dx = (float) Math.sin(s * 0.2 + i) * w * 0.05f;
            p.setShader(new LinearGradient(0, y - h * 0.08f, 0, y + h * 0.08f, new int[]{0x00FFFFFF, 0x88E8ECEF, 0x00FFFFFF}, null, Shader.TileMode.CLAMP));
            cv.drawRect(-w * 0.1f + dx, y - h * 0.08f, w * 1.1f + dx, y + h * 0.08f, p); p.setShader(null);
        }
        // 8) lluvia (rayas) o nieve (copos que bajan bailando)
        if (lluvia() || nieve()) {
            boolean copos = nieve();
            p.setStrokeWidth(Math.max(1.5f, w * 0.004f)); p.setStrokeCap(Paint.Cap.ROUND);
            p.setColor(copos ? 0xDDFFFFFF : 0x99BFD8FF);
            for (float[] g : gotas) {
                float y = ((g[1] + s * (copos ? 0.06f : 0.55f) * g[2]) % 1f) * h;
                float x = g[0] * w + (copos ? (float) Math.sin(s + g[0] * 30) * w * 0.02f : -y * 0.12f);
                if (copos) cv.drawCircle(x, y, w * 0.006f * g[2], p);
                else cv.drawLine(x, y, x - w * 0.012f, y + h * 0.045f * g[2], p);
            }
        }
        // 9) velo oscuro abajo para que se lean bien los botones
        p.setShader(new LinearGradient(0, h * 0.45f, 0, h, 0x00000000, 0xB3000000, Shader.TileMode.CLAMP));
        cv.drawRect(0, h * 0.45f, w, h, p); p.setShader(null);

        if (vivo) postInvalidateDelayed(lluvia() || nieve() || tormenta() ? 66 : n > 0 || niebla() ? 200 : 1000);
    }

    // ---------- piezas del dibujo ----------
    void nube(Canvas cv, float x, float y, float r, int c) {
        p.setColor(c);
        cv.drawCircle(x, y, r * 0.55f, p); cv.drawCircle(x + r * 0.55f, y + r * 0.1f, r * 0.45f, p);
        cv.drawCircle(x - r * 0.55f, y + r * 0.15f, r * 0.4f, p); cv.drawRect(x - r * 0.55f, y + r * 0.1f, x + r * 0.55f, y + r * 0.55f, p);
    }
    /** silueta de una capa de montes (0 = la del fondo, la más alta) */
    Path perfil(int w, int h, int k) {
        float base = h * (0.62f + 0.11f * k), alto = h * (0.16f - 0.035f * k);
        Path pa = new Path(); pa.moveTo(0, h); pa.lineTo(0, base);
        for (int i = 0; i <= 40; i++) {
            float x = w * i / 40f, f = i / 40f;
            double y = Math.sin(f * (5 + k * 2) + k * 1.3) * 0.5 + Math.sin(f * (11 + k * 3) + k) * 0.28 + Math.sin(f * 23 + k * 2) * 0.1;
            pa.lineTo(x, base - (float) (y + 0.7) / 1.6f * alto);
        }
        pa.lineTo(w, h); pa.close(); return pa;
    }
    /** las puntas nevadas de la capa del fondo */
    Path cumbres(int w, int h) {
        Path pa = new Path(); float base = h * 0.62f, alto = h * 0.16f;
        boolean dentro = false; float lim = base - alto * 0.72f;
        for (int i = 0; i <= 80; i++) {
            float x = w * i / 80f, f = i / 80f;
            double y = Math.sin(f * 5 + 0) * 0.5 + Math.sin(f * 11) * 0.28 + Math.sin(f * 23) * 0.1;
            float yy = base - (float) (y + 0.7) / 1.6f * alto;
            if (yy < lim) {if (!dentro) {pa.moveTo(x, lim); dentro = true;} pa.lineTo(x, yy);}
            else if (dentro) {pa.lineTo(x, lim); pa.close(); dentro = false;}
        }
        return pa;
    }
    /** colores del cielo [arriba, abajo] según la hora */
    static int[] cielo(float h) {
        if (h < 6 || h >= 21.5f) return new int[]{0xFF050B1E, 0xFF1A2448};                 // noche
        if (h < 7.5f) return new int[]{0xFF27315E, 0xFFF0A070};                             // amanecer
        if (h < 9) return new int[]{0xFF3F7BC4, 0xFFF6CFA0};                                // mañana temprano
        if (h < 17.5f) return new int[]{0xFF2F7FD8, 0xFFA9D4F5};                            // día
        if (h < 19.5f) return new int[]{0xFF3A4F8E, 0xFFF39A5B};                            // atardecer
        return new int[]{0xFF141B3D, 0xFF6A3E66};                                           // anochecer
    }
    /** colores de los montes [fondo, medio, delante] según el mes */
    static int[] montes(int mes, boolean nieve) {
        if (nieve) return new int[]{0xFFC9D3DC, 0xFFA9B6C0, 0xFF7E8C96};
        if (mes >= 2 && mes <= 4) return new int[]{0xFF6F9A78, 0xFF3F7A4A, 0xFF24552F};    // primavera
        if (mes >= 5 && mes <= 7) return new int[]{0xFF8E9C72, 0xFF5E7E45, 0xFF3C5A2A};    // verano
        if (mes >= 8 && mes <= 10) return new int[]{0xFF9A8A6A, 0xFF8A5A2E, 0xFF5A3A1E};   // otoño
        return new int[]{0xFF7F8C96, 0xFF4D6058, 0xFF2E3F38};                               // invierno
    }
    static int mezcla(int a, int b, float f) {
        return Color.argb(255, (int) (Color.red(a) + (Color.red(b) - Color.red(a)) * f),
            (int) (Color.green(a) + (Color.green(b) - Color.green(a)) * f), (int) (Color.blue(a) + (Color.blue(b) - Color.blue(a)) * f));
    }
}
