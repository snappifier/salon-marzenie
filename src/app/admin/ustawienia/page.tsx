import {getSettings} from "@/features/settings/queries"
import {SettingsForm} from "@/components/settings/settings-form"

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Ustawienia salonu</h1>
            <SettingsForm settings={settings} />
        </div>
    )
}