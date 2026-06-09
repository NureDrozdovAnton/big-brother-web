import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
    children: React.ReactNode;
    role?: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) {
        return (
            <Navigate
                to={user.role === "Admin" ? "/admin" : "/operator"}
                replace
            />
        );
    }

    return <>{children}</>;
}
