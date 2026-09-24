export type JsonTokenKind = 'key' | 'string' | 'literal' | 'plain'

export interface JsonToken {
  text: string
  kind: JsonTokenKind
}

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

export function highlightJson(json: string): JsonToken[] {
  const tokens: JsonToken[] = []
  let last = 0
  for (const match of json.matchAll(TOKEN)) {
    const start = match.index
    if (start > last) tokens.push({ text: json.slice(last, start), kind: 'plain' })
    const [whole, str, colon] = match
    if (str && colon) {
      tokens.push({ text: str, kind: 'key' }, { text: colon, kind: 'plain' })
    } else {
      tokens.push({ text: whole, kind: str ? 'string' : 'literal' })
    }
    last = start + whole.length
  }
  if (last < json.length) tokens.push({ text: json.slice(last), kind: 'plain' })
  return tokens
}
