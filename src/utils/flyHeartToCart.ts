// GSAP is lazily imported at call time — not part of the initial bundle
export default async function flyHeartToCart(
  sourceEl: HTMLElement,
  onComplete: () => void
) {
  if (!sourceEl) { onComplete(); return; }

  let gsap: any;
  try {
    const mod = await import('gsap');
    gsap = mod.gsap;
  } catch {
    onComplete();
    return;
  }

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetBtn = document.querySelector<HTMLElement>('[data-target="wishlist-icon"]');
  let targetRect: { left: number; top: number; width: number; height: number };

  if (targetBtn && targetBtn.offsetParent !== null) {
    targetRect = targetBtn.getBoundingClientRect();
  } else {
    targetRect = { left: window.innerWidth - 60, top: 20, width: 24, height: 24 };
  }

  const heartClone = sourceEl.cloneNode(true) as HTMLElement;
  const startX = sourceRect.left;
  const startY = sourceRect.top;
  const endX = targetRect.left + targetRect.width / 2 - sourceRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2 - sourceRect.height / 2;
  const dx = endX - startX;
  const dy = endY - startY;

  heartClone.style.cssText = `
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    left: ${startX}px;
    top: ${startY}px;
    width: ${sourceRect.width}px;
    height: ${sourceRect.height}px;
    margin: 0;
    will-change: transform, opacity;
  `;
  document.body.appendChild(heartClone);

  const tl = gsap.timeline({
    onComplete: () => {
      heartClone.remove();
      onComplete();
    },
  });

  tl.set(heartClone, { transformOrigin: 'center center', scale: 1, x: 0, y: 0, rotation: 0, opacity: 1 })
    .to(heartClone, {
      scale: 0.85,
      duration: 0.1,
      ease: 'power2.in',
    })
    .to(heartClone, {
      scale: 1.7,
      rotation: -12,
      duration: 0.18,
      ease: 'back.out(4)',
    })
    .to(heartClone, {
      x: dx * 0.4,
      y: dy * 0.4 - 100,
      scale: 1.3,
      rotation: 0,
      duration: 0.3,
      ease: 'power1.out',
    })
    .to(heartClone, {
      x: dx,
      y: dy,
      scale: 0.35,
      rotation: 15,
      opacity: 0,
      duration: 0.42,
      ease: 'power3.in',
    });
}
