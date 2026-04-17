import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import Conversations from "@/pages/Conversations";
import ConversationView from "@/pages/ConversationView";
import Appointments from "@/pages/Appointments";
import Knowledge from "@/pages/Knowledge";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/conversations/:id" element={<ConversationView />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/chat" element={<Navigate to="/conversations" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}