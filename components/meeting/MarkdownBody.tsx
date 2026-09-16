"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function MarkdownBody({
  markdown,
  className,
  darkDoc = false,
}: {
  markdown: string;
  className?: string;
  darkDoc?: boolean;
}) {
  const { theme } = useTheme();

  if (!markdown.trim()) {
    return (
      <p className={cn("py-6 text-sm text-slate-400", className)}>
        내용이 없습니다.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "minutes-markdown text-[15px] leading-7 text-slate-800",
        darkDoc && whenDark(theme, "text-zinc-200"),
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => (
            <h1
              className={cn(
                "mt-8 mb-3 border-b border-slate-200 pb-2 text-2xl font-extrabold tracking-tight text-slate-900 first:mt-0",
                darkDoc && whenDark(theme, "border-zinc-800 text-zinc-50"),
              )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={cn(
                "mt-7 mb-2.5 text-xl font-bold tracking-tight text-slate-900 first:mt-0",
                darkDoc && whenDark(theme, "text-zinc-50"),
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={cn(
                "mt-5 mb-2 text-base font-bold text-slate-800 first:mt-0",
                darkDoc && whenDark(theme, "text-zinc-100"),
              )}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-2.5">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-2.5 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          hr: () => (
            <hr
              className={cn(
                "my-6 border-slate-200",
                darkDoc && whenDark(theme, "border-zinc-800"),
              )}
            />
          ),
          strong: ({ children }) => (
            <strong
              className={cn(
                "font-semibold text-slate-900",
                darkDoc && whenDark(theme, "text-zinc-50"),
              )}
            >
              {children}
            </strong>
          ),
          table: ({ children }) => (
            <div
              className={cn(
                "my-4 overflow-x-auto rounded-xl border border-slate-200",
                darkDoc && whenDark(theme, "border-zinc-800"),
              )}
            >
              <table className="w-full min-w-[320px] border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead
              className={cn(
                "bg-slate-50",
                darkDoc && whenDark(theme, "bg-zinc-900"),
              )}
            >
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th
              className={cn(
                "border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-500",
                darkDoc && whenDark(theme, "border-zinc-800 text-zinc-400"),
              )}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className={cn(
                "border-t border-slate-100 px-3 py-2.5 align-top text-slate-800",
                darkDoc && whenDark(theme, "border-zinc-800/80 text-zinc-200"),
              )}
            >
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                "my-3 border-l-4 border-sky-300 pl-3 text-slate-600",
                darkDoc && whenDark(theme, "border-sky-700 text-zinc-300"),
              )}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
