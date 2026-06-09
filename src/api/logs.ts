import client from "./client";
import type { LogEntry, LogsFilter } from "@/types";

export const getLogs = async (filter: LogsFilter = {}): Promise<LogEntry[]> => {
    const params: Record<string, string> = {};
    if (filter.by) params.by = filter.by;
    if (filter.types?.length) params.types = filter.types.join(",");
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
    const res = await client.get("/admin/logs", { params });
    return res.data.data;
};
