package es.pedrito.controlarga;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONObject;

import java.util.Map;

/**
 * 📲 Avisos push (21 nov. 2026).
 * Los manda el robot de GitHub (tools/push.py) a un TEMA de Firebase Cloud Messaging; cada móvil se apunta
 * a los temas que elige en Ajustes («📲 Avisos al momento»). No guardamos ningún identificador del móvil:
 * con temas, Firebase sabe a quién entregar y nosotros no.
 *
 * El mensaje llega con datos (no con «notification»), así lo pinta siempre esta clase con su canal:
 *   tema = desaparecidos | avisos     titulo, texto: lo que se ve     tab: pantalla que se abre al tocar
 */
public class PushService extends FirebaseMessagingService {

    /** Temas que existen. Deben ser iguales que TEMAS en tools/push.py y PU_T en web/push.js */
    static final String[] TEMAS = {"desaparecidos", "avisos"};

    @Override
    public void onMessageReceived(RemoteMessage m) {
        Map<String, String> d = m.getData();
        String tema = d.containsKey("tema") ? d.get("tema") : "avisos";
        // si el usuario lo quitó en Ajustes pero aún no se había dado de baja del tema, no se enseña
        try {
            JSONObject cfg = new JSONObject(getSharedPreferences("rio", MODE_PRIVATE).getString("push", "{}"));
            if (!cfg.optBoolean(tema, false)) return;
        } catch (Exception ignored) {}
        String t = d.containsKey("titulo") ? d.get("titulo") : "BasatiNA";
        String x = d.containsKey("texto") ? d.get("texto") : "";
        String tab = d.containsKey("tab") ? d.get("tab") : "";
        mostrar(this, tema, t, x, tab);
    }

    @Override
    public void onNewToken(String token) {
        // No guardamos el token en ningún sitio. Al cambiar, se vuelve a apuntar a los temas elegidos.
        aplicar(this);
    }

    /** Apunta o da de baja el móvil de cada tema según lo guardado en Ajustes (prefs «push») */
    static void aplicar(Context c) {
        try {
            JSONObject cfg = new JSONObject(c.getSharedPreferences("rio", Context.MODE_PRIVATE).getString("push", "{}"));
            FirebaseMessaging fm = FirebaseMessaging.getInstance();
            for (String tema : TEMAS) {
                if (cfg.optBoolean(tema, false)) fm.subscribeToTopic(tema);
                else fm.unsubscribeFromTopic(tema);
            }
        } catch (Exception ignored) {}
    }

    static void mostrar(Context c, String tema, String titulo, String texto, String tab) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        String ch = "desaparecidos".equals(tema) ? "push_desaparecidos_2" : "push_avisos_2";
        RiverJob.canales(c);   // canales con sonido de BasatiNA (22 nov. 2026)
        Intent i = new Intent(c, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (tab != null && !tab.isEmpty()) i.putExtra("pushTab", tab);
        int id = 700 + (int) (System.currentTimeMillis() / 1000 % 200);
        PendingIntent pi = PendingIntent.getActivity(c, id, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new android.app.Notification.Builder(c, ch) : new android.app.Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_river).setContentTitle(titulo).setContentText(texto)
                .setStyle(new android.app.Notification.BigTextStyle().bigText(texto))
                .setContentIntent(pi).setAutoCancel(true);
        try { nm.notify(id, b.build()); } catch (SecurityException ignored) {}
    }
}
