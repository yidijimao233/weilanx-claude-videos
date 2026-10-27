import React from 'react';
import {clamp01} from '../anim';
import {goldText} from '../gilded/theme';
import {D, draw, G, GF, rise} from './theme';

/**
 * 暗金图解风的图表：样本方阵、大数字计数、虚线流程图。
 */

/**
 * 样本方阵：cols×rows 个图标，at 起逐个柔入（每个错开 stagger 帧，按行优先）。
 * render(i, state) 画单个图标，state 是 'seen' | 'missing' | 'gone'：
 *   missing 里的下标在 missAt 帧后先闪一下红光再换成红虚线；gone 里的下标在 goneAt 后淡成空位。
 * cell 是格宽，iconW/iconH 是图标尺寸。整片居中在 (cx, cy)。
 */
export const IconGrid: React.FC<{
  f: number;
  at: number;
  cols: number;
  rows: number;
  cell: [number, number];
  cx?: number;
  cy?: number;
  stagger?: number;
  missing?: number[];
  missAt?: number;
  missStagger?: number;
  gone?: number[];
  goneAt?: number;
  render: (i: number, state: 'seen' | 'missing') => React.ReactNode;
}> = ({f, at, cols, rows, cell, cx = 960, cy = 540, stagger = 2, missing = [], missAt, missStagger = 6, gone = [], goneAt, render}) => {
  const W = cols * cell[0];
  const H = rows * cell[1];
  return (
    <div style={{position: 'absolute', left: cx - W / 2, top: cy - H / 2, width: W, height: H}}>
      {Array.from({length: cols * rows}, (_, i) => {
        const s = rise(f, at + i * stagger, 12, undefined, 6);
        const mk = missing.indexOf(i);
        const mt = mk < 0 || missAt === undefined ? -1 : f - (missAt + mk * missStagger);
        const isMiss = mt >= 0;
        const flash = isMiss ? Math.max(0, 1 - mt / 10) : 0;
        const gk = gone.indexOf(i);
        const goneV = gk < 0 || goneAt === undefined ? 1 : 1 - clamp01((f - goneAt - gk * 3) / 12);
        return (
          <div key={i} style={{position: 'absolute', left: (i % cols) * cell[0], top: Math.floor(i / cols) * cell[1], width: cell[0], height: cell[1], display: 'flex', alignItems: 'center', justifyContent: 'center', ...s.style, opacity: s.v * goneV}}>
            {flash > 0 ? <div style={{position: 'absolute', width: cell[0] * 0.8, height: cell[1] * 0.8, borderRadius: '50%', background: `radial-gradient(circle, rgba(230,110,90,${0.6 * flash}) 0%, rgba(0,0,0,0) 70%)`}} /> : null}
            {render(i, isMiss ? 'missing' : 'seen')}
          </div>
        );
      })}
    </div>
  );
};

/** 大数字计数：金色衬线大数字从 0 滚到 value（ease-out，dur 帧），下面「单位 · 说明」和一行斜体小字（时间范围等） */
export const BigCount: React.FC<{f: number; at: number; value: number; unit: string; note?: string; dur?: number; size?: number}> = ({f, at, value, unit, note, dur = 40, size = 120}) => {
  const s = rise(f, at, 16);
  const p = 1 - Math.pow(1 - clamp01((f - at) / dur), 3);
  return (
    <div style={{textAlign: 'center', ...s.style}}>
      <div style={{fontFamily: GF.num, fontSize: size, lineHeight: 1, ...goldText(0.6)}}>{Math.round(value * p)}</div>
      <div style={{fontFamily: GF.cn, fontSize: 28, color: G.ivory, marginTop: 18, letterSpacing: 4}}>{unit}</div>
      {note ? <div style={{fontFamily: GF.latin, fontSize: 20, color: G.ivoryFaint, marginTop: 10, letterSpacing: 2}}>{note}</div> : null}
    </div>
  );
};

export type FlowNode = {x: number; cn: string; en?: string; tone?: 'gold' | 'dim'; body?: React.ReactNode; tag?: React.ReactNode};

/**
 * 虚线流程图：一排节点（x 坐标）用金色虚线箭头连起来，at 起逐段画出（每段 seg 帧），
 * 节点内容 body 在线条到达时柔入；token 给一个在 0–1 之间移动的小标记（画在线上，位置按整条线插值）。
 * y 是线的高度，节点名写在线下方。
 */
export const FlowRow: React.FC<{f: number; at: number; nodes: FlowNode[]; y?: number; seg?: number; token?: {p: number; node: React.ReactNode}}> = ({f, at, nodes, y = 470, seg = 22, token}) => {
  const xs = nodes.map((n) => n.x);
  const span = xs[xs.length - 1] - xs[0];
  const tx = token ? xs[0] + span * token.p : 0;
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <marker id="fr-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={9} markerHeight={9} orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={D.champagneDim} />
          </marker>
        </defs>
        {nodes.slice(0, -1).map((n, i) => {
          const p = draw(f, at + 10 + i * seg, seg);
          const x0 = n.x + 110;
          const x1 = nodes[i + 1].x - 110;
          if (p <= 0) return null;
          return <line key={i} x1={x0} y1={y} x2={x0 + (x1 - x0) * p} y2={y} stroke={D.champagneDim} strokeWidth={2} strokeDasharray="8 7" markerEnd={p > 0.98 ? 'url(#fr-arrow)' : undefined} />;
        })}
      </svg>
      {nodes.map((n, i) => {
        const s = rise(f, at + i * seg, 16);
        return (
          <div key={i} style={{position: 'absolute', left: n.x - 200, width: 400, top: y - 150, textAlign: 'center', ...s.style}}>
            <div style={{height: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 10}}>{n.body}</div>
            <div style={{marginTop: 34, fontFamily: GF.cn, fontWeight: 700, fontSize: 34, letterSpacing: 4, ...(n.tone === 'gold' ? {...goldText(0.35)} : {color: '#e6dcc6'})}}>{n.cn}</div>
            {n.en ? <div style={{fontFamily: GF.latinItalic, fontSize: 20, color: G.ivoryFaint, marginTop: 6, letterSpacing: 2}}>{n.en}</div> : null}
            {n.tag ? <div style={{marginTop: 12}}>{n.tag}</div> : null}
          </div>
        );
      })}
      {token ? <div style={{position: 'absolute', left: tx - 20, top: y - 46, width: 40, display: 'flex', justifyContent: 'center', opacity: clamp01(token.p * 20) * (1 - clamp01((token.p - 0.97) * 30))}}>{token.node}</div> : null}
    </>
  );
};
