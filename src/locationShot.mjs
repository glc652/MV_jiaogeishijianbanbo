const clamp = x => Math.max(0, Math.min(1, x));
const smooth = x => {const t=clamp(x);return t*t*(3-2*t);};
/** A whole-location insert, timed in seconds on the uninterrupted song clock. */
export const resolveLocationShot = (shot, seconds) => {
  const local = seconds-shot.startSeconds;
  const duration=shot.endSeconds-shot.startSeconds;
  const active=local>=0 && local<duration;
  const enter=smooth(local/shot.transitionSeconds);
  const leave=smooth((duration-local)/shot.transitionSeconds);
  const progress=clamp(local/duration);
  const mix=smooth(progress);
  const from=shot.camera.from,to=shot.camera.to;
  const pose={x:from.x+(to.x-from.x)*mix,y:from.y+(to.y-from.y)*mix,zoom:from.zoom+(to.zoom-from.zoom)*mix};
  const opacity=shot.transition==='dissolve'?Math.min(enter,leave):1;
  const clipPath=shot.transition==='wipe-left'
    ? `inset(0 ${(1-enter)*100}% 0 ${(1-leave)*100}%)`
    : shot.transition==='wipe-up'?`inset(${(1-leave)*100}% 0 ${(1-enter)*100}% 0)`:'none';
  return {active,local,progress,duration,opacity,clipPath,...pose};
};
