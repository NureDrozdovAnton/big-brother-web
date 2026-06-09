import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";

export function OperatorLayout() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar items={[{ to: "/operator", label: t("nav.cameras") }]} />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <Outlet />
            </main>
        </div>
    );
}
