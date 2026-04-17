import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
import { knowledgeApi, type KnowledgeEntry } from "@/lib/api";

export default function Knowledge() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeEntry | null>(null);

  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ["knowledge", search, sourceFilter],
    queryFn: () =>
      knowledgeApi.list({
        source_type: sourceFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      setDeleteTarget(null);
    },
  });

  const sources = Array.from(
    new Set((entries ?? []).map((e: KnowledgeEntry) => e.source_type))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">
          Manage clinic knowledge used by the chatbot
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant={sourceFilter === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSourceFilter("")}
          >
            All
          </Button>
          {sources.map((src) => (
            <Button
              key={src}
              variant={sourceFilter === src ? "default" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => setSourceFilter(src)}
            >
              {src}
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
          <p className="text-sm text-muted-foreground">Failed to load knowledge entries.</p>
        </div>
      ) : !entries || entries.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">No knowledge entries found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(entries ?? []).map((entry: KnowledgeEntry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium text-foreground">
                    {entry.source_title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {entry.source_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                    {entry.content}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(entry)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.source_title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}