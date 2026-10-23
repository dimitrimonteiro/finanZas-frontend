const padrao =
  process.env.NODE_ENV === "production"
    ? "https://finanzas-backend-rmik.onrender.com/api"
    : "http://localhost:8080/api";

export const API_URL = (process.env.REACT_APP_API_URL || padrao).replace(/\/$/, "");