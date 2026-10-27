import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, rand} from '../anim';
import {SealMark} from '../gilded/stage';
import {goldText} from '../gilded/theme';
import {D, draw, DS, G, GF, rise} from './theme';

/**
 * 暗金图解风的舞台层：大字幕、小节标题、带导语的文献引用、蓝图网格、取景框、闪白聚字片名、
 * 夜景楼群、群山剪影、点阵地图。背景 / 浮尘 / 颗粒 / 年份抬头 / 红章直接用 gilded 的。全部按 1920×1080。
 */

/** 把「普通【金】〔红〕」拆成带颜色的片段 */
const parseMarks = (text: string) => {
  const parts: {ch: string; c: 'n' | 'g' | 'r'}[] = [];
  let c: 'n' | 'g' | 'r' = 'n';
  for (const ch of text) {
    if (ch === '【') c = 'g';
    else if (ch === '〔') c = 'r';
    else if (ch === '】' || ch === '〕') c = 'n';
    else parts.push({ch, c});
  }
  return parts;
};

/** 重点词：金色用上亮下深的窄渐变 + 柔光（56px 以上不会发褐）；红色纯色 + 红光 */
const GOLD_GRAD: React.CSSProperties = {
  background: 'linear-gradient(180deg, #fbe9bd 0%, #e8c77f 55%, #c49a52 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};
const GOLD_GLOW = 'drop-shadow(0 0 10px rgba(236,196,110,0.45))';
const markStyle = (c: 'n' | 'g' | 'r'): React.CSSProperties =>
  c === 'g' ? {...GOLD_GRAD, textShadow: 'none'} : c === 'r' ? {color: D.mark, textShadow: '0 0 12px rgba(208,96,90,0.45), 0 2px 10px rgba(0,0,0,0.9)'} : {color: G.ivory};

/**
 * 字幕：粗宋 56px（比 gilded 的 42px 大一号），`【词】` 香槟金、`〔词〕` 标记红，逐字柔入。
 * 换句直接替换（上一句给 out），没有英文行。y 是字的底边。
 */
export const DCaption: React.FC<{f: number; at: number; text: string; out?: number; y?: number; size?: number; perChar?: number}> = ({f, at, text, out, y = 950, size = DS.caption, perChar = 1}) => {
  const parts = parseMarks(text);
  const o = out === undefined ? 1 : 1 - clamp01((f - out) / 8);
  if (f < at || o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y - size * 1.1, textAlign: 'center', fontFamily: GF.cn, fontWeight: 700, fontSize: size, letterSpacing: 1, opacity: o, textShadow: '0 2px 14px rgba(0,0,0,0.95)'}}>
      {parts.map((p, i) => {
        const v = clamp01((f - at - i * perChar) / 9);
        return (
          <span key={i} style={{display: 'inline-block', opacity: v, ...markStyle(p.c), filter: `blur(${(1 - v) * 6}px)${p.c === 'g' ? ` ${GOLD_GLOW}` : ''}`}}>
            {p.ch}
          </span>
        );
      })}
    </div>
  );
};

/** 小节标题：居中、粗宋、字距 0.3em，下面一条两头渐隐的金线；支持【】〔〕上色 */
export const SectionTitle: React.FC<{f: number; at: number; text: string; y?: number; size?: number; out?: number}> = ({f, at, text, y = 110, size = DS.section, out}) => {
  const s = rise(f, at, 16, out, 8);
  const w = draw(f, at + 6, 24);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', ...s.style}}>
      <div style={{fontFamily: GF.cn, fontWeight: 700, fontSize: size, letterSpacing: size * 0.3}}>
        {parseMarks(text).map((p, i) => (
          <span key={i} style={p.c === 'n' ? {color: '#e9dcbc'} : markStyle(p.c)}>
            {p.ch}
          </span>
        ))}
      </div>
      <div style={{margin: '18px auto 0', width: 600 * w, height: 1, background: `linear-gradient(90deg, rgba(214,180,106,0), ${G.goldLine}, rgba(214,180,106,0))`}} />
    </div>
  );
};

/**
 * 右上角文献引用（图解风版）：最上面一行朱红小字导语（字距 0.3em），下面是斜体原文书名、
 * 金色《中文书名》、作者 · 年份，右侧一枚小印。导语写「这份文献在讲什么」。
 */
export const KickerCite: React.FC<{f: number; at: number; kicker: string; original: string; title: string; meta: string; seal?: string; out?: number}> = ({f, at, kicker, original, title, meta, seal = '文献', out}) => {
  const s = rise(f, at, 20, out, 0);
  return (
    <div style={{position: 'absolute', right: 56, top: 14, display: 'flex', gap: 18, alignItems: 'flex-start', ...s.style}}>
      <div style={{textAlign: 'right'}}>
        <div style={{fontFamily: GF.cn, fontSize: 19, letterSpacing: 6, color: D.mark, opacity: 0.85}}>{kicker}</div>
        <div style={{fontFamily: GF.latinItalic, fontSize: 30, color: G.ivoryDim, marginTop: 10}}>{original}</div>
        <div style={{fontFamily: GF.cn, fontWeight: 700, fontSize: 32, color: '#e6d2a4', marginTop: 6}}>《{title}》</div>
        <div style={{fontFamily: GF.latin, fontSize: 20, letterSpacing: 2, color: G.ivoryFaint, marginTop: 6}}>{meta}</div>
        <div style={{height: 1, marginTop: 10, background: `linear-gradient(270deg, ${G.goldLine}, rgba(214,180,106,0))`}} />
      </div>
      <div style={{marginTop: 34}}>
        <SealMark text={seal} size={52} />
      </div>
    </div>
  );
};

/** 蓝图网格：线稿背后的淡方格，cell 格宽，向外椭圆淡出。x/y/w/h 是网格区域 */
export const BlueprintGrid: React.FC<{f: number; at: number; x: number; y: number; w: number; h: number; cell?: number; out?: number}> = ({f, at, x, y, w, h, cell = 40, out}) => {
  const s = rise(f, at, 24, out, 0);
  const id = `bp-${x}-${y}`;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: s.v}}>
      <defs>
        <pattern id={`${id}-p`} width={cell} height={cell} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M${cell} 0 L0 0 0 ${cell}`} fill="none" stroke={D.grid} strokeWidth={1} />
        </pattern>
        <radialGradient id={`${id}-g`}>
          <stop offset="0.45" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}-m`}>
          <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={`url(#${id}-g)`} />
        </mask>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-p)`} mask={`url(#${id}-m)`} />
    </svg>
  );
};

/** 四角取景框：只画四个 L 形角，len 角长；表示「这一片是统计样本」 */
export const CornerFrame: React.FC<{f: number; at: number; x: number; y: number; w: number; h: number; len?: number; color?: string; out?: number}> = ({f, at, x, y, w, h, len = 34, color = G.goldLine, out}) => {
  const p = draw(f, at, 16) * (out === undefined ? 1 : 1 - clamp01((f - out) / 12));
  const l = len * p;
  const c = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: p}}>
      {c.map(([cx, cy, dx, dy], i) => (
        <path key={i} d={`M${cx + dx * l} ${cy} L${cx} ${cy} L${cx} ${cy + dy * l}`} fill="none" stroke={color} strokeWidth={1.5} />
      ))}
    </svg>
  );
};

/**
 * 片名招牌动作：at 帧全屏闪白（3 帧顶满后 10 帧退去）→ 一圈光环扩散 → 几百颗金粒子从环上旋进来，
 * 约 30 帧聚成字的位置后金色大字柔入；上方拉丁小标、下方带亮点的金线和副标题依次出现。
 * 闪白那一帧要踩在配乐重拍上。
 */
export const FlashTitle: React.FC<{f: number; at: number; title: string; latin: string; sub?: string; y?: number; size?: number; out?: number}> = ({f, at, title, latin, sub, y = 470, size = DS.title, out}) => {
  const t = f - at;
  if (t < 0) return null;
  const o = out === undefined ? 1 : 1 - clamp01((f - out) / 14);
  const flash = t < 3 ? 1 : 1 - clamp01((t - 3) / 10);
  const ring = 1 - Math.pow(1 - clamp01(t / 26), 3);
  const gather = clamp01((t - 4) / 30);
  const ge = 1 - Math.pow(1 - gather, 3);
  const txt = clamp01((t - 24) / 16);
  const tw = title.length * size * 1.14;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 50% ${(y / 1080) * 100}%, #f4efe2 0%, #cfc6b2 55%, #8d8576 100%)`, opacity: flash * 0.96}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <circle cx={960} cy={y} r={120 + 360 * ring} fill="none" stroke={G.goldBright} strokeWidth={1.5} opacity={(1 - ring) * 0.9} />
        {Array.from({length: 360}, (_, i) => {
          const a0 = rand(i * 3.1) * Math.PI * 2;
          const r0 = 120 + rand(i * 7.7) * 220;
          const spin = (1 - ge) * 2.2;
          const sx = 960 + Math.cos(a0 + spin) * r0 * (0.4 + 0.6 * (1 - ge * 0.2));
          const sy = y + Math.sin(a0 + spin) * r0 * 0.55;
          const tx = 960 - tw / 2 + rand(i * 1.3) * tw;
          const ty = y - size * 0.45 + rand(i * 5.9) * size * 0.9;
          const px = sx + (tx - sx) * ge;
          const py = sy + (ty - sy) * ge;
          const a = (0.25 + 0.75 * rand(i * 2.2)) * (1 - txt * 0.85) * clamp01(t / 4);
          return <circle key={i} cx={px} cy={py} r={0.8 + rand(i * 9.1) * 1.4} fill={G.goldBright} opacity={a} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: y - size * 1.25, textAlign: 'center', fontFamily: GF.latin, fontSize: 20, letterSpacing: 16, color: G.ivoryDim, opacity: clamp01((t - 30) / 16)}}>{latin.toUpperCase()}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: y - size * 0.62, textAlign: 'center', opacity: txt, filter: `blur(${(1 - txt) * 10}px)`, transform: `scale(${1.03 - 0.03 * txt})`}}>
        <span style={{fontFamily: GF.cn, fontWeight: 900, fontSize: size, letterSpacing: size * 0.14, ...goldText(1.1)}}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: clamp01((t - 36) / 12)}}>
        <line x1={960 - 160 * draw(f, at + 36, 24)} y1={y + size * 0.72} x2={960 + 160 * draw(f, at + 36, 24)} y2={y + size * 0.72} stroke={G.goldLine} strokeWidth={1} />
        <circle cx={960} cy={y + size * 0.72} r={3} fill={G.goldBright} style={{filter: `drop-shadow(0 0 8px ${G.goldBright})`}} />
      </svg>
      {sub ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: y + size * 0.95, textAlign: 'center', fontFamily: GF.cn, fontSize: 30, letterSpacing: 10, color: G.ivory, ...rise(f, at + 50, 18).style}}>{sub}</div>
      ) : null}
    </AbsoluteFill>
  );
};

/** 计数抬头：左上金色大数字 + 小单位 + 渐隐金线（夜景里表示楼层、高度、天数等，随镜头滚动） */
export const Counter: React.FC<{f: number; at: number; value: number; unit: string; out?: number}> = ({f, at, value, unit, out}) => {
  const s = rise(f, at, 16, out, 0);
  return (
    <div style={{position: 'absolute', left: 104, top: 56, ...s.style}}>
      <span style={{fontFamily: GF.num, fontSize: 84, ...goldText(0.4)}}>{Math.round(value)}</span>
      <span style={{fontFamily: GF.cn, fontSize: 30, color: G.gold, marginLeft: 8}}>{unit}</span>
      <div style={{width: 330, height: 1, marginTop: 4, background: `linear-gradient(90deg, ${G.goldLine}, rgba(214,180,106,0))`}} />
    </div>
  );
};

/**
 * 夜景楼群（冷调开场）：深蓝夜空、两侧远楼零星亮窗、正中一栋大楼的窗格（暖黄 / 冷灰蓝随机亮），
 * 斜落细雨。scroll 是镜头向下摇的像素数（大楼往上走），seed 换一套亮窗。
 */
export const NightCity: React.FC<{f: number; scroll?: number; seed?: number}> = ({f, scroll = 0, seed = 3}) => {
  const cols = 5;
  const cw = 160;
  const rh = 150;
  const bx = 960 - (cols * cw) / 2;
  const rows = 14;
  const off = ((scroll % rh) + rh) % rh;
  const row0 = Math.floor(scroll / rh);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${D.sky} 0%, #0a0f1c 100%)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {/* 远处楼群：两侧暗块 + 零星亮窗，视差 0.4 */}
        {[0, 1].map((side) =>
          Array.from({length: 7}, (_, b) => {
            const s = seed * 50 + side * 20 + b;
            const w = 110 + rand(s) * 120;
            const x = side === 0 ? b * 75 - 40 : 1920 - b * 75 - w + 40;
            const top = 120 + rand(s + 1) * 320 - ((scroll * 0.4) % 1080);
            return (
              <g key={`${side}-${b}`}>
                <rect x={x} y={top} width={w} height={2400} fill={b % 2 ? '#0b0f19' : '#0e1320'} />
                {Array.from({length: 30}, (_, k) => {
                  const ks = s * 31 + k;
                  if (rand(ks) > 0.32) return null;
                  const wx = x + 12 + Math.floor(rand(ks + 1) * ((w - 24) / 22)) * 22;
                  const wy = top + 30 + k * 52;
                  return <rect key={k} x={wx} y={wy} width={10} height={26} fill={rand(ks + 2) > 0.3 ? D.winWarm : D.winCool} opacity={0.55} />;
                })}
              </g>
            );
          }),
        )}
        {/* 正中大楼 */}
        <rect x={bx - 30} y={0} width={cols * cw + 60} height={1080} fill={D.facade} />
        <line x1={bx - 30} y1={0} x2={bx - 30} y2={1080} stroke={D.facadeEdge} strokeWidth={2} />
        <line x1={bx + cols * cw + 30} y1={0} x2={bx + cols * cw + 30} y2={1080} stroke={D.facadeEdge} strokeWidth={2} />
        {Array.from({length: rows}, (_, r) => {
          const rr = row0 + r - 1;
          const yy = (r - 1) * rh - off + 40;
          return Array.from({length: cols}, (_, c) => {
            const s = seed * 1000 + rr * 13 + c;
            const lit = rand(s) > 0.55;
            const warm = rand(s + 0.5) > 0.3;
            return (
              <g key={`${r}-${c}`}>
                <rect x={bx + c * cw + 20} y={yy} width={cw - 40} height={rh - 44} fill={lit ? (warm ? D.winWarm : D.winCool) : '#0c0f16'} opacity={lit ? 0.92 : 1} />
                {lit ? <rect x={bx + c * cw + 20} y={yy} width={cw - 40} height={rh - 44} fill="url(#nc-shade)" /> : <line x1={bx + c * cw + 80} y1={yy} x2={bx + c * cw + 80} y2={yy + rh - 44} stroke="#151a24" strokeWidth={2} />}
                <line x1={bx + c * cw + 14} y1={yy + rh - 40} x2={bx + c * cw + cw - 14} y2={yy + rh - 40} stroke={D.facadeEdge} strokeWidth={2} />
              </g>
            );
          });
        })}
        <defs>
          <linearGradient id="nc-shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.12} />
            <stop offset="1" stopColor="#000" stopOpacity={0.25} />
          </linearGradient>
        </defs>
        {/* 细雨 */}
        {Array.from({length: 70}, (_, i) => {
          const x = rand(i * 4.3 + seed) * 1920;
          const len = 40 + rand(i * 2.1) * 80;
          const y = ((rand(i * 8.8) * 1400 + f * (14 + rand(i) * 8)) % 1400) - 200;
          return <line key={i} x1={x} y1={y} x2={x - len * 0.04} y2={y + len} stroke="#c8d2e6" strokeWidth={1} opacity={0.12 + rand(i * 3.3) * 0.12} />;
        })}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)'}} />
    </AbsoluteFill>
  );
};

/** 群山剪影（冷调）：三层由正弦叠出的山脊，越远越亮越淡，带一层薄雾；horizon 是最前排山脊的大致高度 */
export const Ridges: React.FC<{f: number; horizon?: number; seed?: number}> = ({f, horizon = 640, seed = 5}) => {
  const ridge = (k: number) => {
    const pts: string[] = [];
    const base = horizon - 120 + k * 70;
    for (let x = 0; x <= 1920; x += 24) {
      const s = seed + k * 10;
      const yv = base - 40 * Math.sin(x / (180 + k * 40) + rand(s) * 6) - 26 * Math.sin(x / (73 + k * 11) + rand(s + 1) * 6) - 10 * Math.sin(x / 31 + k);
      pts.push(`${x},${yv.toFixed(1)}`);
    }
    return `M0,1080 L${pts.join(' L')} L1920,1080 Z`;
  };
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${D.sky} 0%, #0d1424 ${(horizon / 1080) * 100 - 10}%, #111a2c 100%)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 40}, (_, i) => (
          <circle key={i} cx={rand(i * 3 + seed) * 1920} cy={rand(i * 7 + seed) * (horizon - 220)} r={0.6 + rand(i) * 1.1} fill="#dfe6f5" opacity={(0.2 + 0.5 * Math.abs(Math.sin(f / 40 + i))) * 0.6} />
        ))}
        {D.ridge.map((c, k) => (
          <path key={k} d={ridge(k)} fill={c} transform={`translate(${-((f * (0.15 + k * 0.12)) % 60)} 0)`} />
        ))}
        <rect x={0} y={horizon - 40} width={1920} height={180} fill="url(#rg-mist)" />
        <defs>
          <linearGradient id="rg-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a6a88" stopOpacity={0} />
            <stop offset="0.5" stopColor="#5a6a88" stopOpacity={0.12} />
            <stop offset="1" stopColor="#5a6a88" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * 点阵地图：两团程序生成的抽象「大陆」（不对应真实地理），加一条从 from 到 to 的虚线弧线航线，
 * 航线在 at 起约 50 帧画出，头部有发光点；两端标中文名 + 斜体英文名。
 */
export const DotMap: React.FC<{
  f: number;
  at: number;
  from: {x: number; y: number; cn: string; en: string};
  to: {x: number; y: number; cn: string; en: string};
  lift?: number;
  out?: number;
}> = ({f, at, from, to, lift = 160, out}) => {
  const s = rise(f, at, 24, out, 0);
  const blobs = [
    {cx: 420, cy: 520, rx: 400, ry: 280, seed: 1},
    {cx: 1530, cy: 450, rx: 360, ry: 260, seed: 2},
  ];
  const dots: React.ReactNode[] = [];
  for (const b of blobs) {
    for (let gx = b.cx - b.rx; gx <= b.cx + b.rx; gx += 16) {
      for (let gy = b.cy - b.ry; gy <= b.cy + b.ry; gy += 16) {
        const nx = (gx - b.cx) / b.rx;
        const ny = (gy - b.cy) / b.ry;
        const ang = Math.atan2(ny, nx);
        const edge = 0.78 + 0.16 * Math.sin(ang * 3 + b.seed) + 0.08 * Math.sin(ang * 7 + b.seed * 2);
        const d = Math.sqrt(nx * nx + ny * ny);
        if (d > edge) continue;
        dots.push(<circle key={`${gx}-${gy}`} cx={gx} cy={gy} r={1.9} fill="#9aa0a3" opacity={0.62 * (1 - Math.pow(d / edge, 3) * 0.6)} />);
      }
    }
  }
  const mx = (from.x + to.x) / 2;
  const my = Math.min(from.y, to.y) - lift;
  const path = `M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`;
  const p = draw(f, at + 20, 50);
  const q = (u: number) => {
    const a = (1 - u) * (1 - u);
    const b = 2 * (1 - u) * u;
    const c = u * u;
    return [a * from.x + b * mx + c * to.x, a * from.y + b * my + c * to.y];
  };
  const [hx, hy] = q(p);
  const label = (pt: typeof from, k: number) => (
    <div key={k} style={{position: 'absolute', left: pt.x - 140, top: pt.y - 92, width: 280, textAlign: 'center', ...rise(f, at + 14 + k * 40, 16).style}}>
      <div style={{fontFamily: GF.cn, fontWeight: 700, fontSize: 30, color: '#e6d2a4', letterSpacing: 4}}>{pt.cn}</div>
      <div style={{fontFamily: GF.latinItalic, fontSize: 18, color: G.ivoryFaint, letterSpacing: 2}}>{pt.en}</div>
    </div>
  );
  return (
    <AbsoluteFill style={s.style}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {dots}
        <path d={path} fill="none" stroke={G.goldLine} strokeWidth={2} strokeDasharray="7 6" pathLength={1000} strokeDashoffset={0} mask="url(#dm-reveal)" />
        <defs>
          <mask id="dm-reveal">
            <path d={path} fill="none" stroke="#fff" strokeWidth={6} pathLength={1} strokeDasharray={`${p} 1`} />
          </mask>
        </defs>
        <circle cx={from.x} cy={from.y} r={4} fill={G.goldBright} />
        {p > 0 ? <circle cx={hx} cy={hy} r={5} fill="#fffdf6" style={{filter: `drop-shadow(0 0 10px ${G.goldBright}) drop-shadow(0 0 22px ${G.gold})`}} /> : null}
      </svg>
      {label(from, 0)}
      {label(to, 1)}
    </AbsoluteFill>
  );
};
