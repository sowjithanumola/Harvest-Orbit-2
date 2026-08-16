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

    private static async fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 1000): Promise<Response> {
        try {
            const response = await fetch(url, options);
            if (response.status === 503 && retries > 0) {
                console.warn(`Backend 503 error. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchWithRetry(url, options, retries - 1, delay * 2);
            }
            return response;
        } catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchWithRetry(url, options, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    static async get<T>(url: string, signal?: AbortSignal): Promise<T> {
        const response = await this.fetchWithRetry(url, { signal });
        return this.handleResponse<T>(response);
    }

    static async post<T>(url: string, body: any, signal?: AbortSignal): Promise<T> {
        const response = await this.fetchWithRetry(url, {
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
