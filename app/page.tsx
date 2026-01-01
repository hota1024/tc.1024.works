"use client";

import { useLocalStorage } from "usehooks-ts";
import { TextCounter, TextCounterOptions } from "@/components/text-counter";
import { SettingsDialog } from "@/components/settings-dialog";

export default function Home() {
  const [maxLength, setMaxLength] = useLocalStorage(
    "te.1024.works.text_counter.max_length",
    2000
  );
  const [value, setValue] = useLocalStorage(
    "te.1024.works.text_counter.value",
    ""
  );
  const [options, setOptions] = useLocalStorage(
    "te.1024.works.text_counter.options",
    {
      ignoreNewline: true,
    } as TextCounterOptions
  );

  return (
    <main className="relative">
      <TextCounter
        className="min-h-dvh"
        initialMaxLength={maxLength}
        initialValue={value}
        onMaxLengthChange={setMaxLength}
        onValueChange={setValue}
        options={options}
      />

      <div className="absolute top-4 right-4">
        <SettingsDialog
          ignoreNewline={options.ignoreNewline ?? true}
          onIgnoreNewlineChange={(value) => {
            setOptions({ ...options, ignoreNewline: value });
          }}
        />
      </div>
    </main>
  );
}
