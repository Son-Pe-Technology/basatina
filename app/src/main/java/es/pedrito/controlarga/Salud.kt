package es.pedrito.controlarga

import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Period
import java.time.ZoneId

/**
 * «Mi actividad»: lee pasos y pulsaciones de Health Connect (el almacén de salud de Android).
 * Samsung Health, Fitbit, Garmin, Xiaomi… guardan ahí lo que mide el reloj, así que no hace
 * falta hablar con cada reloj: leemos de un único sitio.
 *
 * Está en Kotlin (y no en Java como el resto) porque la librería de Health Connect solo trae
 * funciones «suspend» de Kotlin, que desde Java no se pueden llamar de forma sencilla.
 * Java y Kotlin conviven sin problema en la misma app.
 *
 * Todo devuelve un texto JSON por el callback, para pasárselo tal cual a la página (index.html).
 * Los datos NO se guardan ni se envían a ningún sitio: se leen y se enseñan.
 */
object Salud {

    /** Lo que pedimos: SOLO leer pasos y pulsaciones (Google revisa que no pidamos de más). */
    @JvmField
    val PERMISOS: Set<String> = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class),
    )
    private val P_PASOS = HealthPermission.getReadPermission(StepsRecord::class)
    private val P_PULSO = HealthPermission.getReadPermission(HeartRateRecord::class)

    /** Para que Java pueda pasar una lambda: Salud.hoy(ctx, json -> ...) */
    fun interface Respuesta { fun listo(json: String) }

    // Las lecturas se hacen en segundo plano (Dispatchers.IO) para no congelar la pantalla
    private val hilo = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    /**
     * ¿Se puede usar Health Connect en este móvil?
     *  "ok"       → sí
     *  "instalar" → falta instalarlo o actualizarlo (Android 13 o anterior)
     *  "no"       → este móvil no lo admite
     */
    @JvmStatic
    fun estado(ctx: Context): String {
        if (Build.VERSION.SDK_INT < 26) return "no"
        return when (HealthConnectClient.getSdkStatus(ctx)) {
            HealthConnectClient.SDK_AVAILABLE -> "ok"
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "instalar"
            else -> "no"
        }
    }

    /** La pantalla estándar de Android donde el usuario marca qué nos deja leer. */
    @JvmStatic
    fun intentPermisos(ctx: Context): Intent =
        PermissionController.createRequestPermissionResultContract().createIntent(ctx, PERMISOS)

    /** Qué permisos tenemos ahora mismo: {"ok":true,"pasos":true,"pulso":false} */
    @JvmStatic
    fun concedidos(ctx: Context, r: Respuesta) {
        hilo.launch {
            r.listo(seguro {
                val p = HealthConnectClient.getOrCreate(ctx).permissionController.getGrantedPermissions()
                JSONObject().put("ok", true).put("pasos", P_PASOS in p).put("pulso", P_PULSO in p)
            })
        }
    }

    /**
     * Resumen de hoy y de los últimos 7 días:
     * {"ok":true,"pasos":8123,"pulso":{"media":72,"min":55,"max":131,"ultimo":68,"hora":"13:42"},
     *  "semana":[{"dia":"2026-11-11","pasos":10234}, ...]}
     */
    @JvmStatic
    fun hoy(ctx: Context, r: Respuesta) {
        hilo.launch {
            r.listo(seguro {
                val c = HealthConnectClient.getOrCreate(ctx)
                val tengo = c.permissionController.getGrantedPermissions()
                val zona = ZoneId.systemDefault()
                val inicio: LocalDateTime = LocalDate.now(zona).atStartOfDay()
                val ahora: LocalDateTime = LocalDateTime.now(zona)
                val hoyRango = TimeRangeFilter.between(inicio, ahora)
                val out = JSONObject().put("ok", true)

                // PASOS — usamos «aggregate» y no sumamos a mano: si el móvil y el reloj
                // cuentan a la vez, Health Connect quita los pasos repetidos.
                if (P_PASOS in tengo) {
                    val a = c.aggregate(AggregateRequest(setOf(StepsRecord.COUNT_TOTAL), hoyRango))
                    out.put("pasos", a[StepsRecord.COUNT_TOTAL] ?: 0L)

                    // los 7 últimos días, uno por uno (para la gráfica)
                    val dias = c.aggregateGroupByPeriod(
                        AggregateGroupByPeriodRequest(
                            metrics = setOf(StepsRecord.COUNT_TOTAL),
                            timeRangeFilter = TimeRangeFilter.between(inicio.minusDays(6), ahora),
                            timeRangeSlicer = Period.ofDays(1),
                        )
                    )
                    val sem = JSONArray()
                    for (d in dias) {
                        sem.put(JSONObject()
                            .put("dia", d.startTime.toLocalDate().toString())
                            .put("pasos", d.result[StepsRecord.COUNT_TOTAL] ?: 0L))
                    }
                    out.put("semana", sem)
                }

                // PULSACIONES — media, mínima y máxima de hoy, y la última medida
                if (P_PULSO in tengo) {
                    val a = c.aggregate(AggregateRequest(
                        setOf(HeartRateRecord.BPM_AVG, HeartRateRecord.BPM_MIN, HeartRateRecord.BPM_MAX), hoyRango))
                    val pulso = JSONObject()
                    a[HeartRateRecord.BPM_AVG]?.let { pulso.put("media", it) }
                    a[HeartRateRecord.BPM_MIN]?.let { pulso.put("min", it) }
                    a[HeartRateRecord.BPM_MAX]?.let { pulso.put("max", it) }
                    // la última: leemos el registro más reciente (orden descendente, solo 1)
                    val ult = c.readRecords(ReadRecordsRequest(
                        recordType = HeartRateRecord::class,
                        timeRangeFilter = hoyRango,
                        ascendingOrder = false,
                        pageSize = 1,
                    )).records.firstOrNull()?.samples?.maxByOrNull { it.time }
                    if (ult != null) {
                        pulso.put("ultimo", ult.beatsPerMinute)
                        pulso.put("hora", ult.time.atZone(zona).toLocalTime().withNano(0).toString().take(5))
                    }
                    out.put("pulso", pulso)
                }
                out
            })
        }
    }

    /** Si algo falla, devolvemos {"ok":false,"error":"..."} en vez de cerrar la app. */
    private suspend fun seguro(bloque: suspend () -> JSONObject): String =
        try {
            bloque().toString()
        } catch (e: SecurityException) {
            JSONObject().put("ok", false).put("error", "sin-permiso").toString()
        } catch (e: Exception) {
            JSONObject().put("ok", false).put("error", e.toString()).toString()
        }
}
