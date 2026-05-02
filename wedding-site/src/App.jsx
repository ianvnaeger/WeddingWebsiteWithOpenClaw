import { useEffect, useState } from 'react'

const navLinks = [
  { label: 'Our Story', href: '#story' },
  { label: 'Details', href: '#details' },
  { label: 'Travel', href: '#travel' },
  { label: 'Registry', href: '#registry' },
  { label: 'RSVP', href: '#rsvp' },
]

const detailCards = [
  {
    title: 'Ceremony',
    lines: ['Saturday, October 31, 2026', 'Union', 'Kansas City, MO'],
  },
  {
    title: 'Reception',
    lines: ['Following the ceremony', 'Reception details to come', 'Dinner, dancing, dessert, and happy tears'],
  },
  {
    title: 'Dress code',
    lines: ['Garden formal', 'Think cocktail attire, suits, dresses, and shoes comfortable enough for dancing.'],
  },
]

const registryLinks = [
  { label: 'Registry One', href: '#' },
  { label: 'Registry Two', href: '#' },
]

function SectionHeading({ kicker, title, narrow = false, children }) {
  return (
    <div className={`section-copy ${narrow ? 'narrow' : ''}`}>
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false)
    window.addEventListener('resize', closeMenu)
    return () => window.removeEventListener('resize', closeMenu)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header className="hero">
        <nav className="nav">
          <div className="brand">Ian & Sarah</div>

          <button
            type="button"
            className={`nav-toggle ${menuOpen ? 'is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div className={`nav-backdrop ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} />

        <div className="hero-content">
          <p className="eyebrow">Save the date</p>
          <h1>We’re getting married</h1>
          <p className="hero-text">Saturday, October 31, 2026 • Kansas City, Missouri</p>
          <div className="hero-actions">
            <a className="button" href="#rsvp">RSVP</a>
            <a className="button button-secondary" href="#details">View details</a>
          </div>
        </div>
      </header>

      <main>
        <section className="section section-intro">
          <SectionHeading kicker="Welcome" title="We can’t wait to celebrate with you in Kansas City." narrow>
            <p>
              We made this site to keep everything in one place. You’ll find the weekend schedule,
              venue details, hotel suggestions, and gift registry information below.
            </p>
          </SectionHeading>
        </section>

        <section id="story" className="section two-column card-surface">
          <div>
            <p className="kicker">Our story</p>
            <h2>From here to forever.</h2>
            <p>
              Ian Naeger and Sarah Bondurant are getting married, and this site is the home base for the celebration.
            </p>
            <p>
              We’re so excited to gather with the people we love most for a fall wedding weekend in Kansas City.
            </p>
          </div>
          <div className="quote-card">
            <p>
              “We’re so glad you’ll be part of this with us. More story details, photos, or a note to guests can go here.”
            </p>
          </div>
        </section>

        <section id="details" className="section">
          <SectionHeading kicker="Wedding details" title="The weekend at a glance." />
          <div className="grid three-up">
            {detailCards.map((card) => (
              <article className="info-card" key={card.title}>
                <h3>{card.title}</h3>
                {card.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section id="travel" className="section two-column muted-band split-panel">
          <div>
            <p className="kicker">Travel</p>
            <h2>Stay, fly, and get around.</h2>
            <ul className="detail-list">
              <li><strong>City:</strong> Kansas City, Missouri</li>
              <li><strong>Venue:</strong> Union</li>
              <li><strong>Travel info:</strong> Hotel block and transportation details coming soon</li>
            </ul>
          </div>
          <div>
            <p>
              You can replace this section with your actual hotel links, shuttle timing, welcome party plans,
              child care notes, or accessibility information.
            </p>
          </div>
        </section>

        <section id="registry" className="section">
          <SectionHeading kicker="Registry" title="Your presence is the best gift." narrow>
            <p>If you’d like to give something, we’re registered at a few places below.</p>
          </SectionHeading>
          <div className="grid two-up">
            {registryLinks.map((item) => (
              <a className="registry-card" href={item.href} key={item.label} aria-label={item.label}>
                <span>{item.label}</span>
                <span>→</span>
              </a>
            ))}
          </div>
        </section>

        <section id="rsvp" className="section card-surface center-panel rsvp-panel">
          <p className="kicker">RSVP</p>
          <h2>Let us know if you can make it.</h2>
          <p>
            You can link this button to a Google Form, WithJoy, Zola, or a custom RSVP page later.
          </p>
          <a className="button" href="mailto:hello@example.com?subject=Wedding%20RSVP">
            Send RSVP
          </a>
        </section>
      </main>

      <footer className="footer">
        <p>Made with love for a very good party.</p>
      </footer>
    </>
  )
}
