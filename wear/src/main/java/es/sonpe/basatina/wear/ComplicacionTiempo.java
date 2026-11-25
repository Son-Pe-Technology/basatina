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
 * ⌚ Complicación «BasatiNA · Temperatura» (25 nov. 2026): la temperatura de Pamplona en la esfera del reloj.
 * El reloj la pide cada 30 min (UPDATE_PERIOD_SECONDS en el manifiesto). Al tocarla se abre la app.
 */
public class ComplicacionTiempo extends ComplicationDataSourceService {

    @Override
    public void onComplicationRequest(ComplicationRequest req, ComplicationRequestListener l) {
        if (req.getComplicationType() != ComplicationType.SHORT_TEXT) {responde(l, null); return;}
        new Thread(() -> {
            Datos d = Datos.actualiza(this);
            if (Double.isNaN(d.temp)) d = Datos.guardados(this);
            responde(l, Double.isNaN(d.temp) ? texto("--°", "BasatiNA") : texto(Datos.n0(d.temp) + "°", Datos.icono(d.codigo, d.dia)));
        }).start();
    }

    @Override
    public ComplicationData getPreviewData(ComplicationType type) {
        return type == ComplicationType.SHORT_TEXT ? texto("12°", "⛅") : null;
    }

    ComplicationData texto(String valor, String titulo) {
        PendingIntent pi = PendingIntent.getActivity(this, 1, new Intent(this, Principal.class), PendingIntent.FLAG_IMMUTABLE);
        return new ShortTextComplicationData.Builder(
                new PlainComplicationText.Builder(valor).build(),
                new PlainComplicationText.Builder("Temperatura en Pamplona: " + valor).build())
            .setTitle(new PlainComplicationText.Builder(titulo).build())
            .setTapAction(pi).build();
    }

    static void responde(ComplicationRequestListener l, ComplicationData d) {
        try {l.onComplicationData(d);} catch (Exception ignored) {}
    }
}
