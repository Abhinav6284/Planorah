import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal,.reveal-fade,.reveal-scale').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function DemoPage() {
  useScrollReveal();
  const navigate = useNavigate();

  return (
    <main>
      <section style={{ padding: '96px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow reveal-fade" style={{ marginBottom: 16 }}>Product demo</div>
          <h1 className="reveal" style={{ marginBottom: 20, maxWidth: 820, marginInline: 'auto' }}>
            See Planorah in action.
          </h1>
          <p className="reveal" style={{ fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
            Watch how a student goes from uploading a syllabus to a complete study roadmap in under 2 minutes.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="reveal reveal-scale" style={{
            width: '100%', aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden',
            background: 'var(--surface)', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'var(--fg-deep)', color: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div style={{ fontSize: 14, color: 'var(--fg-muted)' }}>3 min walkthrough — no signup required</div>
          </div>
        </div>
      </section>
    </main>
  );
}
