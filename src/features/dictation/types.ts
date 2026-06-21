export type WordLang = 'zh-CN' | 'en-US'

/**
 * 听写文件的固定格式。
 * 每份听写资料是 `src/data/dictation/` 下的一个 JSON 文件，结构如下。
 */
export interface DictationFile {
  /** 标题，显示在选择列表里，如「听写二：3B 第十一课」 */
  title: string
  /** 可选：对应课本/课次，如「3B 课本 第十一课」 */
  lesson?: string
  /** 可选：听写日期范围，如「6月22日 - 6月28日」 */
  dateRange?: string
  /** 朗读语言，决定使用哪种语音 */
  lang: WordLang
  /** 听写条目，按顺序朗读；每条可以是词语、短语或整句 */
  words: string[]
}

/** 加载后的听写资料：文件内容 + 由文件名生成的唯一 id */
export interface DictationMaterial {
  id: string
  file: DictationFile
}
