package es.pedrito.controlarga;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

/**
 * Health Connect OBLIGA a tener esta pantalla: cuando el usuario, desde los ajustes de Health Connect,
 * pulsa «¿Por qué BasatiNA quiere mis datos?», Android abre esta actividad.
 * No dibuja nada: abre el apartado de datos de salud de la política de privacidad y se cierra.
 */
public class PrivacidadSalud extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://basatina.es/privacidad.html#salud")));
        } catch (Exception ignored) {}
        finish();
    }
}
