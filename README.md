# visual-skill

The `/visual` agent skill by [@Nuu-maan](https://github.com/Nuu-maan). It turns a song and an idea into a hand-painted watercolour or stop-motion music video, rendered entirely from code. Also on [qala.lol](https://qala.lol/numan/visual).

It follows the open [Agent Skills](https://agentskills.io) standard, so it works in Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Goose, and any other agent that supports the format.

## Install

```bash
npx skills add https://qala.lol/numan/visual
```

Or straight from GitHub:

```bash
npx skills add https://github.com/Nuu-maan/visual-skill/tree/main/skills/visual
```

Or as a Claude Code plugin:

```
/plugin marketplace add Nuu-maan/visual-skill
/plugin install visual@visual
```

Or by hand, by copying `skills/visual` into your agent's skills folder:

```bash
git clone https://github.com/Nuu-maan/visual-skill
cp -r visual-skill/skills/visual ~/.claude/skills/     # Claude Code
cp -r visual-skill/skills/visual ~/.codex/skills/      # Codex
```

Requirements: Node 18+, ffmpeg, and Chrome or Chromium. Optional: [uv](https://docs.astral.sh/uv/) for automatic tempo and lyric timing.

## Use

```
/visual a stop motion music video for my song audio=~/Music/track.mp3
/visual how a black hole forms — playful explainer for kids — len=45s
```

See [skills/visual](skills/visual) for what it does and how it works.

## Layout

| Path | Role |
| :--- | :--- |
| `skills/visual/SKILL.md` | The agent's workflow: brief, storyboard, paint, check, render |
| `skills/visual/GUIDE.md` | Painting API and style bar for chapter authors |
| `skills/visual/engine/` | The renderer: p5.brush painting core, timeline, character rigs, stop-motion kit, headless render and encode |
| `.claude-plugin/marketplace.json` | Claude Code plugin marketplace |

## Security

Skills are instructions an agent follows, and this one runs `npm install`, Node and ffmpeg in the project folder it creates. Read `SKILL.md` and `engine/render.mjs` before using it. It fetches nothing at runtime beyond npm packages and Google Fonts.

## License

MIT. See [LICENSE](LICENSE).
