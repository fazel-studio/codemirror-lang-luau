import { LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, delimitedIndent, foldInside } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"
import { parser } from "./parser.js"
import { completeFromList } from "@codemirror/autocomplete"
import type { SyntaxNode } from "@lezer/common"
import type { EditorState } from "@codemirror/state"

function foldBlockLike(node: SyntaxNode, state: EditorState) {
  let firstLine = state.doc.lineAt(node.from);
  let lastLine = state.doc.lineAt(node.to);
  return firstLine.number < lastLine.number ? {from: firstLine.to, to: lastLine.from - 1} : null;
}

const configuredParser = parser.configure({
  props: [
    styleTags({
      // Keywords (Lua 5.1 baseline)
      "and or not": t.logicOperator,
      "if then else elseif end": t.controlKeyword,
      "while do repeat until": t.controlKeyword,
      "for in": t.controlKeyword,
      "function local": t.definitionKeyword,
      "return break": t.controlKeyword,
      "nil true false": t.atom,
      // Luau-specific keywords
      "continue": t.controlKeyword,
      "type export typeof": t.definitionKeyword,
      // Names
      "Identifier": t.name,
      "FunctionName": t.function(t.definition(t.variableName)),
      "VariableName": t.variableName,
      "Param": t.variableName,
      "FuncParam": t.variableName,
      "TypeName": t.typeName,
      "TypeParam": t.typeName,
      "TypeParams": t.typeName,
      "TypeArgs": t.typeName,
      // Literals
      "Number": t.number,
      "String": t.string,
      "LongString": t.string,
      "InterpolatedString": t.special(t.string),
      "InterpContent": t.special(t.string),
      "Interpolation": t.special(t.string),
      // Comments
      "LineComment": t.lineComment,
      "BlockComment": t.blockComment,
      // Type annotations (Luau-specific)
      "TypeAnno": t.typeName,
      "ReturnTypeAnno": t.typeName,
      "TypeAlias": t.definition(t.typeName),
      "ExportTypeAlias": t.definition(t.typeName),
      "Type": t.typeName,
      "TypeList": t.typeName,
      "UnionType IntersectionType OptionalType PrimaryType SimpleType GenericType ParenType TableType FunctionType TypeofType": t.typeName,
      "FuncParamList FuncParam": t.typeName,
      "TypeFieldList TypeField": t.typeName,
      // Operators
      "\"+\" \"-\" \"*\" \"/\" \"^\" \"%\" \"//\"": t.arithmeticOperator,
      "\"&\" \"|\" \"~\" \"<<\" \">>\"": t.bitwiseOperator,
      "\"<\" \">\" \"<=\" \">=\" \"==\" \"~=\"": t.compareOperator,
      "\"..\"": t.string,
      "\"#\"": t.operator,
      // Compound assignment (Luau-specific)
      "\"+=\" \"-=\" \"*=\" \"/=\" \"//=\" \"%=\" \"^=\" \"..=\"": t.operator,
      // Punctuation
      "\"(\" \")\"": t.paren,
      "\"[\" \"]\"": t.squareBracket,
      "\"{\" \"}\"": t.brace,
      "\".\" \",\" \";\" \":\" \"::\" \"->\" \"=\"": t.punctuation,
      // Table field
      "Field": t.propertyName,
      "TypeField": t.propertyName,
      // Attributes (Luau-specific)
      "Attribute": t.annotation,
      "CompoundOp": t.operator,
      "CompareOp": t.compareOperator,
    }),
    indentNodeProp.add({
      DoBlock: delimitedIndent({ closing: "end" }),
      WhileBlock: delimitedIndent({ closing: "end" }),
      RepeatBlock: delimitedIndent({ closing: "until" }),
      IfStatement: delimitedIndent({ closing: "end" }),
      ForBlock: delimitedIndent({ closing: "end" }),
      FunctionBody: delimitedIndent({ closing: "end" }),
      TableConstructor: delimitedIndent({ closing: "}" }),
      TableType: delimitedIndent({ closing: "}" }),
    }),
    foldNodeProp.add({
      DoBlock: foldBlockLike,
      WhileBlock: foldBlockLike,
      RepeatBlock: foldBlockLike,
      IfStatement: foldBlockLike,
      ForBlock: foldBlockLike,
      FunctionDeclaration: foldBlockLike,
      FunctionDef: foldBlockLike,
      TableConstructor: (node) => ({from: node.from + 1, to: node.to - 1}),
      TableType: (node) => ({from: node.from + 1, to: node.to - 1}),
      LongString: (node) => ({ from: node.from, to: node.to }),
      InterpolatedString: (node) => ({ from: node.from, to: node.to }),
      BlockComment: (node) => ({ from: node.from, to: node.to }),
    }),
  ],
})

export const luauLanguage = LRLanguage.define({
  parser: configuredParser,
  languageData: {
    commentTokens: { line: "--", block: { open: "--[[", close: "]]" } },
    indentOnInput: /^\s*(end|else|elseif|until|\)|\])$/,
    closeBrackets: { brackets: ["(", "[", "{", '"', "'", "`"] },
    wordChars: "_",
    autocomplete: completeFromList([
      {label: "and", type: "keyword"},
      {label: "break", type: "keyword"},
      {label: "continue", type: "keyword"},
      {label: "do", type: "keyword"},
      {label: "else", type: "keyword"},
      {label: "elseif", type: "keyword"},
      {label: "end", type: "keyword"},
      {label: "export", type: "keyword"},
      {label: "false", type: "keyword"},
      {label: "for", type: "keyword"},
      {label: "function", type: "keyword"},
      {label: "if", type: "keyword"},
      {label: "in", type: "keyword"},
      {label: "local", type: "keyword"},
      {label: "nil", type: "keyword"},
      {label: "not", type: "keyword"},
      {label: "or", type: "keyword"},
      {label: "repeat", type: "keyword"},
      {label: "return", type: "keyword"},
      {label: "then", type: "keyword"},
      {label: "true", type: "keyword"},
      {label: "type", type: "keyword"},
      {label: "typeof", type: "keyword"},
      {label: "until", type: "keyword"},
      {label: "while", type: "keyword"},
      // builtin types
      {label: "any", type: "type"},
      {label: "boolean", type: "type"},
      {label: "buffer", type: "type"},
      {label: "never", type: "type"},
      {label: "number", type: "type"},
      {label: "string", type: "type"},
      {label: "thread", type: "type"},
      {label: "table", type: "type"},
      // builtin functions (Luau + Lua 5.1)
      {label: "assert", type: "function"},
      {label: "error", type: "function"},
      {label: "getmetatable", type: "function"},
      {label: "ipairs", type: "function"},
      {label: "next", type: "function"},
      {label: "pairs", type: "function"},
      {label: "pcall", type: "function"},
      {label: "print", type: "function"},
      {label: "require", type: "function"},
      {label: "select", type: "function"},
      {label: "setmetatable", type: "function"},
      {label: "tonumber", type: "function"},
      {label: "tostring", type: "function"},
      {label: "typeof", type: "function"},
      {label: "unpack", type: "function"},
      {label: "xpcall", type: "function"},
    ])
  },
})

export function luau() {
  return new LanguageSupport(luauLanguage)
}
