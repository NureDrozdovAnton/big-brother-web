import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendPtzCommand } from "@/api/cameras";
import type { PtzCommand } from "@/types";

interface PTZControlsProps {
    cameraId: string;
}

export function PTZControls({ cameraId }: PTZControlsProps) {
    const { t } = useTranslation();
    const [active, setActive] = useState<PtzCommand | null>(null);

    const send = async (cmd: PtzCommand) => {
        setActive(cmd);
        try {
            await sendPtzCommand(cameraId, cmd);
        } finally {
            setActive(null);
        }
    };

    const btn = (cmd: PtzCommand, icon: React.ReactNode, title: string) => (
        <button
            onClick={() => send(cmd)}
            disabled={active !== null}
            title={title}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {active === cmd ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
            ) : (
                icon
            )}
        </button>
    );

    const ArrowUp = (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
            />
        </svg>
    );
    const ArrowDown = (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );
    const ArrowLeft = (
        <svg
            className="h-5 w-5"
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
    );
    const ArrowRight = (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
            />
        </svg>
    );
    const ZoomIn = (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
        </svg>
    );
    const ZoomOut = (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
        </svg>
    );

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t("cameras.ptz")}
            </p>
            <div className="flex items-center gap-4">
                <div
                    className="grid grid-cols-3 gap-1"
                    style={{
                        gridTemplateAreas: `". up ." "left . right" ". down ."`,
                    }}
                >
                    <div style={{ gridArea: "up" }}>
                        {btn("up", ArrowUp, t("ptz.up"))}
                    </div>
                    <div style={{ gridArea: "left" }}>
                        {btn("left", ArrowLeft, t("ptz.left"))}
                    </div>
                    <div style={{ gridArea: "right" }}>
                        {btn("right", ArrowRight, t("ptz.right"))}
                    </div>
                    <div style={{ gridArea: "down" }}>
                        {btn("down", ArrowDown, t("ptz.down"))}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    {btn("zoom_in", ZoomIn, t("ptz.zoomIn"))}
                    {btn("zoom_out", ZoomOut, t("ptz.zoomOut"))}
                </div>
            </div>
        </div>
    );
}
