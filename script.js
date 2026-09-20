const progressBar = document.getElementById('progressBar');
const menuToggle = document.getElementById('menuToggle');
const siteNav = document.getElementById('siteNav');
const soundButton = document.getElementById('soundButton');
const soundLabel = document.getElementById('soundLabel');
const soundtrack = document.getElementById('soundtrack');
const gallery = document.getElementById('gallery');
const galleryIndex = document.getElementById('galleryIndex');
const galleryItems = [...document.querySelectorAll('.gallery-item')];
const toast = document.getElementById('toast');
const posterDialog = document.getElementById('posterDialog');

const tracks = [
  { src: 'assets/opening.mp3', label: '原稿配乐 1' },
  { src: 'assets/debate.mp3', label: '原稿配乐 2' }
];
let trackIndex = 0;

function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const amount = total > 0 ? (window.scrollY / total) * 100 : 0;
  progressBar.style.width = `${amount}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

menuToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

siteNav.addEventListener('click', event => {
  if (event.target.matches('a')) {
    siteNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

soundtrack.src = tracks[0].src;
soundButton.addEventListener('click', async () => {
  if (soundtrack.paused) {
    try {
      await soundtrack.play();
      soundButton.setAttribute('aria-pressed', 'true');
      soundLabel.textContent = `暂停 ${tracks[trackIndex].label}`;
    } catch {
      soundLabel.textContent = '配乐暂时无法播放';
    }
  } else {
    soundtrack.pause();
    soundButton.setAttribute('aria-pressed', 'false');
    soundLabel.textContent = '继续播放配乐';
  }
});

soundtrack.addEventListener('ended', async () => {
  trackIndex = (trackIndex + 1) % tracks.length;
  soundtrack.src = tracks[trackIndex].src;
  try { await soundtrack.play(); } catch { /* User can restart playback manually. */ }
  soundLabel.textContent = `暂停 ${tracks[trackIndex].label}`;
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.13, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

function currentGalleryIndex() {
  const left = gallery.getBoundingClientRect().left;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  galleryItems.forEach((item, index) => {
    const distance = Math.abs(item.getBoundingClientRect().left - left);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function updateGalleryIndex() {
  galleryIndex.textContent = String(currentGalleryIndex() + 1).padStart(2, '0');
}

function moveGallery(direction) {
  const nextIndex = Math.min(Math.max(currentGalleryIndex() + direction, 0), galleryItems.length - 1);
  galleryItems[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
}

document.getElementById('galleryPrev').addEventListener('click', () => moveGallery(-1));
document.getElementById('galleryNext').addEventListener('click', () => moveGallery(1));
gallery.addEventListener('scroll', () => requestAnimationFrame(updateGalleryIndex), { passive: true });

document.getElementById('copyGroup').addEventListener('click', async () => {
  const groupNumber = document.getElementById('groupNumber').textContent.trim();
  let copied = false;
  try {
    await navigator.clipboard.writeText(groupNumber);
    copied = true;
  } catch { /* Local files can block the modern clipboard API. */ }
  if (!copied) {
    const helper = document.createElement('textarea');
    helper.value = groupNumber;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    copied = document.execCommand('copy');
    helper.remove();
  }
  toast.textContent = copied ? '群号已复制' : `QQ群号：${groupNumber}`;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
});

document.getElementById('posterButton').addEventListener('click', () => posterDialog.showModal());
document.getElementById('posterClose').addEventListener('click', () => posterDialog.close());
posterDialog.addEventListener('click', event => {
  if (event.target === posterDialog) posterDialog.close();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && posterDialog.open) posterDialog.close();
  if (document.activeElement === gallery) {
    if (event.key === 'ArrowLeft') moveGallery(-1);
    if (event.key === 'ArrowRight') moveGallery(1);
  }
});
