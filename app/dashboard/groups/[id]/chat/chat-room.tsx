"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getMessages, sendMessage, type ChatMessage } from "./actions";

const POLL_INTERVAL_MS = 4000;

export function ChatRoom({
  groupId,
  viewerMembershipId,
  initialMessages,
}: {
  groupId: string;
  viewerMembershipId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [isSending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations("chat");

  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await getMessages(groupId);
      if (result.ok) setMessages(result.data);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await sendMessage(groupId, trimmed);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setMessages((prev) => [...prev, result.data]);
      setBody("");
    });
  }

  return (
    <div className="mb-24 flex flex-col md:mb-0">
      <div
        ref={listRef}
        className="h-[60vh] space-y-3 overflow-y-auto rounded-2xl border border-border bg-card p-4"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noMessagesYet")}</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.membershipId === viewerMembershipId;
            return (
              <div
                key={message.id}
                className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}
              >
                {!isOwn && (
                  <span className="px-1 text-xs font-medium text-muted-foreground">
                    {message.senderName}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                </div>
                <span className="px-1 text-xs text-muted-foreground">
                  {timeFormatter.format(new Date(message.createdAt))}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t("messagePlaceholder")}
          className="h-12 rounded-full text-base"
        />
        <Button
          type="button"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full"
          disabled={isSending || !body.trim()}
          onClick={handleSend}
          aria-label={t("send")}
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}
