import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSpeech } from './useSpeech'
import { materials } from './materials'

// 「本份词条」答案区的查看密码（仅作软性遮挡，防止孩子直接看答案）
const ANSWER_PASSWORD = '8604'

export function DictationApp() {
  const { supported, speak, cancel } = useSpeech()

  const [materialId, setMaterialId] = useState(materials[0]?.id ?? '')
  const active = useMemo(
    () => materials.find((m) => m.id === materialId) ?? materials[0],
    [materialId],
  )
  const words = active?.file.words ?? []
  const lang = active?.file.lang ?? 'zh-CN'

  // 朗读设置
  const [rate, setRate] = useState(0.9)
  const [repeat, setRepeat] = useState(2) // 每条读几遍
  const [interval, setIntervalSec] = useState(5) // 条与条之间的间隔（秒）
  const [autoAdvance, setAutoAdvance] = useState(true) // 读完自动进入下一条

  // 播放状态
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // 「本份词条」答案区密码锁
  const [answersUnlocked, setAnswersUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  const tryUnlock = () => {
    if (pwInput === ANSWER_PASSWORD) {
      setAnswersUnlocked(true)
      setPwError(false)
      setPwInput('')
    } else {
      setPwError(true)
    }
  }

  // 用递增的 token 取消正在进行的朗读流程
  const tokenRef = useRef(0)

  const sleep = (ms: number, token: number) =>
    new Promise<void>((resolve) => {
      let done = false
      const finish = () => {
        if (done) return
        done = true
        clearTimeout(timer)
        clearInterval(check)
        resolve()
      }
      const timer = setTimeout(finish, ms)
      // 期间若被取消，提前结束等待
      const check = setInterval(() => {
        if (tokenRef.current !== token) finish()
      }, 100)
    })

  const playFrom = useCallback(
    async (start: number) => {
      if (!words.length) return
      const token = ++tokenRef.current
      cancel()
      setIsPlaying(true)
      for (let i = start; i < words.length; i++) {
        if (tokenRef.current !== token) return
        setIndex(i)
        for (let r = 0; r < repeat; r++) {
          if (tokenRef.current !== token) return
          await speak(words[i], { lang, rate })
          if (r < repeat - 1) await sleep(700, token)
        }
        if (tokenRef.current !== token) return
        if (!autoAdvance) {
          setIsPlaying(false)
          return
        }
        if (i < words.length - 1) await sleep(interval * 1000, token)
      }
      if (tokenRef.current === token) {
        setIsPlaying(false)
      }
    },
    [words, repeat, speak, lang, rate, autoAdvance, interval, cancel],
  )

  const pause = useCallback(() => {
    tokenRef.current++
    cancel()
    setIsPlaying(false)
  }, [cancel])

  // 手动朗读指定词：按配置遍数读完即停，不进入「播放中」状态（开始按钮保持可用）
  const readTimes = useCallback(
    async (i: number) => {
      if (!words[i]) return
      const token = ++tokenRef.current
      cancel()
      for (let r = 0; r < repeat; r++) {
        if (tokenRef.current !== token) return
        await speak(words[i], { lang, rate })
        if (r < repeat - 1) await sleep(700, token)
      }
    },
    [words, repeat, speak, lang, rate, cancel],
  )

  // 跳到某条：自动播放中则从该条继续连读；否则手动读 repeat 遍并停留
  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(words.length - 1, i))
      const wasAutoPlaying = isPlaying
      setIndex(clamped)
      if (wasAutoPlaying) {
        playFrom(clamped)
      } else {
        readTimes(clamped)
      }
    },
    [words.length, isPlaying, playFrom, readTimes],
  )

  const togglePlay = () => {
    if (isPlaying) pause()
    else if (autoAdvance) playFrom(index)
    else readTimes(index)
  }

  const replayCurrent = () => {
    readTimes(index)
  }

  const restart = () => {
    tokenRef.current++
    cancel()
    setIsPlaying(false)
    setIndex(0)
  }

  // 切换资料时重置
  useEffect(() => {
    tokenRef.current++
    cancel()
    setIsPlaying(false)
    setIndex(0)
  }, [materialId, cancel])

  if (!materials.length) {
    return (
      <section className="page">
        <h1 className="page-title">✍️ 听写辅助</h1>
        <p className="warning">
          还没有听写资料。请在 <code>src/data/dictation/</code> 放入听写 JSON
          文件（格式见该目录下的 README）。
        </p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1 className="page-title">✍️ 听写辅助</h1>

      {!supported && (
        <p className="warning">
          当前浏览器不支持语音合成（Web Speech API），请改用最新版 Chrome / Edge /
          Safari。
        </p>
      )}

      <div className="dictation-controls">
        <label className="control control-wide">
          <span>选择听写</span>
          <select
            value={active?.id}
            onChange={(e) => setMaterialId(e.target.value)}
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.file.title}（{m.file.words.length} 条）
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
          <span>每条遍数 {repeat}</span>
          <input
            type="range"
            min={1}
            max={4}
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
            max={15}
            step={1}
            value={interval}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
          />
        </label>

        <label className="control control-check">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
          />
          <span>读完自动下一条</span>
        </label>
      </div>

      {(active?.file.lesson || active?.file.dateRange) && (
        <p className="material-meta">
          {active?.file.lesson}
          {active?.file.lesson && active?.file.dateRange ? ' · ' : ''}
          {active?.file.dateRange}
        </p>
      )}

      <div className="dictation-stage">
        <div className="progress">
          第 {index + 1} / {words.length} 条
        </div>

        <div className="current-word">
          <span className="masked">● ● ●</span>
        </div>

        <div className="dictation-actions">
          <button
            className="btn"
            disabled={!supported || index === 0}
            onClick={() => goTo(index - 1)}
          >
            ⬅ 上一条
          </button>
          <button
            className="btn btn-primary btn-play"
            disabled={!supported}
            onClick={togglePlay}
          >
            {isPlaying ? '⏸ 暂停' : '▶ 开始'}
          </button>
          <button
            className="btn"
            disabled={!supported || index === words.length - 1}
            onClick={() => goTo(index + 1)}
          >
            下一条 ➡
          </button>
        </div>

        <div className="dictation-actions secondary">
          <button className="btn" disabled={!supported} onClick={replayCurrent}>
            🔁 重读本条
          </button>
          <button className="btn" onClick={restart}>
            ↺ 从头开始
          </button>
        </div>
      </div>

      <div className="word-review">
        <div className="word-review-head">
          <h3>本份词条</h3>
          {answersUnlocked && (
            <button
              className="btn btn-small"
              onClick={() => setAnswersUnlocked(false)}
            >
              🔒 重新锁定
            </button>
          )}
        </div>

        {answersUnlocked ? (
          <ol>
            {words.map((w, i) => (
              <li
                key={`${w}-${i}`}
                className={i === index ? 'is-current' : ''}
                onClick={() => goTo(i)}
              >
                {w}
              </li>
            ))}
          </ol>
        ) : (
          <div className="lock-panel">
            <p className="lock-hint">🔒 答案已锁定，家长输入密码后可见</p>
            <div className="lock-row">
              <input
                type="password"
                inputMode="numeric"
                value={pwInput}
                placeholder="输入密码"
                onChange={(e) => {
                  setPwInput(e.target.value)
                  setPwError(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') tryUnlock()
                }}
              />
              <button className="btn btn-primary" onClick={tryUnlock}>
                解锁
              </button>
            </div>
            {pwError && <span className="lock-error">密码不对，再试一次</span>}
          </div>
        )}
      </div>
    </section>
  )
}
