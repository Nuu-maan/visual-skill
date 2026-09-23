// props.js: a reusable theatre set. All in world coordinates of a 1920x1080 frame.
//
// Stage layout: backdrop above y 800, wooden floor from y 800 down, side curtains at the frame edges, valance on top.
//   stageBack(t, o)  → backdrop (default: rotating watercolor sunburst) + floor. Draw characters/props after it.
//   stageFront(t, o) → side curtains + valance, drawn last so they frame everything.
//   o: { a, b } sunburst colours · backdrop: fn(t) replaces the sunburst · floor colour · curtain: 0 open → 1 closed
//      · alarm: 0..1 red siren wash · spots: [[x, colour], ...] spotlight cones hitting the floor at x.

const CURTAIN = '#B8323F', CURTAIN_DK = '#7A1C2B', GOLD = '#E8B23A', WOOD = '#B87A4B', WOOD_DK = '#7C4A2C';

function sunburst(cx, cy, a, b, rot = 0, n = 16, r = 2200, op = 120) {
  for (let i = 0; i < n; i++) {
    const a0 = rot + i * TAU / n, a1 = a0 + TAU / n * .62;
    paint([[cx, cy], [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]], { fill: i % 2 ? a : b, fillOp: op, bleed: .2, tex: .5, border: .4, ink: null });
  }
}

function stageBack(t, o = {}) {
  if (o.backdrop) o.backdrop(t);
  else {
    paint(rectPts(-400, -400, W + 800, 1240), { wash: o.wall || '#F6E3C8', washOp: 255, ink: null });
    sunburst(960, 430, o.a || PAL.rose, o.b || PAL.ochre, t * .12);
  }
  // floor with slightly converging planks
  const fl = o.floor || WOOD;
  paint([[-400, 800 + jit(3)], [W / 2, 796 + jit(3)], [W + 400, 800 + jit(3)], [W + 400, 1500], [-400, 1500]], { wash: fl, washOp: 255, fill: WOOD_DK, fillOp: 60, bleed: .05, tex: .8, border: .6, ink: PAL.ink, sw: 1.3 });
  for (let i = -9; i <= 9; i++) { const x0 = 960 + i * 150; inkLine([[x0, 802], [960 + i * 150 * 1.7, 1500]], .55, WOOD_DK, 'inkfine', 0); }
  for (const yy of [880, 990]) inkLine([[-400, yy], [W + 400, yy + jit(2)]], .45, WOOD_DK, 'inkfine', 0);
  if (o.spots) for (const [sx, col] of o.spots) spotlight(sx, col || PAL.cream);
}

function spotlight(x, col = PAL.cream, top = -60) {
  paint([[x - 90, top], [x + 90, top], [x + 260, 860], [x - 260, 860]], { fill: col, fillOp: 50, bleed: .05, tex: .2, border: .1, ink: null });
  paint(ellPts(x, 860, 270, 55, 24), { fill: col, fillOp: 90, bleed: .1, tex: .2, ink: null });
}

function stageFront(t, o = {}) {
  const k = clamp(o.curtain || 0);
  const drape = (side) => {
    const edge = side < 0 ? lerp(250, 985, k) : lerp(1670, 935, k), outer = side < 0 ? -80 : W + 80;
    const tie = k < .05, pts = [];
    // inner edge: gathered at y 560 when tied back, straight when drawn
    for (let i = 0; i <= 10; i++) {
      const y = -20 + i * 112, gather = tie ? Math.sin(clamp(y / 1100) * Math.PI) * 0 + (y > 380 && y < 740 ? -Math.sin((y - 380) / 360 * Math.PI) * 120 : 0) : 0;
      pts.push([edge + side * gather + Math.sin(i * 1.7 + t * 2) * 6, y]);
    }
    pts.push([outer, 1130], [outer, -20]);
    if (side > 0) pts.reverse();
    paint(pts, { wash: CURTAIN, washOp: 255, fill: CURTAIN_DK, fillOp: 90, bleed: .05, tex: .8, border: .7, ink: PAL.ink, sw: 1.5 });
    // folds
    const w = Math.abs(edge - outer), nf = Math.max(3, Math.round(w / 90));
    for (let f = 1; f < nf; f++) {
      const fx = lerp(outer, edge, f / nf), top = [];
      for (let i = 0; i <= 6; i++) { const y = i * 185, g = tie && y > 380 && y < 740 ? -Math.sin((y - 380) / 360 * Math.PI) * 120 * f / nf : 0; top.push([fx + side * g + Math.sin(i + f) * 8, y]); }
      inkLine(top, .8, CURTAIN_DK, 'inkfine', .5);
    }
    if (tie) { const ty = 560; paint(rrPts(edge - side * 120 - 40, ty - 16, 80, 32, 14), { wash: GOLD, ink: PAL.ink, sw: .8 }); }
  };
  drape(-1); drape(1);
  // valance with scallops and gold fringe
  const v = [[-80, -40], [W + 80, -40]];
  for (let i = 12; i >= 0; i--) { const x = i * 160; v.push([x + 80, 118 + jit(2)]); v.push([x, 92]); }
  paint(v, { wash: CURTAIN, washOp: 255, fill: CURTAIN_DK, fillOp: 110, bleed: .05, tex: .7, border: .6, ink: PAL.ink, sw: 1.5 });
  const fr = []; for (let i = 0; i <= 24; i++) fr.push([i * 80, i % 2 ? 106 : 96]);
  inkLine(fr, 1.2, GOLD, 'ink', .3);
  if (o.alarm) paint(rectPts(-400, -400, W + 800, H + 800), { fill: '#E0283F', fillOp: 110 * clamp(o.alarm), bleed: .02, tex: .5, border: .2, ink: null });
}

