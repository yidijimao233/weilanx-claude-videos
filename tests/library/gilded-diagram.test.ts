import {describe, expect, it} from 'vitest';
import {GILDED_DIAGRAM_DEMO_FRAMES} from '../../src/library/previews/GildedDiagramDemo';
import {draw, rise, tick} from '../../src/library/gilded-diagram/theme';

describe('暗金图解风 gilded-diagram', () => {
  it('柔入：at 之前不可见，14 帧后完全出现、回到原位', () => {
    expect(rise(10, 20).v).toBe(0);
    const s = rise(34, 20);
    expect(s.v).toBeCloseTo(1, 5);
    expect(s.style.transform).toBe('translateY(0px)');
    // 退场 12 帧后归零
    expect(rise(200, 20, 14, 100).v).toBe(0);
  });

  it('描边进度在 at 到 at+dur 之间从 0 走到 1', () => {
    expect(draw(0, 10, 30)).toBe(0);
    expect(draw(25, 10, 30)).toBeCloseTo(0.5, 5);
    expect(draw(40, 10, 30)).toBe(1);
  });

  it('倒计时：3 → 2 → 1，每 step 帧跳一次，倒完标记 done', () => {
    expect(tick(0, 0, 3, 24).n).toBe(3);
    expect(tick(24, 0, 3, 24).n).toBe(2);
    expect(tick(50, 0, 3, 24).n).toBe(1);
    expect(tick(71, 0, 3, 24).done).toBe(false);
    expect(tick(72, 0, 3, 24).done).toBe(true);
    // 倒完停在 1，不会出现 0
    expect(tick(500, 0, 3, 24).n).toBe(1);
  });

  it('预览作品是 11 场 × 150 帧', () => {
    expect(GILDED_DIAGRAM_DEMO_FRAMES).toBe(1650);
  });
});
