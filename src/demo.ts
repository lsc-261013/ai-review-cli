export const DEMO_REPORT = `## Issues Found

### 🔴 CRITICAL Hardcoded API Key in Source Code
- **Line:** 12
- **Problem:** Anthropic API key is hardcoded directly in the source file. If committed to git, anyone can use it.
- **Fix:** Move the API key to environment variable: \`process.env.API_KEY\`, and add \`.env\` to \`.gitignore\`.

### 🟠 HIGH Missing Error Handling in API Call
- **Line:** 45-52
- **Problem:** The \`fetch()\` API call to \`/v1/chat/completions\` has no try/catch wrapper. Network failures or API errors would crash the CLI ungracefully.
- **Fix:**
\`\`\`ts
try {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(\`API error \${res.status}\`)
  return await res.json()
} catch (err) {
  console.error('Review failed:', err.message)
  process.exit(1)
}
\`\`\`

### 🟠 HIGH File Read Without Encoding Check
- **Line:** 28
- **Problem:** \`fs.readFileSync(p, 'utf-8')\` blindly reads all matched files. Binary files with matching extensions could crash the parser and produce garbled output.
- **Fix:** Add a content-length check before reading, skip files larger than 1MB or with binary signatures.

### 🟡 MEDIUM Prompt Truncation Risk
- **Line:** 62
- **Problem:** When reviewing large projects, the combined prompt may exceed the LLM's context window. Currently only limits to 20 files without calculating total token count.
- **Fix:** Add a rough token estimator (1 char ≈ 0.25 tokens) and cap at the model's context limit (e.g., 64K for DeepSeek). Show a warning when truncation occurs.

### 🟡 MEDIUM Missing Input Validation for Paths
- **Line:** 18
- **Problem:** User-provided paths are passed directly to \`fs.statSync()\` without validation. Non-existent paths throw unhandled exceptions.
- **Fix:** Add \`fs.existsSync(p)\` check before calling \`fs.statSync()\`, and skip non-existent paths with a warning.

### 🔵 LOW Magic Number in Code File Detection
- **Line:** 45
- **Problem:** The list of supported file extensions is hardcoded. Adding support for a new language requires editing the source code.
- **Fix:** Move the extension list to a config file or accept it via CLI flag \`--ext\`. Make it overrideable with \`--ext .ts,.tsx,.js\`.

### 🔵 LOW Inconsistent Console Output Formatting
- **Line:** 10, 35, 52
- **Problem:** Some console messages use \`chalk\` for coloring while others use raw strings with emoji prefixes. The mixed styling makes the output feel inconsistent.
- **Fix:** Define a consistent format: use \`chalk.bold()\` for section headers, \`chalk.gray()\` for metadata, and reserve emoji only for severity indicators.

## Summary
- Total issues: 7
- Critical: 1 | High: 2 | Medium: 2 | Low: 2
- Overall: The core logic is solid, but needs hardening around error handling, security (API key management), and edge cases before production use.`
