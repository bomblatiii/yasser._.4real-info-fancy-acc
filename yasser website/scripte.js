const canvas = document.getElementById('particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const particles = [];
const particleCount = 120;
const cursorGlow = document.getElementById('cursorGlow');
const cursorCore = document.getElementById('cursorCore');
const scene = document.getElementById('scene');
const loader = document.getElementById('loader');
const visitorCount = document.getElementById('visitorCount');
const interactiveElements = document.querySelectorAll('a, button');

const sizes = () => {
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
};

function makeParticle() {
    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.5 + 0.25,
        speed: Math.random() * 0.2 + 0.05,
        drift: Math.random() * 0.4 - 0.2,
    };
}

function createParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) {
        particles.push(makeParticle());
    }
}

function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
        particle.x += particle.drift;
        particle.y -= particle.speed;
        if (particle.y < -10) {
            Object.assign(particle, makeParticle(), { y: window.innerHeight + 10 });
        }
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 7);
        gradient.addColorStop(0, `rgba(255,255,255,${particle.alpha})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function render() {
    if (!ctx) return;
    drawParticles();
    requestAnimationFrame(render);
}

function updateCursor(event) {
    const x = event.clientX;
    const y = event.clientY;
    if (cursorGlow) {
        cursorGlow.style.transform = `translate(${x}px, ${y}px)`;
    }
    if (cursorCore) {
        cursorCore.style.transform = `translate(${x}px, ${y}px)`;
    }
    document.documentElement.style.setProperty('--pointer-x', `${x}px`);
    document.documentElement.style.setProperty('--pointer-y', `${y}px`);
}

function updateParallax(event) {
    const x = (event.clientX / window.innerWidth - 0.5) * 20;
    const y = (event.clientY / window.innerHeight - 0.5) * 20;
    scene.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function animateLoader() {
    setTimeout(() => {
        loader.classList.add('loaded');
    }, 900);
}

function setVisitorCount() {
    visitorCount.textContent = '163';
}

window.addEventListener('resize', sizes);
window.addEventListener('mousemove', (event) => {
    updateCursor(event);
    updateParallax(event);
});

interactiveElements.forEach((element) => {
    element.addEventListener('mouseenter', () => {
        cursorGlow.style.transform += ' scale(1.25)';
    });
    element.addEventListener('mouseleave', () => {
        cursorGlow.style.transform = cursorGlow.style.transform.replace(' scale(1.25)', '');
    });
});
window.addEventListener('load', () => {
    sizes();
    createParticles();
    render();
    animateLoader();
    setVisitorCount();

    const audio = document.getElementById('backgroundAudio');
    const video = document.getElementById('backgroundVideo');

    if (audio) {
        audio.volume = 0.45;
        audio.play().catch((error) => {
            console.warn('Audio autoplay blocked, will resume on interaction.', error);
            const resumeAudio = () => {
                audio.play().catch(() => { });
                window.removeEventListener('click', resumeAudio);
            };
            window.addEventListener('click', resumeAudio, { once: true });
        });
    }

    if (video) {
        video.play().catch((error) => {
            console.warn('Video autoplay blocked; the background will stay ready on interaction.', error);
        });
    }
});
