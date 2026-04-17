import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Phone,
  Send,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  patientsApi,
  conversationsApi,
  type Message,
} from "@/lib/api";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: patient, isLoading: patientLoading, isError: patientError } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => patientsApi.get(id!),
    enabled: !!id,
  });

  const conversations = patient?.conversations ?? [];
  const convId = activeConversation ?? (conversations[0]?.id ?? null);

  const { data: messages } = useQuery({
    queryKey: ["conversation-messages", convId],
    queryFn: () => conversationsApi.getMessages(convId!),
    enabled: !!convId,
    refetchInterval: 8000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => conversationsApi.sendMessage(convId!, content),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", convId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-muted-foreground">Failed to load patient data.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/patients")}>
          Back to Patients
        </Button>
      </div>
    );
  }

  const appointments = patient.appointments ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Patient Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patients")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground">{patient.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{patient.external_id}</span>
            <Badge
              variant={(patient.channel as "whatsapp" | "web" | "voice") ?? "whatsapp"}
              className="capitalize text-[10px]"
            >
              {patient.channel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Chat */}
      <div className="flex flex-1 gap-4 mt-4 min-h-0">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-64 flex-col gap-3 shrink-0 overflow-y-auto">
          {/* Patient Info Card */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Info</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversations</span>
                <span className="tabular-nums">{patient.total_conversations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages</span>
                <span className="tabular-nums">{patient.total_messages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Seen</span>
                <span>{formatDistanceToNow(new Date(patient.first_seen), { addSuffix: true })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Active</span>
                <span>{formatDistanceToNow(new Date(patient.last_seen), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="bg-card border border-border rounded-lg p-4 flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Conversations</span>
            </div>
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground">No conversations</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`w-full text-left rounded-md px-2.5 py-2 text-xs transition-colors ${
                      convId === conv.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={(conv.channel as "whatsapp" | "web" | "voice") ?? "whatsapp"}
                        className="capitalize text-[9px] px-1.5 py-0"
                      >
                        {conv.channel}
                      </Badge>
                      <span className="text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {conv.last_message && (
                      <p className="mt-1 truncate text-muted-foreground">
                        {typeof conv.last_message === "string"
                          ? conv.last_message
                          : conv.last_message.content}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Appointments */}
          {appointments.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Appointments ({appointments.length})
                </span>
              </div>
              <div className="space-y-2">
                {appointments.slice(0, 3).map((appt) => (
                  <div key={appt.id} className="rounded-md border border-border p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground">
                        {appt.preferred_date}
                      </span>
                      <Badge
                        variant={appt.status as "confirmed" | "pending" | "cancelled" | "completed"}
                        className="capitalize text-[10px]"
                      >
                        {appt.status}
                      </Badge>
                    </div>
                    {appt.reason && (
                      <p className="text-[11px] text-muted-foreground mt-1 truncate">{appt.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col bg-card border border-border rounded-lg min-h-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
            <span className="text-sm font-medium text-foreground">
              {convId ? "Conversation" : "Select a conversation"}
            </span>
            {convId && (
              <span className="text-xs text-muted-foreground">
                {conversations.find((c) => c.id === convId)?.channel ?? ""}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {!convId ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Select a conversation to view messages</p>
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No messages in this conversation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg: Message) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm ${
                          isUser
                            ? "bg-secondary text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-medium opacity-70">
                            {isUser ? "Patient" : "Sabeel Bot"}
                          </span>
                          <span className="text-[10px] opacity-50">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          {convId && (
            <div className="border-t border-border px-4 py-3 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (messageText.trim()) {
                    sendMessageMutation.mutate(messageText.trim());
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Send a message as the agent..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Messages will be sent to the patient via their active channel
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}