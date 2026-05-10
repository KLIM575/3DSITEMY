import { projects } from './data/projects.js'

// ====== POPULATE CONTENT ======
function populateWork() {
  const grid = document.getElementById('projectsGrid')
  grid.innerHTML = projects.map(p => `
    <li>
      <article class="project-card">
        <img src="${p.image}" alt="${p.title}: ${p.category}, ${p.client}" width="640" height="400" loading="lazy" decoding="async">
        <div class="project-card-overlay">
          <div class="project-card-number">${p.number}</div>
          <div class="project-card-title">${p.title}</div>
          <div class="project-card-cat">${p.category} — ${p.client}</div>
        </div>
      </article>
    </li>
  `).join('')
}

function populateAbout() {
  const skills = [
    'WebGL / Three.js', 'GLSL Shaders', 'JavaScript / TypeScript',
    'React / Vue', 'Node.js', 'Blender / 3D',
    'UI/UX Design', 'GSAP / Animation', 'Figma', 'WebGPU'
  ]
  document.getElementById('skillsList').innerHTML = skills.map(s => `
    <li class="skill-item">
      <span class="skill-name">${s}</span>
      <span class="skill-level">Advanced</span>
    </li>
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
    <li class="service-item">
      <span class="service-num">${s.num}</span>
      <span class="service-name">${s.name}</span>
      <span class="service-desc">${s.desc}</span>
      <span class="service-arrow" aria-hidden="true">→</span>
    </li>
  `).join('')
}

// ====== SCROLL NAVIGATION ======
window.scrollToSection = function (id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// ====== SECTION REVEAL ON SCROLL ======
function initScrollAnimations(gsap, ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger)
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

  const navLinks = document.querySelectorAll('.nav-links a')
  const mobileTabs = document.querySelectorAll('.mobile-tab')
  const sectionIds = ['hero', 'work', 'designer', 'about', 'services', 'contact']

  function updateActiveNav(index) {
    navLinks.forEach((l, i) => l.classList.toggle('active', i === index))
    mobileTabs.forEach((t, i) => t.classList.toggle('active', i === index))
  }

  sectionIds.forEach((id, i) => {
    ScrollTrigger.create({
      trigger: document.getElementById(id),
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateActiveNav(i),
      onEnterBack: () => updateActiveNav(i)
    })
  })
}

async function loadGsapChunk() {
  try {
    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ])
    initScrollAnimations(gsap, ScrollTrigger)
    return gsap
  } catch (e) {
    console.warn('[gsap]', e)
    return null
  }
}

// ====== LOADING ======
function dismissLoading() {
  const el = document.getElementById('loading')
  const bar = document.getElementById('loadingBar')
  if (bar) bar.style.width = '100%'
  if (!el) return
  el.classList.add('hidden')
  el.setAttribute('aria-busy', 'false')
  el.setAttribute('aria-hidden', 'true')
  setTimeout(() => { el.style.display = 'none' }, 1000)
}

function runEntryAnimations(gsap) {
  if (!gsap) return
  gsap.from('.nav', { y: -30, opacity: 0, duration: 1, ease: 'power3.out' })
  gsap.from('.hero-label', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
  gsap.from('.hero-name', { y: 30, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out' })
  gsap.from('.hero-role', { y: 20, opacity: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' })
  gsap.from('.hero-desc', { y: 20, duration: 0.8, delay: 0.7, ease: 'power3.out' })
  gsap.from('.scroll-indicator', { y: 15, opacity: 0, duration: 0.8, delay: 1, ease: 'power3.out' })
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

/** Lazy-load chat JS until first FAB click. */
function setupLazyAIChat() {
  const toggleBtn = document.getElementById('chatToggle')
  if (!toggleBtn) return

  let chat = null
  let pending

  async function ensureChat() {
    if (chat) return chat
    pending ||= import('./components/AIChat.js').then(({ AIChat }) => {
      chat = new AIChat({ manageToggle: false })
      return chat
    })
    try {
      return await pending
    } finally {
      pending = null
    }
  }

  toggleBtn.addEventListener('click', async () => {
    toggleBtn.setAttribute('aria-busy', 'true')
    try {
      const c = await ensureChat()
      c.toggle()
    } catch (e) {
      console.warn('[AIChat]', e)
    } finally {
      toggleBtn.removeAttribute('aria-busy')
    }
  })
}

// ====== BOOT ======
async function boot() {
  populateWork()
  populateAbout()
  populateServices()
  initContactForm()
  setupLazyAIChat()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dismissLoading()
      void loadGsapChunk().then((gsap) => {
        runEntryAnimations(gsap)
        requestAnimationFrame(() => {
          void import('./webgl/portfolioScene.js')
            .then(({ startPortfolioWebGL }) => startPortfolioWebGL())
            .catch((err) => console.warn('[WebGL]', err))
        })
      })
    })
  })
}

boot()
