// song.js: the only per-video config. Read by the page and by render.mjs.
const SONG = {
  dur: 12,                    // seconds
  look: 'watercolor',         // watercolor, chalk, pencil, film or neon (see looks.js)
  fps: 24,                    // 12 for stop motion and pencil tests; read by every render.mjs command
  bpm: 100,                   // beat grid for pulse()/move(); use the track's tempo when there is audio
  offset: 0,                  // time of the first downbeat
  audio: null,                // e.g. 'assets/track.mp3'; null renders a silent video
  wipes: [6],                 // chapter-break times that get a brush wipe
  chapters: ['c01_demo'],     // files in src/ch/, loaded in order
  lyrics: []                  // [[start, end, text], ...] for the karaoke bar; empty = no captions
};
