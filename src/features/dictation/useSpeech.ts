import { useCallback, useEffect, useState } from 'react'

/**
 * 基于浏览器 Web Speech API 的语音合成封装。
 * 用于听写时朗读词语，无需联网或第三方服务。
 */
export interface SpeakOptions {
  lang?: string
  rate?: number // 语速 0.1 - 10，默认 1
  pitch?: number // 音调 0 - 2，默认 1
}

export function useSpeech() {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [supported])

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
  }, [supported])

  /** 朗读一段文字，返回一个在朗读结束时 resolve 的 Promise。 */
  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      return new Promise<void>((resolve) => {
        if (!supported) {
          resolve()
          return
        }
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = options.lang ?? 'zh-CN'
        utterance.rate = options.rate ?? 1
        utterance.pitch = options.pitch ?? 1

        // 优先选用与语言匹配的本地语音
        const match = voices.find((v) => v.lang === utterance.lang)
        if (match) utterance.voice = match

        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()
        window.speechSynthesis.speak(utterance)
      })
    },
    [supported, voices],
  )

  return { supported, voices, speak, cancel }
}
