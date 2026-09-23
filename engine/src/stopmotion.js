// stopmotion.js: clay puppets and stop-motion helpers for claymation / papercraft videos (render with --fps=12).
//
// CAST.boy(x, y, s, o) / CAST.her(x, y, s, o): (x, y) is the ground point between the feet, s the unit. About 10.5s tall.
// Local coordinates for hooks: feet y 0, hips -2.4s, shoulders (±1.9s, -6.2s), head centre (0, -9.3s) radius 2.25s, beanie pompom top about -12.2s.
// Pose: dy, sq, rot, flip, sx, aL/aR (0 = out sideways, + raised, about -1.2 hangs), walk / run (phase), sit, back, noShadow.
// Face: eyes ('dot','closed','look','wide','sad'), lookX/lookY, brows ('sad','up','flat','angry'),
// mouth ('flat','frown','smile','o','wobble','laugh'), blush, squint (from mood()), smileK 0..1 overrides the mouth curve.
// Hooks: draw(s, sw) in body space, handL/handR(s, sw) at the hand centre (+x outward along the arm).
//
// CAST.photo(x, y, s, rot, o): Polaroid of her face, s ≈ its width / 10. o.fold 0..1 folds it into a paper boat.
// CAST.hand(x, y, s, rot, o): the animator's hand reaching in from the right (fingertips at (x, y), wrist toward +x).
//   o.pinch 0..1 closes thumb and index, o.point extends only the index finger. Use rot/flip to enter from other sides.
//
// Stop motion: sm(t, fps = 12) quantises time; nudge(id, a) is a per-frame [dx, dy, rot] replacement jitter;
// cutout(pts, o) paints a paper piece with its drop shadow (o.lift = shadow offset, default 8).

const CLAY = { skin: '#EFBE98', skinDk: '#D69A78', boyHair: '#5A3A2A', herHair: '#2A2230', beanie: '#E0A43A', scarf: '#2F8F8A',
  sweater: '#F1E4C8', trousers: '#7A5236', coat: '#C8394A', coatDk: '#962A38', tights: '#3A2E44', shoe: '#3A2A2A' };

function sm(t, fps = 12) { return Math.floor(t * fps + 1e-6) / fps; }
function nudge(id, a = 1) {
  const f = Math.floor(T * 12 + 1e-6), h = k => hash(f * 7.13 + id * 91.7 + k) - .5;
  return [h(1) * 3 * a, h(2) * 3 * a, h(3) * .012 * a];
}
function cutout(pts, o = {}) {
  const l = o.lift ?? 8;
  if (l) paint(pts.map(p => [p[0] + l, p[1] + l]), { wash: PAL.ink, washOp: o.shadowOp ?? 55, ink: null });
  paint(pts, { ink: PAL.ink, sw: 1, ...o });
}

function clayKid(x, y, s, o, her) {
  const sw = clamp(s / 11, .5, 2.4), J = s * .04, sq = (o.sq || 0) + (o.take || 0);
  const [nx, ny, nr] = nudge(her ? 2 : 1, o.still ? 0 : 1);
  if (!o.noShadow) paint(ellPts(x, y + s * .1, s * 3, s * .6, 16), { fill: PAL.ink, fillOp: 90, bleed: .15, tex: .3, border: .1, ink: null });
  push();
  translate(x + nx, y + ny + (o.dy || 0) * s);
  rotate((o.rot || 0) + nr);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), 1 - sq);

  const top = her ? CLAY.coat : CLAY.sweater, topDk = her ? CLAY.coatDk : '#D8C49E';
  const clay = (pts, c, dk, w = .9) => paint(pts, { wash: c, fill: dk, fillOp: 70, bleed: .06, tex: .8, border: .5, ink: PAL.ink, sw: sw * w });

  const leg = (side, i) => {
    let h = o.sit ? 1.3 : 2.5, a = 0;
    if (o.walk != null) { const ph = Math.sin((o.walk + i * .5) * TAU); if (ph > 0) h -= ph * .7; a = Math.cos((o.walk + i * .5) * TAU) * .12; }
    if (o.run != null) a = Math.sin((o.run + i * .5) * TAU) * .6;
    push(); translate(side * .75 * s, -2.4 * s); rotate(a);
    clay(rrPts(-.5 * s, 0, 1 * s, h * s, .35 * s, J), her ? CLAY.tights : CLAY.trousers, '#4A3024', .7);
    paint(ellPts(side * .2 * s, h * s, .8 * s, .4 * s, 12), { wash: CLAY.shoe, ink: PAL.ink, sw: sw * .5 });
    pop();
  };
  leg(-1, 0); leg(1, 1);

  const arm = (side, a, hook) => {
    push(); translate(side * 1.9 * s, -6.1 * s); rotate(side < 0 ? a : -a);
    clay(rrPts(side < 0 ? -2.9 * s : -.1 * s, -.5 * s, 3 * s, 1 * s, .45 * s, J), top, topDk, .7);
    translate(side * 3.05 * s, 0);
    paint(ellPts(0, 0, .55 * s, .55 * s, 12), { wash: CLAY.skin, ink: PAL.ink, sw: sw * .6 });
    if (hook) { if (side < 0) scale(-1, 1); hook(s, sw); }
    pop();
  };
  arm(-1, o.aL ?? -1.2, o.handL); arm(1, o.aR ?? -1.2, o.handR);

  const bodyPts = her
    ? [[-1.7 * s, -6.9 * s], [1.7 * s, -6.9 * s], [2.6 * s, -2.1 * s], [-2.6 * s, -2.1 * s]]
    : rrPts(-2.2 * s, -7 * s, 4.4 * s, 4.8 * s, 1.3 * s, J);
  clay(bodyPts, top, topDk, 1);
  paint(ellPts(-.8 * s, -5.6 * s, .5 * s, 1.2 * s, 10), { wash: '#FFFFFF', washOp: 45, ink: null });
  if (her && !o.back) for (const by of [-5.6, -4.4, -3.2]) paint(ellPts(.3 * s, by * s, .16 * s, .16 * s, 8), { wash: PAL.ink, ink: null });
  if (!her) {
    clay(rrPts(-2.3 * s, -7.4 * s, 4.6 * s, 1.1 * s, .5 * s, J), CLAY.scarf, '#1E6664', .8);
    for (const sx of [-1.3, -.3, .7, 1.6]) inkLine([[sx * s, -7.35 * s], [sx * s, -6.4 * s]], sw * 1.4, PAL.cream, 'ink', 0);
    if (!o.back) { clay(rrPts(.6 * s, -6.6 * s, 1 * s, 2.6 * s, .3 * s, J), CLAY.scarf, '#1E6664', .7); inkLine([[.8 * s, -4.1 * s], [1.4 * s, -4.1 * s]], sw * 1.2, PAL.cream, 'ink', 0); }
  }

  const hy = -9.3 * s, R = 2.25 * s;
  clay(ellPts(0, hy, R, R * .95, 24, J * .5), CLAY.skin, CLAY.skinDk, .9);
  paint(ellPts(-.8 * s, hy - .9 * s, .6 * s, .35 * s, 10), { wash: '#FFFFFF', washOp: 50, ink: null });
  if (her) {
    const bob = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI * .92 + i / 16 * Math.PI * 1.16; bob.push([Math.cos(a) * R * 1.2, hy + Math.sin(a) * R * 1.12]); }
    if (o.back) clay(ellPts(0, hy + .2 * s, R * 1.2, R * 1.15, 22, J), CLAY.herHair, '#4A3A55', .8);
    else {
      bob.push([R * 1.15, hy + .9 * s], [R * .75, hy + .95 * s], [R * .8, hy - .6 * s], [-.2 * s, hy - 1.1 * s], [-R * .8, hy - .6 * s], [-R * .75, hy + .95 * s], [-R * 1.15, hy + .9 * s]);
      clay(bob, CLAY.herHair, '#4A3A55', .8);
    }
  } else {
    if (o.back) clay(ellPts(0, hy + .1 * s, R * 1.02, R * .95, 22, J), CLAY.boyHair, '#3A2418', .8);
    const bn = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; bn.push([Math.cos(a) * R * 1.08, hy - 1 * s + Math.sin(a) * R * 1.02]); }
    clay(bn, CLAY.beanie, '#B07A22', .9);
    clay(rrPts(-R * 1.12, hy - 1.4 * s, R * 2.24, .9 * s, .4 * s, J), CLAY.beanie, '#B07A22', .8);
    for (let k = -3; k <= 3; k++) inkLine([[k * .6 * s, hy - 1.35 * s], [k * .6 * s, hy - .55 * s]], sw * .4, '#9A6A1C', 'inkfine', 0);
    paint(ellPts(0, hy - 3.6 * s, .6 * s, .55 * s, 10, J), { wash: CLAY.beanie, fill: '#B07A22', fillOp: 80, ink: PAL.ink, sw: sw * .7 });
  }
  if (!o.back) kidFace(s, sw, o, hy, her);
  if (o.draw) o.draw(s, sw);
  pop();
}

function kidFace(s, sw, o, hy, her) {
  const e = (o.squint || 0) > .5 ? 'closed' : (o.eyes || 'dot'), blink = (e === 'dot' || e === 'sad') && ((T * .7 + (her ? 2.1 : .4)) % 4.1) < .1;
  const lx = (o.lookX || 0) * .45 * s, ly = (o.lookY || 0) * .3 * s, ey = hy + .15 * s;
  for (const side of [-1, 1]) {
    const cx = side * .85 * s + lx, cy = ey + ly;
    if (e === 'closed' || blink) inkLine([[cx - .32 * s, cy], [cx, cy + .2 * s], [cx + .32 * s, cy]], sw * .9, PAL.ink, 'ink', .4);
    else if (e === 'wide') { paint(ellPts(cx, cy, .42 * s, .48 * s, 12), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 }); paint(ellPts(cx, cy + .05 * s, .2 * s, .24 * s, 10), { wash: PAL.ink, ink: null }); }
    else {
      paint(ellPts(cx, cy, .22 * s, .28 * s, 10), { wash: PAL.ink, ink: null });
      paint(ellPts(cx + .08 * s, cy - .1 * s, .07 * s, .07 * s, 6), { wash: PAL.cream, ink: null });
    }
    if (her && e !== 'closed' && !blink) inkLine([[cx + side * .2 * s, cy - .08 * s], [cx + side * .42 * s, cy - .18 * s]], sw * .6, PAL.ink, 'inkfine', 0);
  }
  const b = o.brows || (e === 'sad' ? 'sad' : null);
  if (b) for (const side of [-1, 1]) {
    const bx = side * .85 * s + lx, by = ey - (her ? .75 : .55) * s + ly + (b === 'up' ? (her ? -.3 : -.12) * s : 0);
    const tilt = b === 'sad' ? -side * .28 : b === 'angry' ? side * .3 : 0;
    inkLine([[bx - .35 * s, by + tilt * s], [bx + .35 * s, by - tilt * s]], sw * .9, her ? CLAY.herHair : CLAY.boyHair, 'ink', 0);
  }
  if (o.blush ?? her) for (const bx of [-1.45, 1.45]) paint(ellPts(bx * s, ey + .75 * s, .45 * s, .25 * s, 10), { fill: PAL.rose, fillOp: 170, bleed: .15, ink: null });
  const my = ey + 1.15 * s, m = o.mouth || 'flat';
  const k = o.smileK ?? { smile: 1, laugh: 1, frown: -1, flat: 0 }[m];
  if (k != null && m !== 'laugh') inkLine([[-.5 * s, my - k * .12 * s], [0, my + k * .22 * s], [.5 * s, my - k * .12 * s]], sw * .8, PAL.ink, 'ink', .6);
  else if (m === 'laugh') paint([[-.55 * s, my - .1 * s], [.55 * s, my - .1 * s], [0, my + .5 * s]], { wash: '#7A2A35', ink: PAL.ink, sw: sw * .5, curv: .5 });
  else if (m === 'o') paint(ellPts(0, my + .1 * s, .22 * s, .28 * s, 10), { wash: '#7A2A35', ink: PAL.ink, sw: sw * .4 });
  else if (m === 'wobble') inkLine([[-.55 * s, my], [-.28 * s, my - .14 * s], [0, my], [.28 * s, my - .14 * s], [.55 * s, my]], sw * .7, PAL.ink, 'ink', .3);
}

CAST.boy = (x, y, s, o = {}) => clayKid(x, y, s, o, false);
CAST.her = (x, y, s, o = {}) => clayKid(x, y, s, o, true);

CAST.herFace = (cx, cy, r, o = {}) => {
  push(); translate(cx, cy); const s = r / 2.3;
  const bob = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * .92 + i / 16 * Math.PI * 1.16; bob.push([Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.12]); }
  paint(ellPts(0, 0, r, r * .95, 22), { wash: CLAY.skin, fill: CLAY.skinDk, fillOp: 60, tex: .7, ink: PAL.ink, sw: clamp(r / 40, .4, 1.6) });
  bob.push([r * 1.15, .9 * s], [r * .75, .95 * s], [r * .8, -.6 * s], [-.2 * s, -1.1 * s], [-r * .8, -.6 * s], [-r * .75, .95 * s], [-r * 1.15, .9 * s]);
  paint(bob, { wash: CLAY.herHair, ink: PAL.ink, sw: clamp(r / 50, .3, 1.3) });
  kidFace(s, clamp(s / 11, .4, 2.2), { mouth: 'smile', ...o }, 0, true);
  pop();
};

CAST.photo = (x, y, s, rot = 0, o = {}) => {
  const f = clamp(o.fold || 0);
  push(); translate(x, y); rotate(rot);
  if (f < .5) {
    const w = 10 * s * (1 - f), h = 12 * s * (1 - f * .6);
    cutout(rectPts(-w / 2, -h / 2, w, h), { wash: PAL.cream, lift: o.lift ?? s * .6, sw: clamp(s / 8, .4, 1.4) });
    paint(rectPts(-w / 2 + s, -h / 2 + s, w - 2 * s, h - 3.2 * s), { wash: o.bg || '#F2B8A8', ink: null });
    if (f < .2) CAST.herFace(0, -h / 2 + s + (h - 3.2 * s) / 2 + s * .5, s * 2.8 * (1 - f));
  } else {
    const k = (f - .5) * 2, bw = 11 * s, bh = 5 * s * (.6 + .4 * k);
    cutout([[-bw / 2, -bh * .2], [bw / 2, -bh * .2], [bw * .32, bh * .5], [-bw * .32, bh * .5]], { wash: PAL.cream, lift: s * .5, sw: clamp(s / 8, .4, 1.4) });
    cutout([[-bw * .3, -bh * .2], [0, -bh * (1.1 + .5 * k)], [bw * .3, -bh * .2]], { wash: '#F6EEDD', lift: 0, sw: clamp(s / 8, .4, 1.4) });
    paint(ellPts(0, -bh * .45, s * .9, s * .9, 10), { wash: '#F2B8A8', washOp: 200, ink: null });
  }
  pop();
};

CAST.hand = (x, y, s, rot = 0, o = {}) => {
  const sw = clamp(s / 8, .6, 2.4), p = clamp(o.pinch || 0), skin = '#F4C9B4', dk = '#D9A08C';
  push(); translate(x, y); rotate(rot); if (o.flip) scale(1, -1);
  paint(rrPts(9 * s, -4 * s, 40 * s, 9 * s, 3 * s).map(q => [q[0] + 10, q[1] + 14]), { wash: PAL.ink, washOp: 50, ink: null });
  paint(rrPts(12 * s, -3.6 * s, 40 * s, 8.4 * s, 3 * s), { wash: '#6C7FA8', fill: '#4A5A80', fillOp: 70, tex: .7, ink: PAL.ink, sw });
  paint(rrPts(1 * s, -4.5 * s, 12 * s, 10 * s, 4 * s), { wash: skin, fill: dk, fillOp: 60, tex: .6, ink: PAL.ink, sw });
  const finger = (fy, len, a) => { push(); translate(2 * s, fy * s); rotate(a); paint(rrPts(-len * s, -.9 * s, len * s + s, 1.8 * s, .9 * s), { wash: skin, fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .8 }); pop(); };
  finger(-3.2, 6.5, p * .5);
  if (!o.point) { finger(-1.2, 7, p * .9); finger(.9, 6.5, p * 1.1); finger(2.9, 5.5, p * 1.2); }
  else for (const fy of [-1.2, .9, 2.9]) finger(fy, 2.2, 1.3);
  push(); translate(6 * s, 4.5 * s); rotate(.9 - p * 1.3); paint(rrPts(-6 * s, -1 * s, 6.5 * s, 2 * s, 1 * s), { wash: skin, fill: dk, fillOp: 50, ink: PAL.ink, sw: sw * .8 }); pop();
  pop();
};
