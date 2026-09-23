(() => {
  function hello(t, lt) {
    stageBack(t, { spots: [[960, PAL.cream]] });
    dancer(960, 900, 40, 'bounce', t, { eyes: 'happy', mouth: 'smile' });
    sfx('HELLO!', 960, 260, 150, PAL.ochre, lt - .3);
    stageFront(t);
  }
  function lab(t, lt) {
    paint(rectPts(-100, -100, W + 200, H + 200), { wash: PAL.night, fill: PAL.indigo, fillOp: 140, tex: .8, ink: null });
    camBegin(960, 560, kf(lt, [[0, 1], [6, 1.3]]));
    researcherDancer(760, 880, 30, 'sway', t, { eyes: 'wide' });
    clawd(1200, 880, 30, { ...mood(lt, [[0, 'normal'], [2, 'spark', 'spark']]), aR: .9 * pulse(t) });
    camEnd();
  }
  chapter('demo', 0, 12, [[0, hello], [6, lab]]);
})();
