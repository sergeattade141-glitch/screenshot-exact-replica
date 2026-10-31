import { Fragment } from "react";

/** Lightweight renderer: paragraphs, bullet/numbered lists and fenced code blocks. */
export function MessageContent({ text }: { text: string }) {
  const parts = text.split(/```(\w*)\n?([\s\S]*?)```/g);
  const nodes = [];
  for (let i = 0; i < parts.length; i += 3) {
    const prose = parts[i];
    if (prose?.trim()) nodes.push(<Prose key={`p${i}`} text={prose} />);
    if (i + 2 < parts.length) {
      nodes.push(
        <pre key={`c${i}`} className="my-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[13px] leading-relaxed">
          {parts[i + 1] && <div className="mb-1 text-xs text-muted-foreground">{parts[i + 1]}</div>}
          <code>{parts[i + 2]}</code>
        </pre>,
      );
    }
  }
  return <div className="space-y-2 leading-relaxed">{nodes}</div>;
}

function Prose({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-*•]\s+/.test(l)))
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => <li key={j}>{l.replace(/^\s*[-*•]\s+/, "")}</li>)}
            </ul>
          );
        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l)))
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {lines.map((l, j) => <li key={j}>{l.replace(/^\s*\d+[.)]\s+/, "")}</li>)}
            </ol>
          );
        return (
          <p key={i} className="whitespace-pre-wrap">
            {lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{l}</Fragment>)}
          </p>
        );
      })}
    </>
  );
}
