// looks.js: the rendering style of the whole video, picked by SONG.look (or ?look= in the page URL).
// A look can recolour PAL, restyle every paint() shape and line, replace the paper, swap the chapter wipe and the
// lettering font, and post-process the finished frame. Rigs and chapters don't change between looks.

const LIGHT = c => mixCol(c, '#FFFFFF', .45);
const isBackdrop = pts => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return (x1 - x0) * (y1 - y0) > W * H * .3;
};
let postC = null;
function copyFrame(c) {
  if (!postC) { postC = document.createElement('canvas'); postC.width = W; postC.height = H; }
  const p = postC.getContext('2d'); p.clearRect(0, 0, W, H); p.drawImage(c.canvas, 0, 0);
  return postC;
}

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

  film: {
    face: '"Rye"',
    wipe(p) { const k = p < .5 ? 1 - easeIn(p * 2) : easeOut((p - .5) * 2); iris(W / 2, H / 2, k * 1150, '#16110C'); },
    post(c, t) {
      const f = Math.floor(t * 24), h = k => hash(f * 13.7 + k), src = copyFrame(c);
      c.filter = `grayscale(1) sepia(.35) contrast(1.25) brightness(${.9 + h(1) * .14})`;
      c.drawImage(src, (h(2) - .5) * 5 - 10, (h(3) - .5) * 8 - 10, W + 20, H + 20);
      c.filter = 'none';
      for (let i = 0, n = Math.floor(h(4) * 3.5); i < n; i++) {
        const x = h(10 + i) * W; c.strokeStyle = `rgba(${h(20 + i) < .5 ? '255,250,235' : '30,22,15'},${.25 + h(30 + i) * .35})`;
        c.lineWidth = 1 + h(40 + i) * 2; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + (h(50 + i) - .5) * 30, H / 2, x + (h(60 + i) - .5) * 20, H); c.stroke();
      }
      c.fillStyle = 'rgba(25,18,12,.7)';
      for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(h(70 + i) * W, h(80 + i) * H, 1 + h(90 + i) * 4, 1 + h(95 + i) * 3, h(99 + i) * 3, 0, TAU); c.fill(); }
      const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,14,8,.7)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
  },

  neon: {
    pal: { paper: '#130F24' },
    face: '"Tilt Neon"',
    brushes() { brush.add('neon', { type: 'default', weight: 5, scatter: .05, sharpness: .95, grain: 40, opacity: 255, spacing: .15, pressure: [1, 1], rotate: 'natural', noise: .05 }); },
    stroke: (c, b, w) => [c === PAL.ink ? '#7DF6FF' : LIGHT(c), 'neon', w * 1.4],
    shape: (o, pts) => ({
      ...o,
      ink: o.ink === null ? null : o.ink && o.ink !== PAL.ink ? o.ink : o.wash && o.wash !== PAL.ink ? o.wash : o.ink,
      wash: o.wash && mixCol(o.wash, PAL.paper, isBackdrop(pts) ? .85 : .65),
      fill: o.fill && mixCol(o.fill, PAL.paper, .6), fillOp: (o.fillOp ?? 170) * .6
    }),
    wipe(p) { const k = 1 - Math.abs(p - .5) * 2, on = hash(Math.floor(T * 24) * 3.1) > .3; flash(clamp(k * 1.8) * (on ? 1 : .55), '#07060D'); },
    ground(c) {
      c.strokeStyle = 'rgba(255,80,200,.10)'; c.lineWidth = 2;
      for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(W / 2 + i * 40, 700); c.lineTo(W / 2 + i * 260, H); c.stroke(); }
      for (let y = 700, d = 14; y < H; y += d, d *= 1.35) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    },
    post(c) {
      const src = copyFrame(c);
      c.globalCompositeOperation = 'lighter';
      c.filter = 'blur(18px)'; c.globalAlpha = .55; c.drawImage(src, 0, 0);
      c.filter = 'blur(5px)'; c.globalAlpha = .45; c.drawImage(src, 0, 0);
      c.filter = 'none'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
  }
};

const LOOK_NAME = new URLSearchParams(location.search).get('look') || SONG.look || 'watercolor';
const LOOK = LOOKS[LOOK_NAME];
if (!LOOK) throw new Error(`unknown look "${LOOK_NAME}"; pick one of ${Object.keys(LOOKS).join(', ')}`);
Object.assign(PAL, LOOK.pal);
