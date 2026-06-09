import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAdminCameras, createCamera } from "@/api/cameras";
import { getLogs } from "@/api/logs";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { exportAsJson, exportAsCsv } from "@/utils/date";
import type { Camera, CameraFormData } from "@/types";

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-semibold text-gray-900">
                {title}
            </h2>
            {description && (
                <p className="mb-4 text-sm text-gray-500">{description}</p>
            )}
            {!description && <div className="mb-4" />}
            {children}
        </div>
    );
}

export function SettingsPage() {
    const { t } = useTranslation();
    const [importStatus, setImportStatus] = useState("");
    const [format, setFormat] = useState<"json" | "csv">("json");
    const importRef = useRef<HTMLInputElement>(null);

    const exportCameras = async () => {
        const cameras = await getAdminCameras();
        if (format === "json") {
            exportAsJson(cameras, "cameras.json");
        } else {
            exportAsCsv(
                cameras.map(
                    ({
                        id,
                        name,
                        ipAddress,
                        cameraId,
                        status,
                        ptzEnabled,
                        rtspUrl,
                        ptzUrl,
                        createdAt,
                    }) => ({
                        id,
                        name,
                        ipAddress,
                        cameraId,
                        status,
                        ptzEnabled: String(ptzEnabled),
                        rtspUrl: rtspUrl ?? "",
                        ptzUrl: ptzUrl ?? "",
                        createdAt,
                    }),
                ),
                "cameras.csv",
            );
        }
    };

    const exportLogs = async () => {
        const logs = await getLogs();
        if (format === "json") {
            exportAsJson(logs, "logs.json");
        } else {
            exportAsCsv(
                logs.map(({ id, userId, eventType, meta, createdAt }) => ({
                    id,
                    userId,
                    eventType,
                    meta: JSON.stringify(meta),
                    createdAt,
                })),
                "logs.csv",
            );
        }
    };

    const exportAll = async () => {
        const [cameras, logs] = await Promise.all([
            getAdminCameras(),
            getLogs(),
        ]);
        exportAsJson(
            { cameras, logs, exportedAt: new Date().toISOString() },
            "big-brother-backup.json",
        );
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportStatus("");
        try {
            const text = await file.text();
            const data = JSON.parse(text) as Camera[];
            if (!Array.isArray(data)) throw new Error("Expected array");
            let count = 0;
            for (const cam of data) {
                const payload: CameraFormData = {
                    name: cam.name,
                    ipAddress: cam.ipAddress,
                    cameraId: cam.cameraId,
                    ptzEnabled: cam.ptzEnabled,
                    rtspUrl: cam.rtspUrl ?? "",
                    ptzUrl: cam.ptzUrl ?? "",
                };
                await createCamera(payload);
                count++;
            }
            setImportStatus(t("settings.importDone", { count }));
        } catch {
            setImportStatus(t("settings.importError"));
        } finally {
            if (importRef.current) importRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
                {t("settings.title")}
            </h1>

            <Section title={t("settings.languageSection")}>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        {t("settings.selectLanguage")}:
                    </span>
                    <LanguageSwitcher />
                </div>
            </Section>

            <Section title={t("settings.exportSection")}>
                <div className="mb-4 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">
                        {t("settings.exportFormat")}:
                    </span>
                    {(["json", "csv"] as const).map((f) => (
                        <label
                            key={f}
                            className="flex cursor-pointer items-center gap-1.5 text-sm"
                        >
                            <input
                                type="radio"
                                name="format"
                                value={f}
                                checked={format === f}
                                onChange={() => setFormat(f)}
                                className="text-brand-600"
                            />
                            {f.toUpperCase()}
                        </label>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3">
                    <div>
                        <Button variant="secondary" onClick={exportCameras}>
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            {t("settings.exportCameras")}
                        </Button>
                        <p className="mt-1 text-xs text-gray-400">
                            {t("settings.exportCamerasDesc")}
                        </p>
                    </div>
                    <div>
                        <Button variant="secondary" onClick={exportLogs}>
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            {t("settings.exportLogs")}
                        </Button>
                        <p className="mt-1 text-xs text-gray-400">
                            {t("settings.exportLogsDesc")}
                        </p>
                    </div>
                </div>
            </Section>

            <Section
                title={t("settings.backupSection")}
                description={t("settings.backupDescription")}
            >
                <Button onClick={exportAll}>
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
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                    </svg>
                    {t("settings.exportAll")}
                </Button>
            </Section>

            <Section title={t("settings.importSection")}>
                <div>
                    <p className="mb-3 text-sm text-gray-500">
                        {t("settings.importCamerasDesc")}
                    </p>
                    <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            {t("settings.importCamerasBtn")}
                        </span>
                        <input
                            ref={importRef}
                            type="file"
                            accept=".json"
                            className="sr-only"
                            onChange={handleImport}
                        />
                    </label>
                    {importStatus && (
                        <p
                            className={`mt-3 text-sm ${importStatus.includes(t("settings.importError").slice(0, 6)) ? "text-red-500" : "text-green-600"}`}
                        >
                            {importStatus}
                        </p>
                    )}
                </div>
            </Section>
        </div>
    );
}
