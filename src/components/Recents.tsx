import { For } from "solid-js";
import type { Project } from "../data";

type Props = {
  projects: Project[];
  onOpen: (projectId: string, chatId: string) => void;
  animate?: boolean;
};

export default function Recents(props: Props) {
  const flat = () =>
    props.projects.flatMap((p) => p.chats.map((c) => ({ project: p, chat: c })));

  return (
    <div class="mx-auto w-full max-w-[640px]">
      <div class="mb-4 flex items-end justify-between">
        <h2 class="text-[15px] font-semibold text-white">Recent chats</h2>
        <span class="text-[12px] text-white/50">{flat().length} total</span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <For each={flat()}>
          {({ project, chat }, i) => (
            <button
              class={`${props.animate ? "msg-enter " : ""}glass rounded-2xl p-4 text-left transition hover:bg-white/10`}
              style={props.animate ? { "animation-delay": `${i() * 60}ms` } : undefined}
              onClick={() => props.onOpen(project.id, chat.id)}
            >
              <div class="mb-1 truncate text-[13px] font-semibold text-white">
                {chat.title}
              </div>
              <div class="mb-3 line-clamp-2 text-[12px] leading-relaxed text-white/55">
                {chat.snippet}
              </div>
              <div class="flex items-center gap-1.5 text-[11px] text-white/40">
                <span class="max-w-[120px] truncate text-white/55">{project.name}</span>
                <span>•</span>
                <span>{chat.time}</span>
              </div>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
