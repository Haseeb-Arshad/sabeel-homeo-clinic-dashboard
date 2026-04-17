import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  Users,
  Calendar,
  Activity,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { dashboardApi } from "@/lib/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Conversations",
      value: stats?.total_conversations ?? 0,
      icon: MessageSquare,
    },
    {
      title: "Total Messages",
      value: stats?.total_messages ?? 0,
      icon: Activity,
    },
    {
      title: "Pending Appointments",
      value: stats?.pending_appointments ?? 0,
      icon: Calendar,
    },
    {
      title: "Active Patients",
      value: stats?.active_patients ?? 0,
      icon: Users,
    },
  ];

  const channelData = [
    { channel: "WhatsApp", key: "whatsapp" as const, color: "bg-emerald-500" },
    { channel: "Web", key: "web" as const, color: "bg-cyan-500" },
    { channel: "Voice", key: "voice" as const, color: "bg-amber-500" },
  ];

  const totalCh =
    (stats?.channel_breakdown?.whatsapp ?? 0) +
    (stats?.channel_breakdown?.web ?? 0) +
    (stats?.channel_breakdown?.voice ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Sabeel Homeo Clinic admin panel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.title}
            className="border-t border-border bg-card px-4 py-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {item.title}
              </span>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
              {item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Channel Breakdown</h2>
          </div>
          <div className="p-5 space-y-4">
            {channelData.map((ch) => {
              const count = stats?.channel_breakdown?.[ch.key] ?? 0;
              const pct = totalCh > 0 ? (count / totalCh) * 100 : 0;
              return (
                <div key={ch.key} className="flex items-center gap-3">
                  <Badge variant={ch.key} className="capitalize w-24 justify-center">
                    {ch.channel}
                  </Badge>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ch.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-10 text-right tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Pending Appointments</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate("/appointments")}
            >
              View All
            </Button>
          </div>
          <div className="p-5">
            {stats?.pending_appointments === 0 ? (
              <p className="text-sm text-muted-foreground">No pending appointments</p>
            ) : (
              <div className="flex items-center justify-center py-3">
                <Button
                  onClick={() => navigate("/appointments")}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {stats?.pending_appointments} pending
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="p-5">
          {!stats?.recent_activity || stats.recent_activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_activity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 py-2"
                >
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}