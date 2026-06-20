import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          📚 学习小帮手
        </Link>
        <nav className="app-nav">
          <Link to="/" activeOptions={{ exact: true }} className="nav-link">
            首页
          </Link>
          <Link to="/dictation" className="nav-link">
            听写
          </Link>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>陪伴孩子一起进步 · v0.1.0</span>
      </footer>
    </div>
  )
}
