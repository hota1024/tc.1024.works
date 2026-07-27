"use client";

import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { TextCounterOptions } from "@/components/text-counter";

/**
 * エディタの表示モード
 */
export type EditorMode = "plain" | "markdown";

/**
 * メモごとの設定のデフォルト値
 */
export const DEFAULT_MAX_LENGTH = 2000;
export const DEFAULT_OPTIONS: TextCounterOptions = {
  ignoreNewline: true,
};
export const DEFAULT_MODE: EditorMode = "plain";

/**
 * メモのデータ型
 */
export interface Memo {
  /** メモのslug（URLのパスに使われる識別子） */
  slug: string;
  /** メモの内容 */
  content: string;
  /** 最大文字数（メモごとに独立した設定） */
  maxLength: number;
  /** 文字数カウントのオプション（メモごとに独立した設定） */
  options: TextCounterOptions;
  /** エディタの表示モード（メモごとに独立した設定） */
  mode: EditorMode;
  /** メモの作成日（ISO 8601形式） */
  createdAt: string;
  /** メモの最終更新日（ISO 8601形式） */
  updatedAt: string;
}

const STORAGE_KEY = "tc.1024.works.memos.v2";

/**
 * メモを管理するカスタムフック
 *
 * メモは slug をキーとして localStorage に保存される。
 * 設定（最大文字数・カウントオプション）はメモごとに独立して保持される。
 */
export function useMemos() {
  const [memos, setMemos] = useLocalStorage<Memo[]>(STORAGE_KEY, []);

  /**
   * slugでメモを取得
   */
  const getMemo = useCallback(
    (slug: string): Memo | undefined => {
      return memos.find((memo) => memo.slug === slug);
    },
    [memos]
  );

  /**
   * 新しいメモを作成する。
   * 既に同じslugのメモが存在する場合は何もしない（冪等）。
   */
  const createMemo = useCallback(
    (slug: string, content = ""): Memo => {
      const now = new Date().toISOString();
      const newMemo: Memo = {
        slug,
        content,
        maxLength: DEFAULT_MAX_LENGTH,
        options: { ...DEFAULT_OPTIONS },
        mode: DEFAULT_MODE,
        createdAt: now,
        updatedAt: now,
      };
      setMemos((prev) => {
        if (prev.some((memo) => memo.slug === slug)) {
          return prev;
        }
        return [newMemo, ...prev];
      });
      return newMemo;
    },
    [setMemos]
  );

  /**
   * メモを更新する（部分更新）。
   */
  const updateMemo = useCallback(
    (
      slug: string,
      updates: Partial<Omit<Memo, "slug" | "createdAt" | "updatedAt">>
    ) => {
      setMemos((prev) =>
        prev.map((memo) =>
          memo.slug === slug
            ? { ...memo, ...updates, updatedAt: new Date().toISOString() }
            : memo
        )
      );
    },
    [setMemos]
  );

  /**
   * メモのslugを変更する（リネーム）。
   * 変更先のslugが空、または既に別のメモで使われている場合は何もしない。
   *
   * @returns リネームに成功したかどうか
   */
  const renameMemo = useCallback(
    (oldSlug: string, newSlug: string): boolean => {
      if (!newSlug || oldSlug === newSlug) {
        return false;
      }
      let renamed = false;
      setMemos((prev) => {
        // 変更先が既に使われている場合はリネームしない
        if (prev.some((memo) => memo.slug === newSlug)) {
          return prev;
        }
        renamed = true;
        return prev.map((memo) =>
          memo.slug === oldSlug
            ? { ...memo, slug: newSlug, updatedAt: new Date().toISOString() }
            : memo
        );
      });
      return renamed;
    },
    [setMemos]
  );

  /**
   * メモを削除する。
   */
  const deleteMemo = useCallback(
    (slug: string) => {
      setMemos((prev) => prev.filter((memo) => memo.slug !== slug));
    },
    [setMemos]
  );

  return {
    memos,
    getMemo,
    createMemo,
    updateMemo,
    renameMemo,
    deleteMemo,
  };
}
