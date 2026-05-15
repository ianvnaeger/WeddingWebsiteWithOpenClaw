import { useEffect, useState } from 'react'

const navLinks = [
  { label: 'Our Story', href: '#story' },
  { label: 'Details', href: '#details' },
  { label: 'Hotel Blocks', href: '#hotel-blocks' },
  { label: 'Things to Do', href: '#things-to-do' },
  { label: 'Registry', href: '#registry' },
  { label: 'RSVP', href: '#rsvp' },
]

const detailCards = [
  {
    title: 'Ceremony',
    lines: ['Saturday, October 31, 2026', '5:00 PM', 'Union Wedding Venue', '1721 Baltimore Ave, Kansas City, MO 64108'],
  },
  {
    title: 'Reception',
    lines: ['Immediately following the ceremony', 'Union Wedding Venue', 'Dinner, dancing, dessert, and happy tears'],
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

const hotelBlocks = [
  {
    name: 'Hotel Phillips',
    rate: '$189 + tax',
    walkTime: 'About an 11 minute walk to the venue',
    availableDates: 'Friday, October 30 through Sunday, November 1',
    bookBy: 'Tuesday, September 29',
  },
  {
    name: 'Courtyard Kansas City Downtown',
    rate: '$199 + tax',
    walkTime: 'About a 9 minute walk to the venue',
    availableDates: 'Thursday, October 29 through Sunday, November 1',
    bookBy: 'Wednesday, October 7',
  },
]

const hotelBookingLink = 'https://book.passkey.com/go/BondurantNaeger'

const travelCoordinator = {
  email: 'Help@EngagedSourcing.com',
  phone: '720.593.8534',
  reference: 'Bondurant-Naeger Wedding',
}

const assetBase = import.meta.env.BASE_URL

function withBase(path) {
  return `${assetBase}${path}`
}

function createPhoto(fileName, alt, label) {
  return {
    src: withBase(`photos/${fileName}`),
    alt,
    label,
  }
}

const galleryPhotos = [
  createPhoto(
    'fuji-bell.jpg',
    'Ian and Sarah standing together beneath a heart-shaped bell with Mount Fuji in the background.',
    'Fuji Vista',
  ),
  createPhoto(
    'proposal-snow.jpg',
    'Ian proposing to Sarah on a snowy overlook at dusk.',
    'Proposal',
  ),
  createPhoto(
    'tent-kiss.jpg',
    'Ian kissing Sarah on the cheek under string lights at an outdoor celebration.',
    'Celebration',
  ),
  createPhoto(
    'yukata.jpg',
    'Ian and Sarah standing together in yukata with a mountain view behind them.',
    'Japan',
  ),
  createPhoto(
    'neon-lounge.jpg',
    'Ian and Sarah laughing together in a neon-lit lounge.',
    'Night Out',
  ),
  createPhoto(
    'stadium-selfie.jpg',
    'Ian and Sarah smiling together at a stadium.',
    'Game Day',
  ),
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
  const [galleryIndex, setGalleryIndex] = useState(0)
  const mobileNavMaxWidth = 640

  const currentPhoto = galleryPhotos[galleryIndex]

  const showPrevPhoto = () => {
    setGalleryIndex((index) => (index - 1 + galleryPhotos.length) % galleryPhotos.length)
  }

  const showNextPhoto = () => {
    setGalleryIndex((index) => (index + 1) % galleryPhotos.length)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${mobileNavMaxWidth + 1}px)`)
    const handleBreakpointChange = (event) => {
      if (event.matches) {
        setMenuOpen(false)
      }
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleBreakpointChange)
      return () => mediaQuery.removeEventListener('change', handleBreakpointChange)
    }

    mediaQuery.addListener(handleBreakpointChange)
    return () => mediaQuery.removeListener(handleBreakpointChange)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(20, 12, 10, 0.36), rgba(20, 12, 10, 0.64)), url(${withBase('photos/fuji-bell.jpg')})`,
        }}
      >
        <div className="hero-shell">
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
            <h1>Saturday, October 31, 2026 • Kansas City, Missouri</h1>
            <p className="hero-subtitle">Join us for our wedding celebration in downtown Kansas City.</p>
            <div className="hero-actions">
              <a className="button" href="#rsvp">RSVP</a>
              <a className="button button-secondary" href="#hotel-blocks">Hotel blocks</a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="story" className="section two-column card-surface">
          <div>
            <p className="kicker">Our story</p>
            <h2>From here to forever.</h2>
            <p>
              We’re so excited to celebrate our wedding with the people we love most.
            </p>
            <p>
              This site is the best place for weekend details, hotel information, and updates as the day gets closer.
            </p>
          </div>
          <div className="quote-card photo-callout">
            <img src={withBase('photos/our-story.jpg')} alt="Ian and Sarah together in a favorite photo." />
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

        <section id="hotel-blocks" className="section">
          <SectionHeading kicker="Hotel blocks" title="Where to stay for the weekend.">
            <p>
              We’ve reserved room blocks at two downtown Kansas City hotels, both an easy walk from Union Wedding Venue.
            </p>
          </SectionHeading>

          <div className="grid two-up hotel-grid">
            {hotelBlocks.map((hotel) => (
              <article className="hotel-card" key={hotel.name}>
                <div className="hotel-card-header">
                  <div>
                    <h3>{hotel.name}</h3>
                    <p className="hotel-rate">Rates from {hotel.rate}</p>
                  </div>
                </div>

                <ul className="detail-list hotel-details">
                  <li><strong>Walk to venue:</strong> {hotel.walkTime}</li>
                  <li><strong>Available dates:</strong> {hotel.availableDates}</li>
                  <li><strong>Book by:</strong> {hotel.bookBy}</li>
                </ul>
              </article>
            ))}
          </div>

          <div className="hotel-actions">
            <a className="button hotel-section-button" href={hotelBookingLink} target="_blank" rel="noreferrer">
              Book a Hotel
            </a>
          </div>

          <div className="travel-note">
            <p>
              Need to arrive early or stay a little longer? Reach out to our travel coordinator at{' '}
              <a href={`mailto:${travelCoordinator.email}`}>{travelCoordinator.email}</a> or{' '}
              <a href={`tel:${travelCoordinator.phone.replace(/\./g, '')}`}>{travelCoordinator.phone}</a> and mention the{' '}
              <strong>{travelCoordinator.reference}</strong>.
            </p>
          </div>
        </section>

        <section id="things-to-do" className="section things-section">
          <SectionHeading kicker="Things to do" title="Make a weekend of it in Kansas City.">
            <p>
              If you’re coming in from out of town, here are a few of our favorite nearby spots to check out while you’re in Kansas City.
            </p>
          </SectionHeading>
          <div className="things-card">
            <ul className="things-list">
              <li>
                Visit some of our favorite restaurants
                <ul>
                  <li>Blue Sushi</li>
                  <li>County Road Ice House</li>
                  <li>Tiki Taco</li>
                </ul>
              </li>
              <li>Explore the Power & Light District</li>
              <li>Walk through the Crossroads Arts District</li>
            </ul>
          </div>
        </section>

        <section className="section">
          <SectionHeading kicker="Gallery" title="A few favorite moments." />
          <div className="gallery-viewer">
            <figure className="gallery-stage">
              <img src={currentPhoto.src} alt={currentPhoto.alt} />
            </figure>

            <div className="gallery-controls">
              <button type="button" className="gallery-button" onClick={showPrevPhoto}>
                Previous
              </button>
              <div className="gallery-meta">
                <div className="gallery-caption">{currentPhoto.label}</div>
                <div className="gallery-count">{galleryIndex + 1} / {galleryPhotos.length}</div>
              </div>
              <button type="button" className="gallery-button" onClick={showNextPhoto}>
                Next
              </button>
            </div>

            <div className="gallery-thumbs">
              {galleryPhotos.map((photo, index) => (
                <button
                  type="button"
                  key={photo.src}
                  className={`gallery-thumb ${index === galleryIndex ? 'is-active' : ''}`}
                  onClick={() => setGalleryIndex(index)}
                  aria-label={`Show photo ${index + 1}: ${photo.label}`}
                  aria-current={index === galleryIndex ? 'true' : undefined}
                >
                  <img src={photo.src} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="registry" className="section">
          <SectionHeading kicker="Registry" title="Your presence is the best gift." narrow>
            <p>If you’d like to celebrate with a gift, we’re registered at the places below.</p>
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
            We can’t wait to celebrate with you. Please send your RSVP when you’re ready.
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
