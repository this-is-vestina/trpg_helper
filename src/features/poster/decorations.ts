/**
 * 海报装饰资源
 *
 * 植物图鉴（线稿）放在 public/plant.png，
 * 通过 PLANT_IMAGE_URL 引用。Canvas 渲染时由 PosterStudio 异步加载。
 *
 * 注意：URL 必须带 BASE_URL 前缀，否则部署到 GitHub Pages 子路径
 * （如 /trpg_helper/）时，浏览器会向根域请求资源导致 404。
 */

/** 植物图鉴 URL（vintage botanical atlas 风格线稿） */
export const PLANT_IMAGE_URL = `${import.meta.env.BASE_URL}plant.png`

/** 向后兼容别名（旧代码可能仍引用 PLANT_IMAGE_DATA_URL） */
export const PLANT_IMAGE_DATA_URL = PLANT_IMAGE_URL