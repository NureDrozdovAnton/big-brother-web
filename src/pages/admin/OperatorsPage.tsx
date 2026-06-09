import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOperator, getOperators } from "@/api/operators";
import { OperatorForm } from "@/components/operators/OperatorForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { OperatorFormData } from "@/types";
import { formatDate } from "@/utils/date";

export function OperatorsPage() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language?.startsWith("uk") ? "uk" : "en";
    const qc = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [toast, setToast] = useState("");

    const { data: operators = [], isLoading } = useQuery({
        queryKey: ["operators"],
        queryFn: getOperators,
    });

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const mutation = useMutation({
        mutationFn: (data: OperatorFormData) => createOperator(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["operators"] });
            setModalOpen(false);
            showToast(t("operators.operatorCreated"));
        },
    });

    const handleSubmit = async (data: OperatorFormData) => {
        await mutation.mutateAsync(data);
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
                    {t("operators.title")}
                </h1>
                <Button onClick={() => setModalOpen(true)}>
                    + {t("operators.createOperator")}
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                t("operators.operatorName"),
                                t("operators.login"),
                                t("operators.role"),
                                t("operators.createdAt"),
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
                        {operators.map((op) => (
                            <tr key={op.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {op.name}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                    {op.login}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {t(`roles.${op.role}`)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    {op.createdAt
                                        ? formatDate(op.createdAt, locale)
                                        : "—"}
                                </td>
                            </tr>
                        ))}
                        {operators.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <svg
                                            className="h-10 w-10"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <p className="text-sm">
                                            {t("common.noData")}
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => setModalOpen(true)}
                                        >
                                            {t("operators.createOperator")}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t("operators.createOperator")}
                footer={null}
            >
                <OperatorForm
                    onSubmit={handleSubmit}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
