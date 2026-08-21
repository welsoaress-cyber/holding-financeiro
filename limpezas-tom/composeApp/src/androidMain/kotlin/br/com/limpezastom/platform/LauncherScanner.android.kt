package br.com.limpezastom.platform

import android.content.Context
import android.content.Intent
import android.content.pm.LauncherApps
import android.content.pm.PackageManager
import android.content.pm.ShortcutManager
import android.os.Build
import android.os.Process
import br.com.limpezastom.model.DuplicateShortcutGroup

/**
 * Implementação Android do scanner de atalhos da tela inicial.
 *
 * O Android não expõe API pública para manipular o layout da tela inicial —
 * cada launcher gerencia sua própria grade. O que é possível sem Accessibility Service:
 *
 *  1. Activities com intent LAUNCHER por pacote → ícones duplicados do mesmo app
 *  2. Pinned shortcuts via LauncherApps → podem ser desabilitados via ShortcutManager
 *
 * Para ícones de Activity launcher, instruímos o usuário manualmente.
 * Para pinned shortcuts, podemos desabilitar programaticamente.
 */
actual class LauncherScanner actual constructor(context: PlatformContext) {

    private val ctx: Context = context

    actual fun findDuplicateShortcuts(): List<DuplicateShortcutGroup> {
        val pm = ctx.packageManager

        // 1. Activities launcher por pacote
        val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        val activities = pm.queryIntentActivities(launcherIntent, PackageManager.GET_META_DATA)
        val byPackage = activities.groupBy { it.activityInfo.packageName }

        // 2. Pinned shortcuts (API 25+)
        val shortcutsByPkg: Map<String, List<String>> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            val launcherApps = ctx.getSystemService(LauncherApps::class.java)
            val query = LauncherApps.ShortcutQuery().apply {
                setQueryFlags(LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED)
            }
            runCatching {
                launcherApps.getShortcuts(query, Process.myUserHandle())
                    ?.groupBy { it.`package` }
                    ?.mapValues { (_, shortcuts) -> shortcuts.map { it.id } }
                    ?: emptyMap()
            }.getOrDefault(emptyMap())
        } else {
            emptyMap()
        }

        // 3. Monta grupos de duplicatas
        return byPackage
            .filter { (pkg, acts) ->
                acts.size > 1 || (shortcutsByPkg[pkg]?.size ?: 0) > 1
            }
            .mapNotNull { (pkg, acts) ->
                val pinnedIds = shortcutsByPkg[pkg] ?: emptyList()
                val extras = (acts.size - 1) + pinnedIds.size.coerceAtMost(
                    (pinnedIds.size - 1).coerceAtLeast(0)
                )
                if (extras <= 0) return@mapNotNull null

                DuplicateShortcutGroup(
                    packageName = pkg,
                    appLabel = runCatching {
                        acts.first().loadLabel(pm).toString()
                    }.getOrDefault(pkg),
                    appIconUri = "android.resource://$pkg/mipmap/ic_launcher",
                    activityCount = acts.size,
                    activityLabels = acts.map { ri ->
                        runCatching { ri.loadLabel(pm).toString() }.getOrDefault(ri.activityInfo.name)
                    },
                    pinnedShortcutIds = pinnedIds,
                    extras = extras,
                )
            }
    }

    actual fun disablePinnedShortcuts(packageName: String, shortcutIds: List<String>) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return
        if (shortcutIds.isEmpty()) return
        val sm = ctx.getSystemService(ShortcutManager::class.java) ?: return
        // ShortcutManager.disableShortcuts só funciona para shortcuts do próprio app.
        // Para shortcuts de terceiros, silenciamos sem erro.
        runCatching {
            sm.disableShortcuts(shortcutIds, "Atalho duplicado removido pelo Apps Tom")
        }
    }
}
