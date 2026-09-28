/* ============================================================
   MC 百科全书 · 应用逻辑
   路由：#/<edition>/<cat?>/<entryId?>
   ============================================================ */

const LS_EDITION = 'mcwiki.edition';
const LS_THEME = 'mcwiki.theme';

const App = {
  edition: 'java',
  cat: null,
  entry: null,
  q: '',

  /* ---------- 数据 ---------- */
  all() { return E; },
  visible() { return E.filter(e => e.versions.includes(this.edition)); },
  visibleIn(catId) {
    return this.visible().filter(e => e.cat === catId);
  },
  catCount(catId) { return this.visibleIn(catId).length; },
  find(id) { return E.find(e => e.id === id); },

  /* ---------- 启动 ---------- */
  init() {
    const savedEd = localStorage.getItem(LS_EDITION);
    const savedTh = localStorage.getItem(LS_THEME);

    if (savedTh) document.documentElement.setAttribute('data-theme', savedTh);
    this.syncThemeBtn();

    // 直接带 hash 进来就跳过选版本
    const h = location.hash;
    const m = h.match(/^#\/(java|bedrock)/);
    if (m && savedEd) {
      this.edition = m[1];
      this.enterApp();
      this.route();
    } else {
      // 只渲染选版本界面
    }

    // 版本卡片
    document.querySelectorAll('.vcard').forEach(btn => {
      btn.addEventListener('click', () => {
        this.edition = btn.dataset.edition;
        localStorage.setItem(LS_EDITION, this.edition);
        this.enterApp();
        this.goHome();
      });
    });

    window.addEventListener('hashchange', () => this.route());
    this.bindUI();
  },

  enterApp() {
    document.getElementById('gate').style.display = 'none';
    const app = document.getElementById('app');
    app.hidden = false;
    this.applyEdition();
    this.renderCats();
  },

  bindUI() {
    // 搜索
    const si = document.getElementById('search');
    si.addEventListener('input', () => {
      this.q = si.value.trim();
      document.getElementById('searchClear').hidden = !this.q;
      this.renderSearchPop();
    });
    document.getElementById('searchClear').addEventListener('click', () => {
      si.value = ''; this.q = '';
      document.getElementById('searchClear').hidden = true;
      document.getElementById('searchPop').hidden = true;
    });

    // 随机
    document.getElementById('randBtn').addEventListener('click', () => {
      const v = this.visible();
      const e = v[Math.floor(Math.random() * v.length)];
      this.go(e.id);
    });

    // 主题
    document.getElementById('themeBtn').addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme');
      const next = now === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(LS_THEME, next);
      this.syncThemeBtn();
    });

    // 版本浮层
    const pill = document.getElementById('editionPill');
    const pop = document.getElementById('editionPop');
    pill.addEventListener('click', ev => {
      ev.stopPropagation();
      const r = pill.getBoundingClientRect();
      pop.style.top = (r.bottom + 8) + 'px';
      pop.style.left = Math.max(8, r.right - 200) + 'px';
      pop.hidden = !pop.hidden;
    });
    document.addEventListener('click', () => { pop.hidden = true; });
    pop.addEventListener('click', ev => ev.stopPropagation());
    pop.querySelectorAll('.popover__item').forEach(b => {
      b.addEventListener('click', () => {
        this.edition = b.dataset.edition;
        localStorage.setItem(LS_EDITION, this.edition);
        pop.hidden = true;
        this.applyEdition();
        this.renderCats();
        // 当前条目若不属于新版本，退回分类/首页
        if (this.entry && !this.find(this.entry).versions.includes(this.edition)) {
          this.goHome();
        } else {
          this.hash();
          this.render();
        }
      });
    });

    // 移动端侧栏
    const sb = document.getElementById('sidebar');
    document.getElementById('menuBtn').addEventListener('click', () => {
      sb.classList.toggle('open');
      document.getElementById('scrim').hidden = !sb.classList.contains('open');
    });
    document.getElementById('scrim').addEventListener('click', () => {
      sb.classList.remove('open');
      document.getElementById('scrim').hidden = true;
    });
  },

  syncThemeBtn() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.getElementById('themeBtn').textContent = dark ? '🌙' : '☀️';
  },

  applyEdition() {
    const isJava = this.edition === 'java';
    document.documentElement.style.setProperty('--accent',
      isJava ? 'var(--java)' : 'var(--bedrock)');
    document.getElementById('editionPillName').textContent = isJava ? 'Java 版' : '基岩版';
  },

  /* ---------- 路由 ---------- */
  hash() {
    const parts = ['#', this.edition];
    if (this.cat) parts.push(this.cat);
    if (this.entry) parts.push(this.entry);
    location.hash = parts.join('/');
  },

  route() {
    const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!p.length) return;
    if (p[0] === 'java' || p[0] === 'bedrock') {
      this.edition = p[0];
      p.shift();
    }
    this.cat = p[0] || null;
    this.entry = p[1] || null;
    if (document.getElementById('app').hidden) this.enterApp();
    this.applyEdition();
    this.renderCats();
    this.render();
  },

  goHome() {
    this.cat = null; this.entry = null;
    this.hash(); this.render();
    window.scrollTo({ top: 0 });
  },

  goCat(catId) {
    this.cat = catId; this.entry = null;
    this.hash(); this.render();
    window.scrollTo({ top: 0 });
  },

  go(id) {
    const e = this.find(id);
    if (!e) return;
    this.cat = e.cat; this.entry = id;
    this.hash(); this.render();
    window.scrollTo({ top: 0 });
  },

  /* ---------- 渲染：侧栏 ---------- */
  renderCats() {
    const nav = document.getElementById('catNav');
    let html = `<button class="cat-btn ${this.cat ? '' : 'on'}" data-cat="">
      <span class="cat-btn__ico">🏠</span><span>全部</span>
      <span class="cat-btn__n">${this.visible().length}</span></button>`;
    for (const c of CATS) {
      const n = this.catCount(c.id);
      if (n === 0) continue;
      html += `<button class="cat-btn ${this.cat === c.id ? 'on' : ''}" data-cat="${c.id}">
        <span class="cat-btn__ico">${c.icon}</span><span>${c.name}</span>
        <span class="cat-btn__n">${n}</span></button>`;
    }
    nav.innerHTML = html;
    nav.querySelectorAll('.cat-btn').forEach(b => {
      b.addEventListener('click', () => {
        const c = b.dataset.cat;
        c ? this.goCat(c) : this.goHome();
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('scrim').hidden = true;
      });
    });
    document.getElementById('statCount').textContent = this.visible().length;
  },

  /* ---------- 渲染：搜索下拉 ---------- */
  renderSearchPop() {
    const pop = document.getElementById('searchPop');
    if (!this.q) { pop.hidden = true; return; }
    const q = this.q.toLowerCase();
    const hits = this.visible().filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.en.toLowerCase().includes(q) ||
      (e.tags || []).some(t => t.toLowerCase().includes(q)) ||
      e.summary.toLowerCase().includes(q)
    ).slice(0, 12);

    if (!hits.length) {
      pop.innerHTML = `<div class="search__empty">没有匹配「${this.esc(this.q)}」的条目</div>`;
      pop.hidden = false; return;
    }
    pop.innerHTML = hits.map(e => {
      const c = CATS.find(x => x.id === e.cat);
      return `<button class="search__item" data-id="${e.id}">
        <span class="si-ico">${e.icon}</span>
        <span class="si-tx">
          <span class="si-nm">${this.esc(e.name)}</span>
          <span class="si-cat">${c ? c.name : ''} · ${e.en}</span>
        </span></button>`;
    }).join('');
    pop.querySelectorAll('.search__item').forEach(b => {
      b.addEventListener('click', () => {
        this.go(b.dataset.id);
        pop.hidden = true;
        document.getElementById('search').value = '';
        this.q = '';
        document.getElementById('searchClear').hidden = true;
      });
    });
    pop.hidden = false;
  },

  /* ---------- 渲染：主区 ---------- */
  render() {
    const crumbs = document.getElementById('crumbs');
    const view = document.getElementById('view');

    if (this.entry) { this.renderEntry(crumbs, view); return; }
    if (this.cat) { this.renderCatPage(crumbs, view); return; }
    this.renderHome(crumbs, view);
  },

  renderHome(crumbs, view) {
    crumbs.innerHTML = `<span class="cur">首页</span>`;
    const isJava = this.edition === 'java';
    const edName = isJava ? 'Java 版' : '基岩版';
    const sysName = isJava ? '进度' : '成就';

    let html = `<div class="hero">
      <h1>${edName} · 百科首页</h1>
      <p>当前按 <b>${edName}</b> 过滤内容，共 <b>${this.visible().length}</b> 个条目。
      这个版本使用<b>${sysName}</b>系统${isJava ? '，红石支持<b>准连接性</b>与攻击冷却' : '，可以用桶<b>装起水生生物</b>'}。</p>
      <div class="hero__tags">
        <span class="tag tag--accent">${edName}</span>
        <span class="tag">${isJava ? '进度系统' : '成就系统'}</span>
        <span class="tag">${CATS.length} 个分类</span>
        <span class="tag">右上角可切换版本</span>
      </div>
    </div>`;

    for (const c of CATS) {
      const list = this.visibleIn(c.id);
      if (!list.length) continue;
      html += `<div class="sect-title">${c.icon} ${c.name}<span class="cnt">${list.length} 条 · ${c.desc}</span></div>
        <div class="grid">${list.slice(0, 8).map(e => this.cardHtml(e)).join('')}</div>`;
      if (list.length > 8) {
        html += `<div style="margin-top:10px"><button class="tag tag--accent" data-morecat="${c.id}">查看全部 ${list.length} 条 →</button></div>`;
      }
    }
    view.innerHTML = html;
    view.querySelectorAll('[data-morecat]').forEach(b =>
      b.addEventListener('click', () => this.goCat(b.dataset.morecat)));
    this.bindCards(view);
  },

  renderCatPage(crumbs, view) {
    const c = CATS.find(x => x.id === this.cat);
    if (!c) return this.goHome();
    crumbs.innerHTML = `<button onclick="App.goHome()">首页</button>
      <span class="sep">/</span><span class="cur">${c.name}</span>`;

    const list = this.visibleIn(this.cat);
    const onlyOther = E.filter(e => e.cat === this.cat && !e.versions.includes(this.edition));

    let html = `<div class="hero">
      <h1>${c.icon} ${c.name}</h1>
      <p>${c.desc} · 当前版本可见 <b>${list.length}</b> 条。</p>
    </div>`;

    if (onlyOther.length) {
      const other = this.edition === 'java' ? '基岩版' : 'Java 版';
      html += `<div class="note"><span class="note__ico">ℹ️</span><div>
        另有 <b>${onlyOther.length}</b> 条属于<b>${other}</b>专属内容，已按当前版本隐藏：
        ${onlyOther.map(e => e.name).join('、')}。切换版本即可看到。</div></div>`;
    }

    html += `<div class="sect-title">全部条目<span class="cnt">${list.length}</span></div>
      <div class="grid">${list.map(e => this.cardHtml(e)).join('')}</div>`;
    view.innerHTML = html;
    this.bindCards(view);
  },

  renderEntry(crumbs, view) {
    const e = this.find(this.entry);
    if (!e) return this.goHome();
    const c = CATS.find(x => x.id === e.cat);

    crumbs.innerHTML = `<button onclick="App.goHome()">首页</button>
      <span class="sep">/</span>
      <button onclick="App.goCat('${e.cat}')">${c ? c.name : ''}</button>
      <span class="sep">/</span><span class="cur">${this.esc(e.name)}</span>`;

    const flags = [];
    if (e.boss) flags.push('<span class="flag flag--boss">Boss</span>');
    if (e.versions.length === 1) {
      flags.push(e.versions[0] === 'java'
        ? '<span class="flag flag--j">仅 Java 版</span>'
        : '<span class="flag flag--b">仅基岩版</span>');
    }

    const facts = (e.facts || []).map(([k, v]) =>
      `<div class="row"><div class="row__k">${this.esc(k)}</div><div class="row__v">${v}</div></div>`).join('');

    const body = (e.sections || []).map(s => {
      const inner = s.ul ? `<ul>${s.ul.map(x => `<li>${x}</li>`).join('')}</ul>`
        : `<p>${s.p}</p>`;
      return `<h2>${this.esc(s.h)}</h2>${inner}`;
    }).join('');

    const diffHtml = e.diff ? `<div class="note"><span class="note__ico">🔀</span><div>
      <b>版本差异</b><br>${e.diff}</div></div>` : '';

    let relIds = (RELATED[e.id] || []).filter(id => this.find(id) && this.find(id).versions.includes(this.edition));
    if (relIds.length < 4) {
      relIds = relIds.concat(this.visibleIn(e.cat).filter(x => x.id !== e.id && !relIds.includes(x.id))
        .slice(0, 6 - relIds.length).map(x => x.id));
    }
    const relHtml = relIds.length ? `<h2>相关条目</h2><div class="related">${
      relIds.map(id => { const r = this.find(id); return `<button data-goto="${id}"><span>${r.icon}</span>${this.esc(r.name)}</button>`; }).join('')
    }</div>` : '';

    view.innerHTML = `
      <div class="entry">
        <aside class="infobox" style="--c:${e.color}">
          <div class="infobox__head">
            <div class="infobox__ico">${e.icon}</div>
            <div class="infobox__nm">${this.esc(e.name)}</div>
            <div class="infobox__en">${this.esc(e.en)}</div>
          </div>
          <div class="infobox__rows">${facts}</div>
          <div class="infobox__foot">
            ${flags.join('')}
            ${(e.tags || []).map(t => `<span class="flag">${this.esc(t)}</span>`).join('')}
          </div>
        </aside>
        <article class="article">
          <div class="article__lead">${e.summary}</div>
          ${diffHtml}
          ${body}
          ${relHtml}
        </article>
      </div>`;

    view.querySelectorAll('[data-goto]').forEach(b =>
      b.addEventListener('click', () => this.go(b.dataset.goto)));
  },

  cardHtml(e) {
    let flags = '';
    if (e.boss) flags += '<span class="flag flag--boss">Boss</span>';
    if (e.versions.length === 1) {
      flags += e.versions[0] === 'java'
        ? '<span class="flag flag--j">仅 Java</span>'
        : '<span class="flag flag--b">仅基岩</span>';
    }
    return `<button class="card" data-goto="${e.id}">
      <div class="card__top">
        <div class="card__ico" style="background:color-mix(in srgb, ${e.color} 26%, var(--panel))">${e.icon}</div>
        <div>
          <div class="card__nm">${this.esc(e.name)}</div>
          <div class="card__en">${this.esc(e.en)}</div>
        </div>
      </div>
      <div class="card__sm">${this.esc(e.summary)}</div>
      ${flags ? `<div class="card__flags">${flags}</div>` : ''}
    </button>`;
  },

  bindCards(root) {
    root.querySelectorAll('[data-goto]').forEach(b =>
      b.addEventListener('click', () => this.go(b.dataset.goto)));
  },

  esc(s) {
    return String(s).replace(/[&<>"']/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  },
};

window.addEventListener('DOMContentLoaded', () => App.init());
