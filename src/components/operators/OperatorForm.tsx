import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { OperatorFormData } from "@/types";

interface OperatorFormProps {
    onSubmit: (data: OperatorFormData) => Promise<void>;
    onCancel: () => void;
}

export function OperatorForm({ onSubmit, onCancel }: OperatorFormProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState<OperatorFormData>({
        login: "",
        name: "",
        password: "",
    });

    const set = (key: keyof OperatorFormData, val: string) =>
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
                label={t("operators.operatorName")}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                minLength={3}
            />
            <Input
                label={t("operators.login")}
                value={form.login}
                onChange={(e) => set("login", e.target.value)}
                required
                minLength={3}
            />
            <Input
                label={t("operators.password")}
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                minLength={6}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    {t("common.cancel")}
                </Button>
                <Button type="submit" loading={loading}>
                    {t("common.create")}
                </Button>
            </div>
        </form>
    );
}
