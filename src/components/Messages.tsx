import { For, Show } from "solid-js";
import Icon from "./Icon";

export type Msg = { id: number; role: "user" | "ai"; text: string };

/** Minimal ``` fence renderer so the AI space can show code. */
function RichText(props: { text: string }) {
  const parts = () => {
    const out: { code: boolean; body: string }[] = [];
    const re = /```(\w*)\n?([\s\S]*?)```/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(props.text))) {
      if (m.index > last) out.push({ code: false, body: props.text.slice(last, m.index) });
      out.push({ code: true, body: m[2].replace(/\n$/, "") });
      last = m.index + m[0].length;
    }
    if (last < props.text.length) out.push({ code: false, body: props.text.slice(last) });
    return out;
  };

  return (
    <>
      <For each={parts()}>
        {(p) => (
          <Show
            when={p.code}
            fallback={<p class="whitespace-pre-wrap">{p.body}</p>}
          >
            <pre class="mt-2 overflow-x-auto rounded-xl bg-black/50 p-3 font-mono text-[12px] leading-relaxed text-white/90">
              {p.body}
            </pre>
          </Show>
        )}
      </For>
    </>
  );
}

export function TypingDots() {
  return (
    <div class="msg-enter flex items-center gap-2.5">
      <span class="icon-btn h-7 w-7 shrink-0 !cursor-default">
        <Icon name="cpu" size={14} />
      </span>
      <span class="glass flex items-center gap-1.5 rounded-2xl px-4 py-3.5">
        <span class="typing-dot" />
        <span class="typing-dot" />
        <span class="typing-dot" />
      </span>
    </div>
  );
}

export default function Messages(props: { messages: Msg[]; typing: boolean }) {
  return (
    <div class="mx-auto flex w-full max-w-[640px] flex-col gap-4">
      <For each={props.messages}>
        {(m) => (
          <Show
            when={m.role === "ai"}
            fallback={
              <div class="msg-enter ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-[#2f6bff]/90 px-4 py-2.5 text-[13px] leading-relaxed text-white shadow-lg">
                <RichText text={m.text} />
              </div>
            }
          >
            <div class="msg-enter flex items-start gap-2.5">
              <span class="icon-btn h-7 w-7 shrink-0 !cursor-default">
                <Icon name="cpu" size={14} />
              </span>
              <div class="glass max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 text-[13px] leading-relaxed text-white/90">
                <RichText text={m.text} />
              </div>
            </div>
          </Show>
        )}
      </For>
      <Show when={props.typing}>
        <TypingDots />
      </Show>
    </div>
  );
}
