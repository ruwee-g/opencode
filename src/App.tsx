import { createEffect, createSignal, Show } from "solid-js";
import Background, { ImagePickerButton } from "./components/Background";
import Composer from "./components/Composer";
import Messages, { type Msg } from "./components/Messages";
import Recents from "./components/Recents";
import NewProjectModal from "./components/NewProjectModal";
import Icon from "./components/Icon";
import { TrafficLights } from "./components/Chrome";
import { initialProjects, chatHistory, type Chat } from "./data";

let nextId = 1;
let uid = 100;
const nid = (p: string) => `${p}${uid++}`;

const aiReplies = [
  (q: string) =>
    `Got it — working from “${q.length > 90 ? q.slice(0, 90) + "…" : q}”.\n\nHere's a first sketch:\n\`\`\`tsx\nfunction Answer() {\n  return <main>draft v1</main>\n}\n\`\`\`\nTell me what to adjust and I'll iterate.`,
  (q: string) =>
    `Good point. I broke “${q.length > 70 ? q.slice(0, 70) + "…" : q}” into two steps:\n\n1. Draft the structure\n2. Polish the details\n\nWhich one should I expand first?`,
  () =>
    `Done — updated the draft. Anything else to refine, or should I move on to the next block?`,
];

function App() {
  const [dark, setDark] = createSignal(false);
  const [text, setText] = createSignal("");
  const [customUrl, setCustomUrl] = createSignal<string | undefined>(undefined);
  const [messages, setMessages] = createSignal<Msg[]>([]);
  const [typing, setTyping] = createSignal(false);
  const [attachments, setAttachments] = createSignal<string[]>([]);
  const [model, setModel] = createSignal("Muse Spark 1.3");
  const [projects, setProjects] = createSignal(initialProjects);
  const [activeProjectId, setActiveProjectId] = createSignal<string | null>(null);
  const [activeChatId, setActiveChatId] = createSignal<string | null>(null);
  const [chatOpen, setChatOpen] = createSignal(false);
  const [projectModalOpen, setProjectModalOpen] = createSignal(false);
  /** overlay recents opened from chat; null = closed */
  const [recentsFrom, setRecentsFrom] = createSignal<null | "chat">(null);
  const [recentsClosing, setRecentsClosing] = createSignal(false);
  const [leavingChat, setLeavingChat] = createSignal(false);
  const inRecents = () => recentsFrom() !== null;

  const closeRecents = () => {
    if (recentsClosing()) return;
    setRecentsClosing(true);
    setTimeout(() => {
      setRecentsFrom(null);
      setRecentsClosing(false);
    }, 250);
  };

  const goHome = () => {
    if (leavingChat()) return;
    setLeavingChat(true);
    setTimeout(() => {
      resetChat();
      setLeavingChat(false);
    }, 250);
  };
  const [replyIdx, setReplyIdx] = createSignal(0);
  const [homePage, setHomePage] = createSignal<0 | 1>(0);
  const [recentsTop, setRecentsTop] = createSignal(true);
  let wheelLock = false;
  let fileInput!: HTMLInputElement;
  let scrollRef!: HTMLDivElement;
  let timers: ReturnType<typeof setTimeout>[] = [];

  const chatting = () => chatOpen();
  const dimmed = () => dark() || chatting() || homePage() === 1;
  const chromeHidden = () => !chatting() && homePage() === 1;

  const findChat = (pid: string, cid: string) => {
    const p = projects().find((x) => x.id === pid) ?? null;
    const c = p?.chats.find((x) => x.id === cid) ?? null;
    return { project: p, chat: c };
  };

  const chatLabel = () => {
    const { project, chat } = findChat(activeProjectId() ?? "", activeChatId() ?? "");
    if (!project) return "";
    return chat ? `${project.name} / ${chat.title}` : project.name;
  };

  const touchChat = (pid: string, cid: string, patch: Partial<Chat>) =>
    setProjects((ps) =>
      ps.map((p) =>
        p.id !== pid
          ? p
          : { ...p, chats: p.chats.map((c) => (c.id !== cid ? c : { ...c, ...patch })) },
      ),
    );

  const openChat = (pid: string, chatId: string) => {
    const { project, chat } = findChat(pid, chatId);
    if (!project || !chat) return;
    timers.forEach(clearTimeout);
    timers = [];
    setTyping(false);
    setActiveProjectId(pid);
    setActiveChatId(chatId);
    setModel(chat.model);
    setText("");
    setAttachments([]);
    setMessages(chatHistory(chat).map((l) => ({ id: nextId++, role: l.role, text: l.text })));
    setChatOpen(true);
  };

  const newChat = () => {
    const pid = activeProjectId() ?? projects()[0]?.id;
    if (!pid) {
      setProjectModalOpen(true);
      return;
    }
    const chat: Chat = {
      id: nid("c"),
      title: "New chat",
      snippet: "No messages yet",
      time: "Just now",
      model: model(),
      seed: (Math.random() * 1e6) | 0,
    };
    setProjects((ps) => ps.map((p) => (p.id !== pid ? p : { ...p, chats: [chat, ...p.chats] })));
    timers.forEach(clearTimeout);
    timers = [];
    setTyping(false);
    setActiveProjectId(pid);
    setActiveChatId(chat.id);
    setText("");
    setAttachments([]);
    setMessages([]);
    setChatOpen(true);
  };

  const createProject = (name: string, firstMessage: string) => {
    const p = { id: nid("p"), name, chats: [] as Chat[] };
    setProjects((ps) => [...ps, p]);
    setActiveProjectId(p.id);
    setActiveChatId(null);
    setProjectModalOpen(false);
    if (firstMessage) {
      setText(firstMessage);
      send();
    }
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const prev = customUrl();
    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
    setCustomUrl(URL.createObjectURL(f));
  };

  const selectProject = (pid: string) => {
    setActiveProjectId(pid);
    setActiveChatId(null);
  };

  const send = () => {
    const v = text().trim();
    if ((!v && attachments().length === 0) || typing()) return;
    if (!chatOpen()) {
      // home composer always starts a NEW chat in the selected project
      const pid = activeProjectId() ?? projects()[0]?.id ?? null;
      if (!pid) {
        setProjectModalOpen(true);
        return;
      }
      const chat: Chat = {
        id: nid("c"),
        title: v ? v.slice(0, 42) : "New chat",
        snippet: v || "Attachment",
        time: "Just now",
        model: model(),
        seed: (Math.random() * 1e6) | 0,
      };
      setProjects((ps) => ps.map((p) => (p.id !== pid ? p : { ...p, chats: [chat, ...p.chats] })));
      setActiveProjectId(pid);
      setActiveChatId(chat.id);
    } else {
      const pid = activeProjectId();
      const cid = activeChatId();
      if (pid && cid) {
        touchChat(pid, cid, { snippet: v || "Attachment", time: "Just now", model: model() });
      }
    }
    const attached = attachments();
    const q = attached.length > 0 ? `${v}\n\nAttached: ${attached.join(", ")}` : v;
    setMessages((m) => [...m, { id: nextId++, role: "user", text: q }]);
    setText("");
    setAttachments([]);
    setTyping(true);
    setChatOpen(true);
    const reply = aiReplies[replyIdx() % aiReplies.length](q);
    setReplyIdx((i) => i + 1);
    timers.push(
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [...m, { id: nextId++, role: "ai", text: reply }]);
      }, 1400),
    );
  };

  const resetChat = () => {
    timers.forEach(clearTimeout);
    timers = [];
    setTyping(false);
    setMessages([]);
    setText("");
    setAttachments([]);
    setReplyIdx(0);
    setActiveProjectId(null);
    setActiveChatId(null);
    setChatOpen(false);
    setHomePage(0);
  };

  const onAttach = (files: FileList | null) => {
    if (!files) return;
    setAttachments((a) => [...a, ...Array.from(files).map((f) => f.name)]);
  };

  const onRemoveAttachment = (i: number) =>
    setAttachments((a) => a.filter((_, idx) => idx !== i));

  const composerProps = () => ({
    value: text(),
    onInput: setText,
    onSend: send,
    attachments: attachments(),
    onAttach,
    onRemoveAttachment,
    model: model(),
    onSelectModel: setModel,
    projects: projects(),
    activeProjectId: activeProjectId(),
    onSelectProject: selectProject,
    onNewChat: newChat,
    onOpenNewProject: () => setProjectModalOpen(true),
  });

  const onHomeScroll = (_e: Event) => {
    const el = _e.currentTarget as HTMLDivElement | null;
    setRecentsTop(!el || el.scrollTop <= 0);
  };

  const goHomePage = (p: 0 | 1) => {
    if (homePage() === p || wheelLock) return;
    wheelLock = true;
    setHomePage(p);
    setTimeout(() => (wheelLock = false), 650);
  };

  const onHomeWheel = (e: WheelEvent) => {
    if (chatting()) return;
    if (homePage() === 0 && e.deltaY > 30) goHomePage(1);
    else if (homePage() === 1 && e.deltaY < -30 && recentsTop()) goHomePage(0);
  };

  createEffect(() => {
    // autoscroll on new messages / typing state
    messages().length;
    typing();
    const el = scrollRef;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  });

  return (
    <div class="demo-scene">
      <div class="app-window flex h-[560px] w-[880px] max-w-full">
        <main class="relative flex min-w-0 flex-1 overflow-hidden">
          <Background customUrl={customUrl()} dark={dimmed()} />

          <div
            class="absolute left-4 top-4 z-20 flex items-center gap-2 transition-opacity duration-300"
            classList={{ "pointer-events-none opacity-0": chromeHidden() }}
          >
            <TrafficLights />
          </div>

          <Show
            when={chatting()}
            fallback={
              <div class="overlay-enter relative z-10 h-full w-full overflow-hidden" onWheel={onHomeWheel}>
                <div
                  class="flex h-[200%] flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ transform: homePage() === 1 ? "translateY(-50%)" : "translateY(0)" }}
                >
                  <section class="flex h-1/2 items-center justify-center px-10">
                    <div class="flex w-full translate-y-8 justify-center">
                      <Composer dark={dark()} {...composerProps()} />
                    </div>
                  </section>

                  <section onScroll={onHomeScroll} class="chat-scroll flex h-1/2 flex-col overflow-y-auto px-10 pb-8 pt-5">
                    <div class="m-auto w-full">
                      <Show when={homePage() === 1}>
                        <Recents animate projects={projects()} onOpen={openChat} />
                      </Show>
                    </div>
                  </section>
                </div>
              </div>
            }
          >
            <div class={`relative z-10 flex h-full w-full flex-col ${leavingChat() ? "overlay-exit" : ""}`}>
              <Show when={chatLabel()}>
                <div class="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-24">
                  <span class="truncate text-[12px] text-white/60">{chatLabel()}</span>
                </div>
              </Show>
              <div ref={scrollRef} class="chat-scroll min-h-0 flex-1 overflow-y-auto px-10">
                <div class="h-16" aria-hidden="true" />
                <Show when={messages().length === 0 && !typing()}>
                  <div class="msg-enter mx-auto w-full max-w-[640px] py-10 text-center text-[13px] text-white/40">
                    New chat — ask the first question below.
                  </div>
                </Show>
                <Messages messages={messages()} typing={typing()} />
                <div class="h-44" aria-hidden="true" />
              </div>
              <div class="composer-dock pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-10 pb-5">
                <div class="pointer-events-auto flex w-full max-w-[640px] justify-center">
                  <Composer dark={true} {...composerProps()} wide chatMode />
                </div>
              </div>
            </div>
          </Show>

          <Show when={chatting() && !inRecents()}>
            <div class="absolute right-4 top-4 z-20 flex flex-col gap-2">
              <button
                class="icon-btn h-8 w-8"
                onClick={() => setRecentsFrom("chat")}
                aria-label="recent chats"
                title="Recent chats"
              >
                <Icon name="chat" size={16} />
              </button>
              <button
                class="icon-btn h-8 w-8"
                onClick={goHome}
                aria-label="home"
                title="Home"
              >
                <Icon name="home" size={16} />
              </button>
            </div>
          </Show>

          <Show when={inRecents()}>
            <div
              class={`absolute inset-0 z-30 overflow-y-auto backdrop-blur-xl ${
                recentsClosing() ? "overlay-exit" : "overlay-enter"
              }`}
            >
              <div class="flex min-h-full flex-col px-10 py-5">
                <div class="m-auto w-full">
                  <Recents animate projects={projects()} onOpen={(pid, cid) => { closeRecents(); openChat(pid, cid); }} />
                </div>
              </div>
              <button
                class="icon-btn absolute right-4 top-4 h-8 w-8"
                onClick={closeRecents}
                aria-label="back to chat"
                title="Back to chat"
              >
                <Icon name="back" size={16} />
              </button>
            </div>
          </Show>

          <Show when={chromeHidden()}>
            <button
              class="icon-btn absolute bottom-4 left-4 z-20 h-8 w-8"
              onClick={() => goHomePage(0)}
              aria-label="back to top"
              title="Back to top"
            >
              <Icon name="up" />
            </button>
          </Show>

          <ImagePickerButton onPick={() => fileInput.click()} />

          <Show when={projectModalOpen()}>
            <NewProjectModal
              onClose={() => setProjectModalOpen(false)}
              onCreate={createProject}
            />
          </Show>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            class="hidden"
            onChange={(e) => onFile(e.currentTarget.files?.[0])}
          />
        </main>
      </div>

      {/* demo helper */}
      <div class="flex flex-wrap items-center justify-center gap-2 text-[12px] text-slate-600">
        <button
          class="rounded-full border border-slate-300 bg-white/70 px-3 py-1.5 backdrop-blur hover:bg-white"
          onClick={() => setDark((v) => !v)}
        >
          Dim: {dark() ? "dark" : "light"}
        </button>
        <Show when={chatting()}>
          <button
            class="rounded-full border border-slate-300 bg-white/70 px-3 py-1.5 backdrop-blur hover:bg-white"
            onClick={resetChat}
          >
            Reset chat
          </button>
        </Show>
        <Show when={customUrl()}>
          <button
            class="rounded-full border border-slate-300 bg-white/70 px-3 py-1.5 backdrop-blur hover:bg-white"
            onClick={() => setCustomUrl(undefined)}
          >
            Reset background
          </button>
        </Show>
        <span class="opacity-70">scroll on home → recents screen · send (Enter) → chat</span>
      </div>
    </div>
  );
}

export default App;
