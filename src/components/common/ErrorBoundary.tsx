import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message?: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: String(error?.message || error) }
  }

  componentDidCatch(error: any, info: any) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: '#fff' }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Something went wrong.</div>
          <div style={{ opacity: .8, fontSize: 14 }}>{this.state.message}</div>
        </div>
      )
    }
    return this.props.children
  }
}


