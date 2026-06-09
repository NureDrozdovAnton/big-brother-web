import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getMe } from "@/api/me";
import { signOut as apiSignOut } from "@/api/auth";
import type { UserRole } from "@/types";

interface AuthUser {
    id: string;
    name: string;
    login: string;
    role: UserRole;
}

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            const me = await getMe();
            if (me.auth) {
                setUser({
                    id: me.id,
                    name: me.name,
                    login: me.login,
                    role: me.role,
                });
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await apiSignOut();
        setUser(null);
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
