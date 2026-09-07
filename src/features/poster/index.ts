/**
 * poster feature 入口
 */

export { POSTER_TEMPLATES, SELF_INTRO_TEMPLATE, RECRUIT_TEMPLATE, getTemplateById } from './templates'
export { renderPoster, renderRecruitPoster, downloadCanvasAsPng } from './renderer'
export type { PosterRenderInput, RecruitPosterInput } from './renderer'