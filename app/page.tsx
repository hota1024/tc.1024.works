"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";

const LAST_SLUG_KEY = "tc.1024.works.last_slug";
const DEFAULT_SLUG = "default";

/**
 * ルートにアクセスされたら、最後に開いていたslug（なければ既定のslug）へ
 * リダイレクトする。実際のエディタは /[slug] が担当する。
 */
export default function Home() {
  const router = useRouter();
  const [lastSlug] = useLocalStorage(LAST_SLUG_KEY, "");

  useEffect(() => {
    const slug = lastSlug || DEFAULT_SLUG;
    router.replace(`/${encodeURIComponent(slug)}`);
  }, [lastSlug, router]);

  return null;
}
