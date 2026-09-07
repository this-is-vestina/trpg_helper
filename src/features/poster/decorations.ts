/**
 * 海报装饰资源
 *
 * 植物图鉴（线稿）放在 public/plant.png，
 * 通过 PLANT_IMAGE_URL 引用。Canvas 渲染时由 PosterStudio 异步加载。
 */

/** 植物图鉴 URL（vintage botanical atlas 风格线稿） */
export const PLANT_IMAGE_URL = '/plant.png'

/** 向后兼容别名（旧代码可能仍引用 PLANT_IMAGE_DATA_URL） */
export const PLANT_IMAGE_DATA_URL = PLANT_IMAGE_URL