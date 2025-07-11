import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://127.0.0.1:5002',
    headers:{
        'Content-Type': 'application/json',
    }
});
api.interceptors.request.use(
    (config)=> {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) =>{
        return Promise.reject(error)
    }
)
export default api 