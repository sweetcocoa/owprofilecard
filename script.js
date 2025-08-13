// Data: hero lists by role (from assets folder names)
const HEROES = {
  dps: [
    'ashe','bastion','cassidy','echo','freja','genji','hanzo','junkrat','mei','pharah','reaper','sojourn','soldier-76','sombra','symmetra','torbjorn','tracer','venture','widowmaker'
  ],
  support: [
    'ana','baptiste','brigitte','illari','juno','kiriko','lifeweaver','lucio','mercy','moira','zenyatta'
  ],
  tank: [
    'doomfist','dva','hazard','junker-queen','mauga','orisa','ramattra','reinhardt','roadhog','sigma','winston','wrecking-ball','zarya'
  ]
};

const POSITION_BADGES = {
  DPS: { text: 'DPS', hue: 24 },
  SUPPORT: { text: 'SUPPORT', hue: 160 },
  TANK: { text: 'TANK', hue: 210 },
  FLEX: { text: 'FLEX', hue: 280 }
};

const canvas = document.getElementById('card-canvas');
const ctx = canvas.getContext('2d');

const inputs = {
  nickname: document.getElementById('nickname'),
  realname: document.getElementById('realname'),
  position: document.getElementById('position'),
  hero1: document.getElementById('hero1'),
  hero2: document.getElementById('hero2'),
  hero3: document.getElementById('hero3'),
  photo: document.getElementById('photo'),
  download: document.getElementById('download-btn')
};

// Build hero options merged across roles
const ALL_HEROES = [
  ...HEROES.dps.map(n => ({ role: 'dps', name: n })),
  ...HEROES.support.map(n => ({ role: 'support', name: n })),
  ...HEROES.tank.map(n => ({ role: 'tank', name: n }))
];

function populateHeroSelect(selectEl) {
  selectEl.innerHTML = '';
  const makeOptGroup = (label) => {
    const group = document.createElement('optgroup');
    group.label = label.toUpperCase();
    return group;
  };
  const groupDps = makeOptGroup('DPS');
  const groupSupport = makeOptGroup('SUPPORT');
  const groupTank = makeOptGroup('TANK');
  HEROES.dps.forEach(n => {
    const opt = document.createElement('option');
    opt.value = `dps/${n}.png`;
    opt.textContent = titleCase(n);
    groupDps.appendChild(opt);
  });
  HEROES.support.forEach(n => {
    const opt = document.createElement('option');
    opt.value = `support/${n}.png`;
    opt.textContent = titleCase(n);
    groupSupport.appendChild(opt);
  });
  HEROES.tank.forEach(n => {
    const opt = document.createElement('option');
    opt.value = `tank/${n}.png`;
    opt.textContent = titleCase(n);
    groupTank.appendChild(opt);
  });
  selectEl.appendChild(groupDps);
  selectEl.appendChild(groupSupport);
  selectEl.appendChild(groupTank);
}

function titleCase(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Populate selects
[inputs.hero1, inputs.hero2, inputs.hero3].forEach(populateHeroSelect);
inputs.hero1.value = 'dps/tracer.png';
inputs.hero2.value = 'support/mercy.png';
inputs.hero3.value = 'tank/winston.png';

// State
let uploadedImage = null; // Image object from user upload

inputs.photo.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      uploadedImage = img;
      draw();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

['input', 'change'].forEach(evt => {
  inputs.nickname.addEventListener(evt, draw);
  inputs.realname.addEventListener(evt, draw);
  inputs.position.addEventListener(evt, draw);
  inputs.hero1.addEventListener(evt, draw);
  inputs.hero2.addEventListener(evt, draw);
  inputs.hero3.addEventListener(evt, draw);
});

inputs.download.addEventListener('click', async () => {
  // Ensure all async image loads in draw() finished before export
  await draw();
  const link = document.createElement('a');
  const nick = inputs.nickname.value || 'player';
  link.download = `ow-profile-${slugify(nick)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundedRectPath(context, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + w - radius, y);
  context.quadraticCurveTo(x + w, y, x + w, y + radius);
  context.lineTo(x + w, y + h - radius);
  context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  context.lineTo(x + radius, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

async function draw() {
  const width = canvas.width;
  const height = canvas.height;
  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0e0f14');
  gradient.addColorStop(1, '#1a2030');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Card frame
  const framePadding = 48;
  drawRoundedRectPath(ctx, framePadding, framePadding, width - framePadding * 2, height - framePadding * 2, 32);
  ctx.fillStyle = '#0b0e14cc';
  ctx.fill();
  ctx.strokeStyle = '#2a3350';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Header
  const headerY = framePadding + 72;
  ctx.font = '700 64px Pretendard, system-ui, sans-serif';
  ctx.fillStyle = '#eaf0ff';
  ctx.textBaseline = 'middle';
  const nickname = inputs.nickname.value || 'NICKNAME';
  ctx.fillText(nickname, framePadding + 36, headerY);

  ctx.font = '400 28px Pretendard, system-ui, sans-serif';
  ctx.fillStyle = '#a9b2c7';
  const realname = inputs.realname.value || '홍길동';
  ctx.fillText(realname, framePadding + 40, headerY + 46);

  // Position badge (top-right)
  const pos = inputs.position.value || 'DPS';
  const badgeX = width - framePadding - 36;
  const badgeY = framePadding + 36;
  const badgeW = 260;
  const badgeH = 72;
  ctx.save();
  drawRoundedRectPath(ctx, badgeX - badgeW, badgeY, badgeW, badgeH, 18);
  const hue = POSITION_BADGES[pos].hue;
  const grad2 = ctx.createLinearGradient(badgeX - badgeW, badgeY, badgeX, badgeY + badgeH);
  grad2.addColorStop(0, `hsl(${hue} 90% 60% / 0.95)`);
  grad2.addColorStop(1, `hsl(${hue} 90% 40% / 0.95)`);
  ctx.fillStyle = grad2;
  ctx.fill();
  ctx.shadowColor = `hsl(${hue} 90% 50% / 0.6)`;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 2;
  ctx.strokeStyle = `hsl(${hue} 90% 35%)`;
  ctx.stroke();
  ctx.restore();

  // position icon + text inside badge (keep icon fully within left padding)
  const iconSize = 28;
  const badgeLeft = badgeX - badgeW;
  const iconCenterX = badgeLeft + 18 + iconSize; // left margin + radius to avoid overflow
  drawPositionIcon(ctx, pos, iconCenterX, badgeY + badgeH / 2, iconSize, hue);
  ctx.font = '800 34px Pretendard, system-ui, sans-serif';
  ctx.fillStyle = '#0b0f16';
  ctx.textAlign = 'right';
  ctx.fillText(POSITION_BADGES[pos].text, badgeX - 22, badgeY + badgeH / 2 + 2);
  ctx.textAlign = 'left';

  // Player photo area
  const photoX = framePadding + 48;
  const photoY = framePadding + 160;
  const photoW = width - (framePadding + 48) * 2;
  const photoH = 980;
  ctx.save();
  drawRoundedRectPath(ctx, photoX, photoY, photoW, photoH, 24);
  ctx.clip();
  ctx.fillStyle = '#121621';
  ctx.fillRect(photoX, photoY, photoW, photoH);
  if (uploadedImage) {
    // Cover fit
    const img = uploadedImage;
    const ratio = Math.max(photoW / img.width, photoH / img.height);
    const dw = img.width * ratio;
    const dh = img.height * ratio;
    const dx = photoX + (photoW - dw) / 2;
    const dy = photoY + (photoH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = '#24304a';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = '#8ca0c9';
    ctx.font = '600 28px Pretendard, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('선수 사진을 업로드하세요', width / 2, photoY + photoH / 2);
    ctx.textAlign = 'left';
  }
  ctx.restore();

  // Most heroes strip
  const heroBoxW = Math.floor((photoW - 2 * 36) / 3); // 3 columns with gaps
  const labelHeight = 64; // slightly tighter label area
  const heroBoxH = heroBoxW + labelHeight; // square portrait + label
  const bottomMargin = 96; // reduce large blank space below hero row
  const minTop = photoY + photoH + 36; // avoid overlapping photo area
  const heroesY = Math.max(minTop, height - framePadding - bottomMargin - heroBoxH);

  const heroSelections = [inputs.hero1.value, inputs.hero2.value, inputs.hero3.value];
  const heroImages = await Promise.all(heroSelections.map(async (rel) => {
    try {
      return await loadImage(`./assets/${rel}`);
    } catch (_) {
      return null;
    }
  }));

  for (let i = 0; i < 3; i++) {
    const hx = photoX + i * (heroBoxW + 36);
    const hy = heroesY;
    ctx.save();
    drawRoundedRectPath(ctx, hx, hy, heroBoxW, heroBoxH, 20);
    ctx.fillStyle = '#0f1420';
    ctx.fill();
    ctx.strokeStyle = '#2a3350';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();
    // Portrait area square top
    const portraitSize = heroBoxW;
    if (heroImages[i]) {
      const img = heroImages[i];
      // contain fit into square
      const ratio = Math.min(portraitSize / img.width, portraitSize / img.height);
      const dw = img.width * ratio;
      const dh = img.height * ratio;
      const dx = hx + (portraitSize - dw) / 2;
      const dy = hy + (portraitSize - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#1a2332';
      ctx.fillRect(hx, hy, portraitSize, portraitSize);
    }
    // Name label area
    ctx.fillStyle = '#101725';
    ctx.fillRect(hx, hy + portraitSize, heroBoxW, heroBoxH - portraitSize);

    ctx.font = '700 26px Pretendard, system-ui, sans-serif';
    ctx.fillStyle = '#dfe7ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const nameSlug = heroSelections[i] || '';
    const base = nameSlug.split('/').pop() || '';
    const name = titleCase(base.replace('.png',''));
    ctx.fillText(name || '—', hx + heroBoxW / 2, hy + portraitSize + labelHeight / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  // Footer
  ctx.font = '400 22px Pretendard, system-ui, sans-serif';
  ctx.fillStyle = '#7f8bad';
  ctx.textAlign = 'center';
  ctx.fillText('overwatch profile card', width / 2, height - framePadding - 22);
  ctx.textAlign = 'left';
}

function drawPositionIcon(context, position, centerX, centerY, size, hue) {
  const stroke = `hsl(${hue} 90% 18%)`;
  const fill = `hsl(${hue} 90% 12%)`;
  context.save();
  context.translate(centerX, centerY);
  context.lineWidth = 3;
  context.strokeStyle = stroke;
  context.fillStyle = fill;
  switch (position) {
    case 'DPS': {
      // crosshair
      const r = size;
      context.beginPath();
      context.arc(0, 0, r, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(-r, 0); context.lineTo(-r / 3, 0);
      context.moveTo(r, 0); context.lineTo(r / 3, 0);
      context.moveTo(0, -r); context.lineTo(0, -r / 3);
      context.moveTo(0, r); context.lineTo(0, r / 3);
      context.stroke();
      break;
    }
    case 'SUPPORT': {
      // plus sign
      const t = size * 0.6;
      const w = size * 0.4;
      context.beginPath();
      context.rect(-w / 2, -t, w, t * 2);
      context.rect(-t, -w / 2, t * 2, w);
      context.fill();
      context.stroke();
      break;
    }
    case 'TANK': {
      // shield
      const s = size * 1.2;
      context.beginPath();
      context.moveTo(0, -s);
      context.lineTo(s * 0.9, -s * 0.2);
      context.lineTo(s * 0.6, s * 0.8);
      context.lineTo(0, s);
      context.lineTo(-s * 0.6, s * 0.8);
      context.lineTo(-s * 0.9, -s * 0.2);
      context.closePath();
      context.fill();
      context.stroke();
      break;
    }
    case 'FLEX': {
      // rotated square (diamond)
      const r = size * 1.2;
      context.beginPath();
      context.moveTo(0, -r);
      context.lineTo(r, 0);
      context.lineTo(0, r);
      context.lineTo(-r, 0);
      context.closePath();
      context.fill();
      context.stroke();
      break;
    }
  }
  context.restore();
}

// Initial draw
draw();


