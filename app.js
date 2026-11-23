/* ============ 三式合参 · 应用逻辑 ============ */
'use strict';

const E = window.SanShiEngine;
const $ = (id) => document.getElementById(id);

/* ---------------- 基础常量与工具 ---------------- */

// 八卦三线（自下而上，1=阳 0=阴），兼容繁简
const TRIGRAM_LINES = {
  '乾': [1, 1, 1],
  '兌': [1, 1, 0], '兑': [1, 1, 0],
  '離': [1, 0, 1], '离': [1, 0, 1],
  '震': [1, 0, 0],
  '巽': [0, 1, 1],
  '坎': [0, 1, 0],
  '艮': [0, 0, 1],
  '坤': [0, 0, 0],
};

// 引擎（mingpan）输出为繁体，统一转为简体显示
const TRAD2SIMP = {
  '為': '为', '風': '风', '澤': '泽', '離': '离', '兌': '兑', '與': '与', '時': '时',
  '轉': '转', '陽': '阳', '陰': '阴', '沖': '冲', '傷': '伤', '開': '开', '驚': '惊',
  '輔': '辅', '臨': '临', '門': '门', '宮': '宫', '儀': '仪', '擊': '击', '滯': '滞',
  '嚴': '严', '並': '并', '晝': '昼', '龍': '龙', '貴': '贵', '從': '从', '賊': '贼',
  '尅': '克', '傳': '传', '財': '财', '孫': '孙', '審': '审', '歲': '岁', '陳': '陈',
  '課': '课', '將': '将', '馬': '马', '蓋': '盖', '電': '电', '勝': '胜', '魁': '魁',
  '太': '太', '神': '神', '后': '后', '雀': '雀', '合': '合', '空': '空', '常': '常',
  '玄': '玄', '上': '上', '下': '下', '初': '初', '中': '中', '末': '末', '妻': '妻',
  '官': '官', '鬼': '鬼', '伏': '伏', '吟': '吟', '值': '值', '本': '本', '大': '大',
  '阻': '阻', '重': '重', '行': '行', '加': '加', '首': '首', '遇': '遇', '主': '主',
  '悖': '悖', '逆': '逆', '相': '相', '于': '于', '入': '入', '墓': '墓', '凶': '凶',
  '吉': '吉', '格': '格', '得': '得', '使': '使', '奇': '奇', '星': '星', '性': '性',
  '水': '水', '火': '火', '土': '土', '金': '金', '木': '木', '日': '日', '月': '月',
  '年': '年', '辰': '辰', '巳': '巳', '午': '午', '未': '未', '申': '申', '酉': '酉',
  '戌': '戌', '亥': '亥', '子': '子', '丑': '丑', '寅': '寅', '卯': '卯',
  // 六十四卦名常用繁体
  '謙': '谦', '師': '师', '復': '复', '剝': '剥', '蠱': '蛊', '頤': '颐', '賁': '贲',
  '損': '损', '濟': '济', '節': '节', '觀': '观', '漸': '渐', '渙': '涣', '過': '过',
  '恆': '恒', '豐': '丰', '歸': '归', '壯': '壮', '晉': '晋', '隨': '随', '遯': '遁',
  '訟': '讼', '無': '无', '妄': '妄', '泰': '泰', '升': '升', '蒙': '蒙', '比': '比',
  '需': '需', '蹇': '蹇', '屯': '屯', '畜': '畜', '益': '益', '家人': '家人', '孚': '孚',
  '豫': '豫', '解': '解', '鼎': '鼎', '睽': '睽', '萃': '萃', '咸': '咸', '困': '困',
  '革': '革', '夬': '夬', '否': '否', '姤': '姤', '同': '同', '人': '人', '履': '履',
  '妄': '妄', '壯': '壮', '旅': '旅', '明': '明', '夷': '夷',
};

function trad2simp(s) {
  return String(s ?? '').replace(/[為風澤離兌與時轉陽陰沖傷開驚輔臨門宮儀擊滯嚴並晝龍貴從賊尅傳財孫審歲陳課將馬蓋電勝魁太神后雀合空常玄上下初中末妻官鬼伏吟值本大阻重行加首遇主悖逆相于入墓凶吉格得使奇星性水火土木金日月年辰巳午未申酉戌亥子丑寅卯謙師復剝蠱頤賁損濟節觀漸渙過恆豐歸壯晉隨遯訟無妄泰升蒙比需蹇屯畜益家人孚豫解鼎睽萃咸困革夬否姤同人履壯旅明夷]/g,
    (c) => TRAD2SIMP[c] || c);
}

const YAO_POS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

// 解读侧重：界面四类 ↔ 奇门用神事类
const SHILEI_MAP = { '感情': '婚姻', '事业': '工作', '财运': '求财', '健康': '疾病' };
const SHILEI_DISPLAY = { '婚姻': '感情', '工作': '事业', '求财': '财运', '疾病': '健康' };

// 六爻爻值：6老阴 7少阴 8少阳 9老阳
function yaoSym(v) {
  return { 6: '×', 7: '--', 8: '—', 9: '○' }[v] || '—';
}
function yaoName(v) {
  return { 6: '老阴', 7: '少阴', 8: '少阳', 9: '老阳' }[v] || '';
}
function isMovingVal(v) { return v === 6 || v === 9; }

// 卦象 HTML：上卦 + 下卦，动爻高亮。lines 自下而上
function guaHTML(upperName, lowerName, movingYao) {
  const lines = [...TRIGRAM_LINES[lowerName], ...TRIGRAM_LINES[upperName]];
  return lines.map((y, i) => {
    const pos = i + 1;
    const moving = movingYao === pos;
    const bars = y === 1
      ? '<span class="seg"></span>'
      : '<span class="seg"></span><span class="seg"></span>';
    return `<div class="yao ${y === 1 ? 'yang' : 'yin'}${moving ? ' moving' : ''}">${bars}${moving ? '<span class="mark">○</span>' : ''}</div>`;
  }).join('');
}

function esc(s) {
  return trad2simp(String(s ?? '')).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function gongName(g) {
  return { 1: '坎', 2: '坤', 3: '震', 4: '巽', 5: '中', 6: '乾', 7: '兑', 8: '艮', 9: '离' }[g] || g;
}

function nowBeijing() {
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes() };
}

/* ---------------- AI 配置（本地存储） ---------------- */

const AI_KEY = 'sanshi.ai.config';

function loadAIConfig() {
  try { return JSON.parse(localStorage.getItem(AI_KEY)) || {}; } catch { return {}; }
}
function fillAIForm() {
  const c = loadAIConfig();
  $('aiBase').value = c.base || '';
  $('aiKey').value = c.key || '';
  $('aiModel').value = c.model || '';
}
function getAIConfig() {
  const c = loadAIConfig();
  if (!c.base || !c.key || !c.model) return null;
  return c;
}
function saveAIConfig() {
  const c = { base: $('aiBase').value.trim().replace(/\/+$/, ''), key: $('aiKey').value.trim(), model: $('aiModel').value.trim() };
  localStorage.setItem(AI_KEY, JSON.stringify(c));
  const st = $('configStatus');
  st.textContent = '已保存到本地';
  st.className = 'status ok';
  setTimeout(() => { st.textContent = ''; st.className = 'status'; }, 2500);
}

/* ---------------- AI 对话引擎（OpenAI 兼容，支持流式） ---------------- */

async function chatCompletion(messages, onDelta) {
  const c = getAIConfig();
  if (!c) throw new Error('请先展开「AI 接口配置」，填写接口地址、API Key 与模型');
  const url = c.base + '/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + c.key },
    body: JSON.stringify({ model: c.model, messages, stream: true, temperature: 0.7 }),
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.text()).slice(0, 180); } catch {}
    throw new Error('接口返回 ' + res.status + (detail ? '：' + detail : ''));
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/event-stream')) {
    const j = await res.json();
    const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
    if (text) onDelta(text);
    return;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const j = JSON.parse(data);
        const d = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
        if (d) onDelta(d);
      } catch {}
    }
  }
}

function addMsg(bodyEl, cls, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + cls;
  div.textContent = text;
  bodyEl.appendChild(div);
  bodyEl.scrollTop = bodyEl.scrollHeight;
  return div;
}

// 流式发送：返回 Promise，resolve 时消息完成
async function sendChat(bodyEl, messages, userText) {
  if (userText) addMsg(bodyEl, 'user', userText);
  const aiDiv = document.createElement('div');
  aiDiv.className = 'msg ai';
  aiDiv.innerHTML = '<span class="caret"></span>';
  bodyEl.appendChild(aiDiv);
  bodyEl.scrollTop = bodyEl.scrollHeight;
  let text = '';
  try {
    await chatCompletion(messages, (delta) => {
      text += delta;
      aiDiv.innerHTML = esc(text) + '<span class="caret"></span>';
      bodyEl.scrollTop = bodyEl.scrollHeight;
    });
    aiDiv.innerHTML = esc(text);
  } catch (err) {
    aiDiv.remove();
    addMsg(bodyEl, 'error', '⚠ ' + (err.message || '请求失败'));
  }
}
/* ---------------- 状态 ---------------- */

let current = null;          // 三式合参当前盘：{meihua, qimen, daliuren, input}
let qimenYongShen = null;    // 奇门用神（按事类）
const hecanMsgs = [];        // 合参对话历史
const lyMsgs = [];           // 六爻对话历史

/* ---------------- 起盘 ---------------- */

function resolveBirth() {
  const cal = document.querySelector('.seg-btn.active[data-cal]').dataset.cal;
  let y, m, d, isLunar = false;
  if (cal === 'lunar') {
    y = +$('lunarYear').value;
    m = +$('lunarMonth').value;
    if ($('lunarRun').checked) m = -m;
    d = +$('lunarDay').value;
    isLunar = true;
  } else {
    const dt = new Date($('birthDate').value + 'T00:00:00');
    y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
  }
  // 农历先转公历（统一下游口径）
  if (isLunar) {
    const s = E.Lunar.fromYmd(y, m, d).getSolar();
    y = s.getYear(); m = s.getMonth(); d = s.getDay();
    isLunar = false;
  }
  const t = $('birthTime').value || '00:00';
  let hour = +t.slice(0, 2), minute = +(t.slice(3, 5) || 0);
  // 真太阳时：按所选省市县经度修正（仅时差，未计均时差）
  if ($('trueSolar').checked) {
    const prov = $('locProv').value;
    const city = $('locCity').value;
    const county = $('locCounty').value;
    const provData = (window.LOCATIONS || {})[prov] || {};
    const cityData = (provData.cities || {})[city] || {};
    const lon = (cityData.counties && cityData.counties[county] !== undefined)
      ? cityData.counties[county]
      : (cityData.lng !== undefined ? cityData.lng : (provData.lng || 116.4));
    const off = (lon - 120) * 4; // 分钟
    let total = Math.round(hour * 60 + minute + off);
    while (total < 0) { total += 1440; d -= 1; }
    while (total >= 1440) { total -= 1440; d += 1; }
    hour = Math.floor(total / 60);
    minute = total % 60;
  }
  return { year: y, month: m, day: d, hour, minute, isLunar };
}

function cast() {
  const input = resolveBirth();
  const { year, month, day, hour, minute } = input;
  const mh = E.meihua.calculate({ method: 'time', year, month, day, hour, isLunar: false });
  const qm = E.qimen.calculate({ year, month, day, hour, minute, isLunar: false, panType: '时盘', panStyle: '转盘', zhiRunMethod: 'chaibu' });
  const lr = E.daliuren.calculateFromTime({ year, month, day, hour, minute });
  current = { meihua: mh, qimen: qm, daliuren: lr, input };
  qimenYongShen = null;

  renderInfoStrip();
  renderMeihua();
  renderQimen();
  renderDaliuren();
  $('results').classList.remove('hidden');
  // 新盘开启，清空合参对话
  hecanMsgs.length = 0;
  $('hecanBody').innerHTML = '';
  $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------- 信息条 ---------------- */

function renderInfoStrip() {
  const m = current.meihua, q = current.qimen, r = current.daliuren;
  const sz = q.timeInfo.siZhu;
  $('infoStrip').innerHTML = `
    <span class="chip">公历 <b>${esc(m.timeInfo.solarDate)}</b></span>
    <span class="chip">农历 <b>${esc(m.timeInfo.lunarDate)}</b></span>
    <span class="chip">年柱 <b>${esc(sz.yearGanZhi)}</b></span>
    <span class="chip">月柱 <b>${esc(sz.monthGanZhi)}</b></span>
    <span class="chip">日柱 <b>${esc(sz.dayGanZhi)}</b></span>
    <span class="chip">时柱 <b>${esc(sz.hourGanZhi)}</b></span>
    <span class="chip g">节气 <b>${esc(q.timeInfo.jieQi)}</b></span>
  `;
}

/* ---------------- 梅花易数面板 ---------------- */

function renderMeihua() {
  const m = current.meihua;
  const mv = m.movingYao;
  const ti = m.tiYong;
  const wx = (g) => g.wuXing;
  const box = (title, gua, mv) => `
    <div class="gua-box">
      <div class="gua-title">${title} · ${esc(gua.name)}<span class="wx">${esc(wx(gua.upperGua))}${esc(wx(gua.lowerGua))}</span></div>
      <div class="gua">${guaHTML(gua.upperGua.name, gua.lowerGua.name, mv)}</div>
    </div>`;
  $('panelMeihua').innerHTML = `
    <div class="panel-head">
      <span class="t"><span class="dot" style="background:var(--gold)"></span>梅花易数</span>
      <span class="tag">时间起卦</span>
    </div>
    <div class="gua-grid">
      ${box('本卦', m.benGua, mv)}
      ${box('变卦', m.bianGua, null)}
      ${box('互卦', m.huGua, null)}
    </div>
    <div class="info-list">
      <div class="info-row"><span class="k">动爻</span><span class="v gold">${YAO_POS[mv - 1]}（${yaoName(mv)}位）</span></div>
      <div class="info-row"><span class="k">体用</span><span class="v">${esc(ti.tiWuXing)}体 · ${esc(ti.yongWuXing)}用</span></div>
      <div class="info-row"><span class="k">体用关系</span><span class="v jade">${esc(ti.relation)}</span></div>
      <div class="info-row"><span class="k">断意</span><span class="v">${esc(ti.description)}</span></div>
    </div>
  `;
}

/* ---------------- 奇门遁甲面板 ---------------- */

const LUOSHU_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

function renderQimen() {
  const q = current.qimen;
  const sz = q.timeInfo.siZhu;
  const cells = LUOSHU_ORDER.map((g) => {
    const c = q.gongs[g];
    return `
      <div class="qm-cell ${g === 5 ? 'center' : ''}">
        ${c.isKong ? '<span class="kong">空</span>' : ''}
        ${c.isMa ? '<span class="ma">马</span>' : ''}
        <span class="gong-name">${esc(c.gongName)}宫</span>
        <span class="tg">${esc(c.tianPanGan)}</span>
        <span class="di">地${esc(c.diPanGan)}</span>
        <span class="row2">
          <span class="m">${esc(c.men)}门</span>
          <span class="x">${esc(c.xing)}星</span>
          <span class="s">${esc(c.shen)}神</span>
        </span>
      </div>`;
  }).join('');

  const geju = (q.geJu || []).map((g) => {
    const cls = g.type === '吉格' ? 'good' : g.type === '凶格' ? 'bad' : 'neutral';
    return `<span class="tag-item ${cls}">${esc(g.name)}</span>`;
  }).join('');

  const ysLabel = qimenYongShen ? (SHILEI_DISPLAY[qimenYongShen.shiLei] || qimenYongShen.shiLei) : '';
  const ysHtml = qimenYongShen ? `
    <div class="panel-sub" style="margin-top:10px">用神（${esc(ysLabel)}）：主 ${qimenYongShen.zhuyong.map((i) => esc(i.name)).join(' · ')}；辅 ${qimenYongShen.fuyong.map((i) => esc(i.name)).join(' · ')}</div>` : '';

  $('panelQimen').innerHTML = `
    <div class="panel-head">
      <span class="t"><span class="dot" style="background:var(--jade)"></span>奇门遁甲</span>
      <span class="tag">时盘 · 转盘</span>
    </div>
    <div class="qm-meta">
      <span class="chip g">${esc(q.yinYangDun)} · <b>${esc(q.juShu)}局</b> · ${esc(q.yuan)}</span>
      <span class="chip">节气 <b>${esc(q.timeInfo.jieQi)}</b></span>
    </div>
    <div class="qm-legend">
      <span><i style="background:var(--jade)"></i>八门</span>
      <span><i style="background:var(--violet)"></i>九星</span>
      <span><i style="background:var(--blue)"></i>八神</span>
    </div>
    <div class="qm-grid">${cells}</div>
    <div class="info-list">
      <div class="info-row"><span class="k">值符</span><span class="v gold">${esc(q.xunShou.zhiFuXing)}星 · 落${esc(gongName(q.xunShou.zhiFuLuoGong))}宫</span></div>
      <div class="info-row"><span class="k">值使</span><span class="v gold">${esc(q.xunShou.zhiShiMen)}门 · 落${esc(gongName(q.xunShou.zhiShiLuoGong))}宫</span></div>
      <div class="info-row"><span class="k">旬首 / 空亡</span><span class="v">${esc(q.xunShou.xunShou)} · ${esc(q.xunShou.kongWang.join(''))}</span></div>
      <div class="info-row"><span class="k">日干 / 时干落宫</span><span class="v">${esc(gongName(q.dayGanGong))}宫 / ${esc(gongName(q.hourGanGong))}宫</span></div>
      ${qimenYongShen && qimenYongShen.zhuKe ? `<div class="info-row"><span class="k">主客</span><span class="v">${esc(qimenYongShen.zhuKe.relation)} · ${esc(qimenYongShen.zhuKe.summary)}</span></div>` : ''}
    </div>
    ${geju ? `<div class="tag-list">${geju}</div>` : ''}
    ${ysHtml}
  `;
}

/* ---------------- 大六壬面板 ---------------- */

function renderDaliuren() {
  const r = current.daliuren;
  const b = r.basicInfo;
  const td = r.tianDiPan;
  const hourZhi = b.hourGanZhi.charAt(1);

  const panCells = td.diPan.map((dz) => {
    const tp = td.diToTian[dz];
    const tj = td.diToJiang[dz];
    return `
      <div class="lr-cell ${dz === hourZhi ? 'cur' : ''}">
        <span class="tj">${esc(tj)}</span>
        <span class="tp">${esc(tp)}</span>
        <span class="dz">${esc(dz)}</span>
      </div>`;
  }).join('');

  const siKeRows = r.siKe.list.map((k) => `
    <tr>
      <td class="k">第${k.position}课</td>
      <td class="v gold">${esc(k.shangShen)}</td>
      <td class="v">${esc(k.xiaShen)}</td>
      <td class="v">${esc(k.tianJiang)}</td>
      <td class="v">${esc(k.relation)}</td>
    </tr>`).join('');

  const chu = r.sanChuan;
  const chuRows = [chu.chuChuan, chu.zhongChuan, chu.moChuan].map((c) => `
    <tr>
      <td class="k">${esc(c.position)}</td>
      <td class="v gold">${esc(c.diZhi)}</td>
      <td class="v">${esc(c.tianJiang)}</td>
      <td class="v">${esc(c.liuQin)}</td>
      <td class="v">${c.xunKong ? esc(c.xunKong) : '—'}</td>
    </tr>`).join('');

  const ss = r.shenSha;
  $('panelDaliuren').innerHTML = `
    <div class="panel-head">
      <span class="t"><span class="dot" style="background:var(--violet)"></span>大六壬</span>
      <span class="tag">四课三传</span>
    </div>
    <div class="lr-meta">
      <span class="chip v">节气 <b>${esc(b.jieqi)}</b></span>
      <span class="chip v">月将 <b>${esc(td.yueJiangName)}（${esc(td.yueJiang)}）</b></span>
      <span class="chip">昼夜 <b>${esc(b.dayNight)}</b></span>
      <span class="chip">${esc(b.dayGanZhi)} · ${esc(b.hourGanZhi)}</span>
    </div>
    <div class="lr-section">
      <h4>天地盘（时支加临）</h4>
      <div class="lr-pan">${panCells}</div>
    </div>
    <div class="lr-section">
      <h4>四课</h4>
      <table class="lr-table">
        <tr><th>课位</th><th>上神</th><th>下神</th><th>天将</th><th>关系</th></tr>
        ${siKeRows}
      </table>
    </div>
    <div class="lr-section">
      <h4>三传 · ${esc(chu.geJu)} · ${esc(chu.geJuDetail)}</h4>
      <table class="lr-table">
        <tr><th>传位</th><th>地支</th><th>天将</th><th>六亲</th><th>旬空</th></tr>
        ${chuRows}
      </table>
    </div>
    <div class="lr-section">
      <h4>神煞</h4>
      <div class="tag-list">
        <span class="tag-item">日马 ${esc(ss.riMa)}</span>
        <span class="tag-item">月马 ${esc(ss.yueMa)}</span>
        <span class="tag-item">丁马 ${esc(ss.dingMa)}</span>
        <span class="tag-item">华盖 ${esc(ss.huaGai)}</span>
        <span class="tag-item">闪电 ${esc(ss.shanDian)}</span>
      </div>
    </div>
  `;
}

/* ---------------- AI 合参解读 ---------------- */

const SYS_HEC = `你是一位精通中国传统术数的三式合参解读师，精通梅花易数、奇门遁甲、大六壬三大式。用户会提供同一时刻起出的三盘结构化数据。请以"三式合参"的方式综合解读：三式相互印证、互为补充，而非孤立断某一个式。

输出结构：
1. 【总体定调】三式共同指向的核心主题与基调。
2. 【分维度解读】性格特质、事业与财运、感情与家庭、健康与注意、近期运势与择时，每个维度结合三式各自的证据展开。
3. 【三式侧重与分歧】说明三式在哪些问题上相互印证，在哪些问题上各有侧重或存在分歧，应如何取舍。
4. 【可执行建议】给出2-4条具体、可操作的建议。

要求：语言中文，专业而通俗，避免故弄玄虚；若数据有矛盾或信息不足，如实说明；不给出医疗、法律、投资等专业领域的确定性结论。`;

function chartDataJSON() {
  const m = current.meihua, q = current.qimen, r = current.daliuren;
  const sz = q.timeInfo.siZhu;
  const data = {
    时间: {
      公历: m.timeInfo.solarDate,
      农历: m.timeInfo.lunarDate,
      年柱: sz.yearGanZhi,
      月柱: sz.monthGanZhi,
      日柱: sz.dayGanZhi,
      时柱: sz.hourGanZhi,
      节气: q.timeInfo.jieQi,
    },
    梅花易数: {
      本卦: `${m.benGua.name}（上${m.benGua.upperGua.name}${m.benGua.upperGua.wuXing}，下${m.benGua.lowerGua.name}${m.benGua.lowerGua.wuXing}）`,
      变卦: m.bianGua.name,
      互卦: m.huGua.name,
      动爻: YAO_POS[m.movingYao - 1],
      体用: `${m.tiYong.tiWuXing}体，${m.tiYong.yongWuXing}用，关系${m.tiYong.relation}：${m.tiYong.description}`,
    },
    奇门遁甲: {
      盘局: `${q.yinYangDun}，${q.juShu}局，${q.yuan}`,
      值符: `${q.xunShou.zhiFuXing}星，落${gongName(q.xunShou.zhiFuLuoGong)}宫`,
      值使: `${q.xunShou.zhiShiMen}门，落${gongName(q.xunShou.zhiShiLuoGong)}宫`,
      旬首: q.xunShou.xunShou,
      空亡: q.xunShou.kongWang.join(''),
      日干落宫: gongName(q.dayGanGong),
      时干落宫: gongName(q.hourGanGong),
      九宫: Object.keys(q.gongs).map((g) => {
        const c = q.gongs[g];
        return `${c.gongName}宫：天盘${c.tianPanGan}（地盘${c.diPanGan}），${c.men}门，${c.xing}星，${c.shen}神${c.isKong ? '，空亡' : ''}${c.isMa ? '，马星' : ''}`;
      }),
      格局: (q.geJu || []).map((g) => g.name),
    },
    大六壬: {
      节气: r.basicInfo.jieqi,
      月将: `${r.tianDiPan.yueJiangName}（${r.tianDiPan.yueJiang}）`,
      昼夜: r.basicInfo.dayNight,
      四课: r.siKe.list.map((k) => `第${k.position}课：上神${k.shangShen}，下神${k.xiaShen}，天将${k.tianJiang}，${k.relation}`),
      三传: `初传${r.sanChuan.chuChuan.diZhi}（${r.sanChuan.chuChuan.tianJiang}·${r.sanChuan.chuChuan.liuQin}），中传${r.sanChuan.zhongChuan.diZhi}（${r.sanChuan.zhongChuan.tianJiang}·${r.sanChuan.zhongChuan.liuQin}），末传${r.sanChuan.moChuan.diZhi}（${r.sanChuan.moChuan.tianJiang}·${r.sanChuan.moChuan.liuQin}）`,
      格局: `${r.sanChuan.geJu} · ${r.sanChuan.geJuDetail}`,
      神煞: `日马${r.shenSha.riMa}，月马${r.shenSha.yueMa}，丁马${r.shenSha.dingMa}，华盖${r.shenSha.huaGai}，闪电${r.shenSha.shanDian}`,
    },
  };
  if (qimenYongShen) {
    data['奇门用神'] = {
      事类: `${SHILEI_DISPLAY[qimenYongShen.shiLei] || qimenYongShen.shiLei}（${qimenYongShen.shiLei}）`,
      主用神: qimenYongShen.zhuyong.map((i) => `${i.name}（${gongName(i.gong)}宫，${i.state}）`),
      辅用神: qimenYongShen.fuyong.map((i) => `${i.name}（${gongName(i.gong)}宫，${i.state}）`),
      分析: qimenYongShen.analysis.map((a) => `${a.yongshen}落${gongName(a.gong)}宫，空亡${a.isKong ? '是' : '否'}，入墓${a.isRuMu ? '是' : '否'}，击刑${a.isJiXing ? '是' : '否'}，与日干${a.relationToDay}，评分${a.score}`),
    };
    if (qimenYongShen.zhuKe) data['奇门用神'].主客 = `${qimenYongShen.zhuKe.relation}：${qimenYongShen.zhuKe.summary}`;
  }
  return JSON.stringify(data, null, 2);
}

async function askAI(bodyEl, history, sys, userText, payload) {
  addMsg(bodyEl, 'user', userText);
  history.push({ role: 'user', content: payload || userText });
  const aiDiv = document.createElement('div');
  aiDiv.className = 'msg ai';
  aiDiv.innerHTML = '<span class="caret"></span>';
  bodyEl.appendChild(aiDiv);
  bodyEl.scrollTop = bodyEl.scrollHeight;
  let text = '';
  try {
    await chatCompletion([{ role: 'system', content: sys }, ...history], (d) => {
      text += d;
      aiDiv.innerHTML = esc(text) + '<span class="caret"></span>';
      bodyEl.scrollTop = bodyEl.scrollHeight;
    });
    aiDiv.innerHTML = esc(text);
    history.push({ role: 'assistant', content: text });
  } catch (err) {
    aiDiv.remove();
    addMsg(bodyEl, 'error', '⚠ ' + (err.message || '请求失败'));
  }
}

async function doHecan() {
  if (!current) { addMsg($('hecanBody'), 'error', '⚠ 请先在上方完成起盘'); return; }
  const shiLei = $('aiShiLei').value;
  if (shiLei) {
    qimenYongShen = E.qimen.calculateWithYongShen(current.input, SHILEI_MAP[shiLei] || shiLei).yongShen;
    renderQimen();
  }
  hecanMsgs.length = 0;
  await askAI($('hecanBody'), hecanMsgs, SYS_HEC, '（已提供三盘结构化数据，请开始三式合参解读）', chartDataJSON());
}

async function doHecanAsk() {
  const q = $('hecanInput').value.trim();
  if (!q) return;
  if (!current) { addMsg($('hecanBody'), 'error', '⚠ 请先在上方完成起盘'); return; }
  $('hecanInput').value = '';
  await askAI($('hecanBody'), hecanMsgs, SYS_HEC, q, q);
}

/* ---------------- 六爻 · 手摇起卦 ---------------- */

let lyCurrent = null;
let tossCount = 0;
let yaoValues = [];

function resetToss() {
  tossCount = 0;
  yaoValues = [];
  document.querySelectorAll('.coin').forEach((c) => {
    c.classList.remove('spin', 'back');
    c.querySelector('.coin-face').textContent = '字';
  });
  renderTossProgress();
  $('liuyaoResult').classList.add('hidden');
}

function renderTossProgress() {
  const slots = [];
  for (let i = 0; i < 6; i++) {
    const v = yaoValues[i];
    slots.push(`
      <div class="yao-slot ${v ? 'done' : ''}">
        <div class="pos">${YAO_POS[i]}</div>
        <div class="val ${v && isMovingVal(v) ? 'moving' : ''}">${v ? yaoSym(v) : '·'}</div>
      </div>`);
  }
  $('tossProgress').innerHTML = slots.join('');
}

function tossOnce() {
  if (tossCount >= 6) return;
  const coins = document.querySelectorAll('.coin');
  coins.forEach((c) => c.classList.add('spin'));
  setTimeout(() => {
    const heads = Math.floor(Math.random() * 4); // 正面「字」的个数 0-3
    coins.forEach((c, i) => {
      c.classList.remove('spin');
      if (i < heads) {
        c.classList.remove('back');
        c.querySelector('.coin-face').textContent = '字';
      } else {
        c.classList.add('back');
        c.querySelector('.coin-face').textContent = '背';
      }
    });
    // 三字老阳9，两字少阴7，一字少阳8，三背老阴6
    const val = heads === 3 ? 9 : heads === 2 ? 7 : heads === 1 ? 8 : 6;
    yaoValues[tossCount] = val;
    tossCount++;
    renderTossProgress();
    if (tossCount === 6) setTimeout(renderLiuyao, 350);
  }, 700);
}

function liuyaoGuaHTML(vals) {
  return vals.map((v) => {
    const yang = v === 7 || v === 9;
    const moving = isMovingVal(v);
    const bars = yang ? '<span class="seg"></span>' : '<span class="seg"></span><span class="seg"></span>';
    return `<div class="yao ${yang ? 'yang' : 'yin'}${moving ? ' moving' : ''}">${bars}${moving ? `<span class="mark">${v === 9 ? '○' : '×'}</span>` : ''}</div>`;
  }).join('');
}

function renderLiuyao() {
  // 手摇起卦以摇卦当下（北京时间）为占问时间
  const n = nowBeijing();
  const res = E.liuyao.calculate({
    year: n.y, month: n.mo, day: n.d,
    hour: n.h, minute: n.mi,
    yaoValues,
  });
  lyCurrent = res;

  $('lyInfoStrip').innerHTML = `
    <span class="chip">公历 <b>${esc(res.timeInfo.solarDate)}</b></span>
    <span class="chip">农历 <b>${esc(res.timeInfo.lunarDate)}</b></span>
    <span class="chip">日柱 <b>${esc(res.timeInfo.dayGanZhi)}</b></span>
    <span class="chip">时柱 <b>${esc(res.timeInfo.hourGanZhi)}</b></span>
    <span class="chip g">旬空 <b>${esc(res.timeInfo.xunKong)}</b></span>
  `;

  const bg = res.benGua;
  const rows = res.yaoList.map((y) => {
    const changedVal = y.isMoving ? (y.value === 9 ? 7 : 8) : null;
    return `
      <tr class="${y.isMoving ? 'moving' : ''}">
        <td class="num">${YAO_POS[y.position - 1]}${y.isShiYao ? ' 世' : ''}${y.isYingYao ? ' 应' : ''}</td>
        <td class="shen">${esc(y.liuShen)}</td>
        <td class="qin">${esc(y.liuQin)}</td>
        <td>${esc(yaoSym(y.value))}</td>
        <td class="bian">${changedVal ? esc(yaoSym(changedVal)) : '—'}</td>
        <td class="num">${esc(y.naJia)}</td>
      </tr>`;
  }).join('');

  $('lyPanel').innerHTML = `
    <div class="panel-head">
      <span class="t"><span class="dot" style="background:var(--gold)"></span>六爻装卦</span>
      <span class="tag">手摇起卦</span>
    </div>
    <div class="ly-gua-box">
      <div class="ly-gua-title">本卦 · ${esc(bg.name)}<span class="wx">${esc(bg.gong)}宫 · 第${bg.guaXu}卦${bg.isYouHun ? ' · 游魂' : ''}${bg.isGuiHun ? ' · 归魂' : ''}</span></div>
      <div class="gua">${liuyaoGuaHTML(yaoValues)}</div>
    </div>
    ${res.bianGua ? `
    <div class="ly-gua-box">
      <div class="ly-gua-title">变卦 · ${esc(res.bianGua.name)}</div>
      <div class="gua">${liuyaoGuaHTML(yaoValues.map((v, i) => (isMovingVal(v) ? (v === 9 ? 7 : 8) : v)))}</div>
    </div>` : ''}
    <table class="ly-table">
      <tr><th>爻位</th><th>六神</th><th>六亲</th><th>本卦</th><th>变卦</th><th>纳甲</th></tr>
      ${rows}
    </table>
    <div class="info-list">
      <div class="info-row"><span class="k">世应</span><span class="v gold">世${bg.shiYaoPosition}爻 · 应${bg.yingYaoPosition}爻</span></div>
      <div class="info-row"><span class="k">动爻</span><span class="v">${res.movingYaoPositions.length ? res.movingYaoPositions.map((p) => YAO_POS[p - 1]).join('、') : '无'}</span></div>
      <div class="info-row"><span class="k">日辰 / 月建</span><span class="v">${esc(res.timeInfo.dayGanZhi)} / ${esc(res.timeInfo.monthGanZhi)}</span></div>
      <div class="info-row"><span class="k">旬空</span><span class="v">${esc(res.timeInfo.xunKong)}</span></div>
    </div>
  `;

  $('liuyaoResult').classList.remove('hidden');
  lyMsgs.length = 0;
  $('lyBody').innerHTML = '';
  $('liuyaoResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const SYS_LIU = `你是一位精通六爻纳甲筮法的解读师。用户提供手摇起卦所得六爻的装卦数据（本卦、变卦、世应、六亲、六神、动爻、纳甲、旬空等）。请据此解读：先总述卦局与体用，再分层面分析所问之事的趋势、应期与建议。语言中文，专业通俗，避免故弄玄虚；信息不足时如实说明，不给出医疗、法律、投资等专业领域的确定性结论。`;

function liuyaoDataJSON() {
  const r = lyCurrent;
  return {
    占问时间: {
      公历: r.timeInfo.solarDate,
      农历: r.timeInfo.lunarDate,
      日干支: r.timeInfo.dayGanZhi,
      时干支: r.timeInfo.hourGanZhi,
      旬空: r.timeInfo.xunKong,
    },
    本卦: {
      名: r.benGua.name,
      宫: r.benGua.gong + '宫',
      世: r.benGua.shiYaoPosition + '爻',
      应: r.benGua.yingYaoPosition + '爻',
      卦序: r.benGua.guaXu,
      游魂: r.benGua.isYouHun,
      归魂: r.benGua.isGuiHun,
    },
    变卦: r.bianGua ? r.bianGua.name : '无',
    六爻: r.yaoList.map((y) => `${YAO_POS[y.position - 1]}：${y.liuShen}，${y.liuQin}，纳甲${y.naJia}，${y.value === 7 || y.value === 9 ? '阳' : '阴'}${y.isMoving ? '（动，变' + (y.value === 9 ? '阴' : '阳') + '）' : ''}`),
    动爻: r.movingYaoPositions.length ? r.movingYaoPositions.map((p) => YAO_POS[p - 1]).join('、') : '无',
  };
}

async function doLyRead() {
  if (!lyCurrent) { addMsg($('lyBody'), 'error', '⚠ 请先手摇六次完成起卦'); return; }
  lyMsgs.length = 0;
  await askAI($('lyBody'), lyMsgs, SYS_LIU, '（已提供六爻装卦数据，请开始解读）', trad2simp(JSON.stringify(liuyaoDataJSON(), null, 2)));
}

async function doLyAsk() {
  const q = $('lyInput').value.trim();
  if (!q) return;
  if (!lyCurrent) { addMsg($('lyBody'), 'error', '⚠ 请先手摇六次完成起卦'); return; }
  $('lyInput').value = '';
  await askAI($('lyBody'), lyMsgs, SYS_LIU, q, q);
}

/* ---------------- 初始化与事件绑定 ---------------- */

function init() {
  // 农历月份选项
  const months = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  $('lunarMonth').innerHTML = months.map((n, i) => `<option value="${i + 1}">${n}</option>`).join('');

  // AI 配置回填
  fillAIForm();

  // 省市县选择器（真太阳时经度）
  const provSel = $('locProv'), citySel = $('locCity'), countySel = $('locCounty');
  provSel.innerHTML = Object.keys(window.LOCATIONS || {}).map((p) => `<option>${esc(p)}</option>`).join('');
  function fillCity() {
    const p = (window.LOCATIONS || {})[provSel.value];
    citySel.innerHTML = Object.keys(p && p.cities ? p.cities : {}).map((c) => `<option>${esc(c)}</option>`).join('');
    fillCounty();
  }
  function fillCounty() {
    const p = (window.LOCATIONS || {})[provSel.value];
    const c = p && p.cities ? p.cities[citySel.value] : null;
    countySel.innerHTML = Object.keys(c && c.counties ? c.counties : {}).map((k) => `<option>${esc(k)}</option>`).join('');
  }
  provSel.addEventListener('change', fillCity);
  citySel.addEventListener('change', fillCounty);
  fillCity(); // 默认：北京市

  // 标签切换
  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      $('tab-' + t.dataset.tab).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // 历法切换
  document.querySelectorAll('.seg-btn[data-cal]').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn[data-cal]').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      $('solarDateField').classList.toggle('hidden', b.dataset.cal !== 'solar');
      $('lunarDateField').classList.toggle('hidden', b.dataset.cal !== 'lunar');
    });
  });

  // 起盘
  $('castBtn').addEventListener('click', cast);
  $('heroCast').addEventListener('click', cast);

  // AI 配置
  $('saveConfig').addEventListener('click', saveAIConfig);
  $('testConfig').addEventListener('click', async () => {
    const st = $('configStatus');
    st.textContent = '测试中…';
    st.className = 'status';
    try {
      let got = '';
      await chatCompletion([{ role: 'user', content: '你好，请只回复"连接正常"' }], (d) => { got += d; });
      st.textContent = '连接正常' + (got ? '（' + got.slice(0, 12) + '）' : '');
      st.className = 'status ok';
    } catch (e) {
      st.textContent = '失败：' + e.message;
      st.className = 'status err';
    }
  });

  // AI 合参
  $('aiHecan').addEventListener('click', doHecan);
  $('hecanSend').addEventListener('click', doHecanAsk);
  $('hecanInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doHecanAsk(); }
  });

  // 六爻摇卦
  $('tossBtn').addEventListener('click', tossOnce);
  $('tossAuto').addEventListener('click', () => {
    // 连摇六次：依次触发，每次间隔约 900ms
    for (let i = 0; i < 6; i++) {
      setTimeout(() => { if (tossCount < 6) tossOnce(); }, i * 900);
    }
  });
  $('tossReset').addEventListener('click', resetToss);

  // 六爻 AI
  $('lyAiRead').addEventListener('click', doLyRead);
  $('lySend').addEventListener('click', doLyAsk);
  $('lyInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doLyAsk(); }
  });

  resetToss();

  // 调试钩子：#autocast 时自动起盘（用于无头截图验证）
  if (location.hash === '#autocast') {
    setTimeout(() => { try { cast(); } catch (e) { console.error(e); } }, 300);
  }
}

document.addEventListener('DOMContentLoaded', init);
