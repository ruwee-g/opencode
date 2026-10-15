export type Chat = {
  id: string;
  title: string;
  snippet: string;
  time: string;
  model: string;
  /** picks a scripted opening history when the chat is opened */
  seed: number;
};

export type Project = {
  id: string;
  name: string;
  chats: Chat[];
};

export const initialProjects: Project[] = [
  {
    id: "p1",
    name: "Website",
    chats: [
      { id: "c1", title: "Landing hero copy", snippet: "Tighten the headline, add social proof under the CTA…", time: "2m ago", model: "Muse Spark 1.3", seed: 0 },
      { id: "c2", title: "Onboarding flow", snippet: "Three steps, skip-friendly, progress in the titlebar…", time: "Monday", model: "Muse Spark 1.3", seed: 1 },
    ],
  },
  {
    id: "p2",
    name: "API",
    chats: [
      { id: "c3", title: "API error handling", snippet: "Wrap the client in retries with exponential backoff…", time: "1h ago", model: "Muse Spark 1.0", seed: 2 },
      { id: "c4", title: "SQL migration", snippet: "Backfill users.plan before the deploy runs…", time: "Yesterday", model: "Muse Spark 1.3", seed: 0 },
      { id: "c5", title: "Icon set audit", snippet: "Map every light glyph to its slot in the composer…", time: "Yesterday", model: "Muse Spark Lite", seed: 1 },
    ],
  },
  {
    id: "p3",
    name: "Design",
    chats: [
      { id: "c6", title: "Sidebar animation", snippet: "Spring the width, fade the labels, keep 60fps…", time: "3h ago", model: "Muse Spark 1.3", seed: 2 },
    ],
  },
];

export const models = [
  { name: "Muse Spark 1.3", tag: "Smart" },
  { name: "Muse Spark 1.0", tag: "Balanced" },
  { name: "Muse Spark Lite", tag: "Fast" },
];

type ScriptLine = { role: "user" | "ai"; text: string };

const scripts: Array<(title: string) => ScriptLine[]> = [
  (title) => [
    { role: "user", text: `How should I structure the “${title}” work?` },
    {
      role: "ai",
      text: `Here's a tight plan for “${title}”:\n\n1. Draft the structure\n2. Review edge cases\n3. Polish the details\n\nWhere should we start?`,
    },
    { role: "user", text: "Start with the draft, keep it minimal." },
    {
      role: "ai",
      text: `Done — first sketch:\n\`\`\`tsx\nfunction Draft() {\n  return <main>draft v1</main>\n}\n\`\`\`\nTell me what to adjust and I'll iterate.`,
    },
  ],
  (title) => [
    { role: "user", text: `Remind me where we left “${title}”.` },
    {
      role: "ai",
      text: `Last time on “${title}” we agreed on three steps: draft, review, polish. The draft is ready — want me to expand the review part?`,
    },
  ],
  (title) => [
    { role: "user", text: `The “${title}” draft feels off. What would you change?` },
    {
      role: "ai",
      text: `Two things I'd change in “${title}”:\n\n1. Shorten the intro — get to the point faster\n2. Make the CTA impossible to miss\n\nWant me to apply both?`,
    },
    { role: "user", text: "Yes, apply both." },
    { role: "ai", text: "Applied. Anything else to refine, or should I move on to the next block?" },
  ],
];

/** Scripted opening history for a chat card. */
export function chatHistory(chat: Chat): ScriptLine[] {
  return scripts[chat.seed % scripts.length](chat.title);
}
