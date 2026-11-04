const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = v => {const t = clamp(v); return t*t*(3-2*t);};

// Deform the existing complete texture, never separate a limb or invent a rear plate.
// The support band is an exact fixed boundary, including during head/torso motion.
export function deformPaperPoint(x, y, seconds, config) {
  const t = seconds + (config.phase ?? 0);
  if (config.kind === 'water') {
    const {left, right, top, bottom} = config.region;
    const edge = smooth((x-left)/.055)*smooth((right-x)/.055)
      *smooth((y-top)/.035)*smooth((bottom-y)/.035);
    const depth = clamp((y-top)/(bottom-top));
    const wave = Math.sin(y*135-t*2.5+x*8);
    return {x:x+edge*(.0015+.0045*depth)*wave,
      y:y+edge*.0028*depth*Math.cos(y*105-t*2.5+x*8)};
  }
  const support = config.supportY ?? .80;
  if (y >= support) return {x,y};
  const neck = config.neckY ?? .49;
  const upper = smooth((support-y)/(support-neck));
  const breath = Math.sin(t*1.33);
  const sway = Math.sin(t*.81)+.35*Math.sin(t*1.73);
  // Shoulder anticipation precedes the head; a slow lean is distinct from breathing.
  const lean = .021*Math.sin(t*.55)+.006*sway;
  const angle = (.060*Math.sin(t*.73-.5)+.021*Math.sin(t*1.33-.4));
  const headWeight = smooth((neck+.025-y)/.095);
  const dx = x-.50, dy = y-neck;
  const headX = (dx*Math.cos(angle)-dy*Math.sin(angle)-dx)*headWeight;
  const headY = (dx*Math.sin(angle)+dy*Math.cos(angle)-dy)*headWeight;
  const handWeight = Math.exp(-(((y-(neck+.11))/.09)**2))*Math.exp(-(((x-.5)/.21)**4));
  const cloth = config.standing ? Math.exp(-(((y-.62)/.14)**2))*smooth((Math.abs(x-.5)-.045)/.10) : 0;
  return {x:x+lean*upper+headX+cloth*.011*Math.sin(t*2.0-y*10),
    y:y-.006*breath*upper+headY-.007*handWeight*Math.sin(t*1.02)};
}

export function mapRegisteredRow(y, source, target) {
  if (!source || !target) return y;
  const i = Math.max(0, Math.min(source.length-2, source.findIndex(v=>v>=y)-1));
  const u = (y-source[i])/(source[i+1]-source[i]);
  return target[i]+u*(target[i+1]-target[i]);
}
