import type { DictationFile, DictationMaterial } from './types'

// 构建时自动收集 src/data/dictation/ 下的所有听写文件，新增文件无需改代码。
const modules = import.meta.glob<{ default: DictationFile }>(
  '../../data/dictation/*.json',
  { eager: true },
)

function fileNameOf(path: string): string {
  return path.split('/').pop()!.replace(/\.json$/, '')
}

function isValid(file: DictationFile): boolean {
  return (
    !!file &&
    typeof file.title === 'string' &&
    Array.isArray(file.words) &&
    file.words.length > 0
  )
}

export const materials: DictationMaterial[] = Object.entries(modules)
  .map(([path, mod]) => ({ id: fileNameOf(path), file: mod.default }))
  .filter((m) => isValid(m.file))
  .sort((a, b) => a.id.localeCompare(b.id, 'zh-Hans-CN'))
