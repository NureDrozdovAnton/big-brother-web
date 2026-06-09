import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    getAdminCameras,
    getCameraStatus,
    createCamera,
    updateCamera,
    startRecording,
    stopRecording,
} from "@/api/cameras";
import { CameraForm } from "@/components/cameras/CameraForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import type { Camera, CameraFormData, CameraStatus } from "@/types";

function RecordingTimer({ startedAt }: { startedAt: number }) {
    const [elapsed, setElapsed] = useState(0);
    const ref = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        ref.current = setInterval(
            () => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
            500,
        );
        return () => {
            if (ref.current) clearInterval(ref.current);
        };
    }, [startedAt]);

    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    return (
        <span className="animate-pulse font-mono text-xs font-semibold text-red-500">
            ● {mm}:{ss}
        </span>
    );
}

const statusVariant: Record<CameraStatus, "green" | "yellow" | "gray"> = {
    Active: "green",
    Registered: "yellow",
    Archived: "gray",
};

function StatusDot({ cameraId }: { cameraId: string }) {
    const { t } = useTranslation();
    const { data } = useQuery({
        queryKey: ["camera-status", cameraId],
        queryFn: () => getCameraStatus(cameraId),
        refetchInterval: 15000,
    });
    return (
        <span
            className={`inline-flex items-center gap-1 text-xs ${data?.online ? "text-green-600" : "text-gray-400"}`}
        >
            <span
                className={`h-2 w-2 rounded-full ${data?.online ? "bg-green-500" : "bg-gray-300"}`}
            />
            {data?.online ? t("cameras.online") : t("cameras.offline")}
        </span>
    );
}

export function CamerasPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Camera | undefined>();
    const [recordingIds, setRecordingIds] = useState<Set<string>>(new Set());
    const [recordingStartTimes, setRecordingStartTimes] = useState<
        Record<string, number>
    >({});
    const [toast, setToast] = useState("");

    const { data: cameras, isLoading } = useQuery({
        queryKey: ["admin-cameras"],
        queryFn: getAdminCameras,
    });

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const handleSubmit = async (data: CameraFormData) => {
        if (editing) {
            await updateCamera(editing.id, data);
            showToast(t("cameras.cameraUpdated"));
        } else {
            await createCamera(data);
            showToast(t("cameras.cameraCreated"));
        }
        qc.invalidateQueries({ queryKey: ["admin-cameras"] });
        setModalOpen(false);
        setEditing(undefined);
    };

    const toggleRecording = async (camera: Camera) => {
        const isRecording = recordingIds.has(camera.id);
        if (isRecording) {
            await stopRecording(camera.id);
            setRecordingIds((s) => {
                const n = new Set(s);
                n.delete(camera.id);
                return n;
            });
            setRecordingStartTimes((s) => {
                const n = { ...s };
                delete n[camera.id];
                return n;
            });
            showToast(t("cameras.recordingStopped"));
        } else {
            await startRecording(camera.id);
            setRecordingIds((s) => new Set(s).add(camera.id));
            setRecordingStartTimes((s) => ({ ...s, [camera.id]: Date.now() }));
            showToast(t("cameras.recordingStarted"));
        }
    };

    if (isLoading)
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );

    return (
        <div>
            {toast && (
                <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
                    {toast}
                </div>
            )}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    {t("cameras.title")}
                </h1>
                <Button
                    onClick={() => {
                        setEditing(undefined);
                        setModalOpen(true);
                    }}
                >
                    + {t("cameras.addCamera")}
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                t("cameras.cameraName"),
                                t("cameras.ipAddress"),
                                t("cameras.cameraId"),
                                t("common.status"),
                                "Live",
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
                        {cameras?.map((camera) => (
                            <tr key={camera.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">
                                        {camera.name}
                                    </div>
                                    {camera.ptzEnabled && (
                                        <span className="text-xs text-brand-600">
                                            PTZ
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                    {camera.ipAddress}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm text-gray-500">
                                    {camera.cameraId}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        variant={statusVariant[camera.status]}
                                    >
                                        {t(`cameras.statuses.${camera.status}`)}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusDot cameraId={camera.id} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setEditing(camera);
                                                setModalOpen(true);
                                            }}
                                        >
                                            {t("common.edit")}
                                        </Button>
                                        {camera.rtspUrl ? (
                                            <>
                                                <Button
                                                    variant={
                                                        recordingIds.has(
                                                            camera.id,
                                                        )
                                                            ? "danger"
                                                            : "secondary"
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleRecording(camera)
                                                    }
                                                >
                                                    {recordingIds.has(camera.id)
                                                        ? t(
                                                              "cameras.stopRecording",
                                                          )
                                                        : t(
                                                              "cameras.startRecording",
                                                          )}
                                                </Button>
                                                {recordingIds.has(camera.id) &&
                                                    recordingStartTimes[
                                                        camera.id
                                                    ] && (
                                                        <RecordingTimer
                                                            startedAt={
                                                                recordingStartTimes[
                                                                    camera.id
                                                                ]
                                                            }
                                                        />
                                                    )}
                                            </>
                                        ) : null}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/cameras/${camera.id}/recordings`,
                                                )
                                            }
                                        >
                                            {t("recordings.title")}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {cameras?.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-8 text-center text-sm text-gray-400"
                                >
                                    {t("common.noData")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(undefined);
                }}
                title={
                    editing ? t("cameras.editCamera") : t("cameras.addCamera")
                }
                footer={null}
                size="lg"
            >
                <CameraForm
                    initial={editing}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setModalOpen(false);
                        setEditing(undefined);
                    }}
                />
            </Modal>
        </div>
    );
}
