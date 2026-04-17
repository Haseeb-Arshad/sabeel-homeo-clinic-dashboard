import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { patientsApi, type Patient } from "@/lib/api";

export default function Patients() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [channelFilter, setChannelFilter] = useState<string>("");

  const { data: patients, isLoading, isError } = useQuery({
    queryKey: ["patients", search, channelFilter],
    queryFn: () =>
      patientsApi.list({
        search: search || undefined,
      }),
  });

  const filtered = (patients ?? []).filter((p: Patient) =>
    channelFilter ? p.channel === channelFilter : true
  );

  const channels = ["whatsapp", "web", "voice"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Patients</h1>
        <p className="text-sm text-muted-foreground">Manage patient records</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Failed to load patients.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">No patients found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient: Patient) => (
                <TableRow
                  key={patient.external_id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/patients/${patient.external_id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={patient.channel as "whatsapp" | "web" | "voice"}
                      className="capitalize"
                    >
                      {patient.channel}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{patient.message_count}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(patient.last_seen), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}