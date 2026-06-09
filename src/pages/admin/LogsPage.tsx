import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getLogs } from "@/api/logs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/date";
import type { EventType, LogsFilter } from "@/types";

const EVENT_TYPES: EventType[] = [
    "Login",
    "Logout",
    "PtzMove",
    "CameraAdded",
    "CameraArchived",
];

const eventBadge: Record<
    EventType,
    "blue" | "gray" | "yellow" | "green" | "red"
> = {
    Login: "green",
    Logout: "gray",
    PtzMove: "blue",
    CameraAdded: "yellow",
    CameraArchived: "red",
};

export function LogsPage() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language?.startsWith("uk") ? "uk" : "en";

    const [filter, setFilter] = useState<LogsFilter>({});
    const [pending, setPending] = useState<LogsFilter>({});

    const { data: logs, isLoading } = useQuery({
        queryKey: ["logs", filter],
        queryFn: () => getLogs(filter),
    });

    const applyFilter = () => setFilter(pending);
    const clearFilter = () => {
        setPending({});
        setFilter({});
    };

    const toggleType = (type: EventType) => {
        setPending((f) => {
            const types = f.types ?? [];
            return {
                ...f,
                types: types.includes(type)
                    ? types.filter((t) => t !== type)
                    : [...types, type],
            };
        });
    };

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900">
                {t("logs.title")}
            </h1>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Input
                        label={t("logs.filterByUser")}
                        value={pending.by ?? ""}
                        onChange={(e) =>
                            setPending((f) => ({
                                ...f,
                                by: e.target.value || undefined,
                            }))
                        }
                    />
                    <Input
                        label={t("logs.startDate")}
                        type="datetime-local"
                        value={pending.startDate ?? ""}
                        onChange={(e) =>
                            setPending((f) => ({
                                ...f,
                                startDate: e.target.value || undefined,
                            }))
                        }
                    />
                    <Input
                        label={t("logs.endDate")}
                        type="datetime-local"
                        value={pending.endDate ?? ""}
                        onChange={(e) =>
                            setPending((f) => ({
                                ...f,
                                endDate: e.target.value || undefined,
                            }))
                        }
                    />
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-700">
                            {t("logs.filterByType")}
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {EVENT_TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                                        pending.types?.includes(type)
                                            ? "bg-brand-600 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {t(`logs.eventTypes.${type}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={clearFilter}>
                        {t("logs.clearFilter")}
                    </Button>
                    <Button size="sm" onClick={applyFilter}>
                        {t("logs.applyFilter")}
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    t("logs.date"),
                                    t("logs.user"),
                                    t("logs.eventType"),
                                    t("logs.meta"),
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs?.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                        {formatDate(log.createdAt, locale)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">
                                            {log.user?.name ?? "—"}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {log.user?.login ?? log.userId}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={eventBadge[log.eventType]}
                                        >
                                            {t(
                                                `logs.eventTypes.${log.eventType}`,
                                            )}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {Object.keys(log.meta).length > 0 ? (
                                            <code className="rounded bg-gray-100 px-1.5 py-0.5">
                                                {JSON.stringify(log.meta)}
                                            </code>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!logs?.length && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-8 text-center text-sm text-gray-400"
                                    >
                                        {t("common.noData")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
