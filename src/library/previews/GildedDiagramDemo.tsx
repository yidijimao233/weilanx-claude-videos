import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01} from '../anim';
import {BigCount, FlowRow, IconGrid} from '../gilded-diagram/charts';
import {Callout, Checklist, ClaimCard, CountRing, FrameStamp, Gauge, HitMark, Ivory, LineArt, NameCard, Tag} from '../gilded-diagram/props';
import {BlueprintGrid, CornerFrame, Counter, DCaption, DotMap, FlashTitle, KickerCite, NightCity, Ridges, SectionTitle} from '../gilded-diagram/stage';
import {D, G, GF} from '../gilded-diagram/theme';
import {Dust, GildedBg, Grain, YearHeader} from '../gilded/stage';
import {drift} from '../gilded/theme';

/**
 * 暗金图解风素材一览（1920×1080，55 秒）：每 150 帧一场，场间模糊交叉淡化；片名一场是硬切 + 闪白。
 * 示例题目是「回归均值」，文案、线稿（奖杯）、剪影（小鸟）都是新写新画的，人名书名用「示例」占位。
 */
const LEN = 150;
const SCENES = 11;
export const GILDED_DIAGRAM_DEMO_FRAMES = LEN * SCENES;

/** 一场：默认带模糊交叉淡化和 2.5% 慢推；hard=true 时硬切进来（片名闪白那场），cutOut=true 时到点直接消失（下一场是硬切） */
const Scene: React.FC<{f: number; i: number; hard?: boolean; cutOut?: boolean; children: (t: number) => React.ReactNode}> = ({f, i, hard, cutOut, children}) => {
  const at = i * LEN;
  const t = f - at;
  if (t < (hard ? 0 : -12) || t >= (cutOut ? LEN : LEN + 12)) return null;
  const vin = hard ? 1 : clamp01((t + 12) / 24);
  const v = vin * (cutOut ? 1 : 1 - clamp01((t - LEN + 12) / 24));
  return <AbsoluteFill style={{opacity: v, filter: `blur(${(1 - v) * 8}px)`, transform: `scale(${drift(f, at, LEN, 0.025)})`}}>{children(t)}</AbsoluteFill>;
};

// —— 原创线稿和图标 ——
const TROPHY = [
  'M120 40 L280 40 L272 150 Q260 240 200 250 Q140 240 128 150 Z',
  'M124 70 Q62 70 64 120 Q68 172 136 182',
  'M276 70 Q338 70 336 120 Q332 172 264 182',
  'M186 250 L214 250 L222 320 L178 320 Z',
  'M140 320 L260 320 L270 356 L130 356 Z',
  'M106 356 L294 356 L294 398 L106 398 Z',
  'M150 78 L250 78',
];
const TROPHY_HITS: [number, number][] = [
  [160, 108],
  [236, 126],
  [204, 192],
  [252, 92],
  [176, 162],
  [74, 112],
  [330, 128],
  [150, 378],
  [262, 376],
];
const MINI_TROPHY = ['M14 8 L34 8 L33 20 Q31 30 24 31 Q17 30 15 20 Z', 'M22 31 L26 31 L27 37 L21 37 Z', 'M16 37 L32 37 L32 41 L16 41 Z', 'M14 11 Q7 11 8 17 Q9 22 15 22', 'M34 11 Q41 11 40 17 Q39 22 33 22'];
const BIRD = ['M8 36 Q26 22 52 28 Q60 14 74 6 Q72 20 66 30 Q84 26 96 30 Q86 36 70 38 Q56 50 32 46 Q18 44 8 36 Z'];
const ICON_STAR = ['M24 6 L29 18 L42 19 L32 27 L35 40 L24 33 L13 40 L16 27 L6 19 L19 18 Z'];
const ICON_SHOP = ['M8 20 L24 8 L40 20', 'M12 18 L12 40 L36 40 L36 18', 'M20 40 L20 28 L28 28 L28 40'];
const ICON_CHART = ['M8 40 L40 40', 'M8 40 L8 8', 'M12 34 L20 24 L27 29 L38 14', 'M32 14 L38 14 L38 20'];

const MiniTrophy: React.FC<{state: 'seen' | 'missing'; size?: number}> = ({state, size = 58}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    {MINI_TROPHY.map((d, i) => (
      <path key={i} d={d} fill={state === 'seen' ? 'rgba(218,204,157,0.12)' : 'none'} stroke={state === 'seen' ? D.champagne : D.mark} strokeWidth={1.6} strokeDasharray={state === 'seen' ? undefined : '2.5 2'} strokeLinejoin="round" style={state === 'missing' ? {filter: `drop-shadow(0 0 3px ${D.markDim})`} : undefined} />
    ))}
  </svg>
);

/** 线稿奖杯 + 网格 + 弹孔，放在画面中间偏左；at 是开始画的帧，hitAt 是弹孔开始出现的帧 */
const TrophyBoard: React.FC<{t: number; at: number; hitAt: number}> = ({t, at, hitAt}) => (
  <>
    <BlueprintGrid f={t} at={at} x={480} y={160} w={960} h={720} />
    <div style={{position: 'absolute', left: 680, top: 210}}>
      <LineArt f={t} at={at} paths={TROPHY} viewBox="0 0 400 440" w={560} h={616} stroke={2}>
        {TROPHY_HITS.map(([x, y], i) => (
          <HitMark key={i} f={t} at={hitAt + i * 3} x={x} y={y} />
        ))}
      </LineArt>
    </div>
  </>
);

export const GildedDiagramDemo: React.FC = () => {
  const f = useCurrentFrame();
  const scene = Math.floor(f / LEN);
  const ownBg = scene === 0 || scene === 9;
  return (
    <AbsoluteFill style={{background: G.bg, fontFamily: GF.cn}}>
      {!ownBg ? <GildedBg f={f} /> : null}

      {/* 1 夜景开场：镜头往下摇，左上计数跟着滚，一只象牙小鸟掠过 */}
      <Scene f={f} i={0} cutOut>
        {(t) => (
          <>
            <NightCity f={t} scroll={t * 6} />
            <Counter f={t} at={0} value={60 + 22 * clamp01(t / 120)} unit="场" />
            <div style={{position: 'absolute', left: 300 + t * 9, top: 460 - Math.sin(t / 14) * 30}}>
              <Ivory f={t} at={10} paths={BIRD} viewBox="0 0 100 60" w={150} h={90} rot={-6 + Math.sin(t / 7) * 5} />
            </div>
            <DCaption f={t} at={20} text="那一季，这支球队赢下了【82 场】。" />
          </>
        )}
      </Scene>

      {/* 2 片名：硬切 + 闪白 + 金粒子聚字（闪白那帧对配乐重拍） */}
      <Scene f={f} i={1} hard>
        {(t) => <FlashTitle f={t} at={0} title="回归均值" latin="Regression to the Mean" sub="好运气，总会还回去" />}
      </Scene>

      {/* 3 线稿 + 弹孔 + 引线选项 + 倒计时 */}
      <Scene f={f} i={2}>
        {(t) => (
          <>
            <TrophyBoard t={t} at={0} hitAt={30} />
            <Callout f={t} at={50} px={1150} py={378} lx={1480} ly={380} letter="A" text="天赋" />
            <Callout f={t} at={58} px={1002} py={448} lx={1480} ly={520} letter="B" text="训练" />
            <Callout f={t} at={66} px={960} py={739} lx={1480} ly={660} letter="C" text="运气" />
            <div style={{position: 'absolute', left: 250, top: 380}}>
              <CountRing f={t} at={78} step={14} />
            </div>
            <DCaption f={t} at={10} text="一个好成绩里，哪一部分【最靠不住】？" />
          </>
        )}
      </Scene>

      {/* 4 揭晓：两项排除变红删除线，一项打勾；左边人物名牌，右上带导语的文献引用 */}
      <Scene f={f} i={3}>
        {(t) => (
          <>
            <TrophyBoard t={t} at={-80} hitAt={-80} />
            <KickerCite f={t} at={0} kicker="关于成绩为何回落的示例研究" original="Liber Exempli de Medio" title="示例文献" meta="Exemplum · 1886" />
            <Callout f={t} at={-40} px={1150} py={378} lx={1480} ly={380} letter="A" text="天赋" state={t > 40 ? 'reject' : 'idle'} />
            <Callout f={t} at={-40} px={1002} py={448} lx={1480} ly={520} letter="B" text="训练" state={t > 48 ? 'reject' : 'idle'} />
            <Callout f={t} at={-40} px={960} py={739} lx={1480} ly={660} letter="C" text="运气" state={t > 64 ? 'right' : 'idle'} />
            <div style={{position: 'absolute', left: 110, top: 560}}>
              <NameCard f={t} at={14} latin="Exemplum Persona" name="示例人物" meta="统计学家 · 1822–1911" />
            </div>
            <DCaption f={t} at={20} text="示例人物说：会回落的，是〔运气〕那部分。" />
          </>
        )}
      </Scene>

      {/* 5 样本方阵 + 大数字：四角取景框，几只变红虚线 */}
      <Scene f={f} i={4}>
        {(t) => (
          <>
            <SectionTitle f={t} at={0} y={150} text="统计样本：〔只有上过封面的〕" />
            <div style={{position: 'absolute', left: 140, top: 400}}>
              <BigCount f={t} at={10} value={48} unit="支 · 登上封面的球队" note="EXEMPLUM · 1954 – 2000" />
            </div>
            <CornerFrame f={t} at={14} x={680} y={280} w={1120} h={520} />
            <IconGrid f={t} at={18} cols={8} rows={3} cell={[134, 160]} cx={1240} cy={540} missing={[3, 9, 14, 20, 22]} missAt={80} render={(_, s) => <MiniTrophy state={s} />} />
            <DCaption f={t} at={30} text="下一季，其中不少都〔掉了下来〕。" />
          </>
        )}
      </Scene>

      {/* 6 虚线流程图 + 红章 + 推测签 */}
      <Scene f={f} i={5}>
        {(t) => (
          <>
            <FlowRow
              f={t}
              at={0}
              y={470}
              nodes={[
                {
                  x: 330,
                  cn: '所有球队',
                  en: 'every team',
                  tag: <Tag text="实力各不相同" />,
                  body: (
                    <div style={{position: 'relative', width: 220, height: 130}}>
                      {Array.from({length: 14}, (_, k) => (
                        <div key={k} style={{position: 'absolute', left: (k * 53) % 190, top: ((k * 37) % 90) + (k % 3) * 6, opacity: 0.55}}>
                          <MiniTrophy state="seen" size={40} />
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  x: 960,
                  cn: '爆发赛季',
                  en: 'a lucky season',
                  tone: 'gold',
                  body: (
                    <svg width={110} height={110} viewBox="0 0 48 48">
                      <path d={ICON_STAR[0]} fill="rgba(218,204,157,0.15)" stroke={D.champagne} strokeWidth={1.6} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 8px rgba(218,204,157,0.6))'}} />
                    </svg>
                  ),
                },
                {
                  x: 1590,
                  cn: '48 支 · 登上封面',
                  en: 'on the cover',
                  tone: 'gold',
                  body: (
                    <div style={{padding: 16, border: `1px solid ${D.glassBorder}`, borderRadius: 10, background: D.glass, display: 'grid', gridTemplateColumns: 'repeat(8, 22px)', gap: 6}}>
                      {Array.from({length: 48}, (_, k) => (
                        <div key={k} style={{width: 22, height: 14, borderRadius: 2, background: 'rgba(218,204,157,0.55)'}} />
                      ))}
                    </div>
                  ),
                },
              ]}
              token={{p: clamp01((t - 50) / 60), node: <MiniTrophy state="seen" size={40} />}}
            />
            <div style={{position: 'absolute', left: 470, top: 620, width: 340, height: 130, border: `2px dashed ${D.markDim}`, borderRadius: 8, background: 'rgba(120,30,24,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp01((t - 60) / 10)}}>
              <FrameStamp f={t} at={72} text="没有记录" />
            </div>
            <div style={{position: 'absolute', left: 470, top: 770, display: 'flex', gap: 16, alignItems: 'center', opacity: clamp01((t - 80) / 12)}}>
              <span style={{fontFamily: GF.cn, fontWeight: 700, fontSize: 30, color: D.mark, letterSpacing: 4}}>普通赛季 · 没人报道</span>
              <Tag text="推测" tone="gold" />
            </div>
            <DCaption f={t} at={20} text="只在最顺的那一季，才会【被看见】。" />
          </>
        )}
      </Scene>

      {/* 7 成对卡片：你听到的（金）/ 你没算的（红虚线），三组依次出 */}
      <Scene f={f} i={6}>
        {(t) => (
          <>
            <SectionTitle f={t} at={0} y={96} text="生活里的回归均值" />
            {[
              {icon: ICON_STAR, a: '一次满分，以后都稳', b: '那次蒙对的题，下次未必蒙对'},
              {icon: ICON_SHOP, a: '新店开业，天天爆满', b: '新鲜劲过去，排队就散了'},
              {icon: ICON_CHART, a: '业绩一个月翻一倍', b: '大单不会每个月都来'},
            ].map((c, k) => (
              <div key={k} style={{position: 'absolute', left: 130 + k * 580, top: 240}}>
                <ClaimCard f={t} at={14 + k * 30} kind="seen" tab="你听到的" text={c.a} icon={c.icon} />
                <div style={{height: 26}} />
                <ClaimCard f={t} at={30 + k * 30} kind="unseen" tab="你没算的" text={c.b} icon={c.icon} h={200} />
              </div>
            ))}
          </>
        )}
      </Scene>

      {/* 8 勾选清单 + 量表 */}
      <Scene f={f} i={7}>
        {(t) => (
          <>
            <div style={{position: 'absolute', left: 340, top: 250}}>
              <Gauge value={0.35 + 0.6 * clamp01((t - 20) / 50)} h={440} label="运气占比" limitLabel="平均" over="偏高" />
            </div>
            <div style={{position: 'absolute', left: 760, top: 290}}>
              <Checklist f={t} at={6} w={860} title="示例文献的解释" note="Exemplum · 1886" items={['极端成绩里，运气占比更高', '下一次，运气回到平均附近']} check={[60, 80]} />
            </div>
            <DCaption f={t} at={24} text="越是【极端】的成绩，越容易往回落。" />
          </>
        )}
      </Scene>

      {/* 9 年份抬头 + 点阵地图航线 */}
      <Scene f={f} i={8}>
        {(t) => (
          <>
            <YearHeader f={t} at={0} year="1886" caption="甲城  →  乙城" />
            <DotMap f={t} at={4} from={{x: 620, y: 420, cn: '甲城', en: 'Alpha'}} to={{x: 1580, y: 470, cn: '乙城', en: 'Beta'}} />
            <DCaption f={t} at={30} text="示例人物带着数据，去乙城【讲这件事】。" />
          </>
        )}
      </Scene>

      {/* 10 群山剪影（冷调）+ 小鸟 */}
      <Scene f={f} i={9} cutOut>
        {(t) => (
          <>
            <Ridges f={t} />
            <div style={{position: 'absolute', left: 1500 - t * 5, top: 330 + Math.sin(t / 12) * 16}}>
              <Ivory f={t} at={8} paths={BIRD} viewBox="0 0 100 60" w={110} h={66} sx={-1} />
            </div>
            <DCaption f={t} at={20} text="下次看到一个【好得离谱】的结果——" />
          </>
        )}
      </Scene>

      {/* 11 片尾：再闪一次，留问题 */}
      <Scene f={f} i={10} hard>
        {(t) => <FlashTitle f={t} at={0} title="回归均值" latin="Regression to the Mean" sub="先问问：运气还在吗？" y={440} />}
      </Scene>

      <Dust f={f} />
      <Grain />
    </AbsoluteFill>
  );
};
