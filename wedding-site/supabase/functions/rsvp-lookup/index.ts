import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

import { corsHeaders, json } from '../_shared/cors.ts'

function normalizeLookupValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function levenshteinDistance(left: string, right: string) {
  if (left === right) {
    return 0
  }

  if (!left.length) {
    return right.length
  }

  if (!right.length) {
    return left.length
  }

  const previousRow = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    let previousDiagonal = previousRow[0]
    previousRow[0] = leftIndex + 1

    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      const temp = previousRow[rightIndex + 1]
      const substitutionCost = left[leftIndex] === right[rightIndex] ? 0 : 1

      previousRow[rightIndex + 1] = Math.min(
        previousRow[rightIndex + 1] + 1,
        previousRow[rightIndex] + 1,
        previousDiagonal + substitutionCost,
      )

      previousDiagonal = temp
    }
  }

  return previousRow[right.length]
}

function scoreCandidateMatch(input: string, candidateName: string) {
  const normalizedInput = normalizeLookupValue(input)
  const normalizedCandidate = normalizeLookupValue(candidateName)

  if (!normalizedInput || !normalizedCandidate) {
    return 0
  }

  if (normalizedCandidate === normalizedInput) {
    return 1
  }

  if (normalizedCandidate.startsWith(normalizedInput)) {
    return 0.96
  }

  const inputTerms = normalizedInput.split(' ')
  const candidateTerms = normalizedCandidate.split(' ')
  const firstInputTerm = inputTerms[0]

  if (candidateTerms.some((term) => term.startsWith(firstInputTerm))) {
    return 0.9
  }

  if (normalizedCandidate.includes(normalizedInput)) {
    return 0.82
  }

  const bestSimilarity = candidateTerms.reduce((bestScore, term) => {
    const maxLength = Math.max(firstInputTerm.length, term.length)

    if (!maxLength) {
      return bestScore
    }

    const similarity = 1 - levenshteinDistance(firstInputTerm, term) / maxLength
    return Math.max(bestScore, similarity)
  }, 0)

  return bestSimilarity >= 0.72 ? bestSimilarity : 0
}

async function loadHouseholdsByIds(supabase: ReturnType<typeof createClient>, householdIds: string[]) {
  const uniqueHouseholdIds = [...new Set(householdIds)]

  if (!uniqueHouseholdIds.length) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('rsvp_households')
    .select('id, household_name, guests:rsvp_guests(id, guest_name, sort_order)')
    .in('id', uniqueHouseholdIds)

  if (error) {
    throw error
  }

  return new Map(
    (data ?? []).map((household) => [
      household.id,
      {
        householdId: household.id,
        householdName: household.household_name,
        guests: [...(household.guests ?? [])]
          .sort((left, right) => left.sort_order - right.sort_order)
          .map((guest) => ({
            id: guest.id,
            name: guest.guest_name,
          })),
      },
    ]),
  )
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { guestName } = await request.json()

    if (!guestName || typeof guestName !== 'string') {
      return json({ error: 'Guest name is required.' }, 400)
    }

    const normalizedGuestName = normalizeLookupValue(guestName)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: matchingGuest, error: guestMatchError } = await supabase
      .from('rsvp_guests')
      .select('household_id')
      .eq('normalized_guest_name', normalizedGuestName)
      .maybeSingle()

    if (guestMatchError) {
      throw guestMatchError
    }

    if (matchingGuest) {
      const householdMap = await loadHouseholdsByIds(supabase, [matchingGuest.household_id])
      const household = householdMap.get(matchingGuest.household_id)

      if (!household) {
        return json({ error: 'We could not find that household on the guest list.' }, 404)
      }

      return json({ household, candidates: [] })
    }

    const { data: allGuests, error: allGuestsError } = await supabase
      .from('rsvp_guests')
      .select('id, household_id, guest_name, normalized_guest_name')

    if (allGuestsError) {
      throw allGuestsError
    }

    const candidateRows = (allGuests ?? [])
      .map((guest) => ({
        guestName: guest.guest_name,
        householdId: guest.household_id,
        score: scoreCandidateMatch(normalizedGuestName, guest.normalized_guest_name),
      }))
      .filter((guest) => guest.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6)

    if (!candidateRows.length) {
      return json({ error: 'We could not find that guest on the guest list.' }, 404)
    }

    const householdMap = await loadHouseholdsByIds(
      supabase,
      candidateRows.map((candidate) => candidate.householdId),
    )

    const candidateMap = new Map()

    for (const candidate of candidateRows) {
      if (candidateMap.has(candidate.householdId)) {
        continue
      }

      candidateMap.set(candidate.householdId, {
        matchedGuestName: candidate.guestName,
        household: householdMap.get(candidate.householdId) ?? null,
        score: candidate.score,
      })
    }

    const candidates = [...candidateMap.values()].filter((candidate) => candidate.household)

    if (!candidates.length) {
      return json({ error: 'We could not find that household on the guest list.' }, 404)
    }

    if (candidates.length === 1) {
      return json({
        household: candidates[0].household,
        candidates: [],
      })
    }

    return json({
      household: null,
      candidates: candidates.map(({ matchedGuestName, household }) => ({
        matchedGuestName,
        household,
      })),
    })
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Unable to look up this invitation right now.' },
      500,
    )
  }
})
