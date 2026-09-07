/**
 * poster feature 入口
 */

export {
  POSTER_TEMPLATES,
  SELF_INTRO_TEMPLATE,
  RECRUIT_TEMPLATE,
  APPLICATION_TEMPLATE,
  SWAP_TEMPLATE,
  getTemplateById,
} from './templates'
export {
  renderPoster,
  renderRecruitPoster,
  renderApplicationPoster,
  renderSwapPoster,
  downloadCanvasAsPng,
} from './renderer'
export type {
  PosterRenderInput,
  RecruitPosterInput,
  ApplicationPosterInput,
  SwapPosterInput,
  SwapModItem,
  PosterTheme,
  CustomField,
} from './renderer'
export {
  POSTER_PALETTES,
  POSTER_HEADING_FONTS,
  POSTER_CJK_FONTS,
  getPaletteById,
  getHeadingFont,
  getCjkFont,
} from './theme'
export type { PosterPalette, PosterFontOption } from './theme'
export { PLANT_IMAGE_URL, PLANT_IMAGE_DATA_URL } from './decorations'