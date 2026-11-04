import type {LocationShot} from './project';

// Atmosphere has deterministic physical directions: rain descends, dust drifts,
// reflected window light passes laterally. Nothing translates a frozen person.
export const LocationAtmosphere=({kind,time}:{kind:LocationShot['atmosphere'];time:number})=>{
  if(kind==='rain')return <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
    <defs><clipPath id="platform-weather"><rect x="510" y="25" width="1390" height="790"/></clipPath></defs>
    <g clipPath="url(#platform-weather)" stroke="#d9e1de" strokeWidth="1.4" opacity=".30">
      {Array.from({length:52},(_,i)=>{const u=(time*(.65+(i%5)*.07)+i*.618)%1;const x=580+((i*137)%1400)-u*80,y=-40+u*930;return <path key={i} d={`M ${x} ${y} l -5 ${18+(i%4)*5}`}/>;})}
    </g>
    <ellipse cx="472" cy="204" rx="38" ry="50" fill="#ffe4a0" opacity={.025+.012*Math.sin(time*1.4)} />
  </svg>;
  if(kind==='train')return <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
    <defs><clipPath id="carriage-light"><path d="M 300 50 L 1270 50 L 1260 800 L 210 780 Z"/></clipPath><linearGradient id="passing-light"><stop stopColor="#fff0c9" stopOpacity="0"/><stop offset=".5" stopColor="#fff0c9" stopOpacity=".10"/><stop offset="1" stopColor="#fff0c9" stopOpacity="0"/></linearGradient></defs>
    <g clipPath="url(#carriage-light)"><path d={`M ${1700-(time*.21%1)*2500} -100 l 370 0 -490 1100 -370 0 Z`} fill="url(#passing-light)"/></g>
  </svg>;
  return <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
    {kind==='sunlight'?<path d="M 300 55 L 720 50 L 1630 855 L 390 855 Z" fill="#ffe5a6" opacity={.027+.018*Math.sin(time*.7)}/>:null}
    {Array.from({length:kind==='sunlight'?18:10},(_,i)=>{const u=(time*.022+i*.618)%1;return <circle key={i} cx={180+(i*157)%1450+Math.sin(time*.3+i)*15} cy={800-u*720} r={1.2+i%3*.65} fill={kind==='sunlight'?'#fff4d8':'#ede6c4'} opacity={.09+Math.sin(u*Math.PI)*.19}/>;})}
  </svg>;
};
