import client from "./client";
import type { Camera, CameraFormData } from "@/types";

export const getOperatorCameras = async (): Promise<Camera[]> => {
    const res = await client.get("/operator/cameras");
    return res.data.data;
};

export const getCameraStream = async (
    id: string,
): Promise<{ webRTCUrl: string }> => {
    const res = await client.get(`/operator/cameras/${id}/stream`);
    return res.data.data;
};

export const sendPtzCommand = async (id: string, command: string) => {
    const res = await client.post(`/operator/cameras/${id}/ptz`, { command });
    return res.data;
};

export const getAdminCameras = async (): Promise<Camera[]> => {
    const res = await client.get("/admin/cameras");
    return res.data.data;
};

export const getCameraStatus = async (
    id: string,
): Promise<{ online: boolean }> => {
    const res = await client.get(`/admin/cameras/${id}/status`);
    return res.data.data;
};

export const createCamera = async (data: CameraFormData): Promise<Camera> => {
    const payload = {
        ...data,
        rtspUrl: data.rtspUrl || undefined,
        ptzUrl: data.ptzUrl || undefined,
    };
    const res = await client.post("/admin/cameras", payload);
    return res.data.data;
};

export const updateCamera = async (
    id: string,
    data: CameraFormData,
): Promise<Camera> => {
    const payload = {
        ...data,
        rtspUrl: data.rtspUrl || undefined,
        ptzUrl: data.ptzUrl || undefined,
    };
    const res = await client.put(`/admin/cameras/${id}`, payload);
    return res.data.data;
};

export const startRecording = async (id: string) => {
    const res = await client.post(`/admin/cameras/${id}/recordings/start`);
    return res.data;
};

export const stopRecording = async (id: string) => {
    const res = await client.post(`/admin/cameras/${id}/recordings/stop`);
    return res.data;
};

export interface RecordingFile {
    filename: string;
    size: number;
    createdAt: string;
}

export const getCameraRecordings = async (
    id: string,
): Promise<RecordingFile[]> => {
    const res = await client.get(`/admin/cameras/${id}/recordings`);
    return res.data.data;
};

export const getRecordingStreamUrl = (cameraId: string, filename: string) =>
    `/admin/cameras/${cameraId}/recordings/${filename}`;

export const getRecordingDownloadUrl = (cameraId: string, filename: string) =>
    `/admin/cameras/${cameraId}/recordings/${filename}?download=1`;
