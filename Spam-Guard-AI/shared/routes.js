import { z } from "zod";
import { insertScanSchema } from "./schema.js";
export const errorSchemas = {
    validation: z.object({
        message: z.string(),
        field: z.string().optional(),
    }),
    notFound: z.object({
        message: z.string(),
    }),
    internal: z.object({
        message: z.string(),
    }),
};
export const api = {
    scans: {
        create: {
            method: "POST",
            path: "/api/scans",
            input: insertScanSchema,
            responses: {
                201: z.custom(),
                400: errorSchemas.validation,
            },
        },
        get: {
            method: "GET",
            path: "/api/scans/:id",
            responses: {
                200: z.custom(),
                404: errorSchemas.notFound,
            },
        },
        list: {
            method: "GET",
            path: "/api/scans",
            responses: {
                200: z.array(z.custom()),
            },
        }
    },
};
export function buildUrl(path, params) {
    let url = path;
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (url.includes(`:${key}`)) {
                url = url.replace(`:${key}`, String(value));
            }
        });
    }
    return url;
}
