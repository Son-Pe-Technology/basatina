package es.sonpe.basatina.wear;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Shader;
import android.view.View;

/**
 * ⌚ Icono en cuadrado de color, estilo iPhone, como los del menú del móvil (26 nov. 2026). Sin emojis:
 * el dibujo blanco se pinta a mano (con líneas y formas), así se ve nítido en cualquier reloj.
 */
public class Icono extends View {
    static final int MAPA = 0, RADAR = 1, RUTAS = 2, ACTIVIDAD = 3, BRUJULA = 4, PESO = 5, EN_CURSO = 6;
    final int tipo, color; String texto = null;
    final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);

    public Icono(Context c, int tipo, int color) {super(c); this.tipo = tipo; this.color = color;}

    @Override protected void onDraw(Canvas cv) {
        float w = getWidth(), h = getHeight(), r = w * 0.24f;
        // cuadrado con un degradado suave (más claro arriba), como los iconos del iPhone
        p.setStyle(Paint.Style.FILL);
        p.setShader(new LinearGradient(0, 0, 0, h, Fondo.mezcla(color, 0xFFFFFFFF, 0.22f), color, Shader.TileMode.CLAMP));
        cv.drawRoundRect(new RectF(0, 0, w, h), r, r, p); p.setShader(null);

        float cx = w / 2, cy = h / 2, u = w / 100f;           // u: 1 % del icono
        p.setColor(0xFFFFFFFF); p.setStrokeCap(Paint.Cap.ROUND); p.setStrokeJoin(Paint.Join.ROUND);
        Path pa = new Path();
        switch (tipo) {
            case MAPA: {   // chincheta
                pa.addCircle(cx, cy - 8 * u, 22 * u, Path.Direction.CW);
                pa.moveTo(cx - 19 * u, cy + 2 * u); pa.lineTo(cx, cy + 34 * u); pa.lineTo(cx + 19 * u, cy + 2 * u); pa.close();
                cv.drawPath(pa, p); p.setColor(color); cv.drawCircle(cx, cy - 8 * u, 9 * u, p); break;
            }
            case RADAR: {  // nube con lluvia
                cv.drawCircle(cx - 12 * u, cy - 4 * u, 14 * u, p); cv.drawCircle(cx + 6 * u, cy - 12 * u, 18 * u, p); cv.drawCircle(cx + 20 * u, cy - 1 * u, 12 * u, p);
                cv.drawRect(cx - 12 * u, cy - 4 * u, cx + 20 * u, cy + 11 * u, p);
                p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(6 * u);
                for (int i = -1; i <= 1; i++) cv.drawLine(cx + i * 14 * u + 4 * u, cy + 20 * u, cx + i * 14 * u - 2 * u, cy + 32 * u, p);
                break;
            }
            case RUTAS: {  // dos montes y un camino
                pa.moveTo(cx - 34 * u, cy + 26 * u); pa.lineTo(cx - 10 * u, cy - 18 * u); pa.lineTo(cx + 2 * u, cy + 2 * u);
                pa.lineTo(cx + 14 * u, cy - 26 * u); pa.lineTo(cx + 36 * u, cy + 26 * u); pa.close(); cv.drawPath(pa, p);
                p.setColor(color); p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(5 * u);
                Path c = new Path(); c.moveTo(cx - 6 * u, cy + 26 * u); c.quadTo(cx + 14 * u, cy + 10 * u, cx + 2 * u, cy); cv.drawPath(c, p); break;
            }
            case ACTIVIDAD: {   // corazón
                pa.moveTo(cx, cy + 30 * u);
                pa.cubicTo(cx - 44 * u, cy + 2 * u, cx - 26 * u, cy - 36 * u, cx, cy - 14 * u);
                pa.cubicTo(cx + 26 * u, cy - 36 * u, cx + 44 * u, cy + 2 * u, cx, cy + 30 * u); cv.drawPath(pa, p);
                p.setColor(color); p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(5 * u);
                Path l = new Path(); l.moveTo(cx - 24 * u, cy + 2 * u); l.lineTo(cx - 10 * u, cy + 2 * u); l.lineTo(cx - 4 * u, cy - 10 * u);
                l.lineTo(cx + 4 * u, cy + 12 * u); l.lineTo(cx + 10 * u, cy + 2 * u); l.lineTo(cx + 24 * u, cy + 2 * u); cv.drawPath(l, p); break;
            }
            case BRUJULA: {     // círculo y aguja
                p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(6 * u); cv.drawCircle(cx, cy, 31 * u, p); p.setStyle(Paint.Style.FILL);
                pa.moveTo(cx, cy - 24 * u); pa.lineTo(cx + 9 * u, cy); pa.lineTo(cx - 9 * u, cy); pa.close(); p.setColor(0xFFFF6B6B); cv.drawPath(pa, p);
                Path b = new Path(); b.moveTo(cx, cy + 24 * u); b.lineTo(cx + 9 * u, cy); b.lineTo(cx - 9 * u, cy); b.close(); p.setColor(0xFFFFFFFF); cv.drawPath(b, p); break;
            }
            case EN_CURSO: {    // «play»
                pa.moveTo(cx - 14 * u, cy - 24 * u); pa.lineTo(cx + 24 * u, cy); pa.lineTo(cx - 14 * u, cy + 24 * u); pa.close(); cv.drawPath(pa, p); break;
            }
            default: {          // texto (el peso)
                p.setTextAlign(Paint.Align.CENTER); p.setFakeBoldText(true);
                p.setTextSize(30 * u); cv.drawText(texto == null ? "kg" : texto, cx, cy + 4 * u, p);
                p.setTextSize(20 * u); p.setFakeBoldText(false); cv.drawText("kg", cx, cy + 28 * u, p);
            }
        }
        p.setStyle(Paint.Style.FILL);
    }
}
