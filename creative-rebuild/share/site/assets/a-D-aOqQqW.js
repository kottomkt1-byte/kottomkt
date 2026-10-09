import{i as C,r as _}from"./shared-CApQRVBY.js";import{g as p,S as T}from"./ScrollTrigger-a3sj5zmn.js";C();p.registerPlugin(T);const n=window.__kottoMotion={concept:"a",progress:0,renderer:"initializing",frames:0,active:!1,frameIntervals:[]},g=document.querySelector("#a-ribbon"),t={progress:0,intro:_.matches?1:0,pointerX:0,pointerY:0,targetX:0,targetY:0};let U=!1,f=0,h=0,P=!0,e,F,b,S,M=1,z=!1;const D=`
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
}`,H=`
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
}`;function N(){if(e=g.getContext("webgl",{alpha:!0,antialias:!0,powerPreference:"low-power",preserveDrawingBuffer:!1}),!e)throw new Error("WebGL unavailable");const r=(i,d)=>{const u=e.createShader(i);if(e.shaderSource(u,d),e.compileShader(u),!e.getShaderParameter(u,e.COMPILE_STATUS)){const w=e.getShaderInfoLog(u);throw e.deleteShader(u),new Error(w)}return u},c=(e.getExtension("OES_standard_derivatives")?`#extension GL_OES_standard_derivatives : enable
#define HAS_DERIVATIVES
`:"")+H,l=r(e.VERTEX_SHADER,D),v=r(e.FRAGMENT_SHADER,c),a=e.createProgram();if(e.attachShader(a,l),e.attachShader(a,v),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(a));e.useProgram(a);const m=[],x=120,A=20;for(let i=0;i<x;i++)for(let d=0;d<A;d++){const u=i/x*2-1,w=(i+1)/x*2-1,E=d/A*2-1,k=(d+1)/A*2-1;m.push(u,E,w,E,u,k,u,k,w,E,w,k)}const I=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,I),e.bufferData(e.ARRAY_BUFFER,new Float32Array(m),e.STATIC_DRAW);const R=e.getAttribLocation(a,"aUv");e.enableVertexAttribArray(R),e.vertexAttribPointer(R,2,e.FLOAT,!1,0,0);const y=Object.fromEntries(["uAspect","uProgress","uIntro","uPointer"].map(i=>[i,e.getUniformLocation(a,i)]));e.enable(e.DEPTH_TEST),e.clearColor(0,0,0,0);let L=1;b=()=>{const i=g.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,innerWidth<701?1:1.5)*M;g.width=Math.max(1,Math.round(i.width*d)),g.height=Math.max(1,Math.round(i.height*d)),L=i.width/Math.max(1,i.height),e.viewport(0,0,g.width,g.height),n.renderScale=d,s()},F=()=>{e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.uniform1f(y.uAspect,L),e.uniform1f(y.uProgress,t.progress),e.uniform1f(y.uIntro,t.intro),e.uniform2f(y.uPointer,t.pointerX,t.pointerY),e.drawArrays(e.TRIANGLES,0,m.length/2)},S=()=>{e.deleteBuffer(I),e.deleteProgram(a),e.deleteShader(l),e.deleteShader(v)},n.renderer="webgl-parametric-ribbon",b()}function q(r){const o=document.createElement("img");o.id="a-ribbon",o.alt="",o.setAttribute("aria-hidden","true"),o.src="./art/ribbon-poster.png",o.style.cssText="width:100%;height:100%;object-fit:cover;display:block",g.replaceWith(o),b=()=>{},F=()=>{},S=()=>{},n.renderer="authored-ribbon-poster",n.fallbackReason=r}function s(){U||!P||document.hidden||f||(f=requestAnimationFrame(W))}function W(r){if(f=0,U||!P||document.hidden)return;const o=Math.abs(t.targetX-t.pointerX)+Math.abs(t.targetY-t.pointerY);t.pointerX+=(t.targetX-t.pointerX)*.085,t.pointerY+=(t.targetY-t.pointerY)*.085,h&&r-h<200&&(n.frameIntervals.push(Math.round((r-h)*100)/100),n.frameIntervals.length>1200&&n.frameIntervals.shift()),h=r,F?.(),n.frames++,n.active=o>.002,!z&&n.frameIntervals.length>=24&&(z=!0,n.frameIntervals.slice(-24).sort((l,v)=>l-v)[12]>28&&(M=.72,n.quality="reduced-resolution",b?.())),o>.002&&s()}try{N()}catch(r){q(r.message)}const X=new IntersectionObserver(r=>{P=r[0].isIntersecting,P?s():(cancelAnimationFrame(f),f=0,h=0)},{threshold:0});X.observe(document.querySelector(".a-art"));const Y=new ResizeObserver(()=>b?.());Y.observe(document.querySelector(".a-art"));const V=r=>{_.matches||!matchMedia("(pointer:fine)").matches||(t.targetX=(r.clientX/innerWidth-.5)*2,t.targetY=-(r.clientY/innerHeight-.5)*2,s())},G=()=>{t.targetX=0,t.targetY=0,s()};document.querySelector(".a-stage").addEventListener("pointermove",V);document.querySelector(".a-stage").addEventListener("pointerleave",G);const O=()=>{document.hidden||(h=0,s())};document.addEventListener("visibilitychange",O);g.addEventListener("webglcontextlost",r=>{r.preventDefault(),cancelAnimationFrame(f),f=0,S?.(),q("context-lost")},{once:!0});const B=p.matchMedia();B.add({desktop:"(min-width:701px)",mobile:"(max-width:700px)",reduce:"(prefers-reduced-motion:reduce)"},r=>{const{desktop:o,reduce:c}=r.conditions,l=document.querySelector(".a-work"),v=document.querySelector(".a-cover");if(l.inert=o&&!c,v.inert=!1,document.body.classList.toggle("a-static",c),t.progress=0,t.intro=c?1:0,n.progress=0,c){s();return}return p.to(t,{intro:1,duration:1.55,ease:"power3.out",onUpdate:s}),p.from(".a-title-line",{yPercent:18,clipPath:"inset(0 0 100% 0)",duration:1.1,stagger:.12,delay:.12,ease:"power3.out"}),o?(p.set(".a-work",{yPercent:100,clipPath:"inset(0% 0 0 0)"}),p.timeline({scrollTrigger:{trigger:".a-stage",start:"top top",end:()=>`+=${Math.round(innerHeight*1.5)}`,pin:!0,scrub:.55,invalidateOnRefresh:!0,onUpdate:m=>{n.progress=Number(m.progress.toFixed(4)),l.inert=m.progress<.8,v.inert=m.progress>.55}}}).to(t,{progress:1,duration:1,ease:"none",onUpdate:s},0).to(".a-cover",{yPercent:-9,opacity:0,duration:.5,ease:"power1.in"},.3).set(".a-work",{visibility:"visible"},.12).to(".a-work",{yPercent:0,duration:.75,ease:"power2.inOut"},.12).from(".a-work h2",{y:32,duration:.5,ease:"power2.out"},.25).from(".a-service-list a",{y:20,opacity:0,stagger:.07,duration:.3,ease:"power2.out"},.42).to(".a-scene-progress i",{scaleX:1,duration:1,ease:"none"},0)):(p.to(t,{progress:.75,ease:"none",scrollTrigger:{trigger:".a-cover",start:"top top",end:"bottom 15%",scrub:.35,onUpdate:a=>{n.progress=Number(a.progress.toFixed(4))}},onUpdate:s}),p.from(".a-work",{clipPath:"inset(8% 0 0 0)",scrollTrigger:{trigger:".a-work",start:"top 95%",end:"top 40%",scrub:.3},ease:"none"})),()=>{l.inert=!1,v.inert=!1,t.progress=0,t.intro=1,s()}});document.querySelectorAll('a[href="#a-work"]').forEach(r=>r.addEventListener("click",o=>{if(innerWidth<=700||_.matches)return;o.preventDefault();const c=T.getAll().find(l=>l.vars.pin);c&&(window.scrollTo({top:c.end,behavior:"smooth"}),history.replaceState(null,"","#a-work"),document.querySelector("#a-work-title").setAttribute("tabindex","-1"),setTimeout(()=>document.querySelector("#a-work-title").focus({preventScroll:!0}),650))}));document.fonts.ready.then(()=>{T.refresh(),b?.()});window.addEventListener("pagehide",r=>{r.persisted||(U=!0,cancelAnimationFrame(f),X.disconnect(),Y.disconnect(),document.removeEventListener("visibilitychange",O),B.revert(),S?.())});
