import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/security/permission-matrix";

function permissionForRequestPath(method: string, pathname: string): string | null {
  const normalized = pathname.replace(/\/+/g, "/");
  const isGet = ["GET", "HEAD"].includes(method);
  if (normalized.includes("/api/admin/session")) return null;
  if (normalized.includes("/api/admin/members")) return isGet ? PERMISSIONS.MEMBERS_READ : PERMISSIONS.MEMBERS_MANAGE;
  if (normalized.includes("/api/admin/organizations")) return PERMISSIONS.ORGANIZATIONS_MANAGE;
  if (normalized.includes("/api/admin/events")) return PERMISSIONS.EVENTS_MANAGE;
  if (normalized.includes("/api/admin/meetings")) return PERMISSIONS.MEETINGS_MANAGE;
  if (normalized.includes("/api/admin/news")) return PERMISSIONS.CONTENT_MANAGE;
  if (normalized.includes("/api/admin/media") || normalized.includes("/api/admin/albums")) return PERMISSIONS.MEDIA_MANAGE;
  if (normalized.includes("/api/admin/reports")) return isGet ? PERMISSIONS.REPORTS_READ : PERMISSIONS.REPORTS_MANAGE;
  if (normalized.includes("/api/admin/activity")) return PERMISSIONS.ANALYTICS_READ;
  if (normalized.includes("/api/admin/health") || normalized.includes("/api/admin/monitoring") || normalized.includes("/api/admin/production-readiness")) return PERMISSIONS.SYSTEM_HEALTH;
  if (normalized.includes("/api/admin/data")) return PERMISSIONS.DATA_MANAGE;
  if (normalized.includes("/api/admin/settings")) return PERMISSIONS.SETTINGS_MANAGE;
  if (normalized.includes("/api/admin/geocode") || normalized.includes("/api/admin/stats/geographic")) return PERMISSIONS.GEOGRAPHY_MANAGE;
  if (normalized.includes("/api/admin/elections")) return PERMISSIONS.ELECTIONS_MANAGE;
  if (normalized.includes("/api/admin/membership")) return PERMISSIONS.MEMBERS_MANAGE;
  if (normalized.includes("/api/admin/service-requests")) return PERMISSIONS.SERVICE_REQUESTS_MANAGE;
  if (normalized.includes("/api/admin/volunteers")) return PERMISSIONS.VOLUNTEER_MANAGE;
  if (normalized.includes("/api/admin/privacy")) return PERMISSIONS.PRIVACY_MANAGE;
  if (normalized.includes("/api/admin/compliance")) return PERMISSIONS.COMPLIANCE_MANAGE;
  if (normalized.includes("/api/admin/risk")) return PERMISSIONS.RISK_MANAGE;
  if (normalized.includes("/api/admin/incidents") || normalized.includes("/api/admin/security")) return PERMISSIONS.SECURITY_MANAGE;
  if (normalized.includes("/api/admin/legal")) return PERMISSIONS.LEGAL_DOCUMENTS_MANAGE;
  if (normalized.includes("/api/admin/governance")) return PERMISSIONS.GOVERNANCE_MANAGE;
  return null;
}


export function sameOriginMutationAllowed(req: NextRequest): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function hasPermission(role: string, permission: string | null, userId?: string): Promise<boolean> {
  if (!permission) return true;
  if (!userId) return false;
  try {
    const assignment = await db.userRole.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        role: { code: role, status: "ACTIVE" },
        startsAt: { lte: new Date() },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
      orderBy: { startsAt: "desc" },
    });
    return Boolean(assignment?.role.permissions.some((entry) => entry.permission.code === permission));
  } catch {
    // Never grant a permission from a DB failure.
    return false;
  }
}

export function permissionForRequest(req: NextRequest): string | null {
  return permissionForRequestPath(req.method, req.nextUrl.pathname);
}

export function adminScopeAllows(session: { scopeType: string; scopeId?: string | null }): boolean {
  // Current admin APIs are national-scope command-center endpoints. Scoped administration
  // must use dedicated state/chapter endpoints before a narrower scope can be granted.
  return session.scopeType === "NATIONAL";
}
