// looks.js: the rendering style of the whole video, picked by SONG.look (or ?look= in the page URL).
// A look can recolour PAL, restyle every paint() shape and line, replace the paper, swap the chapter wipe and the
// lettering font, and post-process the finished frame. Rigs and chapters don't change between looks.

const LIGHT = c => mixCol(c, '#FFFFFF', .45);
const isBackdrop = pts => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return (x1 - x0) * (y1 - y0) > W * H * .3;
};

const LOOKS = {
  watercolor: {},

  chalk: {
    pal: { paper: '#2F3E38' },
    face: '"Cabin Sketch"', weight: 700,
    wipeCols: [['#3A4A43', '#44564E'], ['#35453F', '#3F5049']],
    brushes() {
      brush.add('chalk', { type: 'default', weight: 6, scatter: .7, sharpness: .35, grain: 9, opacity: 200, spacing: .3, pressure: [1.1, .8], rotate: 'natural', noise: .6 });
      brush.add('chalkfine', { type: 'default', weight: 3.2, scatter: .5, sharpness: .4, grain: 9, opacity: 200, spacing: .3, pressure: [1, .8], rotate: 'natural', noise: .5 });
    },
    stroke: (c, b, w) => [c === PAL.ink ? '#EEEBE0' : LIGHT(c), b === 'inkfine' ? 'chalkfine' : 'chalk', w],
    shape: (o, pts) => !o.wash || o.hatch ? o : isBackdrop(pts)
      ? { ...o, washOp: (o.washOp ?? 255) * .3 }
      : { ...o, washOp: (o.washOp ?? 255) * .72, hatch: { d: 10, a: .7, o: { rand: .5 }, b: 'charcoal', c: LIGHT(o.wash), w: .7 } },
    ground(c, rnd) {
      for (let i = 0; i < 40; i++) {
        const x = rnd() * W, y = rnd() * H, r = 150 + rnd() * 420, g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(220,230,220,${.02 + .035 * rnd()})`); g.addColorStop(1, 'rgba(220,230,220,0)');
        c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
    }
  },

};

const LOOK_NAME = new URLSearchParams(location.search).get('look') || SONG.look || 'watercolor';
const LOOK = LOOKS[LOOK_NAME];
if (!LOOK) throw new Error(`unknown look "${LOOK_NAME}"; pick one of ${Object.keys(LOOKS).join(', ')}`);
Object.assign(PAL, LOOK.pal);
