import axios from "axios";
import { backendBaseURL } from "./endPoints";
import { supabase } from "../Utility/supabase";

export async function getAuthHeaders() {
  if (!supabase) return {};
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function apiGet(path, config = {}) {
  const headers = await getAuthHeaders();
  return axios.get(`${backendBaseURL}${path}`, { ...config, headers });
}

export async function apiPost(path, data, config = {}) {
  const headers = await getAuthHeaders();
  return axios.post(`${backendBaseURL}${path}`, data, { ...config, headers });
}

export async function apiPatch(path, data, config = {}) {
  const headers = await getAuthHeaders();
  return axios.patch(`${backendBaseURL}${path}`, data, { ...config, headers });
}

export async function apiDelete(path, config = {}) {
  const headers = await getAuthHeaders();
  return axios.delete(`${backendBaseURL}${path}`, { ...config, headers });
}
