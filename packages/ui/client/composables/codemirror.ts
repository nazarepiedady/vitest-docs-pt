import type { Ref, WritableComputedRef } from 'vue'
import { watch } from 'vue'
import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
// import 'codemirror/mode/css/css'
import 'codemirror/mode/xml/xml'
// import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/addon/display/placeholder'
import 'codemirror/addon/scroll/simplescrollbars'
import 'codemirror/addon/scroll/simplescrollbars.css'

export function useCodeMirror(
  textarea: Ref<HTMLTextAreaElement | null | undefined>,
  input: Ref<string> | WritableComputedRef<string>,
  options: CodeMirror.EditorConfiguration = {},
) {
  const cm = CodeMirror.fromTextArea(
    textarea.value!,
    {
      theme: 'vars',
      ...options,
      scrollbarStyle: 'simple',
    },
  )

  let skip = false

  cm.on('change', () => {
    if (skip) {
      skip = false
      return
    }
    input.value = cm.getValue()
  })

  watch(
    input,
    (v) => {
      if (v !== cm.getValue()) {
        skip = true
        const selections = cm.listSelections()
        cm.replaceRange(v, cm.posFromIndex(0), cm.posFromIndex(Infinity))
        cm.setSelections(selections)
      }
    },
    { immediate: true },
  )

  return markRaw(cm)
}
