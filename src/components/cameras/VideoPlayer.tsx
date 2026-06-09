import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/Spinner";

interface VideoPlayerProps {
    webRTCUrl: string;
}

export function VideoPlayer({ webRTCUrl }: VideoPlayerProps) {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const [status, setStatus] = useState<"connecting" | "playing" | "error">(
        "connecting",
    );

    useEffect(() => {
        let pc: RTCPeerConnection | null = null;

        async function start() {
            setStatus("connecting");
            try {
                pc = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                });
                pcRef.current = pc;

                pc.ontrack = (evt) => {
                    if (videoRef.current && evt.streams[0]) {
                        videoRef.current.srcObject = evt.streams[0];
                        setStatus("playing");
                    }
                };

                pc.addTransceiver("video", { direction: "recvonly" });
                pc.addTransceiver("audio", { direction: "recvonly" });

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // Wait for ICE gathering
                await new Promise<void>((resolve) => {
                    if (pc!.iceGatheringState === "complete") {
                        resolve();
                        return;
                    }
                    pc!.onicegatheringstatechange = () => {
                        if (pc!.iceGatheringState === "complete") resolve();
                    };
                    setTimeout(resolve, 3000);
                });

                const whepUrl = webRTCUrl.replace(/\/?$/, "/whep");
                const resp = await fetch(whepUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/sdp" },
                    body: pc.localDescription?.sdp,
                });

                if (!resp.ok) throw new Error("WHEP failed");
                const sdpAnswer = await resp.text();
                await pc.setRemoteDescription({
                    type: "answer",
                    sdp: sdpAnswer,
                });
            } catch {
                setStatus("error");
                pc?.close();
            }
        }

        start();

        return () => {
            pc?.close();
        };
    }, [webRTCUrl]);

    return (
        <div
            className="relative w-full overflow-hidden rounded-lg bg-black"
            style={{ aspectRatio: "16/9" }}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-contain"
            />
            {status === "connecting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Spinner size="lg" />
                    <span className="text-sm text-white">
                        {t("cameras.connectingStream")}
                    </span>
                </div>
            )}
            {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <svg
                        className="h-12 w-12 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                    </svg>
                    <span className="text-sm text-red-300">
                        {t("cameras.noStream")}
                    </span>
                </div>
            )}
        </div>
    );
}
