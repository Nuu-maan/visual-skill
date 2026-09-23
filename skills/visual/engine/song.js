// song.js: the only per-video config. Read by the page and by render.mjs.
const SONG = {
  dur: 12,                    // seconds
  bpm: 100,                   // beat grid for pulse()/move(); use the track's tempo when there is audio
  offset: 0,                  // time of the first downbeat
  audio: null,                // e.g. 'assets/track.mp3'; null renders a silent video
  wipes: [6],                 // chapter-break times that get a brush wipe
  chapters: ['c01_demo'],     // files in src/ch/, loaded in order
  lyrics: []                  // [[start, end, text], ...] for the karaoke bar; empty = no captions
};
