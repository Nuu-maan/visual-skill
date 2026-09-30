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


  pencil: {
    pal: { paper: '#F8F6F0' },
    face: '"Patrick Hand"',
    wipeCols: [['#F8F6F0', '#ECE9E1']],
    stroke: (c, b, w) => [c === PAL.ink ? '#45454F' : c, b === 'inkfine' ? 'HB' : '2B', w * 1.3],
    shape: (o, pts) => {
      if (!o.wash) return o.fill ? { ...o, fillOp: (o.fillOp ?? 170) * .6 } : o;
      const big = isBackdrop(pts);
      return { ...o, wash: mixCol(o.wash, PAL.paper, big ? .8 : .5), washOp: (o.washOp ?? 255) * .8,
        hatch: o.hatch || (big ? null : { d: 7, a: .8, o: { rand: .35 }, b: 'cpencil', c: o.wash, w: .8 }) };
    },
    post(c, t) {
      c.fillStyle = '#DDD9CF';
      for (const dx of [-260, 0, 260]) { c.beginPath(); c.ellipse(W / 2 + dx, H - 34, dx ? 34 : 20, 12, 0, 0, TAU); c.fill(); }
      c.font = '34px "Patrick Hand"'; c.fillStyle = 'rgba(70,70,80,.8)'; c.textAlign = 'right';
      c.fillText(String(Math.round(t * (SONG.fps || 24)) + 1).padStart(4, '0'), W - 48, 60);
    }
  },

};

const LOOK_NAME = new URLSearchParams(location.search).get('look') || SONG.look || 'watercolor';
const LOOK = LOOKS[LOOK_NAME];
if (!LOOK) throw new Error(`unknown look "${LOOK_NAME}"; pick one of ${Object.keys(LOOKS).join(', ')}`);
Object.assign(PAL, LOOK.pal);
