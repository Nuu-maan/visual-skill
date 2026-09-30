// looks.js: the rendering style of the whole video, picked by SONG.look (or ?look= in the page URL).
// A look can recolour PAL, restyle every paint() shape and line, replace the paper, swap the chapter wipe and the
// lettering font, and post-process the finished frame. Rigs and chapters don't change between looks.

const LOOKS = {
  watercolor: {},
};

const LOOK_NAME = new URLSearchParams(location.search).get('look') || SONG.look || 'watercolor';
const LOOK = LOOKS[LOOK_NAME];
if (!LOOK) throw new Error(`unknown look "${LOOK_NAME}"; pick one of ${Object.keys(LOOKS).join(', ')}`);
Object.assign(PAL, LOOK.pal);
