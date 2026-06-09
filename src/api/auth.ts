import client from "./client";

export const signIn = async (login: string, password: string) => {
    const res = await client.post("/auth/sign-in", { login, password });
    return res.data;
};

export const signOut = async () => {
    const res = await client.post("/auth/sign-out");
    return res.data;
};
