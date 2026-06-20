import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSpeech } from './useSpeech'
import { builtInWordLists } from './wordLists'

type Phase = 'idle' | 'running' | 'paused' | 'done'

export function DictationApp() {
  const { supported, speak, cancel } = useSpeech()

  const [listId, setListId] = useState(builtInWordLists[0].id)
  const [rate, setRate] = useState(0.9)
  const [repeat, setRepeat] = useState(2) // 每个词读几遍
  const [interval, setIntervalSec] = useState(5) // 词与词之间的间隔（秒）

  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // 用 ref 保存“是否已被取消”，避免异步朗读流程在停止后继续推进
  const runTokenRef = useRef(0)

  const activeList = useMemo(
    () => builtInWordLists.find((l) => l.id === listId) ?? builtInWordLists[0],
    [listId],
  )
  const words = activeList.words

  const stop = useCallback(() => {
    runTokenRef.current += 1
    cancel()
    setPhase('idle')
    setIndex(0)
    setRevealed(false)
  }, [cancel])

  // 切换词单时重置
  useEffect(() => {
    stop()
  }, [listId, stop])

  const sleep = (ms: number, token: number) =>
    new Promise<void>((resolve) => {
      const t = setTimeout(resolve, ms)
      // 若期间被取消，提前结束等待
      const check = setInterval(() => {
        if (runTokenRef.current !== token) {
          clearTimeout(t)
          clearInterval(check)
          resolve()
        }
      }, 100)
    })

  const run = useCallback(
    async (startAt: number) => {
      const token = ++runTokenRef.current
      setPhase('running')
      for (let i = startAt; i < words.length; i++) {
        if (runTokenRef.current !== token) return
        setIndex(i)
        setRevealed(false)
        for (let r = 0; r < repeat; r++) {
          if (runTokenRef.current !== token) return
          await speak(words[i], { lang: activeList.lang, rate })
          if (r < repeat - 1) await sleep(600, token)
        }
        if (runTokenRef.current !== token) return
        if (i < words.length - 1) await sleep(interval * 1000, token)
      }
      if (runTokenRef.current === token) {
        setPhase('done')
        setRevealed(true)
      }
    },
    [words, repeat, speak, activeList.lang, rate, interval],
  )

  const start = () => {
    setRevealed(false)
    run(0)
  }

  const replayCurrent = () => {
    cancel()
    speak(words[index], { lang: activeList.lang, rate })
  }

  return (
    <section className="page">
      <h1 className="page-title">✍️ 听写辅助</h1>

      {!supported && (
        <p className="warning">
          当前浏览器不支持语音合成（Web Speech API），请改用最新版 Chrome / Edge / Safari。
        </p>
      )}

      <div className="dictation-controls">
        <label className="control">
          <span>词单</span>
          <select value={listId} onChange={(e) => setListId(e.target.value)}>
            {builtInWordLists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}（{l.words.length} 个）
              </option>
            ))}
          </select>
        </label>

        <label className="control">
          <span>语速 {rate.toFixed(1)}</span>
          <input
            type="range"
            min={0.5}
            max={1.2}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>

        <label className="control">
          <span>每词遍数 {repeat}</span>
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={repeat}
            onChange={(e) => setRepeat(Number(e.target.value))}
          />
        </label>

        <label className="control">
          <span>间隔 {interval}s</span>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={interval}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="dictation-stage">
        <div className="progress">
          {phase === 'idle'
            ? `共 ${words.length} 个词`
            : `第 ${index + 1} / ${words.length} 个`}
        </div>

        <div className="current-word">
          {phase === 'idle' ? (
            <span className="hint">点击「开始」，听到读音后写下来</span>
          ) : revealed ? (
            <span className="word">{words[index]}</span>
          ) : (
            <span className="masked">● ● ●</span>
          )}
        </div>

        <div className="dictation-actions">
          {phase === 'idle' || phase === 'done' ? (
            <button className="btn btn-primary" disabled={!supported} onClick={start}>
              {phase === 'done' ? '再来一次' : '开始'}
            </button>
          ) : (
            <button className="btn" onClick={stop}>
              停止
            </button>
          )}
          <button
            className="btn"
            disabled={phase === 'idle'}
            onClick={replayCurrent}
          >
            重读本词
          </button>
          <button
            className="btn"
            disabled={phase === 'idle'}
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? '隐藏答案' : '显示答案'}
          </button>
        </div>
      </div>

      {phase === 'done' && (
        <div className="word-review">
          <h3>本轮词语</h3>
          <ol>
            {words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
