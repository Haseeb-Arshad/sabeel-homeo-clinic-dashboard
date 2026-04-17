import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { appointmentsApi, type Appointment } from "@/lib/api";

export default function Appointments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const { data: appointments, isLoading, isError } = useQuery({
    queryKey: ["appointments", statusFilter],
    queryFn: () =>
      appointmentsApi.list({
        status: statusFilter || undefined,
      }),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.updateStatus(id, "confirmed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.updateStatus(id, "cancelled"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setCancelTarget(null);
    },
  });

  const pendingCount = (appointments ?? []).filter(
    (a: Appointment) => a.status === "pending"
  ).length;

  const statusPills = ["", "pending", "confirmed", "cancelled", "completed"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending confirmation
          </p>
        </div>
      </div>

      <div className="flex gap-1">
        {statusPills.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="capitalize"
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Failed to load appointments.</p>
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">No appointments found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(appointments ?? []).map((appt: Appointment) => (
                <TableRow key={appt.id}>
                  <TableCell>
                    <Button
                      variant="link"
                      className="h-auto p-0 font-medium text-foreground hover:text-primary"
                      onClick={() => {
                        if (appt.patient_phone) {
                          navigate(`/patients/${appt.patient_phone}`);
                        }
                      }}
                    >
                      {appt.patient_name}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={(appt.channel as "whatsapp" | "web" | "voice") ?? "whatsapp"}
                      className="capitalize"
                    >
                      {appt.channel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {appt.preferred_date}
                    {appt.preferred_time ? ` ${appt.preferred_time}` : ""}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {appt.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={appt.status as "confirmed" | "pending" | "cancelled" | "completed"}
                      className="capitalize"
                    >
                      {appt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {appt.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs gap-1"
                          onClick={() => confirmMutation.mutate(appt.id)}
                          disabled={confirmMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => setCancelTarget(appt)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the appointment for{" "}
              {cancelTarget?.patient_name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
              disabled={cancelMutation.isPending}
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}