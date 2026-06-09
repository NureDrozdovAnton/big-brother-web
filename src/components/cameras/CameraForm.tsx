import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Camera, CameraFormData } from "@/types";

interface CameraFormProps {
    initial?: Camera;
    onSubmit: (data: CameraFormData) => Promise<void>;
    onCancel: () => void;
}

export function CameraForm({ initial, onSubmit, onCancel }: CameraFormProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState<CameraFormData>({
        name: initial?.name ?? "",
        ipAddress: initial?.ipAddress ?? "",
        cameraId: initial?.cameraId ?? "",
        ptzEnabled: initial?.ptzEnabled ?? false,
        rtspUrl: initial?.rtspUrl ?? "",
        ptzUrl: initial?.ptzUrl ?? "",
    });

    const set = (key: keyof CameraFormData, val: string | boolean) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await onSubmit(form);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })
                ?.response?.data?.error;
            setError(msg || t("common.error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                label={t("cameras.cameraName")}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
            />
            <Input
                label={t("cameras.ipAddress")}
                value={form.ipAddress}
                onChange={(e) => set("ipAddress", e.target.value)}
                placeholder="192.168.1.100"
                required
            />
            <Input
                label={t("cameras.cameraId")}
                value={form.cameraId}
                onChange={(e) => set("cameraId", e.target.value)}
                required
            />
            <Input
                label={t("cameras.rtspUrl")}
                value={form.rtspUrl}
                onChange={(e) => set("rtspUrl", e.target.value)}
                placeholder="rtsp://192.168.1.100:8554/stream"
                hint={t("cameras.rtspUrlHint")}
            />
            <Input
                label={t("cameras.ptzUrl")}
                value={form.ptzUrl}
                onChange={(e) => set("ptzUrl", e.target.value)}
                placeholder="http://..."
            />
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                    type="checkbox"
                    checked={form.ptzEnabled}
                    onChange={(e) => set("ptzEnabled", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                {t("cameras.ptzEnabled")}
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    {t("common.cancel")}
                </Button>
                <Button type="submit" loading={loading}>
                    {t("common.save")}
                </Button>
            </div>
        </form>
    );
}
