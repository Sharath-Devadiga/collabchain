import axios from "axios";
import { API_URL } from "./config";


export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
})

axiosInstance.interceptors.response.use(
    (response) => {
        // Return the response if it's successful
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const isRefreshRequest = originalRequest.url.includes("/api/auth/refresh");

        // Check if the error is due to an unauthorized request
        if (error.response.status === 401 && !originalRequest._retry && !isRefreshRequest) {
            originalRequest._retry = true; // Prevent infinite loop
            try {
                // Attempt to refresh the access token
                await axiosInstance.post('/api/auth/refresh');

                return axiosInstance(originalRequest);
            } catch (tokenRefreshError) {
                // Handle token refresh failure (e.g., logout the user)
                console.error('Token refresh failed', tokenRefreshError);
                return Promise.reject(tokenRefreshError);
            }
        }

        // Handle other errors
        return Promise.reject(error);
    }
);