import Lenis from './vendor/lenis/lenis.mjs';

// Egen modul: innehåll och admin fungerar även om skrollmodulen inte laddas.
const lenis = new Lenis({
  autoRaf: true,
  anchors: true,
  smoothWheel: true,
  respectReducedMotion: true,
  // Bevara naturlig skrollning i redigerbara fält.
  prevent: node => node.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName)
});

window.addEventListener('pagehide', event => {
  if (!event.persisted) lenis.destroy();
});
