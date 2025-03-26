import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * Checks if the current user has admin permissions
 * @throws {Error} with message "Admin permission required" if user lacks admin permissions
 */
export async function checkAdminPermission() {
    const { getPermission } = getKindeServerSession();
    const hasAdminPermission = await getPermission("admin");
    if (!hasAdminPermission?.isGranted) {
        throw new Error("Admin permission required");
    }
}
