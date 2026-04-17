import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Phone, Globe, Mic } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { conversationsApi, type Conversation } from "@/lib/api";

const channelIcons: Record<string, React.ElementType> = {
  whatsapp: Phone,
  web: Globe,
  voice: Mic,
};

export default function Conversations() {
  const navigate = useNavigate();
  const [channelFilter, setChannelFilter] = useState<string>("");

  const { data: conversations, isLoading, isError } = useQuery({
    queryKey: ["conversations", channelFilter],
    queryFn: () =>
      conversationsApi.list({
        channel: channelFilter || undefined,
      }),
  });

  const channels = ["whatsapp", "web", "voice"];

  const getPreview = (conv: Conversation): string => {
    if (!conv.last_message) return "No messages";
    if (typeof conv.last_message === "string") return conv.last_message;
    if (typeof conv.last_message === "object" && "content" in conv.last_message) {
      return conv.last_message.content;
    }
    return "No messages";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Conversations</h1>
        <p className="text-sm text-muted-foreground">Patient conversation history</p>
      </div>

      <div className="flex gap-1">
        <Button
          variant={channelFilter === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setChannelFilter("")}
        >
          All
        </Button>
        {channels.map((ch) => (
          <Button
            key={ch}
            variant={channelFilter === ch ? "default" : "outline"}
            size="sm"
            className="capitalize"
            onClick={() => setChannelFilter(ch)}
          >
            {ch}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Failed to load conversations.</p>
        </div>
      ) : !conversations || conversations.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">No conversations found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: Conversation) => {
            const IconComp = channelIcons[conv.channel] ?? MessageSquare;
            return (
              <button
                key={conv.id}
                onClick={() => navigate(`/conversations/${conv.id}`)}
                className="flex items-center gap-4 w-full rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-md shrink-0 ${
                  conv.channel === "whatsapp"
                    ? "bg-emerald-500/15"
                    : conv.channel === "web"
                    ? "bg-cyan-500/15"
                    : "bg-amber-500/15"
                }`}>
                  <IconComp className={`h-4 w-4 ${
                    conv.channel === "whatsapp"
                      ? "text-emerald-400"
                      : conv.channel === "web"
                      ? "text-cyan-400"
                      : "text-amber-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {conv.patient_name ?? `Conversation ${conv.id.slice(0, 8)}`}
                    </span>
                    <Badge
                      variant={(conv.channel as "whatsapp" | "web" | "voice") ?? "whatsapp"}
                      className="capitalize text-[10px]"
                    >
                      {conv.channel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {getPreview(conv)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                  </span>
                  {conv.message_count != null && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                      {conv.message_count} messages
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}