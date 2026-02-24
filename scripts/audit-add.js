#!/usr/bin/env node
/**
 * Appends a new build/iteration entry to docs/AUDIT_TRAIL.md.
 * Version is read from package.json unless overridden with --version X.Y.Z.
 *
 * Usage: npm run audit:add -- "Change one" "Change two"
 *        npm run audit:add -- --version 1.0.0 "Release"
 *        node scripts/audit-add.js Build   (used by npm run build)
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const auditPath = join(rootDir, 'docs', 'AUDIT_TRAIL.md')

let args = process.argv.slice(2)
let version
if (args[0] === '--version' && args[1]) {
  version = args[1]
  args = args.slice(2)
} else {
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'))
  version = pkg.version || '0.0.0'
}

const messages = args.filter(Boolean)
const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

const content = readFileSync(auditPath, 'utf8')

// Find next iteration number: last "### Iteration N" in Entries section
const entriesMatch = content.match(/## Entries\n\n([\s\S]*)/)
const entriesBody = entriesMatch ? entriesMatch[1] : ''
const lastIter = entriesBody.match(/### Iteration (\d+)/g)
const nextNum = lastIter
  ? Math.max(...lastIter.map((s) => parseInt(s.replace(/\D/g, ''), 10))) + 1
  : 1

const bullets =
  messages.length > 0
    ? messages.map((m) => `- ${m}`).join('\n')
    : '- (No changes listed)'

const newEntry = `
### Iteration ${nextNum} — ${date} — v${version}

${bullets}
`

// Insert after "## Entries\n\n" so newest appears first under Entries
const insertMarker = '## Entries\n\n'
const insertAt = content.indexOf(insertMarker) + insertMarker.length
const updated =
  content.slice(0, insertAt) + newEntry.trim() + '\n\n' + content.slice(insertAt)

writeFileSync(auditPath, updated, 'utf8')
console.log(`Added iteration ${nextNum} (${date}) v${version} to docs/AUDIT_TRAIL.md`)
