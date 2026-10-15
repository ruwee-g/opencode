import { Show } from "solid-js";
import Icon from "./Icon";

/** Painted gradient + optional user image + dark dim (state 3). */
export default function Background(props: { customUrl?: string; dark: boolean }) {
  return (
    <div class="bg-painting absolute inset-0">
      <Show when={props.customUrl}>
        <img
          src={props.customUrl}
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
        />
      </Show>
      <div
        class="absolute inset-0 transition-opacity duration-500"
        style={{
          background: "rgba(4,6,14,0.72)",
          opacity: props.dark ? 1 : 0,
        }}
      />
    </div>
  );
}

export function ImagePickerButton(props: { onPick: () => void }) {
  return (
    <button
      class="icon-btn absolute bottom-4 right-4 z-20 h-8 w-8"
      onClick={props.onPick}
      aria-label="set custom background"
      title="Set custom background"
    >
      <Icon name="image" />
    </button>
  );
}
