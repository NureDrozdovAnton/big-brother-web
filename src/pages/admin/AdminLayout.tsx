import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";

export function AdminLayout() {
    const { t } = useTranslation();
    const items = [
        { to: "/admin", label: t("nav.dashboard") },
        { to: "/admin/cameras", label: t("nav.cameras") },
        { to: "/admin/operators", label: t("nav.operators") },
        { to: "/admin/logs", label: t("nav.logs") },
        { to: "/admin/settings", label: t("nav.settings") },
    ];
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar items={items} />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <Outlet />
            </main>
        </div>
    );
}
