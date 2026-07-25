import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getGroupWithMembership } from "@/lib/groups";
import { getMessages } from "./actions";
import { ChatRoom } from "./chat-room";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("chat");
  return { title: `${t("title")} — Digital Ibimina` };
}

export default async function GroupChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: groupId } = await params;
  const { group, membership } = await getGroupWithMembership(session.user.id, groupId);
  if (!group || !membership) notFound();

  const result = await getMessages(groupId);
  const initialMessages = result.ok ? result.data : [];

  return (
    <ChatRoom
      groupId={groupId}
      viewerMembershipId={membership.id}
      initialMessages={initialMessages}
    />
  );
}
