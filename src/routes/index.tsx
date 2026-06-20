import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

interface FeatureCard {
  to: string
  emoji: string
  title: string
  desc: string
  ready: boolean
}

const features: FeatureCard[] = [
  {
    to: '/dictation',
    emoji: '✍️',
    title: '听写辅助',
    desc: '自动朗读词语，孩子边听边写，支持自定义词单与节奏。',
    ready: true,
  },
  {
    to: '/',
    emoji: '📝',
    title: '错题辅助',
    desc: '收集错题、归类讲解，定期复盘。（规划中）',
    ready: false,
  },
  {
    to: '/',
    emoji: '🧮',
    title: '学科辅助',
    desc: '分学科的针对性练习与讲解。（规划中）',
    ready: false,
  },
]

function HomePage() {
  return (
    <section className="page">
      <h1 className="page-title">欢迎来到学习小帮手 👋</h1>
      <p className="page-subtitle">选择一个工具，开始今天的学习吧。</p>

      <div className="card-grid">
        {features.map((f) => {
          const card = (
            <div className={`feature-card ${f.ready ? '' : 'is-disabled'}`}>
              <div className="feature-emoji">{f.emoji}</div>
              <h2 className="feature-title">{f.title}</h2>
              <p className="feature-desc">{f.desc}</p>
              {!f.ready && <span className="badge">即将上线</span>}
            </div>
          )
          return f.ready ? (
            <Link key={f.title} to={f.to} className="card-link">
              {card}
            </Link>
          ) : (
            <div key={f.title} className="card-link">
              {card}
            </div>
          )
        })}
      </div>
    </section>
  )
}
