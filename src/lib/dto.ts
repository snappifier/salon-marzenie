import type {Settings} from "@/generated/prisma/client"

export type PublicSalonInfo = Pick<Settings,
    "salonPhone" | "salonEmail" | "salonAddress"
>

export function toPublicSalonInfo(s: Settings): PublicSalonInfo {
    return {
        salonPhone: s.salonPhone,
        salonEmail: s.salonEmail,
        salonAddress: s.salonAddress,
    }
}