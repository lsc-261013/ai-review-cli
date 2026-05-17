import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import { SYSTEM_PROMPT, fileReviewPrompt, securityReviewPrompt, perfReviewPrompt } from './prompts'

export type ReviewMode = 'full' | 'security' | 'performance'

export interface ReviewOptions {
  paths: string[]
  mode: ReviewMode
  apiKey: string
  model?: string
  maxTokens?: number
}

function collectFiles(paths: string[]): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = []

  for (const p of paths) {
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      walkDir(p, files)
    } else if (stat.isFile()) {
      if (isCodeFile(p)) {
        files.push({ path: p, content: fs.readFileSync(p, 'utf-8') })
      }
    }
  }

  return files
}

function walkDir(dir: string, files: { path: string; content: string }[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = `${dir}/${entry.name}`
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
      walkDir(full, files)
    } else if (entry.isFile() && isCodeFile(full)) {
      files.push({ path: full, content: fs.readFileSync(full, 'utf-8') })
    }
  }
}

function isCodeFile(path: string): boolean {
  const ext = path.split('.').pop() || ''
  return ['ts', 'tsx', 'js', 'jsx', 'vue', 'py', 'go', 'rs', 'java', 'cs', 'rb', 'php', 'c', 'cpp', 'h', 'css', 'scss', 'html'].includes(ext)
}

function buildMessages(files: { path: string; content: string }[], mode: ReviewMode, maxFiles: number) {
  const selected = files.slice(0, maxFiles)
  let prompt = ''

  for (const f of selected) {
    if (mode === 'security') {
      prompt += securityReviewPrompt(f.path, f.content) + '\n\n---\n\n'
    } else if (mode === 'performance') {
      prompt += perfReviewPrompt(f.path, f.content) + '\n\n---\n\n'
    } else {
      prompt += fileReviewPrompt(f.path, f.content) + '\n\n---\n\n'
    }
  }

  if (files.length > maxFiles) {
    prompt += `\n(Showing ${maxFiles} of ${files.length} files. Use --max-files to adjust.)`
  }

  return prompt
}

export async function reviewCode(options: ReviewOptions): Promise<string> {
  const { paths, mode, apiKey, model = 'claude-sonnet-4-6', maxTokens = 8000 } = options

  const files = collectFiles(paths)
  if (files.length === 0) {
    return 'No code files found in the specified paths.'
  }

  const prompt = buildMessages(files, mode, 20)
  const anthropic = new Anthropic({ apiKey })

  const msg = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  return text
}
