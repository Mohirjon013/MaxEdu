import axios from "axios";


const axiosClient = axios.create({
    baseURL: 'https://najot-edu.softwareengineer.uz/api/v1'
})

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// RESPONSE INTERCEPTOR
let isRefreshing = false; // ikki marta refresh bo'lmasin

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                // refresh ketayotgan bo'lsa loginga o't
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                const res = await axiosClient.post('/auth/refresh-token', {
                    token: refreshToken
                });

                const newToken = res.data.accessToken;
                localStorage.setItem('token', newToken);

                // avvalgi requestni yangi token bilan qayta yuboramiz
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosClient(originalRequest);

            } catch (refreshError) {
                // refresh ham ishlamadi → loginga
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error)
    }
)

export default axiosClient