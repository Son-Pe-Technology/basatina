package es.sonpe.basatina.wear;

import android.app.PendingIntent;
import android.content.Intent;

import androidx.wear.watchface.complications.data.ComplicationData;
import androidx.wear.watchface.complications.data.ComplicationType;
import androidx.wear.watchface.complications.data.PlainComplicationText;
import androidx.wear.watchface.complications.data.ShortTextComplicationData;
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceService;
import androidx.wear.watchface.complications.datasource.ComplicationRequest;

/**
 * ⌚ Complicación «BasatiNA · Río Arga» (25 nov. 2026): el caudal del Arga en Burlada en la esfera del reloj
 * (con ⚠️ si pasa de 150 m³/s y 🔴 si pasa de 300, los mismos umbrales que el móvil). Al tocarla se abre la app.
 */
public class ComplicacionRio extends ComplicationDataSourceService {

    @Override
    public void onComplicationRequest(ComplicationRequest req, ComplicationRequestListener l) {
        if (req.getComplicationType() != ComplicationType.SHORT_TEXT) {ComplicacionTiempo.responde(l, null); return;}
        new Thread(() -> {
            Datos d = Datos.actualiza(this);
            if (Double.isNaN(d.caudal)) d = Datos.guardados(this);
            if (Double.isNaN(d.caudal)) {ComplicacionTiempo.responde(l, texto("--", "Arga")); return;}
            int nv = d.nivelRio();
            String v = d.caudal >= 100 ? Datos.n0(d.caudal) : Datos.n1(d.caudal);
            ComplicacionTiempo.responde(l, texto(v, nv == 2 ? "🔴 Arga" : nv == 1 ? "⚠️ Arga" : "Arga"));
        }).start();
    }

    @Override
    public ComplicationData getPreviewData(ComplicationType type) {
        return type == ComplicationType.SHORT_TEXT ? texto("23,4", "Arga") : null;
    }

    ComplicationData texto(String valor, String titulo) {
        PendingIntent pi = PendingIntent.getActivity(this, 2, new Intent(this, Principal.class), PendingIntent.FLAG_IMMUTABLE);
        return new ShortTextComplicationData.Builder(
                new PlainComplicationText.Builder(valor).build(),
                new PlainComplicationText.Builder("Río Arga en Burlada: " + valor + " metros cúbicos por segundo").build())
            .setTitle(new PlainComplicationText.Builder(titulo).build())
            .setTapAction(pi).build();
    }
}
