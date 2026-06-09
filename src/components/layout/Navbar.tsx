import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Button } from "@/components/ui/Button";

interface NavItem {
    to: string;
    label: string;
}

interface NavbarProps {
    items: NavItem[];
}

export function Navbar({ items }: NavbarProps) {
    const { t } = useTranslation();
    const { user, signOut } = useAuth();
    const location = useLocation();

    return (
        <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-8">
                    <span className="flex items-center gap-2 text-lg font-bold text-brand-700">
                        <svg
                            className="h-6 w-6"
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
                        {t("common.appName")}
                    </span>
                    <nav className="hidden items-center gap-1 sm:flex">
                        {items.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    location.pathname === item.to
                                        ? "bg-brand-50 text-brand-700"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    {user && (
                        <>
                            <span className="hidden text-sm text-gray-500 sm:block">
                                {user.name}
                            </span>
                            <Button variant="ghost" size="sm" onClick={signOut}>
                                {t("common.logout")}
                            </Button>
                        </>
                    )}
                </div>
            </div>
            {/* Mobile nav */}
            <nav className="flex overflow-x-auto border-t border-gray-100 px-4 sm:hidden">
                {items.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
                            location.pathname === item.to
                                ? "border-b-2 border-brand-600 text-brand-700"
                                : "text-gray-600"
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
