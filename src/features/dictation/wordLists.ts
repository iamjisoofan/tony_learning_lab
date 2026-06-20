export type WordLang = 'zh-CN' | 'en-US'

export interface WordList {
  id: string
  name: string
  lang: WordLang
  words: string[]
}

// 内置示例词单。后续可替换为从文件导入 / 后端获取 / 家长自定义。
export const builtInWordLists: WordList[] = [
  {
    id: 'zh-basic-1',
    name: '语文 · 词语示例',
    lang: 'zh-CN',
    words: ['苹果', '老师', '同学', '学校', '朋友', '汉字', '春天', '美丽', '勇敢', '希望'],
  },
  {
    id: 'en-basic-1',
    name: 'English · Sight Words',
    lang: 'en-US',
    words: ['apple', 'school', 'friend', 'teacher', 'water', 'happy', 'because', 'people', 'every', 'little'],
  },
]
