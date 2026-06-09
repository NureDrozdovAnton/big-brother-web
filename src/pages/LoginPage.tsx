import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signIn } from "@/api/auth";
import { getMe } from "@/api/me";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function LoginPage() {
    const { t } = useTranslation();
    const { refresh } = useAuth();
    const navigate = useNavigate();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await signIn(login, password);
            if (!res.ok) {
                setError(t("auth.invalidCredentials"));
                return;
            }
            await refresh();
            const me = await getMe();
            navigate(me.auth && me.role === "Admin" ? "/admin" : "/operator", {
                replace: true,
            });
        } catch {
            setError(t("auth.loginError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="absolute right-4 top-4">
                    <LanguageSwitcher />
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-8 flex flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                            <svg
                                className="h-8 w-8 text-brand-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {t("common.appName")}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {t("auth.title")}
                            </p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <Input
                            label={t("auth.login")}
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder={t("auth.loginPlaceholder")}
                            autoComplete="username"
                            required
                        />
                        <Input
                            label={t("auth.password")}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("auth.passwordPlaceholder")}
                            autoComplete="current-password"
                            required
                        />
                        {error && (
                            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            loading={loading}
                            size="lg"
                            className="mt-2 w-full"
                        >
                            {t("auth.loginButton")}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
