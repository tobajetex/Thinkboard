import axios from "axios";

const BASE_URL = (import.meta.env.MODE = import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: BASE_URL,
});
console.log(api);
export default api;
