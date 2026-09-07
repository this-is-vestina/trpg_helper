/**
 * COC7 标准技能候选库（60+ 项）
 * 数据源：COC7 空白卡 CY23.5 Plus
 * 用途：技能编辑器里的"快速添加"候选
 */

export interface SkillCatalogEntry {
  /** 标准中文名 */
  name: string
  /** 常用别名 / 简称（也用于 .st 解析） */
  aliases: string[]
  /** 英文名 */
  en: string
  /** 类别（仅 UI 分组用） */
  category:
    | 'investigate' // 调查
    | 'knowledge' // 学识
    | 'social' // 社交
    | 'technical' // 技术
    | 'combat' // 战斗
    | 'survival' // 生存
    | 'language' // 语言
    | 'art' // 艺术/手艺
}

/** 类别显示名 */
export const SKILL_CATEGORY_LABELS: Record<SkillCatalogEntry['category'], string> = {
  investigate: '调查',
  knowledge: '学识',
  social: '社交',
  technical: '技术',
  combat: '战斗',
  survival: '生存',
  language: '语言',
  art: '艺术 / 手艺',
}

export const SKILL_LIBRARY: SkillCatalogEntry[] = [
  // ===== 调查 =====
  { name: '侦查', aliases: ['侦查', '搜索'], en: 'Spot Hidden', category: 'investigate' },
  { name: '聆听', aliases: ['聆听'], en: 'Listen', category: 'investigate' },
  { name: '图书馆使用', aliases: ['图书馆', '查资料'], en: 'Library Use', category: 'investigate' },
  { name: '跟踪', aliases: ['跟踪', '追踪'], en: 'Track', category: 'investigate' },

  // ===== 学识 =====
  { name: '会计学', aliases: ['会计'], en: 'Accounting', category: 'knowledge' },
  { name: '人类学', aliases: ['人类学'], en: 'Anthropology', category: 'knowledge' },
  { name: '考古学', aliases: ['考古'], en: 'Archaeology', category: 'knowledge' },
  { name: '估价', aliases: ['估价'], en: 'Appraise', category: 'knowledge' },
  { name: '历史学', aliases: ['历史'], en: 'History', category: 'knowledge' },
  { name: '法律学', aliases: ['法律'], en: 'Law', category: 'knowledge' },
  { name: '神秘学', aliases: ['神秘学'], en: 'Occult', category: 'knowledge' },
  { name: '博物学', aliases: ['博物'], en: 'Natural History', category: 'knowledge' },
  { name: '药学', aliases: ['药学', '药物'], en: 'Pharmacy', category: 'knowledge' },
  { name: '医学', aliases: ['医学'], en: 'Medicine', category: 'knowledge' },
  { name: '精神病学', aliases: ['精神病学'], en: 'Psychiatry', category: 'knowledge' },
  { name: '电子学', aliases: ['电子'], en: 'Electronics', category: 'knowledge' },
  { name: '天文学', aliases: ['天文'], en: 'Astronomy', category: 'knowledge' },
  { name: '气象学', aliases: ['气象'], en: 'Meteorology', category: 'knowledge' },
  { name: '化学', aliases: ['化学'], en: 'Chemistry', category: 'knowledge' },
  { name: '地质学', aliases: ['地质'], en: 'Geology', category: 'knowledge' },
  { name: '生物学', aliases: ['生物'], en: 'Biology', category: 'knowledge' },
  { name: '数学', aliases: ['数学'], en: 'Mathematics', category: 'knowledge' },
  { name: '物理', aliases: ['物理'], en: 'Physics', category: 'knowledge' },

  // ===== 社交 =====
  { name: '说服', aliases: ['说服', '话术'], en: 'Persuade', category: 'social' },
  { name: '恐吓', aliases: ['恐吓', '威吓'], en: 'Intimidate', category: 'social' },
  { name: '心理学', aliases: ['心理学'], en: 'Psychology', category: 'social' },
  { name: '魅惑', aliases: ['魅惑', '魅力'], en: 'Charm', category: 'social' },
  { name: '欺骗', aliases: ['欺骗', '诈术'], en: 'Fast Talk', category: 'social' },
  { name: '信用评级', aliases: ['信用', '信誉'], en: 'Credit Rating', category: 'social' },

  // ===== 技术 =====
  { name: '计算机使用', aliases: ['计算机', '电脑', 'IT'], en: 'Computer Use', category: 'technical' },
  { name: '电子维修', aliases: ['电子维修'], en: 'Electrical Repair', category: 'technical' },
  { name: '机械维修', aliases: ['机械维修'], en: 'Mechanical Repair', category: 'technical' },
  { name: '操作重型机械', aliases: ['重型机械', '重机'], en: 'Operate Heavy Machinery', category: 'technical' },
  { name: '驾驶（汽车）', aliases: ['汽车', '驾驶', '驾车'], en: 'Drive Auto', category: 'technical' },
  { name: '驾驶（船）', aliases: ['船', '开船'], en: 'Pilot Boat', category: 'technical' },
  { name: '驾驶（飞机）', aliases: ['飞机', '开飞机'], en: 'Pilot Airplane', category: 'technical' },
  { name: '锁匠', aliases: ['锁匠', '开锁'], en: 'Locksmith', category: 'technical' },

  // ===== 战斗 =====
  { name: '格斗（拳击）', aliases: ['拳击', '格斗'], en: 'Fighting (Brawl)', category: 'combat' },
  { name: '格斗（刀）', aliases: ['刀', '短刀'], en: 'Fighting (Knife)', category: 'combat' },
  { name: '格斗（剑）', aliases: ['剑', '长剑'], en: 'Fighting (Sword)', category: 'combat' },
  { name: '格斗（斧）', aliases: ['斧'], en: 'Fighting (Axe)', category: 'combat' },
  { name: '射击（手枪）', aliases: ['手枪', '射击'], en: 'Firearms (Handgun)', category: 'combat' },
  { name: '射击（步枪/霰弹枪）', aliases: ['步枪', '霰弹枪'], en: 'Firearms (Rifle/Shotgun)', category: 'combat' },
  { name: '射击（冲锋枪）', aliases: ['冲锋枪', '机枪'], en: 'Firearms (SMG)', category: 'combat' },
  { name: '投掷', aliases: ['投掷'], en: 'Throw', category: 'combat' },
  { name: '闪避', aliases: ['闪避', '躲避'], en: 'Dodge', category: 'combat' },

  // ===== 生存 =====
  { name: '急救', aliases: ['急救'], en: 'First Aid', category: 'survival' },
  { name: '潜行', aliases: ['潜行', '潜踪'], en: 'Stealth', category: 'survival' },
  { name: '隐藏', aliases: ['隐藏'], en: 'Hide', category: 'survival' },
  { name: '攀爬', aliases: ['攀爬'], en: 'Climb', category: 'survival' },
  { name: '跳跃', aliases: ['跳跃'], en: 'Jump', category: 'survival' },
  { name: '游泳', aliases: ['游泳'], en: 'Swim', category: 'survival' },
  { name: '生存（荒野）', aliases: ['荒野', '生存'], en: 'Survival (Wilderness)', category: 'survival' },
  { name: '导航', aliases: ['导航', '辨别方向'], en: 'Navigate', category: 'survival' },
  { name: '骑术', aliases: ['骑术', '骑马'], en: 'Ride', category: 'survival' },
  { name: '烹饪', aliases: ['烹饪'], en: 'Cook', category: 'survival' },

  // ===== 语言 =====
  { name: '母语', aliases: ['母语'], en: 'Own Language (Native)', category: 'language' },
  { name: '英语', aliases: ['英语'], en: 'English', category: 'language' },
  { name: '法语', aliases: ['法语'], en: 'French', category: 'language' },
  { name: '德语', aliases: ['德语'], en: 'German', category: 'language' },
  { name: '西班牙语', aliases: ['西班牙语', '西语'], en: 'Spanish', category: 'language' },
  { name: '俄语', aliases: ['俄语'], en: 'Russian', category: 'language' },
  { name: '拉丁语', aliases: ['拉丁语'], en: 'Latin', category: 'language' },
  { name: '希腊语', aliases: ['希腊语'], en: 'Greek', category: 'language' },
  { name: '日语', aliases: ['日语'], en: 'Japanese', category: 'language' },
  { name: '汉语', aliases: ['汉语', '中文', '普通话'], en: 'Chinese', category: 'language' },
  { name: '阿拉伯语', aliases: ['阿拉伯语'], en: 'Arabic', category: 'language' },

  // ===== 艺术 / 手艺 =====
  { name: '艺术与手艺（绘画）', aliases: ['绘画'], en: 'Art & Craft (Paint)', category: 'art' },
  { name: '艺术与手艺（写作）', aliases: ['写作'], en: 'Art & Craft (Write)', category: 'art' },
  { name: '艺术与手艺（摄影）', aliases: ['摄影'], en: 'Art & Craft (Photo)', category: 'art' },
  { name: '艺术与手艺（音乐）', aliases: ['音乐', '演奏'], en: 'Art & Craft (Music)', category: 'art' },
  { name: '缝纫', aliases: ['缝纫'], en: 'Sewing', category: 'art' },
  { name: '伪造', aliases: ['伪造'], en: 'Forgery', category: 'art' },
]

/** 按类别分组 */
export function groupByCategory(): Record<string, SkillCatalogEntry[]> {
  const out: Record<string, SkillCatalogEntry[]> = {}
  for (const s of SKILL_LIBRARY) {
    if (!out[s.category]) out[s.category] = []
    out[s.category].push(s)
  }
  return out
}
