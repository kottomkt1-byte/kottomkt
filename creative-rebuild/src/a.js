import './base.css';
import './a.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCommon, reducedMotion } from './shared.js';

initCommon();
gsap.registerPlugin(ScrollTrigger);

const diagnostics = window.__kottoMotion = { concept: 'a', progress: 0, renderer: 'initializing', frames: 0, active: false, frameIntervals: [] };
const canvas = document.querySelector('#a-ribbon');
const state = { progress: 0, intro: reducedMotion.matches ? 1 : 0, pointerX: 0, pointerY: 0, targetX: 0, targetY: 0 };
let disposed = false, frame = 0, previous = 0, visible = true, gl, render, resize, cleanup;
let qualityScale=1, qualityChecked=false;

// Authored open metal ribbon: an actual parametric surface, not an eyewear model.
const vertex = `
precision highp float;
attribute vec2 aUv;
uniform float uAspect, uProgress, uIntro;
uniform vec2 uPointer;
varying vec3 vNormal, vPosition;
varying vec2 vUv;
vec3 surface(vec2 uv) {
  float u=uv.x, v=uv.y;
  float fold=1.0-uProgress*0.72;
  float phase=u*4.65+0.15;
  float twist=u*3.7+0.22+uProgress*1.3;
  vec3 center=vec3(sin(phase)*0.74*fold,u*1.98,cos(phase)*0.42*fold);
  vec3 across=normalize(vec3(cos(twist),sin(phase)*-0.30,sin(twist)));
  float width=0.62+0.12*cos(u*3.4);
  vec3 p=center+across*v*width;
  p.z+=sin(v*1.57)*sin(u*4.0)*0.06;
  p.x+=sin(u*8.5)*0.08*fold;
  p.z+=v*v*0.06;
  float angle=-0.27+uProgress*0.93+uPointer.x*0.07;
  mat2 rz=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  p.xy=rz*p.xy;
  float ry=0.24+uPointer.x*0.15;
  p.xz=mat2(cos(ry),-sin(ry),sin(ry),cos(ry))*p.xz;
  p.y+=uPointer.y*0.035;
  p*=0.78+uIntro*0.22;
  return p;
}
void main(){
  vUv=aUv; vec3 p=surface(aUv);
  vec3 pu=surface(aUv+vec2(0.001,0.0))-p;
  vec3 pv=surface(aUv+vec2(0.0,0.001))-p;
  vNormal=normalize(cross(pu,pv));vPosition=p;
  float perspective=4.9/(4.9-p.z);
  gl_Position=vec4(p.x*perspective/(2.55*uAspect),p.y*perspective/2.55,-p.z*0.13,1.0);
}`;
const fragment = `
precision highp float;
uniform vec2 uPointer;
uniform float uProgress;
varying vec3 vNormal,vPosition;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
void main(){
  vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
  vec3 view=normalize(vec3(0.0,0.0,5.0)-vPosition);
  vec3 key=normalize(vec3(-2.0+uPointer.x*1.2,3.5+uPointer.y,3.2));
  vec3 fill=normalize(vec3(2.7,-0.5,1.2));
  float d=max(dot(n,key),0.0);
  float spec=pow(max(dot(n,normalize(key+view)),0.0),48.0);
  float strip=pow(max(dot(n,normalize(vec3(-2.5,0.3,3.0)+view)),0.0),15.0);
  float edge=pow(1.0-max(dot(n,view),0.0),3.0);
  // Filter the printed grain in screen space: never let subpixel lines alias into moiré.
  float hair=0.0;
  #ifdef HAS_DERIVATIVES
    float hairPhase=vUv.x*260.0+sin(vUv.y*12.0)*0.3;
    hair=sin(hairPhase)*0.008*(1.0-smoothstep(0.8,2.6,fwidth(hairPhase)));
  #endif
  float grain=(hash(gl_FragCoord.xy)-0.5)*0.012;
  vec3 silver=vec3(0.65,0.69,0.65);
  vec3 ink=vec3(0.24,0.27,0.24);
  vec3 red=vec3(0.85,0.105,0.043);
  float back=gl_FrontFacing?0.0:1.0;
  vec3 base=mix(silver,red,back*0.95);
  vec3 col=base*(0.16+d*0.82)+vec3(0.91,0.95,0.86)*(spec*0.86+strip*0.33);
  col+=mix(vec3(0.08,0.105,0.075),vec3(0.3,0.018,0.0),back)*max(dot(n,fill),0.0);
  col+=vec3(0.50,0.54,0.46)*edge*0.20;
  // A printed red edge supplies the only chromatic accent on the front face.
  float printEdge=smoothstep(0.72,0.76,vUv.y)*(1.0-smoothstep(0.91,0.93,vUv.y));
  col=mix(col,col*vec3(1.3,0.19,0.07),printEdge*(1.0-back)*0.8);
  col+=hair+grain;
  col=pow(max(col,vec3(0.0)),vec3(0.89));
  gl_FragColor=vec4(col,1.0);
}`;

function startWebGL() {
  gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  if(!gl) throw new Error('WebGL unavailable');
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(message);}return shader;};
  const derivatives=gl.getExtension('OES_standard_derivatives');
  const fragmentSource=(derivatives?'#extension GL_OES_standard_derivatives : enable\n#define HAS_DERIVATIVES\n':'')+fragment;
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragmentSource),program=gl.createProgram();
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const vertices=[];const rows=120,columns=20;
  for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){
    const u0=i/rows*2-1,u1=(i+1)/rows*2-1,v0=j/columns*2-1,v1=(j+1)/columns*2-1;
    vertices.push(u0,v0,u1,v0,u0,v1,u0,v1,u1,v0,u1,v1);
  }
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'aUv');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const uniforms=Object.fromEntries(['uAspect','uProgress','uIntro','uPointer'].map(n=>[n,gl.getUniformLocation(program,n)]));
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  let aspect=1;
  resize=()=>{const box=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,innerWidth<701?1:1.5)*qualityScale;canvas.width=Math.max(1,Math.round(box.width*dpr));canvas.height=Math.max(1,Math.round(box.height*dpr));aspect=box.width/Math.max(1,box.height);gl.viewport(0,0,canvas.width,canvas.height);diagnostics.renderScale=dpr;requestRender();};
  render=()=>{gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(uniforms.uAspect,aspect);gl.uniform1f(uniforms.uProgress,state.progress);gl.uniform1f(uniforms.uIntro,state.intro);gl.uniform2f(uniforms.uPointer,state.pointerX,state.pointerY);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);};
  cleanup=()=>{gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};
  diagnostics.renderer='webgl-parametric-ribbon';resize();
}

function startPoster(reason) {
  // A transparent still captured from this exact authored shader preserves the art direction.
  const replacement=document.createElement('img');replacement.id='a-ribbon';replacement.alt='';replacement.setAttribute('aria-hidden','true');replacement.src=`${import.meta.env.BASE_URL}art/ribbon-poster.png`;
  replacement.style.cssText='width:100%;height:100%;object-fit:cover;display:block';
  canvas.replaceWith(replacement);
  resize=()=>{};render=()=>{};cleanup=()=>{};
  diagnostics.renderer='authored-ribbon-poster';diagnostics.fallbackReason=reason;
}
function requestRender(){if(disposed||!visible||document.hidden||frame)return;frame=requestAnimationFrame(tick);}
function tick(time){frame=0;if(disposed||!visible||document.hidden)return;const drift=Math.abs(state.targetX-state.pointerX)+Math.abs(state.targetY-state.pointerY);state.pointerX+=(state.targetX-state.pointerX)*.085;state.pointerY+=(state.targetY-state.pointerY)*.085;if(previous&&time-previous<200){diagnostics.frameIntervals.push(Math.round((time-previous)*100)/100);if(diagnostics.frameIntervals.length>1200)diagnostics.frameIntervals.shift();}previous=time;render?.();diagnostics.frames++;diagnostics.active=drift>.002;if(!qualityChecked&&diagnostics.frameIntervals.length>=24){qualityChecked=true;const sample=diagnostics.frameIntervals.slice(-24).sort((a,b)=>a-b);if(sample[12]>28){qualityScale=.72;diagnostics.quality='reduced-resolution';resize?.();}}if(drift>.002)requestRender();}
try{startWebGL();}catch(error){startPoster(error.message);}

const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestRender();else{cancelAnimationFrame(frame);frame=0;previous=0;}},{threshold:0});observer.observe(document.querySelector('.a-art'));
const resizeObserver=new ResizeObserver(()=>resize?.());resizeObserver.observe(document.querySelector('.a-art'));
const pointerHandler=e=>{if(reducedMotion.matches||!matchMedia('(pointer:fine)').matches)return;state.targetX=(e.clientX/innerWidth-.5)*2;state.targetY=-(e.clientY/innerHeight-.5)*2;requestRender();};
const pointerLeave=()=>{state.targetX=0;state.targetY=0;requestRender();};
document.querySelector('.a-stage').addEventListener('pointermove',pointerHandler);
document.querySelector('.a-stage').addEventListener('pointerleave',pointerLeave);
const visibility=()=>{if(!document.hidden){previous=0;requestRender();}};document.addEventListener('visibilitychange',visibility);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;cleanup?.();startPoster('context-lost');},{once:true});

const mm=gsap.matchMedia();
mm.add({desktop:'(min-width:701px)',mobile:'(max-width:700px)',reduce:'(prefers-reduced-motion:reduce)'},context=>{
  const {desktop,reduce}=context.conditions;
  const work=document.querySelector('.a-work'),cover=document.querySelector('.a-cover');
  work.inert=desktop&&!reduce;cover.inert=false;
  document.body.classList.toggle('a-static',reduce);
  state.progress=0;state.intro=reduce?1:0;diagnostics.progress=0;
  if(reduce){requestRender();return;}
  gsap.to(state,{intro:1,duration:1.55,ease:'power3.out',onUpdate:requestRender});
  gsap.from('.a-title-line',{yPercent:18,clipPath:'inset(0 0 100% 0)',duration:1.1,stagger:.12,delay:.12,ease:'power3.out'});
  if(desktop){
    gsap.set('.a-work',{yPercent:100,clipPath:'inset(0% 0 0 0)'});
    const tl=gsap.timeline({scrollTrigger:{trigger:'.a-stage',start:'top top',end:()=>`+=${Math.round(innerHeight*1.5)}`,pin:true,scrub:.55,invalidateOnRefresh:true,onUpdate:self=>{diagnostics.progress=Number(self.progress.toFixed(4));work.inert=self.progress<.80;cover.inert=self.progress>.55;}}});
    tl.to(state,{progress:1,duration:1,ease:'none',onUpdate:requestRender},0)
      .to('.a-cover',{yPercent:-9,opacity:0,duration:.5,ease:'power1.in'},.30)
      .set('.a-work',{visibility:'visible'},.12)
      .to('.a-work',{yPercent:0,duration:.75,ease:'power2.inOut'},.12)
      .from('.a-work h2',{y:32,duration:.5,ease:'power2.out'},.25)
      .from('.a-service-list a',{y:20,opacity:0,stagger:.07,duration:.3,ease:'power2.out'},.42)
      .to('.a-scene-progress i',{scaleX:1,duration:1,ease:'none'},0);
  } else {
    gsap.to(state,{progress:.75,ease:'none',scrollTrigger:{trigger:'.a-cover',start:'top top',end:'bottom 15%',scrub:.35,onUpdate:self=>{diagnostics.progress=Number(self.progress.toFixed(4));}},onUpdate:requestRender});
    gsap.from('.a-work',{clipPath:'inset(8% 0 0 0)',scrollTrigger:{trigger:'.a-work',start:'top 95%',end:'top 40%',scrub:.3},ease:'none'});
  }
  return()=>{work.inert=false;cover.inert=false;state.progress=0;state.intro=1;requestRender();};
});

// Pinned-stage anchor needs a document scroll target corresponding to its final scene.
document.querySelectorAll('a[href="#a-work"]').forEach(link=>link.addEventListener('click',e=>{if(innerWidth<=700||reducedMotion.matches)return;e.preventDefault();const trigger=ScrollTrigger.getAll().find(t=>t.vars.pin);if(trigger){window.scrollTo({top:trigger.end,behavior:'smooth'});history.replaceState(null,'','#a-work');document.querySelector('#a-work-title').setAttribute('tabindex','-1');setTimeout(()=>document.querySelector('#a-work-title').focus({preventScroll:true}),650);}}));
document.fonts.ready.then(()=>{ScrollTrigger.refresh();resize?.();});
window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();document.removeEventListener('visibilitychange',visibility);mm.revert();cleanup?.();});
