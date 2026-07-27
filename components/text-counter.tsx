"use client";

import { SlashIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
import type { EditorMode } from "@/hooks/use-memos";
import { noop } from "@/lib/noop";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

export interface TextCounterOptions {
  ignoreNewline?: boolean;
}

export interface TextCounterProps {
  className?: string;
  initialValue?: string;
  onValueChange?: (value: string) => void;
  initialMaxLength?: number;
  onMaxLengthChange?: (maxLength: number) => void;
  options?: TextCounterOptions;
  /** エディタの表示モード（Plain Text / Markdown） */
  mode?: EditorMode;
}

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

export function TextCounter(props: TextCounterProps) {
  const {
    initialMaxLength = 100,
    onMaxLengthChange = noop,
    initialValue = "",
    onValueChange = noop,
    options,
    mode = "plain",
  } = props;

  const ignoreNewline = options?.ignoreNewline ?? false;

  const [value, setValue] = useState(initialValue);
  const [maxLength, setMaxLength] = useState(initialMaxLength);

  // 改行を削除
  const textToCount = useMemo(
    () => (ignoreNewline ? value.replaceAll("\n", "") : value),
    [value, ignoreNewline]
  );
  // 文字数をカウント
  const valueLength = useMemo(
    () => [...segmenter.segment(textToCount)].length,
    [textToCount]
  );
  const progress = Math.max(valueLength / maxLength, 0);

  const handleValueChange = (next: string) => {
    setValue(next);
    onValueChange(next);
  };

  const lengthClassNames = cn(
    "text-lg! font-bold w-[100px] text-center bg-muted h-12 flex items-center justify-center rounded-md border border-border bg-background! font-mono"
  );

  return (
    <div
      className={cn("relative grid place-items-center p-8", props.className)}
    >
      <div
        className="absolute inset-0 bg-foreground/80 dark:bg-foreground/15 transition-all duration-200"
        style={{ top: `${progress * 100}%` }}
      />
      <div className="grid grid-rows-[auto_1fr] gap-4 z-10 max-w-[1000px] w-full max-h-[800px] h-full">
        <div className="flex gap-2 items-center justify-center">
          <div className={cn(lengthClassNames, "text-muted-foreground")}>
            {valueLength}
          </div>
          <SlashIcon />
          <Input
            id="max-length"
            className={lengthClassNames}
            value={maxLength}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (isNaN(value)) {
              } else {
                setMaxLength(value);
                onMaxLengthChange(value);
              }
            }}
          />
        </div>
        {mode === "markdown" ? (
          <MarkdownEditor
            className="min-h-0"
            initialValue={initialValue}
            onChange={handleValueChange}
          />
        ) : (
          <textarea
            id="text"
            className="resize-none notranslate text-2xl font-bold bg-background outline-none p-4 rounded-lg border font-mono"
            autoFocus
            translate="no"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
          ></textarea>
        )}
      </div>
    </div>
  );
}
