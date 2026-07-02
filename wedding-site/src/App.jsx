import { useEffect, useState } from 'react'

import { isMockRsvpMode, lookupHouseholdByName, submitRsvp } from './lib/rsvp'

const navLinks = [
  { label: 'Details', href: '#details' },
  { label: 'RSVP', href: '#rsvp' },
  { label: 'Hotel Blocks', href: '#hotel-blocks' },
  { label: 'Things to Do', href: '#things-to-do' },
  { label: 'Registry', href: '#registry' },
]

const detailCards = [
  {
    title: 'Ceremony',
    lines: ['Saturday, October 31, 2026', '5:00 PM', 'Union Wedding Venue • 1721 Baltimore Ave, Kansas City, MO 64108'],
  },
  {
    title: 'Reception',
    lines: [
      'Immediately following the ceremony',
      'Dinner, dancing, dessert, and an open bar',
      'Union Wedding Venue • 1721 Baltimore Ave, Kansas City, MO 64108',
    ],
  },
  {
    title: 'Dress code',
    lines: [
      'Cocktail attire',
      'We invite guests to wear polished cocktail attire, such as suits, jackets, dresses, or other elevated eveningwear.',
      'We also ask guests to refrain from wearing overt Halloween costumes during the ceremony itself.',
    ],
  },
]

const registryLinks = [
  { label: 'Amazon Registry', href: 'https://www.amazon.com/wedding/guest-view/1VVV5G4VUWTIF' },
  { label: 'Contribute to our Honeymoon Fund', href: 'https://www.zola.com/registry/ianandsarahoctober31' },
]

const hotelBlocks = [
  {
    name: 'Hotel Phillips',
    description:
      'A classic downtown stay close to the venue, with easy access to Kansas City nightlife and weekend plans.',
    rate: 'Starting at $189 + tax',
    availableDates: 'Friday, October 30 through Sunday, November 1',
    bookBy: 'Tuesday, September 29',
  },
  {
    name: 'Courtyard Kansas City Downtown',
    description:
      'A modern downtown option within walking distance of the venue, the T-Mobile Center, and the Power & Light District.',
    rate: 'Starting at $199 + tax',
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
    'our-story.jpg',
    'Ian and Sarah together in a favorite photo.',
    'Favorite Photo',
  ),
  createPhoto(
    'fuji-bell.jpg',
    'Ian and Sarah standing together beneath a heart-shaped bell with Mount Fuji in the background.',
    'Fuji Vista',
  ),
  createPhoto(
    'tent-kiss.jpg',
    'Ian kissing Sarah on the cheek under string lights at an outdoor celebration.',
    'Celebration',
  ),
  createPhoto(
    'kimonos.jpg',
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
  createPhoto(
    'good-times.jpg',
    'Ian and Sarah together during a fun outing.',
    'Good Times',
  ),
  createPhoto(
    'woodchipper.jpg',
    'Ian and Sarah outdoors near a woodchipper.',
    'Woodchipper',
  ),
  createPhoto(
    'concert.jpg',
    'Ian and Sarah together at a concert.',
    'Concert',
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

function createInitialGuestResponses(guests) {
  return Object.fromEntries(
    guests.map((guest) => [
      guest.id,
      {
        guestName: guest.name,
        isEditingName: false,
        attendance: '',
        dietaryRestrictions: '',
      },
    ]),
  )
}

function isLookupCandidate(candidate) {
  return candidate?.household?.householdId
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false)
  const [guestNameInput, setGuestNameInput] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [isLookingUpHousehold, setIsLookingUpHousehold] = useState(false)
  const [household, setHousehold] = useState(null)
  const [lookupCandidates, setLookupCandidates] = useState([])
  const [guestResponses, setGuestResponses] = useState({})
  const [rsvpError, setRsvpError] = useState('')
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false)
  const [rsvpSuccess, setRsvpSuccess] = useState(null)
  const mobileNavMaxWidth = 640

  const currentPhoto = galleryPhotos[galleryIndex]
  const householdGuests = household?.guests ?? []
  const attendingGuests = householdGuests.filter((guest) => guestResponses[guest.id]?.attendance === 'yes')
  const allGuestsAnswered =
    householdGuests.length > 0 &&
    householdGuests.every((guest) => ['yes', 'no'].includes(guestResponses[guest.id]?.attendance))

  const showPrevPhoto = () => {
    setGalleryIndex((index) => (index - 1 + galleryPhotos.length) % galleryPhotos.length)
  }

  const showNextPhoto = () => {
    setGalleryIndex((index) => (index + 1) % galleryPhotos.length)
  }

  const resetRsvpFlow = () => {
    setGuestNameInput('')
    setLookupError('')
    setIsLookingUpHousehold(false)
    setHousehold(null)
    setLookupCandidates([])
    setGuestResponses({})
    setRsvpError('')
    setIsSubmittingRsvp(false)
    setRsvpSuccess(null)
  }

  const openRsvpModal = () => {
    resetRsvpFlow()
    setIsRsvpModalOpen(true)
  }

  const closeRsvpModal = () => {
    setIsRsvpModalOpen(false)
    resetRsvpFlow()
  }

  const handleLookupSubmit = async (event) => {
    event.preventDefault()
    setLookupError('')
    setRsvpError('')
    setRsvpSuccess(null)
    setIsLookingUpHousehold(true)

    try {
      const lookupResult = await lookupHouseholdByName(guestNameInput)
      const nextCandidates = Array.isArray(lookupResult.candidates)
        ? lookupResult.candidates.filter(isLookupCandidate)
        : []

      setLookupCandidates(nextCandidates)

      if (lookupResult.household) {
        setHousehold(lookupResult.household)
        setGuestResponses(createInitialGuestResponses(lookupResult.household.guests))
      } else {
        setHousehold(null)
        setGuestResponses({})
      }
    } catch (error) {
      setHousehold(null)
      setLookupCandidates([])
      setGuestResponses({})
      setLookupError(error instanceof Error ? error.message : 'Unable to find that guest right now.')
    } finally {
      setIsLookingUpHousehold(false)
    }
  }

  const selectLookupCandidate = (candidate) => {
    setLookupError('')
    setLookupCandidates([])
    setHousehold(candidate.household)
    setGuestResponses(createInitialGuestResponses(candidate.household.guests))
  }

  const updateGuestAttendance = (guestId, attendance) => {
    setGuestResponses((current) => ({
      ...current,
      [guestId]: {
        ...current[guestId],
        attendance,
        dietaryRestrictions: attendance === 'yes' ? current[guestId]?.dietaryRestrictions ?? '' : '',
      },
    }))
  }

  const updateGuestName = (guestId, guestName) => {
    setGuestResponses((current) => ({
      ...current,
      [guestId]: {
        ...current[guestId],
        guestName,
      },
    }))
  }

  const setGuestNameEditing = (guestId, isEditingName) => {
    setGuestResponses((current) => ({
      ...current,
      [guestId]: {
        ...current[guestId],
        isEditingName,
      },
    }))
  }

  const updateDietaryRestrictions = (guestId, dietaryRestrictions) => {
    setGuestResponses((current) => ({
      ...current,
      [guestId]: {
        ...current[guestId],
        dietaryRestrictions,
      },
    }))
  }

  const handleRsvpSubmit = async (event) => {
    event.preventDefault()
    setRsvpError('')

    if (!household || !allGuestsAnswered) {
      setRsvpError('Please respond for each invited guest before submitting.')
      return
    }

    const hasBlankGuestNames = householdGuests.some((guest) => !(guestResponses[guest.id]?.guestName ?? guest.name).trim())

    if (hasBlankGuestNames) {
      setRsvpError('Please provide a name for each invited guest before submitting.')
      return
    }

    setIsSubmittingRsvp(true)

    try {
      const response = await submitRsvp({
        householdId: household.householdId,
        householdName: household.householdName,
        guests: householdGuests.map((guest) => ({
          guestId: guest.id,
          guestName: guestResponses[guest.id]?.guestName?.trim() ?? guest.name,
          attending: guestResponses[guest.id]?.attendance === 'yes',
          dietaryRestrictions: guestResponses[guest.id]?.dietaryRestrictions?.trim() ?? '',
        })),
      })

      setRsvpSuccess(response)
      setRsvpError('')
    } catch (error) {
      setRsvpError(error instanceof Error ? error.message : 'Unable to submit your RSVP right now.')
    } finally {
      setIsSubmittingRsvp(false)
    }
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
    document.body.style.overflow = menuOpen || isRsvpModalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isRsvpModalOpen, menuOpen])

  return (
    <>
      <header
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(20, 12, 10, 0.36), rgba(20, 12, 10, 0.64)), url(${withBase('photos/black-and-white.jpg')})`,
        }}
      >
        <div className="hero-shell">
          <nav className="nav">
            <div className="brand brand-offset">Ian & Sarah</div>

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
              <button type="button" className="button" onClick={openRsvpModal}>RSVP</button>
              <a className="button button-secondary" href="#hotel-blocks">Hotel blocks</a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="details" className="section">
          <SectionHeading kicker="Wedding details" title="The weekend at a glance." />
          <div className="grid three-up">
            {detailCards.map((card) => (
              <article className="info-card" key={card.title}>
                <h3>{card.title}</h3>
                {card.lines.map((line, index) => (
                  <p key={line} className={index === 0 ? 'info-card-lead' : ''}>{line}</p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section id="rsvp" className="section card-surface center-panel rsvp-panel">
          <p className="kicker">RSVP</p>
          <h2>Let us know if you can make it.</h2>
          <p>
            Find your invitation by guest name, respond for each invited guest, and share dietary restrictions for anyone attending.
          </p>
          <button type="button" className="button" onClick={openRsvpModal}>Start RSVP</button>
        </section>

        <section id="hotel-blocks" className="section">
          <SectionHeading kicker="Hotel blocks" title="Where to stay for the weekend.">
            <p>
              We’ve reserved room blocks at two downtown Kansas City hotels, both an easy walk from Union Wedding Venue.
            </p>
            <p>
              Both options are available through the same booking link. Choose the hotel that works best for your stay.
            </p>
          </SectionHeading>

          <div className="grid two-up hotel-grid">
            {hotelBlocks.map((hotel) => (
              <article className="hotel-card" key={hotel.name}>
                <div className="hotel-card-header">
                  <div>
                    <h3>{hotel.name}</h3>
                    <p className="hotel-rate">{hotel.rate}</p>
                  </div>
                </div>

                <p className="hotel-description">{hotel.description}</p>

                <ul className="detail-list hotel-details">
                  <li><strong>Stay window:</strong> {hotel.availableDates}</li>
                  <li><strong>Reserve by:</strong> {hotel.bookBy}</li>
                </ul>
              </article>
            ))}
          </div>

          <div className="hotel-actions">
            <a className="button hotel-section-button hotel-section-button-large" href={hotelBookingLink} target="_blank" rel="noreferrer">
              Book a hotel
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
              <li>Start your morning at the River Market for a charming weekend farmers market</li>
              <li>Go brewery hopping around the Crossroads district</li>
              <li>Visit the National WWI Museum and Memorial for one of the city’s most iconic views</li>
              <li>
                Grab a bite at a few of our favorite Kansas City spots
                <ul className="things-food-list">
                  <li>Blue Sushi</li>
                  <li>Q39 BBQ</li>
                  <li>County Road Ice House</li>
                  <li>Cosmo Burger</li>
                  <li>Tiki Taco</li>
                  <li>Winstead’s</li>
                  <li>Betty Rae’s</li>
                </ul>
              </li>
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
            <p>Gifts are unnecessary. However, if you would like to celebrate with something beyond your presence, please see below.</p>
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
      </main>

      {isRsvpModalOpen ? (
        <div
          className="modal-shell"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-modal-title"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeRsvpModal()
          }}
        >
          <div className="modal-backdrop" onClick={closeRsvpModal} />
          <div className="modal-card card-surface rsvp-modal-card">
            <button type="button" className="modal-close" onClick={closeRsvpModal} aria-label="Close RSVP dialog">
              ×
            </button>
            <p className="kicker">RSVP</p>
            <h2 id="rsvp-modal-title">Find your invitation and respond for your invited guests.</h2>
            <p>
              Enter one guest name from your invitation. Once we find that guest, we’ll show everyone in the same household so you can mark who will attend
              and add dietary restrictions for anyone joining us. You can also correct a guest name before submitting if we misspelled it.
            </p>

            {isMockRsvpMode ? (
              <p className="modal-note">
                Demo mode is active right now. Once the real RSVP backend is connected, this will use the live guest list.
              </p>
            ) : null}

            {!rsvpSuccess ? (
              <>
                <form className="modal-form" onSubmit={handleLookupSubmit}>
                  <label className="modal-label" htmlFor="household-name">Guest name</label>
                  <input
                    id="household-name"
                    className="modal-input"
                    type="text"
                    value={guestNameInput}
                    onChange={(event) => setGuestNameInput(event.target.value)}
                    autoComplete="name"
                    placeholder="Ex: Jeff Smith"
                    required
                    autoFocus
                  />
                  {lookupError ? <p className="modal-error">{lookupError}</p> : null}
                  <div className="modal-actions">
                    <button type="submit" className="button" disabled={isLookingUpHousehold}>
                      {isLookingUpHousehold ? 'Looking up...' : household ? 'Find again' : 'Find invitation'}
                    </button>
                    {household ? (
                      <button type="button" className="button button-secondary" onClick={resetRsvpFlow}>
                        Start over
                      </button>
                    ) : null}
                  </div>
                </form>

                {lookupCandidates.length > 0 ? (
                  <div className="rsvp-candidate-list" aria-live="polite">
                    <div className="rsvp-summary">
                      <p>We found a few close matches. Pick the invitation you want to fill out.</p>
                    </div>

                    {lookupCandidates.map((candidate) => (
                      <button
                        type="button"
                        key={`${candidate.household.householdId}:${candidate.matchedGuestName}`}
                        className="rsvp-candidate-card"
                        onClick={() => selectLookupCandidate(candidate)}
                      >
                        <span className="rsvp-candidate-name">{candidate.matchedGuestName}</span>
                        <span className="rsvp-candidate-meta">
                          {candidate.household.householdName} • {candidate.household.guests.length} invited guest
                          {candidate.household.guests.length === 1 ? '' : 's'}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {household ? (
                  <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
                    <div className="rsvp-household-card">
                      <h3>{household.householdName}</h3>
                      <p>{household.guests.length} invited guest{household.guests.length === 1 ? '' : 's'} found.</p>
                    </div>

                    <div className="rsvp-guest-list">
                      {household.guests.map((guest) => {
                        const response = guestResponses[guest.id] ?? {
                          guestName: guest.name,
                          isEditingName: false,
                          attendance: '',
                          dietaryRestrictions: '',
                        }
                        const displayedGuestName = response.guestName?.trim() || guest.name

                        return (
                          <article className="rsvp-guest-card" key={guest.id}>
                            <div className="rsvp-guest-header">
                              <div className="rsvp-guest-name-block">
                                <p className="rsvp-guest-label">Guest name</p>
                                <div className="rsvp-guest-name-row">
                                  <h3>{displayedGuestName}</h3>
                                  {!response.isEditingName ? (
                                    <button
                                      type="button"
                                      className="rsvp-icon-action"
                                      onClick={() => setGuestNameEditing(guest.id, true)}
                                      aria-label={`Edit guest name for ${displayedGuestName}`}
                                      title="Edit guest name"
                                    >
                                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                        <path d="M4 20h4l10.5-10.5-4-4L4 16v4Zm14.7-11.3 1.6-1.6a1.1 1.1 0 0 0 0-1.6l-1.8-1.8a1.1 1.1 0 0 0-1.6 0l-1.6 1.6 3.4 3.4Z" />
                                      </svg>
                                    </button>
                                  ) : null}
                                </div>
                                {response.isEditingName ? (
                                  <div className="rsvp-guest-name-editor">
                                    <label className="sr-only" htmlFor={`guest-name-${guest.id}`}>
                                      Edit guest name for {displayedGuestName}
                                    </label>
                                    <input
                                      id={`guest-name-${guest.id}`}
                                      className="modal-input"
                                      type="text"
                                      value={response.guestName}
                                      onChange={(event) => updateGuestName(guest.id, event.target.value)}
                                      autoComplete="name"
                                      required
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      className="rsvp-inline-action"
                                      onClick={() => setGuestNameEditing(guest.id, false)}
                                    >
                                      Done
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              <div className="rsvp-choice-group" role="group" aria-label={`Attendance for ${displayedGuestName}`}>
                                <button
                                  type="button"
                                  className={`rsvp-choice ${response.attendance === 'yes' ? 'is-active' : ''}`}
                                  onClick={() => updateGuestAttendance(guest.id, 'yes')}
                                >
                                  Attending
                                </button>
                                <button
                                  type="button"
                                  className={`rsvp-choice ${response.attendance === 'no' ? 'is-active' : ''}`}
                                  onClick={() => updateGuestAttendance(guest.id, 'no')}
                                >
                                  Declines
                                </button>
                              </div>
                            </div>

                            {response.attendance === 'yes' ? (
                              <div className="rsvp-dietary-block">
                                <label className="modal-label" htmlFor={`dietary-${guest.id}`}>
                                  Dietary restrictions
                                </label>
                                <textarea
                                  id={`dietary-${guest.id}`}
                                  className="modal-input modal-textarea"
                                  value={response.dietaryRestrictions}
                                  onChange={(event) => updateDietaryRestrictions(guest.id, event.target.value)}
                                  placeholder="Leave blank if none"
                                  rows={3}
                                />
                              </div>
                            ) : null}
                          </article>
                        )
                      })}
                    </div>

                    <div className="rsvp-summary">
                      <p>
                        {attendingGuests.length > 0
                          ? `${attendingGuests.length} guest${attendingGuests.length === 1 ? '' : 's'} attending.`
                          : 'No attending guests selected yet.'}
                      </p>
                      <p>Please respond for each invited guest before submitting.</p>
                    </div>

                    {rsvpError ? <p className="modal-error">{rsvpError}</p> : null}

                    <button type="submit" className="button modal-submit" disabled={isSubmittingRsvp || !allGuestsAnswered}>
                      {isSubmittingRsvp ? 'Submitting...' : 'Submit RSVP'}
                    </button>
                  </form>
                ) : null}
              </>
            ) : (
              <div className="rsvp-success">
                <h3>Thank you. Your RSVP has been recorded.</h3>
                <p>
                  Confirmation code: <strong>{rsvpSuccess.confirmationCode}</strong>
                </p>
                <p>
                  {rsvpSuccess.attendingCount > 0
                    ? `We’re excited to celebrate with ${rsvpSuccess.attendingCount} attending guest${rsvpSuccess.attendingCount === 1 ? '' : 's'}.`
                    : 'We’re sorry you can’t make it, but we appreciate the update.'}
                </p>
                <div className="modal-actions">
                  <button type="button" className="button" onClick={closeRsvpModal}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <footer className="footer">
        <p>Developed by Ian Naeger and a Robot</p>
      </footer>
    </>
  )
}
