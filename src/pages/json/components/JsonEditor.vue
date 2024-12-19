<script setup lang="ts">
import type { JsonEditor } from 'vanilla-jsoneditor'
import { createJSONEditor } from 'vanilla-jsoneditor'
import { onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'

const props = defineProps([
  'content',
  'selection',
  'readOnly',
  'indentation',
  'tabSize',
  'mode',
  'mainMenuBar',
  'navigationBar',
  'statusBar',
  'askToFormat',
  'escapeControlCharacters',
  'escapeUnicodeCharacters',
  'flattenColumns',
  'parser',
  'validator',
  'validationParser',
  'pathParser',
  'queryLanguages',
  'queryLanguageId',
  'onChangeQueryLanguage',
  'onChange',
  'onRenderValue',
  'onClassName',
  'onRenderMenu',
  'onRenderContextMenu',
  'onChangeMode',
  'onSelect',
  'onError',
  'onFocus',
  'onBlur',
])

let editor: JsonEditor | null = null
const editorRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  editor = createJSONEditor({
    target: editorRef.value!,
    props,
  })
})

onUpdated(() => {
  editor!.updateProps(props)
})

onBeforeUnmount(() => {
  editor!.destroy()
  editor = null
})
</script>

<template>
  <div ref="editorRef" />
</template>
