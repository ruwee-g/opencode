import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import Icon from "./Icon";
import { models, type Project } from "../data";

type Props = {
  dark: boolean;
  value: string;
  onInput: (v: string) => void;
  onSend: () => void;
  wide?: boolean;
  /** chat mode: model pill moves next to +, project pills hidden */
  chatMode?: boolean;
  attachments: string[];
  onAttach: (files: FileList | null) => void;
  onRemoveAttachment: (i: number) => void;
  model: string;
  onSelectModel: (m: string) => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onNewChat: () => void;
  onOpenNewProject: () => void;
};

function ModelMenu(props: { current: string; above?: boolean; onPick: (m: string) => void }) {
  return (
    <div
      role="listbox"
      class={`msg-enter glass absolute left-0 z-30 max-h-60 w-60 overflow-y-auto rounded-xl p-1.5 ${
        props.above ? "bottom-full mb-2" : "top-full mt-2"
      }`}
    >
      <For each={models}>
        {(m) => (
          <button
            role="option"
            aria-selected={props.current === m.name}
            class="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/10 hover:text-white"
            classList={{ "bg-white/10 text-white": props.current === m.name }}
            onClick={() => props.onPick(m.name)}
          >
            <span class="inline-flex items-center gap-2 truncate">
              <Icon name="cpu" size={14} />
              {m.name}
            </span>
            <span class="shrink-0 text-[11px] text-white/40">{m.tag}</span>
          </button>
        )}
      </For>
    </div>
  );
}

export default function Composer(props: Props) {
  const send = () => props.onSend();
  let fileInput!: HTMLInputElement;
  let projectWrap!: HTMLDivElement;
  let modelWrap!: HTMLDivElement;

  const [projectOpen, setProjectOpen] = createSignal(false);
  const [modelOpen, setModelOpen] = createSignal(false);

  const activeProject = () => props.projects.find((p) => p.id === props.activeProjectId) ?? null;
  const projectLabel = () => activeProject()?.name ?? "Select project";

  onMount(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (projectWrap && !projectWrap.contains(t)) setProjectOpen(false);
      if (modelWrap && !modelWrap.contains(t)) setModelOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProjectOpen(false);
        setModelOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    onCleanup(() => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    });
  });

  return (
    <div class={`flex w-full flex-col gap-3 ${props.wide ? "max-w-[640px]" : "max-w-[560px]"}`}>
      <div
        class={`glass rounded-2xl px-4 pb-3 pt-3.5 ${props.dark ? "composer-dark" : ""}`}
      >
        <Show when={props.attachments.length > 0}>
          <div class="mb-2 flex flex-wrap gap-1.5">
            <For each={props.attachments}>
              {(name, i) => (
                <span class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-white/10 py-1 pl-2.5 pr-1.5 text-[11px] text-white/85">
                  <Icon name="file" size={13} />
                  <span class="max-w-[180px] truncate">{name}</span>
                  <button
                    class="rounded-full px-1 text-white/60 hover:bg-white/15 hover:text-white"
                    onClick={() => props.onRemoveAttachment(i())}
                    aria-label={`remove ${name}`}
                  >
                    ✕
                  </button>
                </span>
              )}
            </For>
          </div>
        </Show>

        <textarea
          rows={2}
          placeholder="Ask anything..."
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          class="w-full resize-none bg-transparent text-[13px] text-white outline-none placeholder:text-white/60"
        />
        <div class="mt-1 flex h-8 items-center justify-between">
          <div class="flex h-8 items-center gap-3">
            <button
              class="-ml-[7px] flex h-8 w-8 items-center justify-center text-white/70 transition hover:text-white"
              aria-label="attach file"
              title="Attach file"
              onClick={() => fileInput.click()}
            >
              <Icon name="plus" size={18} />
            </button>
            <Show when={props.chatMode}>
              <div ref={modelWrap} class="relative">
                <button
                  class="flex h-8 items-center gap-1.5 bg-transparent text-[12px] leading-none text-white/75 transition hover:text-white"
                  onClick={() => setModelOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={modelOpen()}
                >
                  <Icon name="cpu" size={14} />
                  {props.model}
                </button>
                <Show when={modelOpen()}>
                  <ModelMenu
                    current={props.model}
                    above
                    onPick={(m) => {
                      props.onSelectModel(m);
                      setModelOpen(false);
                    }}
                  />
                </Show>
              </div>
            </Show>
          </div>
          <button
            class="send-btn icon-btn h-8 w-8 border-0"
            aria-label="send"
            onClick={send}
          >
            <Icon name="send" />
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          multiple
          class="hidden"
          onChange={(e) => {
            props.onAttach(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      <Show when={!props.chatMode}>
        <div class="flex items-center justify-between gap-2 px-6">
          <div class="flex items-center gap-2">
            <div ref={projectWrap} class="relative">
              <button
                class={`pill max-w-[220px] ${props.dark ? "pill-ghost" : ""}`}
                onClick={() => setProjectOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={projectOpen()}
              >
                <Icon name="folder" size={14} />
                <span class="truncate">{projectLabel()}</span>
              </button>
              <Show when={projectOpen()}>
                <div
                  role="listbox"
                  class="msg-enter glass absolute left-0 top-full z-30 mt-2 max-h-60 w-64 overflow-y-auto rounded-xl p-1.5"
                >
                  <For each={props.projects}>
                    {(g) => (
                      <button
                        role="option"
                        aria-selected={props.activeProjectId === g.id}
                        class="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/10 hover:text-white"
                        classList={{ "bg-white/10 text-white": props.activeProjectId === g.id }}
                        onClick={() => {
                          props.onSelectProject(g.id);
                          setProjectOpen(false);
                        }}
                      >
                        <span class="inline-flex items-center gap-2 truncate">
                          <Icon name="folder" size={14} />
                          {g.name}
                        </span>
                        <span class="shrink-0 text-[11px] text-white/40">
                          {g.chats.length} {g.chats.length === 1 ? "chat" : "chats"}
                        </span>
                      </button>
                    )}
                  </For>
                  <div class="mt-1 border-t border-white/10 pt-1">
                    <button
                      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/10 hover:text-white"
                      onClick={() => {
                        props.onNewChat();
                        setProjectOpen(false);
                      }}
                    >
                      <Icon name="plus" size={14} />
                      New chat
                    </button>
                    <button
                      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/80 transition hover:bg-white/10 hover:text-white"
                      onClick={() => {
                        props.onOpenNewProject();
                        setProjectOpen(false);
                      }}
                    >
                      <Icon name="folder" size={14} />
                      New project
                    </button>
                  </div>
                </div>
              </Show>
            </div>
            <button
              class={`pill !px-2.5 ${props.dark ? "pill-ghost" : ""}`}
              aria-label="new chat"
              title="New chat"
              onClick={props.onNewChat}
            >
              <Icon name="chat" size={14} />
            </button>
          </div>
          <div ref={modelWrap} class="relative">
            <button
              class={`pill ${props.dark ? "pill-ghost" : ""}`}
              onClick={() => setModelOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={modelOpen()}
            >
              <Icon name="cpu" size={14} />
              {props.model}
            </button>
            <Show when={modelOpen()}>
              <ModelMenu
                current={props.model}
                onPick={(m) => {
                  props.onSelectModel(m);
                  setModelOpen(false);
                }}
              />
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}
