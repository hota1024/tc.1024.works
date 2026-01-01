"use client";

import { useLocalStorage } from "usehooks-ts";
import { TextCounter } from "@/components/text-counter";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [maxLength, setMaxLength] = useLocalStorage(
    "te.1024.works.text_counter.max_length",
    2000,
  );
  const [value, setValue] = useLocalStorage(
    "te.1024.works.text_counter.value",
    "",
  );

  return (
    <main className="relative">
      <TextCounter
        className="min-h-dvh"
        initialMaxLength={maxLength}
        initialValue={value}
        onMaxLengthChange={setMaxLength}
        onValueChange={setValue}
      />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </main>
  );
}
