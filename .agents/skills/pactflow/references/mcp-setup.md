# SmartBear MCP Server — Installation & Configuration

> Source: https://github.com/SmartBear/smartbear-mcp

The `@smartbear/mcp` package exposes all `contract-testing_*` tools as a Model Context Protocol (MCP) server. You need to install and configure it before any of those tools are available.

---

## Prerequisites

- **Node.js 20+** — required to run the MCP server
- **PactFlow account** (Cloud) or a self-hosted **Pact Broker** instance
- An API token or username/password for your broker

---

## Authentication

### PactFlow Cloud

1. Go to `app.pactflow.io/settings/api-tokens`
2. Create a read/write token
3. Copy the token value — you'll use it as `PACT_BROKER_TOKEN`

### Open-source Pact Broker

Use `PACT_BROKER_USERNAME` and `PACT_BROKER_PASSWORD` instead of a token.

---

## Environment Variables

| Variable               | Required for       | Description                                                 |
| ---------------------- | ------------------ | ----------------------------------------------------------- |
| `PACT_BROKER_BASE_URL` | All                | Full URL to your broker, e.g. `https://yourorg.pactflow.io` |
| `PACT_BROKER_TOKEN`    | PactFlow Cloud     | API token from the settings page                            |
| `PACT_BROKER_USERNAME` | Open-source broker | HTTP Basic Auth username                                    |
| `PACT_BROKER_PASSWORD` | Open-source broker | HTTP Basic Auth password                                    |

Use token **or** username/password — not both.

---

## Configuration by Client

### Claude Code (CLI)

```bash
claude mcp add --transport stdio smartbear node mcp
```

Then set environment variables in your shell profile (`~/.zshrc`, `~/.bashrc`):

**PactFlow Cloud (token):**

```bash
export PACT_BROKER_BASE_URL="https://yourorg.pactflow.io"
export PACT_BROKER_TOKEN="your-api-token"
```

**Open-source Pact Broker (username/password):**

```bash
export PACT_BROKER_BASE_URL="https://your-self-hosted-broker.example.com"
export PACT_BROKER_USERNAME="your-username"
export PACT_BROKER_PASSWORD="your-password"
```

Or pass them inline when starting a session:

```bash
PACT_BROKER_BASE_URL=https://yourorg.pactflow.io \
PACT_BROKER_TOKEN=your-token \
claude
```

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

**PactFlow Cloud (token):**

```json
{
  "mcpServers": {
    "smartbear": {
      "command": "npx",
      "args": ["-y", "@smartbear/mcp@latest"],
      "env": {
        "PACT_BROKER_BASE_URL": "https://yourorg.pactflow.io",
        "PACT_BROKER_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Open-source Pact Broker (username/password):**

```json
{
  "mcpServers": {
    "smartbear": {
      "command": "npx",
      "args": ["-y", "@smartbear/mcp@latest"],
      "env": {
        "PACT_BROKER_BASE_URL": "https://your-self-hosted-broker.example.com",
        "PACT_BROKER_USERNAME": "your-username",
        "PACT_BROKER_PASSWORD": "your-password"
      }
    }
  }
}
```

### VS Code (with Copilot or Claude extension)

Create or edit `.vscode/mcp.json` in your project root:

**PactFlow Cloud (token):**

```json
{
  "servers": {
    "smartbear": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@smartbear/mcp@latest"],
      "env": {
        "PACT_BROKER_BASE_URL": "https://yourorg.pactflow.io",
        "PACT_BROKER_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Open-source Pact Broker (username/password):**

```json
{
  "servers": {
    "smartbear": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@smartbear/mcp@latest"],
      "env": {
        "PACT_BROKER_BASE_URL": "https://your-self-hosted-broker.example.com",
        "PACT_BROKER_USERNAME": "your-username",
        "PACT_BROKER_PASSWORD": "your-password"
      }
    }
  }
}
```

### Cursor

Edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

**PactFlow Cloud (token):**

```json
{
  "mcpServers": {
    "smartbear": {
      "command": "npx",
      "args": ["-y", "@smartbear/mcp@latest"],
      "env": {
        "PACT_BROKER_BASE_URL": "https://yourorg.pactflow.io",
        "PACT_BROKER_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Open-source Pact Broker (username/password):**

```json
{
  "mcpServers": {
    "smartbear": {
      "command": "npx",
      "args": ["-y", "@smartbear/mcp@latest"],
      "env": {
        "PACT_BROKER_BASE_URL": "https://your-self-hosted-broker.example.com",
        "PACT_BROKER_USERNAME": "your-username",
        "PACT_BROKER_PASSWORD": "your-password"
      }
    }
  }
}
```

---

## Global Install (optional)

If you prefer a global install over `npx`:

```bash
npm install -g @smartbear/mcp
```

Then replace `"command": "npx", "args": ["-y", "@smartbear/mcp@latest"]` with `"command": "node", "args": ["mcp"]` in the configs above, or just use:

```bash
# Claude Code global install variant
claude mcp add --transport stdio smartbear node mcp
```

---

## Verify the Connection

### Using MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx @smartbear/mcp@latest
```

This opens a browser UI where you can call tools directly to confirm authentication is working.

### Quick check via Claude Code

Once configured, ask Claude:

```
List the environments in my PactFlow workspace
```

Claude will call `contract-testing_list_environments` and return the results if the connection is working.

---

## Troubleshooting

| Symptom               | Likely cause                    | Fix                                                                  |
| --------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `401 Unauthorized`    | Wrong or missing token          | Check `PACT_BROKER_TOKEN` is set and matches the API token           |
| `404 Not Found`       | Wrong broker URL                | Verify `PACT_BROKER_BASE_URL` — no trailing slash, correct subdomain |
| Tools not showing     | MCP server not starting         | Run `npx @smartbear/mcp@latest` in a terminal to see startup errors  |
| AI tools return `401` | Missing PactFlow AI entitlement | Call `contract-testing_check_pactflow_ai_entitlements` to diagnose   |

---

## Open-source Pact Broker config example

```json
{
  "mcpServers": {
    "smartbear": {
      "command": "npx",
      "args": ["-y", "@smartbear/mcp@latest"],
      "env": {
        "PACT_BROKER_BASE_URL": "https://your-self-hosted-broker.example.com",
        "PACT_BROKER_USERNAME": "admin",
        "PACT_BROKER_PASSWORD": "your-password"
      }
    }
  }
}
```

Note: AI generation, BDCT, and team metrics tools require PactFlow Cloud and will not work with an open-source Pact Broker.
