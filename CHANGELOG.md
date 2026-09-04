# Changelog

## 0.1.1
- Fix fold logic using foldBlockLike

## 0.1.0

- Initial release: Luau language support for CodeMirror 6
- Full Lua 5.1 baseline compatibility (chunk, block, assignment, compound assignment, calls, do/while/repeat/if/for, functions, locals, tables, strings, numbers, comments, operators, vararg)
- Luau extensions: type annotations (`: Type`, `:: Type`), type aliases (`type Name = Type`), generic types (`type Pair<T>`), variadic packs (`T...`, `...T`), union/intersection/optional types (`|`, `&`, `?`), type casts, compound assignments (8 operators), `continue` (context-sensitive), string interpolation (backtick `` `...{expr}...` ``), if expressions (`if c then a else b` with `elseif` chains), bitwise operators (`& | ~ << >>`), extended string escapes (`\x`, `\u`, `\z`), extended numeric literals (hex `0x`, binary `0b`, underscore separators), function attributes (`@[attribute]`), `export type`, `typeof` types, named function types (`(a: number) -> string`), type checking directives (`--!strict` etc.)
- Correct operator precedence: `or` < `and` < `if` < `cmp` < `..` (right) < `+ -` < `* / // %` < `&` < `~` < `|` < `<< >>` < `^` (right) < unary
- External tokenizer for block comments (`--[[ ... ]]` with equals), long strings (`[[ ... ]]`), and interpolated strings (backtick with `{expr}` and escapes)
- Syntax highlighting via `@lezer/highlight` (keywords, atoms, strings, numbers, comments, types, operators, attributes)
- Indentation with `delimitedIndent` for blocks, tables, function bodies; folding for blocks, long strings, interpolated strings, block comments
- 104 fixture tests (73 baseline + 31 complex) covering all Lua 5.1 and Luau-specific constructs, including `export type`, `typeof`, named function types, vararg packs, and edge cases
- Dual build (ESM `dist/index.js` + CJS `dist/index.cjs`) + `dist/index.d.ts`, `sideEffects: false`, `exports` field, ready for `npm publish --access public`
