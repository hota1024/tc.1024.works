"use client";

import { MonitorIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export interface SettingsDialogProps {
  ignoreNewline: boolean;
  onIgnoreNewlineChange: (value: boolean) => void;
}

export function SettingsDialog({
  ignoreNewline,
  onIgnoreNewlineChange,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // ハイドレーションエラーを防ぐため
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="設定">
          <SettingsIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>
            アプリケーションの設定を変更できます
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* テーマ設定 */}
          <div className="space-y-3">
            <Label>テーマ</Label>
            {mounted ? (
              <RadioGroup
                value={theme || "system"}
                onValueChange={setTheme}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="flex items-center gap-2 cursor-pointer">
                    <SunIcon className="size-4" />
                    <span>Light</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="flex items-center gap-2 cursor-pointer">
                    <MoonIcon className="size-4" />
                    <span>Dark</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="flex items-center gap-2 cursor-pointer">
                    <MonitorIcon className="size-4" />
                    <span>System</span>
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <div className="text-sm text-muted-foreground">読み込み中...</div>
            )}
          </div>

          {/* 改行文字のカウント設定 */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="ignore-newline">改行文字を無視する</Label>
              <p className="text-sm text-muted-foreground">
                改行文字（\n）を文字数にカウントしない
              </p>
            </div>
            <Switch
              id="ignore-newline"
              checked={ignoreNewline}
              onCheckedChange={onIgnoreNewlineChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

