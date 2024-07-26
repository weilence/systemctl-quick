import type { Ref } from 'vue'
import { ref } from 'vue'

export function resetRef<T = any>(value: T) {
  const initialValue = structuredClone(value)
  const v = ref<T>(value) as Ref<T>

  return [
    v,
    () => {
      v.value = structuredClone(initialValue)
    },
  ] as const
}
