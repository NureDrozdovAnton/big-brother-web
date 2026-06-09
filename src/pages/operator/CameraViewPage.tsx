import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getOperatorCameras, getCameraStream } from "@/api/cameras";
import { VideoPlayer } from "@/components/cameras/VideoPlayer";
import { PTZControls } from "@/components/cameras/PTZControls";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function CameraViewPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: cameras } = useQuery({
        queryKey: ["operator-cameras"],
        queryFn: getOperatorCameras,
    });

    const camera = cameras?.find((c) => c.id === id);

    const { data: stream, isLoading: streamLoading } = useQuery({
        queryKey: ["camera-stream", id],
        queryFn: () => getCameraStream(id!),
        enabled: !!id,
        retry: false,
    });

    if (!camera && cameras) {
        return (
            <div className="py-20 text-center text-gray-500">
                {t("common.noData")}
                <div className="mt-4">
                    <Button
                        variant="secondary"
                        onClick={() => navigate("/operator")}
                    >
                        {t("common.back")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/operator")}
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    {t("common.back")}
                </Button>
                {camera && (
                    <h1 className="text-xl font-bold text-gray-900">
                        {camera.name}
                    </h1>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    {streamLoading ? (
                        <div className="flex aspect-video items-center justify-center rounded-lg bg-black">
                            <Spinner size="lg" />
                        </div>
                    ) : stream ? (
                        <VideoPlayer webRTCUrl={stream.webRTCUrl} />
                    ) : (
                        <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg bg-black">
                            <svg
                                className="h-12 w-12 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                            </svg>
                            <span className="text-sm text-gray-400">
                                {t("cameras.noStream")}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    {camera?.ptzEnabled ? (
                        <PTZControls cameraId={id!} />
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                            {t("ptz.notSupported")}
                        </div>
                    )}

                    {camera && (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
                            <dl className="space-y-2">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">
                                        {t("cameras.ipAddress")}
                                    </dt>
                                    <dd className="font-mono text-gray-700">
                                        {camera.ipAddress}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">
                                        {t("cameras.cameraId")}
                                    </dt>
                                    <dd className="font-mono text-gray-700">
                                        {camera.cameraId}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">
                                        {t("cameras.status")}
                                    </dt>
                                    <dd className="text-gray-700">
                                        {t(`cameras.statuses.${camera.status}`)}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
