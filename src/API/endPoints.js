const productBaseURL = "https://fakestoreapi.com";

const configuredBackendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;
export const backendBaseURL = configuredBackendUrl
  ? configuredBackendUrl.replace(/\/$/, "")
  : `${window.location.protocol}//${window.location.hostname}:5000/api`;

export default productBaseURL;
