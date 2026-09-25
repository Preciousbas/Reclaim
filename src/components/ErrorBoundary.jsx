import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100dvh', padding: 32, color: '#efe8dc', background: '#161410', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>ReClaim hit a snag</h1>
        <p style={{ opacity: 0.8, lineHeight: 1.6 }}>Reload the page. If this keeps happening on your phone, try your browser (not an in-app browser) or email reclaimhello@gmail.com.</p>
      </div>
    );
  }
}
