export type UserRole = "Admin" | "Operator";

export type CameraStatus = "Registered" | "Active" | "Archived";

export type EventType =
    | "Login"
    | "Logout"
    | "PtzMove"
    | "CameraAdded"
    | "CameraArchived";

export type PtzCommand =
    | "up"
    | "down"
    | "left"
    | "right"
    | "zoom_in"
    | "zoom_out";

export interface User {
    id: string;
    login: string;
    name: string;
    role: UserRole;
    createdAt?: string;
}

export interface Camera {
    id: string;
    name: string;
    ipAddress: string;
    cameraId: string;
    ptzEnabled: boolean;
    rtspUrl: string | null;
    ptzUrl: string | null;
    status: CameraStatus;
    createdAt: string;
    updatedAt: string;
}

export interface LogEntry {
    id: string;
    userId: string;
    user: User;
    eventType: EventType;
    meta: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface MeResponse {
    auth: false;
}
export interface MeAuthenticatedResponse {
    auth: true;
    id: string;
    name: string;
    login: string;
    role: UserRole;
}

export type ApiResponse<T> =
    | { ok: true; data: T }
    | { ok: false; error: string };

export interface CameraFormData {
    name: string;
    ipAddress: string;
    cameraId: string;
    ptzEnabled: boolean;
    rtspUrl: string;
    ptzUrl: string;
}

export interface OperatorFormData {
    login: string;
    name: string;
    password: string;
}

export interface LogsFilter {
    by?: string;
    types?: EventType[];
    startDate?: string;
    endDate?: string;
}
