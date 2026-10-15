export function TrafficLights() {
  return (
    <div class="flex items-center gap-2 pl-1" aria-label="window controls">
      <span class="h-3 w-3 rounded-full" style={{ background: "#FF5F57" }} />
      <span class="h-3 w-3 rounded-full" style={{ background: "#FEBC2E" }} />
      <span class="h-3 w-3 rounded-full" style={{ background: "#28C840" }} />
    </div>
  );
}
