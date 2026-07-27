"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import { MemoListDialog } from "@/components/memo-list-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import { TextCounter } from "@/components/text-counter";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEFAULT_MAX_LENGTH,
  DEFAULT_MODE,
  DEFAULT_OPTIONS,
  type EditorMode,
  useMemos,
} from "@/hooks/use-memos";
import { cn } from "@/lib/utils";

const LAST_SLUG_KEY = "tc.1024.works.last_slug";
const SLUG_INPUT_ID = "memo-slug-input";

export default function MemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = use(params);
  const slug = decodeURIComponent(rawSlug);
  const router = useRouter();

  const { memos, getMemo, createMemo, updateMemo, renameMemo, deleteMemo } =
    useMemos();
  const [, setLastSlug] = useLocalStorage(LAST_SLUG_KEY, "");

  const memo = getMemo(slug);

  // slug編集フィールド用の下書き状態
  const [slugDraft, setSlugDraft] = useState(slug);

  // オートクリエイトを一時的に抑制するslug集合。
  // リネームや削除の直後、route が更新される前の再描画で、消えたメモが
  // 誤って作り直されるのを防ぐために使う。
  const suppressCreateRef = useRef<Set<string>>(new Set());
  const suppressCreate = (slug: string) => {
    suppressCreateRef.current.add(slug);
    window.setTimeout(() => {
      suppressCreateRef.current.delete(slug);
    }, 2000);
  };
  // 常に最新の「現在のslug」を保持する（高速入力時の古いクロージャ対策）
  const currentSlugRef = useRef(slug);
  useEffect(() => {
    currentSlugRef.current = slug;
  }, [slug]);

  // URLのslugが外部要因（一覧からの遷移など）で変わったら下書きも同期する。
  // slugフィールドを編集中（フォーカス中）は上書きしない。
  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      document.activeElement?.id === SLUG_INPUT_ID
    ) {
      return;
    }
    setSlugDraft(slug);
  }, [slug]);

  // slugが存在しなければ作成する。
  // ただしリネーム/削除で抑制中のslugでは作成しない。
  useEffect(() => {
    if (suppressCreateRef.current.has(slug)) {
      return;
    }
    if (!getMemo(slug)) {
      createMemo(slug);
    }
  }, [slug, getMemo, createMemo]);

  // 最後に開いたslugを記録する
  useEffect(() => {
    setLastSlug(slug);
  }, [slug, setLastSlug]);

  const mode = memo?.mode ?? DEFAULT_MODE;
  const maxLength = memo?.maxLength ?? DEFAULT_MAX_LENGTH;
  const options = memo?.options ?? DEFAULT_OPTIONS;

  // slugの下書きが別メモと衝突しているか
  const trimmedDraft = slugDraft.trim();
  const slugConflict =
    trimmedDraft !== "" &&
    trimmedDraft !== slug &&
    getMemo(trimmedDraft) !== undefined;

  const handleSlugChange = (raw: string) => {
    setSlugDraft(raw);

    const from = currentSlugRef.current;
    const target = raw.trim();
    if (!target || target === from) {
      return;
    }
    // 変更先が既存の別メモと衝突する場合はリネームしない（入力は保持）
    if (getMemo(target)) {
      return;
    }

    // リネーム元・先の両方で作成を抑制する（元slugは route 更新前の
    // 再描画で、先slugは遷移途中で、それぞれ誤検知されうるため）。
    suppressCreate(from);
    suppressCreate(target);

    renameMemo(from, target);
    currentSlugRef.current = target;
    router.replace(`/${encodeURIComponent(target)}`);
  };

  const handleDelete = (target: string) => {
    const next = memos.find((m) => m.slug !== target);
    // 表示中のメモを削除して他に移る場合、route更新前の再描画で
    // オートクリエイトが削除済みメモを復活させないよう抑制する。
    // （移動先が無い＝ルート経由で同じslugを作り直す場合は抑制しない）
    if (target === slug && next) {
      suppressCreate(target);
    }
    deleteMemo(target);
    // 表示中のメモを削除したら別のメモ、なければルートへ
    if (target === slug) {
      router.push(next ? `/${encodeURIComponent(next.slug)}` : "/");
    }
  };

  return (
    <main className="relative">
      <TextCounter
        key={`${slug}:${mode}`}
        className="min-h-dvh"
        mode={mode}
        initialMaxLength={maxLength}
        initialValue={memo?.content ?? ""}
        onMaxLengthChange={(value) => updateMemo(slug, { maxLength: value })}
        onValueChange={(value) => updateMemo(slug, { content: value })}
        options={options}
      />

      {/* 上部中央: slug編集フィールド + モード切替タブ */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <Input
          id={SLUG_INPUT_ID}
          value={slugDraft}
          onChange={(e) => handleSlugChange(e.target.value)}
          aria-label="slug"
          aria-invalid={slugConflict}
          placeholder="slug"
          className={cn("h-8 w-56 text-center font-mono")}
        />
        <Tabs
          value={mode}
          onValueChange={(value) =>
            updateMemo(slug, { mode: value as EditorMode })
          }
        >
          <TabsList>
            <TabsTrigger value="plain">Plain Text</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 右上: 文章一覧 + 設定 */}
      <div className="absolute top-4 right-4 flex gap-2">
        <MemoListDialog
          memos={memos}
          currentSlug={slug}
          onDelete={handleDelete}
        />
        <SettingsDialog
          ignoreNewline={options.ignoreNewline ?? true}
          onIgnoreNewlineChange={(value) =>
            updateMemo(slug, {
              options: { ...options, ignoreNewline: value },
            })
          }
        />
      </div>
    </main>
  );
}
