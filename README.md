# @fazelstudio/codemirror-lang-luau

[![NPM version](https://img.shields.io/npm/v/@fazelstudio/codemirror-lang-luau.svg)](https://www.npmjs.com/package/@fazelstudio/codemirror-lang-luau)

This package implements Luau (`.luau`) language support for the
[CodeMirror](https://codemirror.net/) code editor: a full Lezer grammar covering
Luau syntax including all Lua 5.1 features plus Luau-specific additions:
gradual typing with type annotations (`: Type`), type aliases, generic types
with variadic packs (`T...`), union/intersection/optional types (`|`, `&`,
`?`), type casts (`:: Type`), `export type`, `typeof` types, compound
assignments (`+=`, `-=`, `*=`, `/=`, `//=`, `%=`, `^=`, `..=`), `continue`
statement (context-sensitive), string interpolation (backtick
`` `...{expr}...` ``), if expressions (`if cond then a else b` with
`elseif` chains), bitwise operators (`&`, `|`, `~`, `<<`, `>>`), extended
string escapes (`\x`, `\u`, `\z`), extended numeric literals (hex `0x`,
binary `0b`, underscore separators), and function attributes
(`@[attribute]`).

This code is released under an MIT license.

## Features

- Full Lua 5.1 compatibility (all valid Lua 5.1 code works)
- Gradual typing: type annotations, `export type`, `typeof`, generic types with packs (`T...`), union/intersection/optional types, named function types (`(a: number) -> string`), type casts (`::`), variadic packs (`...T`, `T...`)
- Compound assignment operators (8 variants)
- `continue` statement (context-sensitive keyword, disambiguated vs `continue = 5` / `continue()`)
- String interpolation with backticks (`` `Hello {name} {expr}` ``) with escapes
- If expressions with `elseif` chains (`if c then a elseif d then b else c`)
- Correct operator precedence (`or` < `and` < `if` < `cmp` < `..` right < `+ -` < `* / // %` < `&` < `~` < `|` < `<< >>` < `^` right < unary)
- Bitwise operators, extended literals, function attributes, `--!strict` directives
- Syntax highlighting, auto-indent and code folding for all blocks

## Usage

```js
import { EditorView, basicSetup } from "codemirror"
import { luau } from "@fazelstudio/codemirror-lang-luau"

new EditorView({
  parent: document.body,
  doc: `local name: string = "World"\nprint(\`Hello, {name}!\`)`,
  extensions: [basicSetup, luau()],
})
```

## API

### `luau() → LanguageSupport`

Create a language support extension for Luau.

```js
import {EditorView, basicSetup} from "codemirror"
import {luau} from "@fazelstudio/codemirror-lang-luau"

new EditorView({
  parent: document.body,
  extensions: [basicSetup, luau()],
  doc: `export type User = { name: string }\nlocal x: number | string = 42`
})
```

### `luauLanguage: LRLanguage`

The Luau language object. Can be used for custom configuration:

```js
import {luauLanguage} from "@fazelstudio/codemirror-lang-luau"
luauLanguage.data.of({ autocomplete: myCompletions })
```

## Testing

```bash
npm run build:grammar  # generate parser from src/luau.grammar
npm run build          # build ESM + CJS + .d.ts via rollup
npm test               # run 104 fixture tests (mocha)
npm pack --dry-run     # verify only dist/ is published
```

## Grammar highlights

- External tokenizer (`src/tokens.js`) for block comments (`--[=[ ... ]=]`), long strings (`[=[ ... ]=]`), and interpolated strings (backtick, `{expr}`, escapes) — contextual (`stack.canShift`) to avoid conflict with normal strings.
- `continue` disambiguation via GLR `~cont` split: `continue` is `VariableName` when followed by `=`, `,`, `(`, `[`, `.`, `:` and `ContinueStatement` otherwise.
- `type` / `export` / `typeof` treated as contextual keywords via `~type` GLR, allowing `local type = 10` and `type{}` call vs `type Foo = number`.
- String interpolation: `` `a {b} c {d+e} f` `` → `InterpolatedString` with `InterpContent` + `Interpolation{ "{" Expression "}" }`.
- Types: `UnionType`, `IntersectionType`, `OptionalType` (`?`), `ParenType` (`(A, B)`), `TableType`, `FunctionType` (`(a: number) -> string` with `FuncParam`), `GenericType` (`Foo<T>`), `TypeofType` (`typeof(x)`), `TypeParams` (`<T...>`).

## Known limitations

- Type analysis/inference is out of scope — this package only provides
  syntax highlighting and parsing, not semantic type checking.
- `goto` and labels are not supported (Luau doesn't have them).
- Module/package system (`require`) is runtime-level, not part of the grammar.
- Autocomplete for Roblox APIs is out of scope (use a separate language server).
