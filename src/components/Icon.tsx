import addPlus from "../assets/icons/Add_light-1.svg?raw";
import arrowTop from "../assets/icons/Arrow_top_light.svg?raw";
import chatPlus from "../assets/icons/Chat_plus_light.svg?raw";
import burger from "../assets/icons/Order_light.svg?raw";
import chip from "../assets/icons/Setting_line_light.svg?raw";
import searchIcon from "../assets/icons/Search_light.svg?raw";
import upIcon from "../assets/icons/Up_light.svg?raw";
import fileIcon from "../assets/icons/Paper_light.svg?raw";
import cpuIcon from "../assets/icons/CPU_light.svg?raw";
import backIcon from "../assets/icons/Back_light.svg?raw";

const map: Record<string, string> = {
  plus: addPlus,
  send: arrowTop,
  chat: chatPlus,
  burger,
  chip,
  search: searchIcon,
  up: upIcon,
  file: fileIcon,
  cpu: cpuIcon,
  back: backIcon,
  // folder + image have no standalone light export in icons2
  // (they live in the "Folder and File.svg" / "Multimedia Types.svg" sheets)
  // — hand-drawn in the same 1.5px stroke style as placeholders:
  folder: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.5"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="10" r="1.8" stroke="currentColor" stroke-width="1.5"/><path d="m5 18 5-5 3 3 2-2 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m4 11 8-7 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 9.5V20h11V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

export default function Icon(props: { name: keyof typeof map | string; size?: number }) {
  const svg = map[props.name] ?? map.plus;
  return (
    <span
      style={{
        width: `${props.size ?? 16}px`,
        height: `${props.size ?? 16}px`,
        display: "inline-flex",
        color: "inherit",
      }}
      // eslint-disable-next-line solid/no-innerhtml
      innerHTML={svg}
    />
  );
}
