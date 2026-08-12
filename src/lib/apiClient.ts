import { APIError } from "../types";

export class ApiClient {
    private static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let errorMessage = `HTTP Error: ${response.status}`;
            let errorCode = "UNKNOWN_ERROR";

            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorData.error || errorMessage;
                errorCode = errorData.error?.code || errorCode;
            } catch {
                // If not JSON, use the status text
                errorMessage = response.statusText || errorMessage;
            }

            const error: APIError = {
                code: errorCode,
                message: errorMessage,
                status: response.status
            };
            throw error;
        }

        try {
            const data = await response.json();
            return data as T;
        } catch (e) {
            throw {
                code: "PARSE_ERROR",
                message: "Invalid response format from server",
                status: response.status
            } as APIError;
        }
    }

    static async get<T>(url: string, signal?: AbortSignal): Promise<T> {
        const response = await fetch(url, { signal });
        return this.handleResponse<T>(response);
    }

    static async post<T>(url: string, body: any, signal?: AbortSignal): Promise<T> {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
            signal
        });
        return this.handleResponse<T>(response);
    }
}
