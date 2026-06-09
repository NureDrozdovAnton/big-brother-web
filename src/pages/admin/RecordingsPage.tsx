import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    getCameraRecordings,
    getRecordingDownloadUrl,
    getRecordingStreamUrl,
    getAdminCameras,
} from "@/api/cameras";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/utils/date";
import type { RecordingFile } from "@/api/cameras";

function formatSize(bytes: number) {
    if (bytes === 0) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function VideoModal({
    cameraId,
    file,
    onClose,
}: {
    cameraId: string;
    file: RecordingFile;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl rounded-xl bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-2">
                    <span className="font-mono text-sm text-gray-300">
                        {file.filename}
                    </span>
                    <button
                        onClick={onClose}
                        className="text-xl leading-none text-gray-400 hover:text-white"
                    >
                        ×
                    </button>
                </div>
                <video
                    src={getRecordingStreamUrl(cameraId, file.filename)}
                    controls
                    autoPlay
                    className="w-full rounded-b-xl"
                    style={{ maxHeight: "70vh" }}
                />
            </div>
        </div>
    );
}

export function RecordingsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const locale = i18n.language?.startsWith("uk") ? "uk" : "en";
    const [playing, setPlaying] = useState<RecordingFile | null>(null);

    const { data: cameras } = useQuery({
        queryKey: ["admin-cameras"],
        queryFn: getAdminCameras,
    });
    const camera = cameras?.find((c) => c.id === id);

    const { data: recordings, isLoading } = useQuery({
        queryKey: ["recordings", id],
        queryFn: () => getCameraRecordings(id!),
        enabled: !!id,
        refetchInterval: 5000,
    });

    return (
        <>
            {playing && id && (
                <VideoModal
                    cameraId={id}
                    file={playing}
                    onClose={() => setPlaying(null)}
                />
            )}

            <div>
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/cameras")}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← {t("nav.cameras")}
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t("recordings.title")}
                        {camera && (
                            <span className="ml-2 text-lg font-normal text-gray-400">
                                — {camera.name}
                            </span>
                        )}
                    </h1>
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
                                        t("recordings.filename"),
                                        t("recordings.size"),
                                        t("recordings.date"),
                                        t("common.actions"),
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
                                {recordings?.map((rec) => (
                                    <tr
                                        key={rec.filename}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-mono text-sm text-gray-700">
                                            {rec.filename}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {formatSize(rec.size)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {formatDate(rec.createdAt, locale)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {rec.size > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            setPlaying(rec)
                                                        }
                                                    >
                                                        ▶ {t("recordings.play")}
                                                    </Button>
                                                )}
                                                <a
                                                    href={getRecordingDownloadUrl(
                                                        id!,
                                                        rec.filename,
                                                    )}
                                                    download={rec.filename}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                    >
                                                        {t(
                                                            "recordings.download",
                                                        )}
                                                    </Button>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!recordings?.length && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-sm text-gray-400"
                                        >
                                            {t("recordings.noRecordings")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
