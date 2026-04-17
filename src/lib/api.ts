import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Conversation {
  id: string;
  channel: string;
  external_id: string;
  patient_name?: string;
  patient_id?: string;
  status?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  message_count?: number;
  last_message?: string | { content: string; role: string; created_at: string } | null;
}

export interface Message {
  id: string | number;
  conversation_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface Patient {
  external_id: string;
  name: string;
  channel: string;
  conversation_id: string;
  first_seen: string;
  last_seen: string;
  message_count: number;
}

export interface PatientDetail {
  external_id: string;
  name: string;
  channel: string;
  first_seen: string;
  last_seen: string;
  total_conversations: number;
  total_messages: number;
  conversations: Conversation[];
  messages: Message[];
  appointments: Appointment[];
}

export interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  preferred_date: string;
  preferred_time: string;
  reason: string;
  channel: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  updated_at?: string;
  conversation_id?: string;
}

export interface KnowledgeEntry {
  id: string;
  source_type: string;
  source_id: string;
  source_title: string;
  source_url: string;
  content: string;
  updated_at: string;
}

export interface DashboardStats {
  total_conversations: number;
  total_messages: number;
  pending_appointments: number;
  confirmed_appointments: number;
  active_patients?: number;
  recent_conversations?: Conversation[];
  recent_activity?: {
    id: string;
    description: string;
    type: string;
    timestamp: string;
  }[];
  channel_breakdown?: {
    whatsapp: number;
    web: number;
    voice: number;
  };
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/api/admin/stats").then((r) => r.data),
};

export const patientsApi = {
  list: (params?: { search?: string; limit?: number; offset?: number }) =>
    api.get<Patient[]>("/api/admin/patients", { params }).then((r) => r.data),
  get: (externalId: string) =>
    api.get<PatientDetail>(`/api/admin/patients/${encodeURIComponent(externalId)}`).then((r) => r.data),
  sendMessage: (conversationId: string, message: string) =>
    api.post("/api/admin/send-message", { conversation_id: conversationId, message }).then((r) => r.data),
};

export const conversationsApi = {
  list: (params?: { channel?: string; status?: string; limit?: number; offset?: number }) =>
    api.get<Conversation[]>("/api/admin/conversations", { params }).then((r) => r.data),
  get: (conversationId: string) =>
    api.get<Conversation>(`/api/admin/conversations/${conversationId}`).then((r) => r.data),
  getMessages: (conversationId: string, params?: { limit?: number; offset?: number }) =>
    api.get<Message[]>(`/api/admin/conversations/${conversationId}/messages`, { params }).then((r) => r.data),
  sendMessage: (conversationId: string, message: string) =>
    api.post("/api/admin/send-message", { conversation_id: conversationId, message }).then((r) => r.data),
};

export const appointmentsApi = {
  list: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get<Appointment[]>("/api/admin/appointments", { params }).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/admin/appointments/${id}`, { status }).then((r) => r.data),
};

export const knowledgeApi = {
  list: (params?: { source_type?: string; limit?: number; offset?: number }) =>
    api.get<KnowledgeEntry[]>("/api/admin/knowledge", { params }).then((r) => r.data),
  delete: (id: string) => api.delete(`/api/admin/knowledge/${id}`).then((r) => r.data),
};

export default api;