#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { reviewCode, ReviewMode } from './reviewer'

const program = new Command()

program
  .name('ai-review')
  .description('AI-powered code review — call Claude API to review your code')
  .version('1.0.0')
  .argument('[paths...]', 'Files or directories to review (default: ./src)')
  .option('-m, --mode <mode>', 'Review mode: full | security | performance', 'full')
  .option('-k, --api-key <key>', 'Anthropic API key (or set ANTHROPIC_API_KEY env)')
  .option('--model <model>', 'Claude model to use', 'claude-sonnet-4-6')
  .option('--max-tokens <n>', 'Max output tokens', '8000')
  .option('--output <file>', 'Save report to file')
  .action(async (paths: string[], options) => {
    const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      console.error(chalk.red('Error: API key required. Use -k <key> or set ANTHROPIC_API_KEY env.'))
      process.exit(1)
    }

    const targetPaths = paths.length > 0 ? paths : ['./src']
    const mode = options.mode as ReviewMode

    if (!['full', 'security', 'performance'].includes(mode)) {
      console.error(chalk.red(`Error: Invalid mode "${mode}". Use: full | security | performance`))
      process.exit(1)
    }

    console.log(chalk.cyan(`\n🔍 AI Code Review — ${mode.toUpperCase()} mode`))
    console.log(chalk.gray(`   Scanning: ${targetPaths.join(', ')}`))
    console.log(chalk.gray(`   Model: ${options.model}\n`))

    try {
      const report = await reviewCode({
        paths: targetPaths,
        mode,
        apiKey,
        model: options.model,
        maxTokens: parseInt(options.maxTokens),
      })

      console.log(report)
      console.log(chalk.green('\n✅ Review complete.\n'))

      if (options.output) {
        const fs = require('fs')
        fs.writeFileSync(options.output, report, 'utf-8')
        console.log(chalk.gray(`Report saved to ${options.output}`))
      }
    } catch (err: any) {
      console.error(chalk.red(`\nError: ${err.message}`))
      if (err.status === 401) {
        console.error(chalk.red('Authentication failed — check your API key.'))
      }
      process.exit(1)
    }
  })

program.parse()
