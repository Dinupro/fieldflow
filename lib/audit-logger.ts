import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthContext, UserRole } from "@/lib/auth-guard";

export type AuditActionType =
  | "AUTH_LOGIN"
  | "AUTH_REGISTER"
  | "AUTH_LOGOUT"
  | "CUSTOMER_CREATE"
  | "CUSTOMER_UPDATE"
  | "CUSTOMER_DELETE"
  | "TECHNICIAN_CREATE"
  | "TECHNICIAN_UPDATE"
  | "TECHNICIAN_STATUS_CHANGE"
  | "TECHNICIAN_DELETE"
  | "WORK_ORDER_CREATE"
  | "WORK_ORDER_ASSIGN"
  | "WORK_ORDER_ACCEPT"
  | "WORK_ORDER_START"
  | "WORK_ORDER_PAUSE"
  | "WORK_ORDER_RESUME"
  | "WORK_ORDER_COMPLETE"
  | "WORK_ORDER_CANCEL"
  | "WORK_ORDER_CLOSE"
  | "WORK_ORDER_UPDATE"
  | "WORK_ORDER_DELETE"
  | "USER_CREATE"
  | "USER_ROLE_UPDATE"
  | "USER_DELETE"
  | "REPORT_EXPORT"
  | "SETTINGS_UPDATE"
  | "SYSTEM_EVENT";

export type EntityType =
  | "CUSTOMER"
  | "TECHNICIAN"
  | "WORK_ORDER"
  | "USER"
  | "AUTH"
  | "REPORT"
  | "SETTINGS"
  | "SYSTEM";

export interface LogActivityParams {
  req?: NextRequest;
  authContext?: AuthContext | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: UserRole | string | null;
  action: AuditActionType;
  entityType: EntityType | string;
  entityId?: string | null;
  entityName?: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Extracts client IP address from NextRequest headers.
 */
export function getClientIp(req?: NextRequest): string | null {
  if (!req) return null;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || null;
}

/**
 * Centrally and immutably records an activity or audit trail entry in PostgreSQL.
 * Safe and non-blocking: will not throw errors or disrupt business operations if logging fails.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const {
      req,
      authContext,
      action,
      entityType,
      entityId,
      entityName,
      description,
      metadata,
    } = params;

    // Resolve Actor Details
    const resolvedUserId = params.userId ?? authContext?.user?.id ?? null;
    const resolvedUserName = params.userName ?? authContext?.user?.name ?? null;
    const resolvedUserEmail = params.userEmail ?? authContext?.user?.email ?? null;
    const resolvedUserRole = (params.userRole ?? authContext?.role ?? null) as UserRole | null;
    const resolvedIp = params.ipAddress ?? getClientIp(req);

    // Save directly to Neon PostgreSQL audit_log table
    await prisma.auditLog.create({
      data: {
        userId: resolvedUserId,
        userName: resolvedUserName,
        userEmail: resolvedUserEmail,
        userRole: resolvedUserRole,
        action: action as any,
        entityType,
        entityId: entityId ? String(entityId) : null,
        entityName: entityName ? String(entityName) : null,
        description,
        metadata: metadata ? (metadata as any) : undefined,
        ipAddress: resolvedIp,
      },
    });
  } catch (error) {
    // Non-blocking log error handling to ensure mission-critical business transactions succeed
    console.error("[AUDIT_LOG_CREATION_FAILED]", error);
  }
}
