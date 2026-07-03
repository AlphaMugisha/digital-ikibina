import type { Metadata } from "next";
import { GroupForm } from "./group-form";

export const metadata: Metadata = {
  title: "Kora itsinda / Create group — Digital Ibimina",
};

export default function NewGroupPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        Kora itsinda / Create a group
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Uzaba umuyobozi (LEADER) w&apos;iri tsinda.
      </p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-warm-sm">
        <GroupForm />
      </div>
    </div>
  );
}
