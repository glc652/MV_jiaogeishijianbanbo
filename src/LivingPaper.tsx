import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import type {PaperPerformance} from './project';
import {deformPaperPoint, mapRegisteredRow} from './paperPerformance.mjs';

type Layer = {id:string; src:string; opacity:number};
type GPU = {canvas:HTMLCanvasElement;gl:WebGLRenderingContext; program:WebGLProgram; buffer:WebGLBuffer;
  textures:Map<string,WebGLTexture>; images:Map<string,HTMLImageElement>};
const vertex = `attribute vec2 position; attribute vec2 uv; varying vec2 tex;
  void main(){tex=uv;gl_Position=vec4(position.x*2.-1.,1.-position.y*2.,0.,1.);}`;
const fragment = `precision mediump float; uniform sampler2D picture; uniform float opacity;
  varying vec2 tex; void main(){vec4 c=texture2D(picture,tex);gl_FragColor=vec4(c.rgb*c.a,c.a)*opacity;}`;
const makeShader=(gl:WebGLRenderingContext,type:number,source:string)=>{
  const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)??'Paper shader failed');
  return shader;
};

// Deterministic texture mesh. Adjacent triangles share vertices, so joints cannot
// reveal gaps; no image is cut into independently floating body parts.
export const LivingPaper=({layers,performance,seconds,bands,width=650,height=650}:{
  layers:Layer[];performance:PaperPerformance;seconds:number;
  bands?:Record<string,number[]>;width?:number;height?:number;
})=>{
  const canvas=useRef<HTMLCanvasElement>(null);
  const gpu=useRef<GPU|null>(null);
  const [ready,setReady]=useState(0);
  const sources=layers.map(l=>l.src).join('|');
  const [handle]=useState(()=>delayRender('Loading continuous paper mesh'));
  useEffect(()=>{
    // Keep GPU rendering offscreen and publish a complete 2D bitmap each frame.
    // This avoids Chromium's partial-damage/occlusion bug when two transformed
    // WebGL canvases overlap under an animated CSS clip-path.
    const gpuCanvas=document.createElement('canvas');gpuCanvas.width=width;gpuCanvas.height=height;
    const gl=gpuCanvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,
      preserveDrawingBuffer:true,antialias:true});
    if(!gl){cancelRender(new Error('WebGL unavailable for paper performance'));return;}
    const program=gl.createProgram()!;
    const vs=makeShader(gl,gl.VERTEX_SHADER,vertex),fs=makeShader(gl,gl.FRAGMENT_SHADER,fragment);
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Paper shader link failed');
    const buffer=gl.createBuffer()!;
    gpu.current={canvas:gpuCanvas,gl,program,buffer,textures:new Map(),images:new Map()};
    return()=>{const g=gpu.current;if(g){for(const tex of g.textures.values())gl.deleteTexture(tex);
      gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
      gpu.current=null;continueRender(handle);};
  },[handle]);
  useEffect(()=>{
    let live=true;
    const token=delayRender('Paper texture upload');
    const g=gpu.current!;
    Promise.all(sources.split('|').map(async src=>{
      if(g.textures.has(src))return;
      const img=new Image();img.src=staticFile(src);await img.decode();
      if(!live)return;
      const {gl}=g;const tex=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      g.textures.set(src,tex);g.images.set(src,img);
    })).then(()=>{if(live)setReady(n=>n+1);continueRender(token);continueRender(handle);})
      .catch(error=>cancelRender(error));
    return()=>{live=false;continueRender(token);};
  },[sources,handle]);
  useLayoutEffect(()=>{
    const g=gpu.current;if(!g||layers.some(l=>!g.textures.has(l.src)))return;
    const {gl,program,buffer}=g;gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    for(const [name,offset] of [['position',0],['uv',8]] as const){const a=gl.getAttribLocation(program,name);
      gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,16,offset);}
    const total=layers.reduce((n,l)=>n+l.opacity,0);
    const target=bands?.[layers[0].id]?.map((_,i)=>layers.reduce((n,l)=>n+bands[l.id][i]*l.opacity,0)/total);
    const posedPerformance=performance.kind==='character' && performance.registrationNeckRow!==undefined && target
      ? {...performance,neckY:target[performance.registrationNeckRow]} : performance;
    const cols=32,rows=48;
    for(const layer of layers){
      const vertices:number[]=[];
      const add=(i:number,j:number)=>{const u=i/cols,v=j/rows;
        const y=mapRegisteredRow(v,bands?.[layer.id],target);
        const p=deformPaperPoint(u,y,seconds,posedPerformance);vertices.push(p.x,p.y,u,v);};
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        add(x,y);add(x+1,y);add(x,y+1);add(x+1,y);add(x+1,y+1);add(x,y+1);}
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
      gl.bindTexture(gl.TEXTURE_2D,g.textures.get(layer.src)!);
      gl.uniform1f(gl.getUniformLocation(program,'opacity'),layer.opacity);
      gl.drawArrays(gl.TRIANGLES,0,vertices.length/4);
    }
    gl.finish();
    const output=canvas.current!.getContext('2d')!;
    output.clearRect(0,0,width,height);
    output.drawImage(g.canvas,0,0,width,height);
  },[ready,layers,performance,seconds,bands,width,height]);
  return <canvas ref={canvas} width={width} height={height} style={{display:'block',width:'100%',height:'100%'}}/>;
};
