import * as fs from 'fs'
import { SYSTEM_PROMPT, fileReviewPrompt, securityReviewPrompt, perfReviewPrompt } from './prompts'

export type ReviewMode = 'full' | 'security' | 'performance'

export interface ReviewOptions {
  paths: string[]
  mode: ReviewMode
  apiKey: string
  provider?: string
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

function buildPrompt(files: { path: string; content: string }[], mode: ReviewMode, maxFiles: number) {
  const selected = files.slice(0, maxFiles)
  let prompt = ''
  for (const f of selected) {
    if (mode === 'security') prompt += securityReviewPrompt(f.path, f.content) + '\n\n---\n\n'
    else if (mode === 'performance') prompt += perfReviewPrompt(f.path, f.content) + '\n\n---\n\n'
    else prompt += fileReviewPrompt(f.path, f.content) + '\n\n---\n\n'
  }
  if (files.length > maxFiles) {
    prompt += `\n(Showing ${maxFiles} of ${files.length} files.)`
  }
  return prompt
}

const PROVIDERS: Record<string, { url: string; model: string }> = {
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  kimi: {
    url: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
  },
  qwen: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
  },
}

async function callOpenAICompatible(apiKey: string, url: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`API error ${res.status}: ${errBody}`)
  }

  const data: any = await res.json()
  return data.choices?.[0]?.message?.content || JSON.stringify(data)
}

async function callAnthropic(apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`API error ${res.status}: ${errBody}`)
  }

  const data: any = await res.json()
  return data.content
    ?.filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n') || ''
}

export async function reviewCode(options: ReviewOptions): Promise<string> {
  const { paths, mode, apiKey, provider = 'deepseek', model, maxTokens = 8000 } = options

  const files = collectFiles(paths)
  if (files.length === 0) {
    return 'No code files found in the specified paths.'
  }

  const prompt = buildPrompt(files, mode, 20)

  // OpenRouter / 自定义 URL
  if (provider === 'custom') {
    const url = process.env.API_BASE_URL || 'https://api.deepseek.com/v1/chat/completions'
    const m = model || 'deepseek-chat'
    return callOpenAICompatible(apiKey, url, m, prompt, maxTokens)
  }

  // 国产大模型 (OpenAI 兼容)
  if (provider in PROVIDERS) {
    const p = PROVIDERS[provider]
    const m = model || p.model
    return callOpenAICompatible(apiKey, p.url, m, prompt, maxTokens)
  }

  // Anthropic
  if (provider === 'anthropic') {
    const m = model || 'claude-sonnet-4-6'
    return callAnthropic(apiKey, m, prompt, maxTokens)
  }

  throw new Error(`Unknown provider: ${provider}. Use: deepseek | moonshot | qwen | anthropic | custom`)
}
