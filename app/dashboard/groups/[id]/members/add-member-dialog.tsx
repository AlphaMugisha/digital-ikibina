"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addMemberToGroup } from "./actions";

export function AddMemberDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("members");
  const tAuth = useTranslations("auth");

  function reset() {
    setName("");
    setPhone("");
    setMode("existing");
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await addMemberToGroup(groupId, mode, name, phone);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("memberAdded"));
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-11 rounded-full">
          <UserPlus className="size-5" aria-hidden="true" />
          {t("addMember")}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("addTitle")}</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "existing" | "new")}>
          <TabsList className="w-full">
            <TabsTrigger value="existing" className="flex-1">
              {t("existingUser")}
            </TabsTrigger>
            <TabsTrigger value="new" className="flex-1">
              {t("newUser")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="existing-phone">{t("searchByPhone")}</Label>
              <Input
                id="existing-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl text-base"
                type="tel"
                inputMode="numeric"
                placeholder={tAuth("phonePlaceholder")}
              />
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="new-name">{t("nameLabel")}</Label>
              <Input
                id="new-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl text-base"
                placeholder={tAuth("namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-phone">{t("phoneLabel")}</Label>
              <Input
                id="new-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl text-base"
                type="tel"
                inputMode="numeric"
                placeholder={tAuth("phonePlaceholder")}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button
          type="button"
          className="h-12 w-full rounded-full text-base"
          disabled={isPending || !phone.trim() || (mode === "new" && !name.trim())}
          onClick={handleSubmit}
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("add")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
