import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getOperatorCameras } from "@/api/cameras";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { CameraStatus } from "@/types";

const statusVariant: Record<CameraStatus, "green" | "yellow" | "gray"> = {
    Active: "green",
    Registered: "yellow",
    Archived: "gray",
};

export function CamerasListPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
        data: cameras,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["operator-cameras"],
        queryFn: getOperatorCameras,
        refetchInterval: 30000,
    });

    if (isLoading)
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    if (error)
        return (
            <div className="rounded-md bg-red-50 p-4 text-red-600">
                {t("common.error")}
            </div>
        );

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900">
                {t("cameras.title")}
            </h1>
            {cameras?.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-20 text-gray-400">
                    <svg
                        className="h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                    <p>{t("common.noData")}</p>
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cameras?.map((camera) => (
                    <div
                        key={camera.id}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="mb-3 flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {camera.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {camera.ipAddress}
                                </p>
                            </div>
                            <Badge variant={statusVariant[camera.status]}>
                                {t(`cameras.statuses.${camera.status}`)}
                            </Badge>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="rounded bg-gray-100 px-2 py-0.5">
                                ID: {camera.cameraId}
                            </span>
                            {camera.ptzEnabled && (
                                <span className="rounded bg-brand-50 px-2 py-0.5 text-brand-700">
                                    PTZ
                                </span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() =>
                                navigate(`/operator/cameras/${camera.id}`)
                            }
                        >
                            {t("cameras.viewStream")}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
