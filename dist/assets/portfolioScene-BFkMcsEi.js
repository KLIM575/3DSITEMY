import{S as _,F as H,P as k,W as L,A as B,E as D,R as j,U as G,V,a as I,C as p,B as Y,b as f,c as x,d as P,e as X,f as q,D as J,M as z,g as K,h as N,i as O,j as R,k as Q}from"./three-CStZh3nJ.js";let n,t,i,c,d,a,r,C=0,T=0;const Z=new Q;let l=0;function $(){c=new D(i),c.addPass(new j(n,t));const e=new G(new V(window.innerWidth,window.innerHeight),1.2,.4,.85);e.threshold=.15,e.strength=1.2,e.radius=.5,c.addPass(e);const o={uniforms:{tDiffuse:{value:null},darkness:{value:1.5},offset:{value:1.2}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"uniform sampler2D tDiffuse;uniform float darkness;uniform float offset;varying vec2 vUv;void main(){vec4 texel=texture2D(tDiffuse,vUv);vec2 uv=(vUv-vec2(0.5))*vec2(offset);float vig=1.0-dot(uv,uv);vig=clamp(pow(vig,darkness),0.0,1.0);gl_FragColor=vec4(texel.rgb*vig,texel.a);}"};c.addPass(new I(o))}function ee(){const o=new Float32Array(12e3),m=new Float32Array(4e3*3),S=new Float32Array(4e3),M=new Float32Array(4e3),W=new p(16777215),F=new p(8952234),U=new p(6715272);for(let u=0;u<4e3;u++){const s=u*3,w=Math.random()*40+5,y=Math.random()*Math.PI*2,g=Math.acos(2*Math.random()-1);o[s]=w*Math.sin(g)*Math.cos(y),o[s+1]=w*Math.sin(g)*Math.sin(y),o[s+2]=w*Math.cos(g);const b=Math.random(),h=b<.6?W:b<.8?F:U;m[s]=h.r,m[s+1]=h.g,m[s+2]=h.b,S[u]=Math.random()*2+.3,M[u]=Math.random()}const v=new Y;v.setAttribute("position",new f(o,3)),v.setAttribute("color",new f(m,3)),v.setAttribute("aSize",new f(S,1)),v.setAttribute("aRandom",new f(M,1));const E=new x({uniforms:{uTime:{value:0},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uScroll:{value:0}},vertexShader:`
      attribute float aSize;
      attribute float aRandom;
      varying vec3 vColor;
      varying float vRandom;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uScroll;
      void main(){
        vColor=color;
        vRandom=aRandom;
        vec3 pos=position;
        float angle=uTime*0.05*aRandom+uScroll*2.0;
        float c=cos(angle);float s=sin(angle);
        pos.xz=mat2(c,-s,s,c)*pos.xz;
        pos.y+=sin(uTime*0.3+aRandom*6.28)*0.3+uScroll*3.0;
        vec4 mv=modelViewMatrix*vec4(pos,1.0);
        gl_PointSize=aSize*uPixelRatio*(60.0/-mv.z);
        gl_Position=projectionMatrix*mv;
      }`,fragmentShader:`
      varying vec3 vColor;
      varying float vRandom;
      void main(){
        float d=length(gl_PointCoord-vec2(0.5));
        if(d>0.5)discard;
        float a=1.0-smoothstep(0.0,0.5,d);
        a*=0.4;
        gl_FragColor=vec4(vColor*1.5,a);
      }`,transparent:!0,vertexColors:!0,depthWrite:!1,blending:P});d=new X(v,E),n.add(d)}function oe(){const e=new q(120,120,1,1),o=new x({uniforms:{uTime:{value:0},uScroll:{value:0}},vertexShader:"varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:`
      uniform float uTime;
      uniform float uScroll;
      varying vec3 vPos;
      void main(){
        vec2 g=abs(fract(vPos.xz*0.3)-0.5);
        float l=min(g.x,g.y);
        float a=1.0-smoothstep(0.0,0.03,l);
        float d=length(vPos.xz)*0.04;
        a*=exp(-d*0.4);
        float p=sin(uTime*1.5-d*1.5+uScroll*4.0)*0.5+0.5;
        a*=(0.15+p*0.1);
        gl_FragColor=vec4(vec3(0.7,0.75,0.8),a*0.25);
      }`,transparent:!0,depthWrite:!1,side:J,blending:P});a=new z(e,o),a.rotation.x=-Math.PI/2,a.position.y=-5,n.add(a)}function te(){const e=new K(10,10,80,24,1,!0),o=new x({uniforms:{uTime:{value:0},uScroll:{value:0}},vertexShader:"varying vec2 vUv;varying vec3 vPos;void main(){vUv=uv;vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:`
      uniform float uTime;
      uniform float uScroll;
      varying vec2 vUv;
      varying vec3 vPos;
      void main(){
        float l=abs(sin(vUv.x*40.0));
        l=smoothstep(0.0,0.08,l);
        float r=abs(sin(vUv.y*20.0-uTime*1.5-uScroll*3.0));
        r=smoothstep(0.0,0.08,r);
        float a=(1.0-l)*(1.0-r)*0.08;
        float d=abs(vPos.y)*0.04;
        a*=exp(-d);
        gl_FragColor=vec4(vec3(0.6,0.65,0.7),a);
      }`,transparent:!0,side:N,depthWrite:!1,blending:P});r=new z(e,o),r.rotation.x=Math.PI/2,r.position.z=-30,n.add(r)}function ne(){n.add(new O(1118481));const e=new R(16777215,2,60);e.position.set(5,5,5),n.add(e);const o=new R(8952234,1.5,60);o.position.set(-5,-3,5),n.add(o)}function ie(e){C=e.clientX/window.innerWidth*2-1,T=-(e.clientY/window.innerHeight)*2+1}function ae(){const e=document.documentElement.scrollHeight-window.innerHeight;l=window.scrollY/Math.max(e,1)}function re(){t.aspect=window.innerWidth/window.innerHeight,t.updateProjectionMatrix(),i.setSize(window.innerWidth,window.innerHeight),c.setSize(window.innerWidth,window.innerHeight)}function A(){requestAnimationFrame(A);const e=Z.getElapsedTime();t.position.x+=(C*1.5-t.position.x)*.02,t.position.y+=(T*1-t.position.y)*.02,t.position.z=5-l*15,t.lookAt(0,0,-5),d&&(d.material.uniforms.uTime.value=e,d.material.uniforms.uScroll.value=l,d.rotation.y=e*.01+l*Math.PI),a&&(a.material.uniforms.uTime.value=e,a.material.uniforms.uScroll.value=l),r&&(r.material.uniforms.uTime.value=e,r.material.uniforms.uScroll.value=l),c.render()}function le(){const e=document.getElementById("webgl-canvas");n=new _,n.fog=new H(0,.02),t=new k(50,window.innerWidth/window.innerHeight,.1,1e3),t.position.set(0,0,5),i=new L({canvas:e,antialias:!0,alpha:!0}),i.setSize(window.innerWidth,window.innerHeight),i.setPixelRatio(Math.min(window.devicePixelRatio,2)),i.toneMapping=B,i.toneMappingExposure=1,$(),ee(),oe(),te(),ne(),window.addEventListener("resize",re),window.addEventListener("mousemove",ie),window.addEventListener("scroll",ae,{passive:!0}),A()}export{le as startPortfolioWebGL};
