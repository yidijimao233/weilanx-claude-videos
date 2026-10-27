import type React from 'react';
import {clamp01} from '../anim';
import {G, GF} from '../gilded/theme';

/**
 * 暗金图解风：暗金文献风的图解分支。底层（黑底、光晕、浮尘、年份、文献、红章）直接用 gilded，
 * 这里补线稿示意图这一路的颜色和动效。规则：金 = 看得见的，红虚线 = 看不见 / 被排除的。
 */
export {G, GF};

export const D = {
  line: '#f8f4eb', // 线稿描边：近白象牙
  lineDim: 'rgba(248,244,235,0.42)',
  fill: 'rgba(248,244,235,0.06)', // 线稿内部的淡填充
  champagne: '#dacc9d', // 香槟金：字幕重点词、标签、选项圈（比 gilded 的金更淡）
  champagneDim: 'rgba(218,204,157,0.55)',
  champagneFaint: 'rgba(218,204,157,0.18)',
  mark: '#d0605a', // 标记红：弹孔、被排除、看不见
  markDim: 'rgba(208,96,90,0.55)',
  markFaint: 'rgba(208,96,90,0.12)',
  glass: 'linear-gradient(180deg, rgba(255,246,225,0.07) 0%, rgba(255,246,225,0.025) 100%)', // 玻璃卡底
  glassBorder: 'rgba(218,204,157,0.32)',
  grid: 'rgba(239,230,210,0.05)', // 蓝图网格
  // 夜景
  sky: '#050811',
  facade: '#15181f',
  facadeEdge: '#232836',
  winWarm: '#a8834f',
  winCool: '#6f7486',
  ridge: ['#1b2333', '#141a27', '#0d121c'],
};

/** 字号层级（1920 宽）：片名 130 / 字幕 56 / 标注 40 / 小节标题 34 / 小签 18–22 */
export const DS = {title: 130, caption: 56, label: 40, section: 34, small: 20};

/** 柔入 + 上浮：透明、模糊、上浮 rise 像素一起收拢，约 14 帧；out 给退场帧 */
export const rise = (f: number, at: number, dur = 14, out?: number, lift = 12) => {
  const i = clamp01((f - at) / dur);
  const e = 1 - Math.pow(1 - i, 3);
  const o = out === undefined ? 1 : 1 - clamp01((f - out) / 12);
  const v = e * o;
  return {v, style: {opacity: v, filter: `blur(${(1 - v) * 8}px)`, transform: `translateY(${(1 - e) * lift}px)`} as React.CSSProperties};
};

/** 描边进度：at 起 dur 帧把线画完（ease-in-out），配 pathLength={1} + strokeDasharray 用 */
export const draw = (f: number, at: number, dur = 30) => {
  const t = clamp01((f - at) / dur);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/** 倒计时：从 from 开始每 step 帧减一，返回当前数字和这一跳内的进度（0–1） */
export const tick = (f: number, at: number, from = 3, step = 24) => {
  const t = Math.max(0, f - at);
  const k = Math.min(from - 1, Math.floor(t / step));
  return {n: from - k, p: clamp01((t - k * step) / step), done: t >= from * step};
};

/** 小字号香槟金（标签、重点词）：纯色加柔光，不用渐变，避免小字发褐 */
export const champagneText = (glow = 0.35): React.CSSProperties => ({
  color: D.champagne,
  textShadow: `0 0 ${14 * glow}px rgba(230,205,140,${0.8 * glow}), 0 2px 10px rgba(0,0,0,0.9)`,
});
