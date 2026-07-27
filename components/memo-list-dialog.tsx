"use client";

import { FileTextIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { Memo } from "@/hooks/use-memos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface MemoListDialogProps {
  memos: Memo[];
  currentSlug: string;
  onDelete: (slug: string) => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MemoListDialog({
  memos,
  currentSlug,
  onDelete,
}: MemoListDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [newSlug, setNewSlug] = React.useState("");

  // 更新日の新しい順に並べる
  const sortedMemos = React.useMemo(
    () =>
      [...memos].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [memos]
  );

  const openMemo = (slug: string) => {
    router.push(`/${encodeURIComponent(slug)}`);
    setOpen(false);
  };

  const createMemo = () => {
    const slug = newSlug.trim();
    if (!slug) {
      return;
    }
    // 存在しないslugへ遷移すればページ側で自動作成される
    openMemo(slug);
    setNewSlug("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="文章一覧">
          <FileTextIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>文章一覧</DialogTitle>
          <DialogDescription>
            保存された文章を開いたり削除したりできます
          </DialogDescription>
        </DialogHeader>

        {/* 新規作成 */}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            createMemo();
          }}
        >
          <Input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="新しい文章のslug"
            aria-label="新しい文章のslug"
          />
          <Button type="submit" disabled={!newSlug.trim()}>
            <PlusIcon className="size-4" />
            作成
          </Button>
        </form>

        {/* 一覧 */}
        <ScrollArea className="h-[320px] pr-3">
          {sortedMemos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              保存された文章はまだありません
            </p>
          ) : (
            <ul className="space-y-2">
              {sortedMemos.map((memo) => {
                const isCurrent = memo.slug === currentSlug;
                const preview =
                  memo.content.replace(/\s+/g, " ").trim() || "（空の文章）";
                return (
                  <li
                    key={memo.slug}
                    className={cn(
                      "flex items-center gap-2 rounded-md border p-3",
                      isCurrent && "border-primary bg-muted/50"
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => openMemo(memo.slug)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono font-medium">
                          {memo.slug}
                        </span>
                        {isCurrent && (
                          <span className="shrink-0 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                            表示中
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {preview}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(memo.updatedAt)}
                      </p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${memo.slug} を削除`}
                      onClick={() => onDelete(memo.slug)}
                    >
                      <TrashIcon className="size-4 text-destructive" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
