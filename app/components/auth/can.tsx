// @/components/auth/Can.tsx
import { useAuthState } from "@/app/providers/authProvider";
import { PERMISSIONS, PermissionType, UserRole } from "@/app/utils/permissions";

interface CanProps {
    perform: PermissionType;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const Can = ({ perform, children, fallback = null }: CanProps) => {
    const { user, isAuthenticated } = useAuthState();

    if (!isAuthenticated || !user) {
        return <>{fallback}</>;
    }

    // Your API returns roles as an array: ["Admin"]
    // We check if any of the user's roles are allowed for this action
    const userRoles = user.roles as UserRole[];
    const allowedRoles = PERMISSIONS[perform];

    const hasPermission = userRoles.some(role => 
        (allowedRoles as readonly string[]).includes(role)
    );

    return hasPermission ? <>{children}</> : <>{fallback}</>;
};