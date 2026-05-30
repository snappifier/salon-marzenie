// src/app/admin/ustawienia/page.tsx
import {getSettings, getClosedDays} from "@/features/settings/queries"
import {SettingsForm} from "@/components/settings/settings-form"

export default async function SettingsPage() {
	const [settings, closedDays] = await Promise.all([getSettings(), getClosedDays()])
	return <SettingsForm settings={settings} closedDays={closedDays} />
}
