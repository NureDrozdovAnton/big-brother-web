import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getAdminCameras } from "@/api/cameras";
import { getLogs } from "@/api/logs";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/utils/date";

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

export function DashboardPage() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language?.startsWith("uk") ? "uk" : "en";

    const { data: cameras, isLoading: cLoading } = useQuery({
        queryKey: ["admin-cameras"],
        queryFn: getAdminCameras,
    });

    const { data: logs, isLoading: lLoading } = useQuery({
        queryKey: ["logs", {}],
        queryFn: () => getLogs(),
    });

    if (cLoading || lLoading)
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );

    const activeCameras =
        cameras?.filter((c) => c.status === "Active").length ?? 0;

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900">
                {t("dashboard.title")}
            </h1>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    label={t("dashboard.totalCameras")}
                    value={cameras?.length ?? 0}
                />
                <StatCard
                    label={t("dashboard.onlineCameras")}
                    value={activeCameras}
                />
                <StatCard
                    label={t("dashboard.totalLogs")}
                    value={logs?.length ?? 0}
                />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                    <h2 className="font-semibold text-gray-900">
                        {t("dashboard.recentEvents")}
                    </h2>
                </div>
                <div className="divide-y">
                    {logs?.slice(0, 10).map((log) => (
                        <div
                            key={log.id}
                            className="flex items-center justify-between px-6 py-3 text-sm"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-700">
                                    {log.user?.name ?? log.userId}
                                </span>
                                <span className="text-gray-500">
                                    {t(`logs.eventTypes.${log.eventType}`)}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {formatDate(log.createdAt, locale)}
                            </span>
                        </div>
                    ))}
                    {!logs?.length && (
                        <div className="px-6 py-8 text-center text-sm text-gray-400">
                            {t("common.noData")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
