import {prisma} from "@/lib/prisma"

export async function getSettings() {
    const settings = await prisma.settings.findUnique({
        where: {id: "settings"},
    })

    if (!settings) {
        throw new Error("Settings not found - run seed first")
    }

    return settings
}