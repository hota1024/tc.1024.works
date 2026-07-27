"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";

export interface MarkdownEditorProps {
  /** 初期のMarkdownテキスト（マウント時のみ参照される） */
  initialValue: string;
  /** 内容が変化したときにMarkdownテキストを通知する */
  onChange: (markdown: string) => void;
  className?: string;
}

/**
 * Tiptapを使ったMarkdownエディタ。
 *
 * 入力内容はMarkdownテキストとして保存され、編集中は見出し・強調・
 * リストなどの装飾がリアルタイムに反映される。
 * エディタの枠（背景・境界線・余白・基本フォント）はPlain Textモードの
 * textareaと揃えてある。
 */
export function MarkdownEditor({
  initialValue,
  onChange,
  className,
}: MarkdownEditorProps) {
  const editor = useEditor({
    // Next.jsのSSRでのハイドレーション不整合を避ける
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Markdown.configure({
        linkify: true,
        breaks: true,
      }),
    ],
    content: initialValue,
    autofocus: "end",
    editorProps: {
      attributes: {
        class: cn(
          // Plain Textモードのtextareaと同じ枠の見た目
          "h-full overflow-auto notranslate bg-background outline-none p-4 rounded-lg border font-mono text-2xl",
          // Markdownの装飾
          "[&_p]:my-2 [&_p:first-child]:mt-0",
          "[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3",
          "[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2",
          "[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2",
          "[&_h4]:text-xl [&_h4]:font-bold [&_h5]:text-lg [&_h5]:font-bold [&_h6]:text-base [&_h6]:font-bold",
          "[&_strong]:font-bold [&_em]:italic [&_s]:line-through",
          "[&_ul]:list-disc [&_ul]:pl-8 [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:my-2",
          "[&_li]:my-1 [&_li>p]:my-0",
          "[&_li[data-type=taskItem]]:list-none [&_ul[data-type=taskList]]:pl-2",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em]",
          "[&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:my-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
          "[&_hr]:my-6 [&_hr]:border-border",
          "[&_a]:underline [&_a]:text-primary"
        ),
        translate: "no",
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      onChange(markdown);
    },
  });

  return (
    <EditorContent editor={editor} className={cn("h-full min-h-0", className)} />
  );
}
