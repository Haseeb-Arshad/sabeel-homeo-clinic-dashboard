import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Send, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { conversationsApi, type Message } from "@/lib/api";

export default function ConversationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading: convLoading, isError: convError } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => conversationsApi.get(id!),
    enabled: !!id,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["conversation-messages", id],
    queryFn: () => conversationsApi.getMessages(id!),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => conversationsApi.sendMessage(id!, content),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", id] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (convLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (convError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-muted-foreground">Failed to load conversation.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/conversations")}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/conversations")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground">
            {conversation?.patient_name ?? "Conversation"}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            {conversation?.channel && (
              <Badge
                variant={(conversation.channel as "whatsapp" | "web" | "voice") ?? "whatsapp"}
                className="capitalize text-[10px]"
              >
                {conversation.channel}
              </Badge>
            )}
            {conversation?.status && (
              <Badge variant="secondary" className="capitalize text-[10px]">
                {conversation.status}
              </Badge>
            )}
            {conversation?.created_at && (
              <span className="text-[11px] text-muted-foreground">
                Started {format(new Date(conversation.created_at), "MMM d, yyyy h:mm a")}
              </span>
            )}
          </div>
        </div>
        {conversation?.patient_id && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate(`/patients/${conversation.patient_id}`)}
          >
            <User className="h-3.5 w-3.5" />
            Patient
          </Button>
        )}
      </div>

      {/* Chat */}
      <div className="flex flex-1 flex-col mt-4 bg-card border border-border rounded-lg min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {!messages || messages.length === 0 ? (
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
                          {isUser ? "Patient" : msg.role === "assistant" ? "Sabeel Bot" : msg.role}
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
            This message will be sent to the patient via their active channel
          </p>
        </div>
      </div>
    </div>
  );
}