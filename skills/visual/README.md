# visual

Turns a song and an idea into a hand-painted animated music video, rendered entirely from code.

Give it a topic, a track and a few scene ideas. The agent listens to the song for its tempo and when each lyric is sung, writes a storyboard with a story that runs through the whole video, and splits it into chapters. It paints every chapter (in parallel with subagents on long songs), checks its own frames on contact sheets, and renders an MP4 with the audio and karaoke lyrics.

## Two looks

| Look | What you get |
| :--- | :--- |
| **Watercolour cartoon** | Picture-book characters in ink and watercolour, theatre sets, brush-stroke transitions between chapters, and beat-synced dancing |
| **Stop motion** | Clay puppets and paper-cutout sets with drop shadows; rain, stars and snow hanging on threads; hand-placed jitter; shot on twos at 12 fps |

## How it works

Every frame is a pure function of time, painted with [p5.brush](https://github.com/acamposuribe/p5.brush) in headless Chrome. Frames render in parallel and can resume after an interruption, and ffmpeg joins them with the audio.

| Stage | What happens |
| :--- | :--- |
| Listen | Detects the tempo and gets word-level lyric timing (librosa and faster-whisper via `uv`) |
| Storyboard | Writes `STORYBOARD.md`: the idea, the cast, a colour arc, and a shot table per chapter |
| Paint | One file per chapter, and every shot lands on a beat |
| Check | Contact sheets of first, last and middle frames, then fixes the weakest shots |
| Render | Estimates the time first, then renders frames with 4 workers and encodes the MP4 |

A 3-minute song (about 2,300 frames at 12 fps) renders in roughly 35 minutes on a laptop GPU.

## Install

```bash
npx skills add https://qala.lol/numan/visual
```

Works in any agent that supports the [Agent Skills standard](https://agentskills.io): Claude Code, Codex, Cursor, Copilot, Gemini CLI, OpenCode, Goose, and others.

Or install it as a Claude Code plugin:

```
/plugin marketplace add Nuu-maan/visual-skill
/plugin install visual@visual
```

Requirements: Node 18+, ffmpeg, and Chrome or Chromium. Optional: [uv](https://docs.astral.sh/uv/) for automatic tempo and lyric timing.

## Use

```
/visual a stop motion music video for my song audio=~/Music/track.mp3
/visual how a black hole forms — playful explainer for kids — len=45s
```

Or ask in your own words:

- "Make a claymation music video for this song"
- "Turn these lyrics into an animated video"
- "Make a 30-second animated explainer about photosynthesis"

The project lands in `./videos/<slug>`: the storyboard, one file per chapter, contact sheets, and `out/video.mp4`.
