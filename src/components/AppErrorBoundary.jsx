import React from 'react'

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
    }
    this.handleReload = this.handleReload.bind(this)
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown runtime error',
    }
  }

  componentDidCatch(error, info) {
    // Keep trace in browser console for debugging judge environment failures.
    console.error('App runtime crash:', error, info)
  }

  handleReload() {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(circle at 20% 20%, #111827 0%, #020617 45%, #000000 100%)',
        padding: '2rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '680px',
          background: 'rgba(3, 7, 18, 0.88)',
          border: '1px solid rgba(236, 72, 153, 0.35)',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          padding: '1.5rem',
          color: '#e5e7eb',
        }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Runtime recovery mode</h1>
          <p style={{ marginTop: '0.75rem', marginBottom: '0.75rem', lineHeight: 1.6, color: '#cbd5e1' }}>
            The app hit an unexpected runtime error. Reload the page to recover.
            If this persists, reconnect wallet and ensure Base Sepolia is selected.
          </p>
          <p style={{ marginTop: 0, marginBottom: '1rem', color: '#fda4af', fontSize: '0.88rem' }}>
            Error: {this.state.errorMessage}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              border: 0,
              borderRadius: '10px',
              padding: '0.7rem 1rem',
              fontWeight: 700,
              color: '#0f172a',
              background: 'linear-gradient(90deg, #22d3ee, #a78bfa)',
              cursor: 'pointer',
            }}
          >
            Reload application
          </button>
        </div>
      </div>
    )
  }
}
