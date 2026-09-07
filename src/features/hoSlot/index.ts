/**
 * hoSlot feature 统一入口
 */

export * from './types'
export { useHoSlotStore } from './hoSlotStore'
export type { CharacterSnapshot } from './hoSlotStore'
export { indexedDbHoSlotRepo } from './indexedDbRepo'
export {
  LANE_COLOR_PALETTE,
  laneColor,
  exportHoBoardAsPng,
  renderHoBoardPngCanvas,
  renderHoBoardPngDataUrl,
  type HoBoardPosterInput,
  type LaneColor,
} from './poster'