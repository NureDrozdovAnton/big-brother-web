import client from "./client";
import type { OperatorFormData, User } from "@/types";

export const getOperators = async (): Promise<User[]> => {
    const res = await client.get("/admin/operators");
    return res.data.data;
};

export const createOperator = async (data: OperatorFormData): Promise<User> => {
    const res = await client.post("/admin/operators", data);
    return res.data.data;
};
