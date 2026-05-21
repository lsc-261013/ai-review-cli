# ai-review-cli

> AI-powered code review CLI — 调用 AI 自动审查代码

一个命令行工具：敲一行命令，AI 自动扫描代码目录，输出结构化审查报告（安全问题、Bug、代码规范、性能风险）。支持可视化的 HTML 报告。

**支持国产大模型：** DeepSeek、Kimi、通义千问等，国内直接可用。

---

## 安装

```bash
# 1. 安装依赖（国内用 npmmirror）
npm install --registry https://registry.npmmirror.com

# 2. 编译 TypeScript
npm run build

# 3. 全局链接（可选，链接后直接敲 ai-review）
npm link
```

如果没链接，用 `node dist/index.js` 代替 `ai-review`。

## 配置 API Key

去对应平台注册获取 Key：

| 平台 | 注册地址 | 价格 |
|------|---------|------|
| **DeepSeek** | [platform.deepseek.com](https://platform.deepseek.com) | ¥1/百万 tokens |
| **Kimi** | [platform.moonshot.cn](https://platform.moonshot.cn) | 注册送 ¥15 |
| **通义千问** | [dashscope.aliyun.com](https://dashscope.aliyun.com) | 有免费额度 |

**设置环境变量：**

| 终端 | 命令 |
|------|------|
| **PowerShell** (Windows) | `$env:API_KEY="sk-xxx"` |
| **CMD** (Windows) | `set API_KEY=sk-xxx` |
| **Git Bash / Linux / Mac** | `export API_KEY="sk-xxx"` |

Or 直接用 `-k` 参数：
```bash
ai-review ./src -k sk-xxx
```

## 使用

```bash
# 演示报告（不需要 API Key）
ai-review --demo                  # 终端显示
ai-review --demo --html           # 还生成 HTML

# 真实审查
ai-review ./src                   # 默认用 DeepSeek
ai-review ./src -p kimi       # Kimi
ai-review ./src -p qwen           # 通义千问
ai-review ./src -p anthropic      # Claude

# 只查安全问题
ai-review ./src -m security

# 只查性能问题
ai-review ./src -m performance

# 审查指定目录
ai-review ./src/pages ./src/store

# 审查单个文件
ai-review ./src/index.ts

# 生成可视化 HTML 报告
ai-review ./src --html

# 保存 Markdown 报告
ai-review ./src --output report.md
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
