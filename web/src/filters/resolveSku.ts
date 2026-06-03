import type { Option } from "./options";

export function resolveSku(preferred: string, available: Option[]): string {
  if (available.some((o) => o.value === preferred)) return preferred;
  return available[0]?.value ?? "";
}
