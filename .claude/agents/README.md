# Ghanem.one — Claude Code Agents

9 specialized agents untuk eksekusi roadmap dari Phase 6 (Handoff) sampai Phase 14 (Post-Launch).

## Cara Pakai

Agent dipanggil dari Claude Code via tool `Agent` dengan parameter `subagent_type`:

```
Agent({
  description: "Generate handoff documentation",
  subagent_type: "documentation-agent",
  prompt: "Generate OpenAPI 3.0 contract dari src/ai/flows/ — output ke docs/api-contract.md"
})
```

Atau dari CLI Claude Code, sebut nama agent saat mendelegasikan task.

## Daftar Agents

| # | Agent | Fase | Mode |
|---|---|---|---|
| 1 | [documentation-agent](./documentation-agent.md) | Phase 6 | Sekuensial |
| 2 | [devops-agent](./devops-agent.md) | Phase 7, 10, 12-14 | Sekuensial |
| 3 | [frontend-agent](./frontend-agent.md) | Phase 8 | Paralel dgn BE+GIS |
| 4 | [backend-agent](./backend-agent.md) | Phase 9 | Paralel dgn FE+GIS |
| 5 | [gis-agent](./gis-agent.md) | Phase 9 | Paralel dgn FE+BE |
| 6 | [security-agent](./security-agent.md) | Phase 10 | Sekuensial |
| 7 | [qa-agent](./qa-agent.md) | Phase 11 | Sekuensial |
| 8 | [performance-agent](./performance-agent.md) | Phase 12 | Sekuensial |
| 9 | [launch-sre-agent](./launch-sre-agent.md) | Phase 13-14 | Sekuensial + ongoing |

## Orchestration Timeline

```
Wk 1     │ ████ documentation-agent
Wk 2     │ ████ devops-agent
Wk 3-10  │ ████ frontend-agent  ─┐
         │ ████ backend-agent   ├─ PARALEL (3 agents concurrent)
         │ ████ gis-agent      ─┘
Wk 11-12 │ ████ security-agent
Wk 13-15 │ ████ qa-agent
Wk 16-17 │ ████ performance-agent
Wk 18    │ ████ launch-sre-agent
Wk 19+   │ ████ launch-sre-agent (ongoing)
```

## Konvensi

- Setiap agent file: frontmatter (`name`, `description`, `tools`, `model`) + system prompt body
- `description` field harus eksplisit kapan harus invoke — Claude Code pakai ini untuk routing otomatis
- `tools` field membatasi akses tool (least-privilege). Hilangkan field untuk akses semua tool
- `model: sonnet` default; ganti `opus` untuk task yang butuh reasoning lebih dalam (e.g., security audit, architecture review)

## Update Agent

Edit file `.md` langsung — Claude Code reload otomatis. Untuk perubahan besar (tools/model), restart session.

## Reference

- Roadmap lengkap: [todolist.md](../../todolist.md)
- Claude Code agents docs: https://docs.claude.com/en/docs/claude-code/sub-agents
