import { styleTags, tags as t } from "@lezer/highlight"

export const luauHighlight = styleTags({
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
})
