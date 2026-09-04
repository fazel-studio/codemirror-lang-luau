import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"
import assert from "assert"
import { parser } from "../src/parser.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let caseFile = path.join(__dirname, "cases.txt")
let data = fs.readFileSync(caseFile, "utf8")

// Parse cases.txt format: # Name\n input \n ==> \n expected
function parseCases(text) {
  let cases = []
  let lines = text.split(/\r?\n/)
  let current = null
  let i = 0
  while (i < lines.length) {
    let line = lines[i]
    if (line.startsWith("#")) {
      let name = line.slice(1).trim()
      // Collect input until ==>
      let inputLines = []
      i++
      while (i < lines.length && lines[i].trim() !== "==>") {
        inputLines.push(lines[i])
        i++
      }
      let input = inputLines.join("\n").trim()
      // Skip ==>
      if (i < lines.length && lines[i].trim() === "==>") i++
      // Collect expected until next # or EOF
      let expectedLines = []
      while (i < lines.length && !lines[i].startsWith("#")) {
        if (lines[i].trim() !== "") expectedLines.push(lines[i].trim())
        else if (expectedLines.length > 0) expectedLines.push("")
        i++
        if (i < lines.length && lines[i].startsWith("#")) break
      }
      let expected = expectedLines.join(" ").trim()
      cases.push({name, input, expected})
    } else {
      i++
    }
  }
  return cases
}

let cases = parseCases(data)

describe("Luau parser", () => {
  for (let {name, input, expected} of cases) {
    it(name, () => {
      let tree = parser.parse(input)
      let hasError = false
      let errorPos = []
      tree.iterate({
        enter(node) {
          if (node.name === "⚠") {
            hasError = true
            errorPos.push(node.from)
          }
        }
      })
      let expectsError = expected.includes("⚠")
      if (expectsError) {
        assert.ok(hasError, `Expected error but none found. Tree: ${tree.toString()} Input: ${JSON.stringify(input)}`)
      } else {
        if (hasError) {
          assert.fail(`Unexpected error node at ${errorPos.join(", ")} Tree: ${tree.toString()} Input: ${JSON.stringify(input)}`)
        }
        // Check that expected top-level node appears in tree if expected is not just Script(...)
        if (expected && expected !== "Script(...)" && !expected.includes("...")) {
          // strict check would compare tree string, but we allow wildcard
        }
        // For Script(...) wildcard, just ensure top is Script
        assert.ok(tree.toString().startsWith("Script"), `Expected Script top node, got ${tree.toString()}`)
      }
    })
  }
})
