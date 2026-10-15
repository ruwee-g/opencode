import { createSignal, onCleanup, onMount } from "solid-js";

type Props = {
  onClose: () => void;
  onCreate: (name: string, firstMessage: string) => void;
};

export default function NewProjectModal(props: Props) {
  const [name, setName] = createSignal("");
  const [firstMessage, setFirstMessage] = createSignal("");
  let input!: HTMLInputElement;

  const create = () => {
    const n = name().trim();
    if (!n) return;
    props.onCreate(n, firstMessage().trim());
  };

  onMount(() => {
    input?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", onKey);
    onCleanup(() => document.removeEventListener("keydown", onKey));
  });

  return (
    <div class="absolute inset-0 z-40 flex items-center justify-center px-10">
      <button
        aria-label="close"
        class="overlay-enter absolute inset-0 bg-black/50"
        onClick={props.onClose}
      />
      <div class="msg-enter glass relative w-full max-w-[340px] rounded-2xl p-5">
        <div class="mb-1 text-[14px] font-semibold text-white">New project</div>
        <div class="mb-4 text-[12px] text-white/55">A folder for related chats.</div>
        <input
          ref={input}
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") create();
          }}
          placeholder="Project name"
          class="mb-2.5 w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-white/30"
        />
        <input
          value={firstMessage()}
          onInput={(e) => setFirstMessage(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") create();
          }}
          placeholder="First message (optional)"
          class="mb-4 w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-white/30"
        />
        <div class="flex justify-end gap-2">
          <button
            class="rounded-full px-4 py-2 text-[12px] text-white/65 transition hover:bg-white/10 hover:text-white"
            onClick={props.onClose}
          >
            Cancel
          </button>
          <button
            class="rounded-full bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-[#3b77ff] disabled:opacity-40"
            disabled={!name().trim()}
            onClick={create}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
