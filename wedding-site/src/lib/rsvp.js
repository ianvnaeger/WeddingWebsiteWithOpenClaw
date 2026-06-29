const configuredApiBaseUrl = (import.meta.env.VITE_RSVP_API_BASE_URL || '').trim().replace(/\/$/, '')
const forceMockMode = import.meta.env.VITE_RSVP_USE_MOCK === 'true'

export const isMockRsvpMode = forceMockMode || !configuredApiBaseUrl

const mockHouseholds = [
  {
    householdId: 'mock-household-1',
    householdName: 'Smith Family',
    guests: [
      { id: 'mock-guest-1', name: 'Jeff Smith' },
      { id: 'mock-guest-2', name: 'Casey Smith' },
    ],
  },
  {
    householdId: 'mock-household-2',
    householdName: 'Taylor Household',
    guests: [
      { id: 'mock-guest-3', name: 'Avery Taylor' },
    ],
  },
]

function normalizeLookupValue(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function buildMockLookupCandidates(guestName) {
  const normalizedGuestName = normalizeLookupValue(guestName)

  const candidateMap = new Map()

  mockHouseholds
    .flatMap((household) =>
      household.guests.map((guest) => ({
        matchedGuestName: guest.name,
        household,
        normalizedGuestName: normalizeLookupValue(guest.name),
      })),
    )
    .filter(({ normalizedGuestName: candidateName }) => candidateName.includes(normalizedGuestName))
    .forEach(({ matchedGuestName, household }) => {
      if (!candidateMap.has(household.householdId)) {
        candidateMap.set(household.householdId, {
          matchedGuestName,
          household,
        })
      }
    })

  return [...candidateMap.values()]
}

async function postJson(path, payload) {
  const response = await fetch(`${configuredApiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || 'Unable to complete the RSVP request right now.')
  }

  return data
}

export async function lookupHouseholdByName(guestName) {
  if (!guestName?.trim()) {
    throw new Error('Please enter your name as it appears on your invitation.')
  }

  if (isMockRsvpMode) {
    const match = mockHouseholds.find(
      (household) => household.guests.some((guest) => normalizeLookupValue(guest.name) === normalizeLookupValue(guestName)),
    )

    if (match) {
      return {
        household: match,
        candidates: [],
      }
    }

    const candidates = buildMockLookupCandidates(guestName)

    if (candidates.length === 1) {
      return {
        household: candidates[0].household,
        candidates: [],
      }
    }

    if (candidates.length > 1) {
      return {
        household: null,
        candidates,
      }
    }

    throw new Error('We could not find that guest. In demo mode, try "Jeff Smith", "Casey Smith", or "Avery Taylor".')
  }

  const data = await postJson('/rsvp-lookup', { guestName })

  return {
    household: data.household ?? null,
    candidates: data.candidates ?? [],
  }
}

export async function submitRsvp(payload) {
  if (isMockRsvpMode) {
    const attendingCount = payload.guests.filter((guest) => guest.attending).length

    return {
      confirmationCode: 'DEMO-RSVP',
      attendingCount,
    }
  }

  return postJson('/rsvp-submit', payload)
}
