import { createCn } from 'cn/config'

// Without these, cn reads text-caption as a colour and drops it next to one
export const cn = createCn({
  extend: { classGroups: { 'font-size': [{ text: ['caption', 'heading', 'display'] }] } },
})
