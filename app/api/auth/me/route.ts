import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: authContext.user,
    role: authContext.role,
    technician: authContext.technician,
    permissions: {
      canManageUsers: authContext.isAdmin,
      canCreateWorkOrders: authContext.isDispatcher,
      canAssignWorkOrders: authContext.isDispatcher,
      canDeleteWorkOrders: authContext.isDispatcher,
      canManageCustomers: authContext.isDispatcher,
      canManageTechnicians: authContext.isDispatcher,
      canExecuteWorkOrders: authContext.isTechnician || authContext.isDispatcher,
      isTechnicianOnly: authContext.isTechnician,
    },
  });
}
