/** Minimal "## heading" + paragraph renderer — no markdown library, just what a group constitution needs. */
export function SimpleMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h3 key={i} className="font-display text-lg font-semibold text-foreground">
              {block.slice(3)}
            </h3>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap text-sm text-foreground">
            {block}
          </p>
        );
      })}
    </div>
  );
}
