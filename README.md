# ai-review-cli

> AI-powered code review CLI — 用 Claude API 自动审查代码

一个命令行工具：敲一行命令，AI 自动扫描代码目录，输出结构化审查报告（安全问题、Bug、代码规范、性能风险）。

**这个项目是 AI-native 开发的实践：** 全程使用 Claude Code 辅助编码，通过精心设计的 System Prompt 让 LLM 扮演资深 Code Reviewer。

---

## 安装

```bash
npm install
npm run build
npm link
```

## 使用

设置 API Key：
```bash
export ANTHROPIC_API_KEY="sk-ant-xxx"
```

审查整个项目：
```bash
ai-review ./src
```

只查安全问题：
```bash
ai-review ./src --mode security
```

只查性能问题：
```bash
ai-review ./src --mode performance
```

保存报告：
```bash
ai-review ./src --output review-report.md
```

---

## 工作原理

```
代码文件 → 拼装 Prompt → 调用 Claude API → 解析输出 → 格式化报告
```

- **System Prompt**：告诉 Claude 它是资深代码审查员，定义输出格式和严重度分级
- **Review Modes**：full（全面）/ security（OWASP）/ performance（性能）
- **输出**：🔴严重 🟠高危 🟡中危 🔵低危，含行号和修复建议

---

## 技术栈

- TypeScript + Node.js
- Anthropic SDK (Claude API)
- Commander (CLI 框架)
- Chalk (终端颜色)

---

## 作者

一位用 AI 构建产品的开发者。

GitHub: [@lsc-261013](https://github.com/lsc-261013)
