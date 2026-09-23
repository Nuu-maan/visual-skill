# /visual

An agent skill that turns a song and an idea into a hand-painted animated music video, made entirely from code.

Every frame is a pure function of time, painted with [p5.brush](https://github.com/acamposuribe/p5.brush) watercolour and ink, rendered in headless Chrome, and joined with the audio by ffmpeg. The agent writes a storyboard, splits the song into chapters, paints each chapter (in parallel with subagents for long songs), checks its own work on contact sheets and renders the MP4.

Two looks:
- **Watercolour cartoon:** picture-book characters, theatre sets, karaoke lyrics.
- **Stop motion:** clay puppets, paper-cutout sets with drop shadows, props on visible threads, and replacement jitter, rendered on twos at 12 fps.

## Install

Install it with one command from [qala.lol](https://qala.lol/numan/visual):

```bash
npx skills add https://qala.lol/numan/visual
```

It works in any agent that supports the [Agent Skills](https://agentskills.io) standard: Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Goose, and others. By default it installs into the current project. To choose where it goes:

```bash
npx skills add https://qala.lol/numan/visual -g                  # every project (user-level)
npx skills add https://qala.lol/numan/visual -a claude-code      # Claude Code only
npx skills add https://qala.lol/numan/visual -a codex            # Codex only
```

Or install by hand:

```bash
git clone https://github.com/Nuu-maan/visual-skill ~/.claude/skills/visual
```

Requirements: Node 18+, ffmpeg, and Chrome or Chromium. Optional: [uv](https://docs.astral.sh/uv/), for automatic tempo detection and lyric timing.

## Use

```
/visual <topic> — <tone and style> — <scene ideas> [audio=path/to/song.mp3] [bpm=N] [out=dir]
```

Examples:

```
/visual a stop motion video for my song audio=~/Music/track.mp3
/visual how a black hole forms — playful explainer for kids — len=45s
```

The agent sets up a project in `./videos/<slug>`, writes `STORYBOARD.md`, paints the chapters, and renders `out/video.mp4`.

## How it works

| Path | Role |
|---|---|
| `SKILL.md` | The agent's workflow: read the brief, storyboard, paint, check, render |
| `GUIDE.md` | Painting API and style bar for chapter authors |
| `engine/src/core.js` | Brush wrappers, geometry, timing, camera, lettering |
| `engine/src/timeline.js` | Chapters, brush-wipe transitions, karaoke |
| `engine/src/clawd.js`, `cast.js` | Ready-made cartoon characters |
| `engine/src/stopmotion.js` | Clay puppets and stop-motion helpers |
| `engine/render.mjs` | Contact sheets, preview clips, resumable parallel frame render, encode |

Render commands, run inside a project:

```bash
node render.mjs --sheet=10,12.5,15 --out=out/check.jpg   # contact sheet
node render.mjs --clip=0:10 --out=out/preview.mp4       # preview with sound
node render.mjs --frames --workers=4 [--fps=12]         # all frames, resumable
node render.mjs --encode [--fps=12] --out=out/video.mp4
```
