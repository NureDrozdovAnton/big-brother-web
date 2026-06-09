import client from "./client";
import type { MeResponse, MeAuthenticatedResponse } from "@/types";

export const getMe = async (): Promise<
    MeResponse | MeAuthenticatedResponse
> => {
    const res = await client.get("/me");
    return res.data.data;
};
