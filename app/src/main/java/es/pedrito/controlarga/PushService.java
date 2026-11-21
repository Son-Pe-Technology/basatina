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
        // ⚽ avisos de mis equipos (día de partido / resultado): llegan al tema del equipo («eq-…»)
        if ("partido".equals(tema) || "resultado".equals(tema)) {
            String eq = d.containsKey("eq") ? d.get("eq") : "";
            if (!equipos(this).contains(eq)) return;      // ya no lo sigue
            mostrar(this, tema, d.get("titulo"), d.get("texto"), d.containsKey("tab") ? d.get("tab") : "misdep");
            return;
        }
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
        // ⚽ equipos: apuntarse a los que sigue y darse de baja de los que ha quitado
        try {
            android.content.SharedPreferences p = c.getSharedPreferences("rio", Context.MODE_PRIVATE);
            java.util.Set<String> ahora = equipos(c), antes = new java.util.HashSet<>(p.getStringSet("equiposSub", new java.util.HashSet<>()));
            FirebaseMessaging fm = FirebaseMessaging.getInstance();
            for (String t : ahora) fm.subscribeToTopic(t);
            for (String t : antes) if (!ahora.contains(t)) fm.unsubscribeFromTopic(t);
            p.edit().putStringSet("equiposSub", ahora).apply();
        } catch (Exception ignored) {}
    }

    /** Temas de los equipos que sigue (los manda la pantalla con setEquipos). Solo «eq-» + letras y números. */
    static java.util.Set<String> equipos(Context c) {
        java.util.Set<String> r = new java.util.HashSet<>();
        try {
            org.json.JSONArray a = new org.json.JSONArray(c.getSharedPreferences("rio", Context.MODE_PRIVATE).getString("equipos", "[]"));
            for (int i = 0; i < a.length() && r.size() < 60; i++) {
                String t = a.optString(i, "");
                if (t.matches("eq-[a-z0-9]{4,20}")) r.add(t);
            }
        } catch (Exception ignored) {}
        return r;
    }

    static void mostrar(Context c, String tema, String titulo, String texto, String tab) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        String ch = "desaparecidos".equals(tema) ? "push_desaparecidos" : "partido".equals(tema) ? "push_partido" : "resultado".equals(tema) ? "push_resultado" : "push_avisos";
        // ⚽ canales con sonido propio: bombos y trompetas (día de partido) y ovación con aplausos (resultado)
        if (Build.VERSION.SDK_INT >= 26 && ch.startsWith("push_") && (ch.equals("push_partido") || ch.equals("push_resultado")) && nm.getNotificationChannel(ch) == null) {
            boolean p = ch.equals("push_partido");
            NotificationChannel nc = new NotificationChannel(ch, p ? "Hoy juega mi equipo" : "Resultado de mi equipo", NotificationManager.IMPORTANCE_HIGH);
            nc.setDescription(p ? "El día del partido de los equipos que sigues, con bombos y trompetas" : "El resultado final de los equipos que sigues, con ovación y aplausos");
            android.net.Uri u = android.net.Uri.parse("android.resource://" + c.getPackageName() + "/" + (p ? R.raw.bn_fanfarria : R.raw.bn_ovacion));
            nc.setSound(u, new android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            nm.createNotificationChannel(nc);
        }
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(ch) == null) {
            NotificationChannel nc = "push_desaparecidos".equals(ch)
                    ? new NotificationChannel(ch, "Personas desaparecidas", NotificationManager.IMPORTANCE_HIGH)
                    : new NotificationChannel(ch, "Avisos de BasatiNA", NotificationManager.IMPORTANCE_DEFAULT);
            nc.setDescription("push_desaparecidos".equals(ch)
                    ? "Alertas de personas desaparecidas en Navarra, en cuanto salen"
                    : "Avisos importantes de BasatiNA");
            nm.createNotificationChannel(nc);
        }
        Intent i = new Intent(c, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (tab != null && !tab.isEmpty()) i.putExtra("pushTab", tab);
        int id = 700 + (int) (System.currentTimeMillis() / 1000 % 200);
        PendingIntent pi = PendingIntent.getActivity(c, id, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new android.app.Notification.Builder(c, ch) : new android.app.Notification.Builder(c);
        if (Build.VERSION.SDK_INT < 26 && (ch.equals("push_partido") || ch.equals("push_resultado")))
            b.setSound(android.net.Uri.parse("android.resource://" + c.getPackageName() + "/" + (ch.equals("push_partido") ? R.raw.bn_fanfarria : R.raw.bn_ovacion)));
        b.setSmallIcon(R.drawable.ic_stat_river).setContentTitle(titulo).setContentText(texto)
                .setStyle(new android.app.Notification.BigTextStyle().bigText(texto))
                .setContentIntent(pi).setAutoCancel(true);
        try { nm.notify(id, b.build()); } catch (SecurityException ignored) {}
    }
}
