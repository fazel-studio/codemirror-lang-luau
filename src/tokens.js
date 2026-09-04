import { ExternalTokenizer } from "@lezer/lr"
import { BlockComment, LongString, InterpStart, InterpContent, InterpEnd } from "./parser.terms.js"

const dash = 45, bracketL = 91, bracketR = 93, equals = 61, backtick = 96, backslash = 92, braceL = 123, newline = 10

export const ext = new ExternalTokenizer((input, stack) => {
  // BlockComment: --[=*[
  if (stack.canShift(BlockComment)) {
    if (input.next == dash && input.peek(1) == dash) {
      let pos = 2
      if (input.peek(pos) == bracketL) {
        pos++
        let eqCount = 0
        while (input.peek(pos) == equals) { eqCount++; pos++ }
        if (input.peek(pos) == bracketL) {
          pos++ // after opener
          // Now search for closing
          let depth = pos
          // Scan ahead to find matching closer
          // We need to advance input step by step to find pattern
          // Use peek to search, but we need to know length to accept
          let cur = pos
          let found = false
          while (true) {
            let ch = input.peek(cur)
            if (ch < 0) break
            if (ch == bracketR) {
              let tmp = cur + 1
              let eq2 = 0
              while (input.peek(tmp) == equals) { eq2++; tmp++ }
              if (eq2 == eqCount && input.peek(tmp) == bracketR) {
                // Found closer
                let totalLen = tmp + 1 // include final ]
                // Advance input and accept
                for (let i = 0; i < totalLen; i++) input.advance()
                input.acceptToken(BlockComment)
                return
              }
            }
            cur++
            // to avoid infinite loop on big file, but okay
            if (cur - pos > 10000) {
              // fallback: if too long, still need to handle? We'll just break and not match?
              // Actually block comment could be large, but we search whole remainder
            }
          }
          // If opener found but closer not found, still consume till end as block comment? For error recovery, consume to EOF as block comment
          // Lezer error recovery will handle unterminated?
          // We'll match up to EOF as BlockComment if not closed
          // Advance to end
          // Count remaining
          let len = 0
          while (input.peek(len) >= 0) len++
          for (let i = 0; i < len; i++) input.advance()
          // Don't accept if not closed? But let's accept as BlockComment to avoid confusion
          // Actually if no closer, it's still a block comment with error, but we can accept what we have
          // For now, don't accept, let other tokenizers try
        }
      }
    }
  }

  // LongString: [=*[
  if (stack.canShift(LongString)) {
    if (input.next == bracketL) {
      let pos = 1
      let eqCount = 0
      while (input.peek(pos) == equals) { eqCount++; pos++ }
      if (input.peek(pos) == bracketL) {
        pos++ // after opener
        let cur = pos
        let found = false
        while (true) {
          let ch = input.peek(cur)
          if (ch < 0) break
          if (ch == bracketR) {
            let tmp = cur + 1
            let eq2 = 0
            while (input.peek(tmp) == equals) { eq2++; tmp++ }
            if (eq2 == eqCount && input.peek(tmp) == bracketR) {
              let totalLen = tmp + 1
              for (let i = 0; i < totalLen; i++) input.advance()
              input.acceptToken(LongString)
              return
            }
          }
          cur++
        }
        // Unterminated long string: consume to EOF?
        // If not found closing, don't accept? Let error recovery handle
      }
    }
  }

  // Interpolated string tokens
  // InterpStart: ` at beginning
  if (stack.canShift(InterpStart)) {
    if (input.next == backtick) {
      input.advance()
      input.acceptToken(InterpStart)
      return
    }
  }

  // InterpEnd: ` at end (inside string)
  if (stack.canShift(InterpEnd)) {
    if (input.next == backtick) {
      input.advance()
      input.acceptToken(InterpEnd)
      return
    }
  }

  // InterpContent: content inside interpolated string, not containing ` or unescaped { 
  if (stack.canShift(InterpContent)) {
    if (input.next == backtick || input.next == braceL) {
      // empty content, don't accept
      return
    }
    if (input.next < 0) return
    let len = 0
    // Need to scan until ` or { or escaped sequence
    while (true) {
      let ch = input.peek(len)
      if (ch < 0) break
      if (ch == backtick || ch == braceL) break
      if (ch == backslash) {
        // Escape next char, consume both if next exists
        let nxt = input.peek(len + 1)
        if (nxt < 0) { len++ ; break } // single backslash at end
        len += 2
        continue
      }
      if (ch == newline) {
        // Allow newline inside interpolated string? Luau allows multiline, but we include
        len++
        continue
      }
      len++
      // To avoid consuming "}" that is part of interpolation end, we already break only on { and `, not }
      // So "}" will be consumed as content if it appears outside interpolation's closing.
      // But "}" that closes interpolation is handled as literal "}" token after expression.
      // Inside string content, "}" is just content until next segment? Actually after expression's "}", we resume content, which may contain "}".
      // So we treat "}" as content, okay.
    }
    if (len > 0) {
      for (let i = 0; i < len; i++) input.advance()
      input.acceptToken(InterpContent)
      return
    }
  }
}, { contextual: true })
