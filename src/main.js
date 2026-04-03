import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from './data/projects.js'
import { AIChat } from './components/AIChat.js'

gsap.registerPlugin(ScrollTrigger)

// ====== GLOBALS ======
let scene, camera, renderer, composer, bloomPass
let particleSystem, gridMesh, tunnelMesh
let mouseX = 0, mouseY = 0
let clock = new THREE.Clock()
let scrollProgress = 0

// ====== POPULATE CONTENT ======
function populateWork() {
  const grid = document.getElementById('projectsGrid')
  grid.innerHTML = projects.map(p => `
    <div class="project-card">
      <img src="${p.image}" alt="${p.title}" loading="lazy">
      <div class="project-card-overlay">
        <div class="project-card-number">${p.number}</div>
        <div class="project-card-title">${p.title}</div>
        <div class="project-card-cat">${p.category} — ${p.client}</div>
      </div>
    </div>
  `).join('')
}

function populateAbout() {
  const skills = [
    'WebGL / Three.js', 'GLSL Shaders', 'JavaScript / TypeScript',
    'React / Vue', 'Node.js', 'Blender / 3D',
    'UI/UX Design', 'GSAP / Animation', 'Figma', 'WebGPU'
  ]
  document.getElementById('skillsList').innerHTML = skills.map(s => `
    <div class="skill-item">
      <span class="skill-name">${s}</span>
      <span class="skill-level">Advanced</span>
    </div>
  `).join('')
}

function populateServices() {
  const services = [
    { num: '01', name: 'WebGL / 3D Сайты', desc: 'Иммерсивные сайты с 3D-графикой, частицами и интерактивными эффектами' },
    { num: '02', name: 'Интерактивные платформы', desc: 'Сложные веб-приложения с уникальным UX и анимациями' },
    { num: '03', name: '3D Визуализация', desc: 'Фотореалистичные 3D-рендеры и анимации для презентаций' },
    { num: '04', name: 'UI/UX Дизайн', desc: 'Проектирование интерфейсов, которые вдохновляют и конвертируют' },
    { num: '05', name: 'Интерактивные инсталляции', desc: 'Арт-объекты и инсталляции для мероприятий и выставок' },
    { num: '06', name: 'Full-Stack Разработка', desc: 'Полный цикл — от бэкенда до фронтенда' }
  ]
  document.getElementById('servicesList').innerHTML = services.map(s => `
    <div class="service-item">
      <span class="service-num">${s.num}</span>
      <span class="service-name">${s.name}</span>
      <span class="service-desc">${s.desc}</span>
      <span class="service-arrow">→</span>
    </div>
  `).join('')
}

// ====== SCROLL NAVIGATION ======
window.scrollToSection = function(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// ====== SECTION REVEAL ON SCROLL ======
function initScrollAnimations() {
  const sections = document.querySelectorAll('.section')

  sections.forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      end: 'top 25%',
      onEnter: () => section.classList.add('visible'),
      onEnterBack: () => section.classList.add('visible')
    })
  })

  // Active nav link based on scroll position
  const navLinks = document.querySelectorAll('.nav-links a')
  const mobileTabs = document.querySelectorAll('.mobile-tab')
  const sectionIds = ['hero', 'work', 'about', 'services', 'contact']

  sectionIds.forEach((id, i) => {
    ScrollTrigger.create({
      trigger: document.getElementById(id),
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateActiveNav(i),
      onEnterBack: () => updateActiveNav(i)
    })
  })

  function updateActiveNav(index) {
    navLinks.forEach((l, i) => l.classList.toggle('active', i === index))
    mobileTabs.forEach((t, i) => t.classList.toggle('active', i === index))
  }
}

// ====== WEBGL ======
function initWebGL() {
  const canvas = document.getElementById('webgl-canvas')
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.02)

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 5)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  createPostProcessing()
  createParticles()
  createGrid()
  createTunnel()
  createLights()

  window.addEventListener('resize', onResize)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('scroll', onScroll)
}

function createPostProcessing() {
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.85
  )
  bloomPass.threshold = 0.15
  bloomPass.strength = 1.2
  bloomPass.radius = 0.5
  composer.addPass(bloomPass)

  const vignetteShader = {
    uniforms: { tDiffuse: { value: null }, darkness: { value: 1.5 }, offset: { value: 1.2 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform sampler2D tDiffuse;uniform float darkness;uniform float offset;varying vec2 vUv;void main(){vec4 texel=texture2D(tDiffuse,vUv);vec2 uv=(vUv-vec2(0.5))*vec2(offset);float vig=1.0-dot(uv,uv);vig=clamp(pow(vig,darkness),0.0,1.0);gl_FragColor=vec4(texel.rgb*vig,texel.a);}'
  }
  composer.addPass(new ShaderPass(vignetteShader))
}

function createParticles() {
  const count = 4000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const randoms = new Float32Array(count)

  const white = new THREE.Color(0xffffff)
  const cool = new THREE.Color(0x8899aa)
  const warm = new THREE.Color(0x667788)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const r = Math.random() * 40 + 5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)

    const m = Math.random()
    const c = m < 0.6 ? white : m < 0.8 ? cool : warm
    colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b
    sizes[i] = Math.random() * 2 + 0.3
    randoms[i] = Math.random()
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uScroll: { value: 0 }
    },
    vertexShader: `
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
      }`,
    fragmentShader: `
      varying vec3 vColor;
      varying float vRandom;
      void main(){
        float d=length(gl_PointCoord-vec2(0.5));
        if(d>0.5)discard;
        float a=1.0-smoothstep(0.0,0.5,d);
        a*=0.4;
        gl_FragColor=vec4(vColor*1.5,a);
      }`,
    transparent: true, vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending
  })

  particleSystem = new THREE.Points(geo, mat)
  scene.add(particleSystem)
}

function createGrid() {
  const geo = new THREE.PlaneGeometry(120, 120, 1, 1)
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 }
    },
    vertexShader: 'varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `
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
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending
  })
  gridMesh = new THREE.Mesh(geo, mat)
  gridMesh.rotation.x = -Math.PI / 2
  gridMesh.position.y = -5
  scene.add(gridMesh)
}

function createTunnel() {
  const geo = new THREE.CylinderGeometry(10, 10, 80, 24, 1, true)
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 }
    },
    vertexShader: 'varying vec2 vUv;varying vec3 vPos;void main(){vUv=uv;vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `
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
      }`,
    transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending
  })
  tunnelMesh = new THREE.Mesh(geo, mat)
  tunnelMesh.rotation.x = Math.PI / 2
  tunnelMesh.position.z = -30
  scene.add(tunnelMesh)
}

function createLights() {
  scene.add(new THREE.AmbientLight(0x111111))
  const p1 = new THREE.PointLight(0xffffff, 2, 60)
  p1.position.set(5, 5, 5)
  scene.add(p1)
  const p2 = new THREE.PointLight(0x8899aa, 1.5, 60)
  p2.position.set(-5, -3, 5)
  scene.add(p2)
}

function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1
}

function onScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress = window.scrollY / maxScroll
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}

// ====== ANIMATE ======
function animate() {
  requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()

  camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02
  camera.position.y += (mouseY * 1 - camera.position.y) * 0.02
  camera.position.z = 5 - scrollProgress * 15
  camera.lookAt(0, 0, -5)

  if (particleSystem) {
    particleSystem.material.uniforms.uTime.value = elapsed
    particleSystem.material.uniforms.uScroll.value = scrollProgress
    particleSystem.rotation.y = elapsed * 0.01 + scrollProgress * Math.PI
  }
  if (gridMesh) {
    gridMesh.material.uniforms.uTime.value = elapsed
    gridMesh.material.uniforms.uScroll.value = scrollProgress
  }
  if (tunnelMesh) {
    tunnelMesh.material.uniforms.uTime.value = elapsed
    tunnelMesh.material.uniforms.uScroll.value = scrollProgress
  }

  composer.render()
}

// ====== LOADING ======
function simulateLoading(onComplete) {
  const bar = document.getElementById('loadingBar')
  const el = document.getElementById('loading')
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 10 + 5
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      bar.style.width = '100%'
      setTimeout(() => {
        el.classList.add('hidden')
        setTimeout(() => { el.style.display = 'none' }, 1000)
        onComplete()
      }, 300)
    } else {
      bar.style.width = progress + '%'
    }
  }, 80)
}

// ====== CONTACT FORM ======
function initContactForm() {
  const form = document.getElementById('contactForm')
  if (!form) return
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const btn = form.querySelector('.form-submit')
    btn.textContent = 'Отправлено!'
    btn.style.background = '#fff'
    btn.style.color = '#000'
    setTimeout(() => {
      btn.textContent = 'Отправить'
      btn.style.background = ''
      btn.style.color = ''
      form.reset()
    }, 3000)
  })
}

// ====== BOOT ======
function boot() {
  populateWork()
  populateAbout()
  populateServices()
  initWebGL()
  initScrollAnimations()
  initContactForm()

  // AI Chat
  const aiChat = new AIChat()
  document.getElementById('chatToggle').addEventListener('click', () => aiChat.open())
  document.getElementById('chatClose').addEventListener('click', () => aiChat.close())

  animate()
  simulateLoading(() => {
    gsap.from('.nav', { y: -30, opacity: 0, duration: 1, ease: 'power3.out' })
    gsap.from('.hero-label', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
    gsap.from('.hero-name', { y: 30, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out' })
    gsap.from('.hero-role', { y: 20, opacity: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' })
    gsap.from('.hero-desc', { y: 20, opacity: 0, duration: 0.8, delay: 0.7, ease: 'power3.out' })
    gsap.from('.scroll-indicator', { y: 15, opacity: 0, duration: 0.8, delay: 1, ease: 'power3.out' })
  })
}

boot()
