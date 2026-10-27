import React from 'react';
import {clamp01} from '../anim';
import {goldText} from '../gilded/theme';
import {champagneText, D, draw, G, GF, rise, tick} from './theme';

/**
 * 暗金图解风的道具：线稿、弹孔标记、引线标注、倒计时圈、人物名牌、小方签、成对卡片、勾选清单、量表、象牙剪影。
 * 坐标都是像素；线稿类组件画在自己的 svg 里（viewBox 由调用方给）。
 */

/**
 * 线稿示意图：paths 是一组 SVG 路径（同一个 viewBox 坐标系），at 起约 30 帧把描边画出来，
 * 再淡入内部填充。missing=true 时换成红色虚线 + 红光（表示「没进样本 / 看不见的那个」）。
 * children 画在线稿上面（弹孔、标注点），坐标同 viewBox。
 */
export const LineArt: React.FC<{
  f: number;
  at: number;
  paths: string[];
  viewBox: string;
  w: number;
  h: number;
  missing?: boolean;
  dur?: number;
  stroke?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({f, at, paths, viewBox, w, h, missing, dur = 30, stroke = 2.2, style, children}) => {
  const p = draw(f, at, dur);
  const fill = clamp01((f - at - dur * 0.6) / 16);
  const col = missing ? D.mark : D.line;
  if (f < at) return null;
  return (
    <svg width={w} height={h} viewBox={viewBox} style={{overflow: 'visible', ...style}}>
      {paths.map((d, i) => (
        <path key={`f${i}`} d={d} fill={missing ? D.markFaint : D.fill} opacity={fill} />
      ))}
      {paths.map((d, i) =>
        missing ? (
          <path key={i} d={d} fill="none" stroke={col} strokeWidth={stroke} strokeDasharray="6 5" opacity={p} style={{filter: `drop-shadow(0 0 6px ${D.markDim})`}} />
        ) : (
          <path key={i} d={d} fill="none" stroke={col} strokeWidth={stroke} strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} style={{filter: 'drop-shadow(0 0 4px rgba(248,244,235,0.35))'}} />
        ),
      )}
      {children}
    </svg>
  );
};

/** 弹孔 / 损伤标记：红色小圆 + 8 根放射短刺 + 中心暗点，at 时从 1.6 倍缩到 1 倍（4 帧）。放在 LineArt 的 children 里 */
export const HitMark: React.FC<{f: number; at: number; x: number; y: number; r?: number; color?: string}> = ({f, at, x, y, r = 7, color = D.mark}) => {
  const t = f - at;
  if (t < 0) return null;
  const s = 1.6 - 0.6 * clamp01(t / 4);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(t / 3)} style={{filter: `drop-shadow(0 0 4px ${D.markDim})`}}>
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        return <line key={i} x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * r * 1.8} y2={Math.sin(a) * r * 1.8} stroke={color} strokeWidth={1.6} strokeLinecap="round" />;
      })}
      <circle r={r} fill="none" stroke={color} strokeWidth={2} />
      <circle r={r * 0.35} fill={color} />
    </g>
  );
};

/**
 * 引线标注：从部件上的点 (px,py) 画一条细线到右侧标签 (lx,ly)，标签是「圆圈字母 + 中文名」。
 * state：idle 金圈未选 / pick 选中（填实金） / reject 排除（变红 + 删除线） / right 正确（填实金 + 勾）。
 * 引线约 12 帧画完，端点带一个小圆环。
 */
export const Callout: React.FC<{f: number; at: number; px: number; py: number; lx: number; ly: number; letter: string; text: string; state?: 'idle' | 'pick' | 'reject' | 'right'; out?: number}> = ({f, at, px, py, lx, ly, letter, text, state = 'idle', out}) => {
  const p = draw(f, at, 12);
  const s = rise(f, at + 8, 14, out, 0);
  const red = state === 'reject';
  const solid = state === 'pick' || state === 'right';
  const c = red ? D.mark : D.champagne;
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: out === undefined ? 1 : s.v}}>
        <line x1={px} y1={py} x2={px + (lx - 30 - px) * p} y2={py + (ly - py) * p} stroke={red ? D.markDim : 'rgba(218,204,157,0.45)'} strokeWidth={1.2} />
        <circle cx={px} cy={py} r={9} fill="none" stroke={c} strokeWidth={1} opacity={p} />
        <circle cx={px} cy={py} r={3} fill={c} opacity={p} />
      </svg>
      <div style={{position: 'absolute', left: lx, top: ly - 30, display: 'flex', alignItems: 'center', gap: 22, ...s.style}}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            border: `2px solid ${red ? D.mark : solid ? D.champagne : D.champagneDim}`,
            background: solid ? D.champagne : red ? 'rgba(208,96,90,0.08)' : 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: GF.latin,
            fontSize: 30,
            color: solid ? '#1a150c' : c,
            boxShadow: solid ? `0 0 18px rgba(218,204,157,0.5)` : undefined,
          }}
        >
          {letter}
        </div>
        <div style={{position: 'relative', fontFamily: GF.cn, fontWeight: 700, fontSize: 40, letterSpacing: 4, ...(red ? {color: D.mark} : solid ? champagneText(0.5) : {color: '#e9e1cd'})}}>
          {text}
          {red ? <div style={{position: 'absolute', left: -4, right: -4, top: '52%', height: 3, background: D.mark}} /> : null}
        </div>
        {state === 'right' ? (
          <svg width={36} height={36} viewBox="0 0 36 36">
            <path d="M6 19 L14 27 L30 9" fill="none" stroke={D.champagne} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw(f, at + 8, 10)} 1`} />
          </svg>
        ) : null}
      </div>
    </>
  );
};

/**
 * 倒计时圈：细圆环 + 金色大数字 + 下方小字（「先想 3 秒」），金色进度弧每一跳从满到空。
 * 数字从 from 开始每 step 帧减一（step 设成配乐的拍长，跳在拍上）；倒完后整体淡出。
 */
export const CountRing: React.FC<{f: number; at: number; from?: number; step?: number; label?: string; size?: number}> = ({f, at, from = 3, step = 24, label = '先想 3 秒', size = 190}) => {
  if (f < at) return null;
  const {n, p, done} = tick(f, at, from, step);
  const s = rise(f, at - 10, 14);
  const fade = done ? 1 - clamp01((f - at - from * step) / 12) : 1;
  const r = size / 2 - 4;
  const cir = 2 * Math.PI * r;
  const pop = 1 + 0.08 * (1 - clamp01((p * step) / 6));
  return (
    <div style={{width: size, textAlign: 'center', ...s.style, opacity: s.v * fade}}>
      <div style={{position: 'relative', width: size, height: size}}>
        <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(0,0,0,0.25)" stroke="rgba(218,204,157,0.22)" strokeWidth={2} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={D.champagne} strokeWidth={3} strokeDasharray={`${cir * (1 - p)} ${cir}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
        </svg>
        <div style={{position: 'absolute', left: 0, top: 0, width: size, height: size, textAlign: 'center', fontFamily: GF.num, fontSize: size * 0.62, lineHeight: `${size}px`, transform: `scale(${pop})`, ...goldText(0.8)}}>{n}</div>
      </div>
      <div style={{fontFamily: GF.cn, fontSize: 28, letterSpacing: 10, color: G.ivoryDim, marginTop: 30}}>{label}</div>
    </div>
  );
};

/** 人物名牌：深色玻璃卡 + 左侧金色竖线 + 斜体西文名 + 金色中文名 + 「身份 · 生卒」小字 */
export const NameCard: React.FC<{f: number; at: number; latin: string; name: string; meta: string; out?: number; w?: number}> = ({f, at, latin, name, meta, out, w = 470}) => {
  const s = rise(f, at, 16, out);
  return (
    <div style={{width: w, padding: '26px 40px 26px 48px', borderRadius: 10, background: 'linear-gradient(180deg, rgba(40,34,24,0.75), rgba(16,14,10,0.75))', border: `1px solid ${D.glassBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative', ...s.style}}>
      <div style={{position: 'absolute', left: 24, top: 26, bottom: 26, width: 2, background: `linear-gradient(180deg, ${G.gold}, rgba(214,180,106,0.2))`}} />
      <div style={{fontFamily: GF.latinItalic, fontSize: 26, color: G.ivoryDim}}>{latin}</div>
      <div style={{fontFamily: GF.cn, fontWeight: 900, fontSize: 42, marginTop: 6, ...goldText(0.4)}}>{name}</div>
      <div style={{fontFamily: GF.cn, fontSize: 22, color: G.ivoryFaint, marginTop: 10, letterSpacing: 2}}>{meta}</div>
    </div>
  );
};

/** 小方签：细框小字（「总数未知」「推测」「示意」），tone 选金或红 */
export const Tag: React.FC<{text: string; tone?: 'gold' | 'red' | 'dim'; size?: number; filled?: boolean}> = ({text, tone = 'dim', size = 20, filled}) => {
  const c = tone === 'red' ? D.mark : tone === 'gold' ? D.champagne : 'rgba(239,230,210,0.62)';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: `${size * 0.22}px ${size * 0.6}px`,
        border: `1px solid ${tone === 'red' ? D.markDim : tone === 'gold' ? D.champagneDim : 'rgba(239,230,210,0.35)'}`,
        borderRadius: 3,
        background: filled ? (tone === 'red' ? 'rgba(208,96,90,0.28)' : 'rgba(218,204,157,0.3)') : 'rgba(0,0,0,0.25)',
        fontFamily: GF.cn,
        fontSize: size,
        letterSpacing: 2,
        color: filled && tone !== 'red' ? '#efe2bf' : c,
        lineHeight: 1.2,
      }}
    >
      {text}
    </span>
  );
};

/** 矩形红章：朱红描边方框 + 横排粗宋，at 时 5 帧从 1.5 倍砸下、轻晃一下；用于「没有记录」「已排除」 */
export const FrameStamp: React.FC<{f: number; at: number; text: string; size?: number; rot?: number}> = ({f, at, text, size = 56, rot = -6}) => {
  const t = f - at;
  if (t < 0) return null;
  const s = t < 5 ? 1.5 - 0.5 * (t / 5) : 1 + 0.03 * Math.sin((t - 5) * 1.2) * Math.exp(-(t - 5) / 4);
  return (
    <div
      style={{
        display: 'inline-block',
        padding: `${size * 0.12}px ${size * 0.4}px`,
        border: `${size * 0.08}px double ${D.mark}`,
        borderRadius: size * 0.14,
        transform: `rotate(${rot}deg) scale(${s})`,
        opacity: clamp01(t / 3) * 0.92,
        fontFamily: GF.cn,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: size * 0.1,
        color: D.mark,
        background: 'rgba(208,96,90,0.1)',
        textShadow: '0 0 10px rgba(208,96,90,0.4)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/**
 * 成对卡片的一半：kind='seen' 是金色玻璃卡（上沿金色小签、线条图标、引号金字），
 * kind='unseen' 是红色虚线卡（上沿红签、虚线图标、红字）。icon 是 48×48 viewBox 的路径。
 * 一组用法：先出 seen，约 20 帧后在它正下方出 unseen。
 */
export const ClaimCard: React.FC<{f: number; at: number; kind: 'seen' | 'unseen'; tab: string; text: string; icon?: string[]; w?: number; h?: number; out?: number}> = ({f, at, kind, tab, text, icon, w = 500, h = 220, out}) => {
  const s = rise(f, at, 16, out);
  const seen = kind === 'seen';
  const c = seen ? D.champagne : D.mark;
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: 12,
        background: seen ? D.glass : 'linear-gradient(180deg, rgba(120,30,24,0.12), rgba(60,12,10,0.08))',
        border: seen ? `1.5px solid ${D.glassBorder}` : `2px dashed ${D.markDim}`,
        boxShadow: seen ? 'inset 0 1px 0 rgba(255,240,210,0.1), 0 10px 30px rgba(0,0,0,0.45)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        ...s.style,
      }}
    >
      <div style={{position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)'}}>
        <Tag text={tab} tone={seen ? 'gold' : 'red'} filled />
      </div>
      {icon ? (
        <svg width={76} height={76} viewBox="0 0 48 48">
          {icon.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={c} strokeWidth={seen ? 2 : 1.6} strokeDasharray={seen ? undefined : '3 2.5'} strokeLinejoin="round" strokeLinecap="round" style={seen ? {filter: 'drop-shadow(0 0 4px rgba(218,204,157,0.5))'} : undefined} />
          ))}
        </svg>
      ) : null}
      <div style={{fontFamily: GF.cn, fontWeight: 700, fontSize: seen ? 38 : 32, letterSpacing: 2, padding: '0 24px', textAlign: 'center', ...(seen ? {...champagneText(0.4), color: '#e8d8a8'} : {color: D.mark})}}>{seen ? `“${text}”` : text}</div>
    </div>
  );
};

/** 勾选清单：标题（金线下划）+ 若干行「罗马数字 · 文字 · 圆圈勾」，每行 rowGap 帧依次出现；check[i] 是第 i 行打勾的帧 */
export const Checklist: React.FC<{f: number; at: number; title: string; note?: string; items: string[]; check?: number[]; rowGap?: number; w?: number}> = ({f, at, title, note, items, check = [], rowGap = 20, w = 620}) => {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const s = rise(f, at, 16);
  return (
    <div style={{width: w, ...s.style}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 14, borderBottom: `1px solid ${G.goldLine}`}}>
        <span style={{fontFamily: GF.cn, fontWeight: 700, fontSize: 38, letterSpacing: 6, color: '#e6d2a4'}}>{title}</span>
        {note ? <span style={{fontFamily: GF.latinItalic, fontSize: 18, color: G.ivoryFaint}}>{note}</span> : null}
      </div>
      {items.map((it, i) => {
        const r = rise(f, at + 14 + i * rowGap, 14);
        const ck = check[i] === undefined ? 0 : draw(f, check[i], 10);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '22px 0', borderBottom: '1px solid rgba(214,180,106,0.12)', ...r.style}}>
            <span style={{fontFamily: GF.latin, fontSize: 24, color: D.champagneDim, width: 40}}>{roman[i]}</span>
            <span style={{flex: 1, fontFamily: GF.cn, fontSize: 34, color: G.ivory, letterSpacing: 2}}>{it}</span>
            <svg width={48} height={48} viewBox="0 0 48 48">
              <circle cx={24} cy={24} r={21} fill="none" stroke={ck > 0 ? D.champagne : 'rgba(218,204,157,0.3)'} strokeWidth={1.5} />
              <path d="M14 25 L21 32 L34 17" fill="none" stroke={D.champagne} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${ck} 1`} />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 竖向量表：细框管子从下往上填，value 0–1；limit 处一条刻度线和标签。
 * value 超过 limit 时整管变红并在顶上弹出红色小签 over（「超重」「过载」）。
 */
export const Gauge: React.FC<{value: number; limit?: number; h?: number; label?: string; limitLabel?: string; over?: string}> = ({value, limit = 0.75, h = 300, label = '载重', limitLabel = '上限', over = '超限'}) => {
  const red = value > limit;
  const c = red ? D.mark : G.gold;
  return (
    <div style={{position: 'relative', width: 160, height: h + 90}}>
      {red ? (
        <div style={{position: 'absolute', left: 10, top: 0}}>
          <FrameStamp f={1} at={0} text={over} size={28} rot={-4} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 30, top: 50, width: 22, height: h, border: '1px solid rgba(218,204,157,0.4)', borderRadius: 3, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.min(1, value) * 100}%`, background: `linear-gradient(180deg, ${c}, ${red ? D.markFaint : 'rgba(214,180,106,0.25)'})`, boxShadow: `0 0 14px ${c}`}} />
      </div>
      <div style={{position: 'absolute', left: 22, width: 40, top: 50 + h * (1 - limit), height: 1.5, background: D.champagne}} />
      <div style={{position: 'absolute', left: 70, top: 50 + h * (1 - limit) - 13, fontFamily: GF.cn, fontSize: 20, color: D.champagne}}>{limitLabel}</div>
      <div style={{position: 'absolute', left: -40, width: 162, top: h + 64, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: GF.cn, fontSize: 22, color: G.ivoryDim, letterSpacing: 2}}>{label}</div>
    </div>
  );
};

/** 象牙剪影：把任意 SVG 路径画成实心象牙白剪影，带柔光；rot / sx 做小动作（翻转、旋转），at 柔入 */
export const Ivory: React.FC<{f: number; at: number; paths: string[]; viewBox: string; w: number; h: number; rot?: number; sx?: number; out?: number; style?: React.CSSProperties}> = ({f, at, paths, viewBox, w, h, rot = 0, sx = 1, out, style}) => {
  const s = rise(f, at, 16, out, 0);
  return (
    <svg width={w} height={h} viewBox={viewBox} style={{overflow: 'visible', ...s.style, transform: `rotate(${rot}deg) scaleX(${sx})`, ...style}}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="#f1e9d8" style={{filter: 'drop-shadow(0 0 14px rgba(241,233,216,0.35))'}} />
      ))}
    </svg>
  );
};
