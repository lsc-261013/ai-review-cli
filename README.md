# ai-review-cli

> AI-powered code review CLI — 调用 AI 自动审查代码

一个命令行工具：敲一行命令，AI 自动扫描代码目录，输出结构化审查报告（安全问题、Bug、代码规范、性能风险）。支持可视化的 HTML 报告。

**支持国产大模型：** DeepSeek、Moonshot（月之暗面）、通义千问等，国内直接可用。

---

## 安装

```bash
npm install --registry https://registry.npmmirror.com
npm run build
npm link
```

## 配置 API Key

去对应平台注册获取 Key：

| 平台 | 注册地址 | 价格 |
|------|---------|------|
| **DeepSeek** | [platform.deepseek.com](https://platform.deepseek.com) | ¥1/百万 tokens |
| **Moonshot** | [platform.moonshot.cn](https://platform.moonshot.cn) | 注册送 ¥15 |
| **通义千问** | [dashscope.aliyun.com](https://dashscope.aliyun.com) | 有免费额度 |

设置环境变量：
```bash
export API_KEY="sk-xxx"
```

## 使用

```bash
# 用 DeepSeek 审查（默认，推荐国内用户）
ai-review ./src

# 指定 provider
ai-review ./src -p moonshot
ai-review ./src -p qwen
ai-review ./src -p anthropic

# 审查模式
ai-review ./src -m security    # 只查安全问题
ai-review ./src -m performance # 只查性能问题

# 生成可视化 HTML 报告
ai-review ./src --html
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
