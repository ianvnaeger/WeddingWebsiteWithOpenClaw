import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

import { corsHeaders, json } from '../_shared/cors.ts'

type GuestSubmission = {
  guestId: string;
  guestName: string;
  attending: boolean;
  dietaryRestrictions?: string;
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { householdId, householdName, guests } = await request.json()

    if (!householdId || !householdName || !Array.isArray(guests) || guests.length === 0) {
      return json({ error: 'A valid household RSVP submission is required.' }, 400)
    }

    if (!guests.every((guest: GuestSubmission) => typeof guest.attending === 'boolean' && guest.guestId)) {
      return json({ error: 'Each invited guest must have an attendance response.' }, 400)
    }

    if (!guests.every((guest: GuestSubmission) => typeof guest.guestName === 'string' && guest.guestName.trim().length > 0)) {
      return json({ error: 'Each invited guest must include a name.' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: validGuests, error: guestLookupError } = await supabase
      .from('rsvp_guests')
      .select('id')
      .eq('household_id', householdId)

    if (guestLookupError) {
      throw guestLookupError
    }

    const validGuestIds = new Set((validGuests ?? []).map((guest) => guest.id))

    if (!guests.every((guest: GuestSubmission) => validGuestIds.has(guest.guestId))) {
      return json({ error: 'This RSVP contains guests that do not belong to the selected household.' }, 400)
    }

    const attendingCount = guests.filter((guest: GuestSubmission) => guest.attending).length

    const { data: existingSubmission, error: existingSubmissionError } = await supabase
      .from('rsvp_submissions')
      .select('id, confirmation_code')
      .eq('household_id', householdId)
      .maybeSingle()

    if (existingSubmissionError) {
      throw existingSubmissionError
    }

    let submissionId = existingSubmission?.id ?? null
    const confirmationCode = existingSubmission?.confirmation_code ?? crypto.randomUUID().slice(0, 8).toUpperCase()

    if (!submissionId) {
      const { data: insertedSubmission, error: insertSubmissionError } = await supabase
        .from('rsvp_submissions')
        .insert({
          household_id: householdId,
          submitted_household_name: householdName,
          confirmation_code: confirmationCode,
          attending_count: attendingCount,
        })
        .select('id')
        .single()

      if (insertSubmissionError) {
        throw insertSubmissionError
      }

      submissionId = insertedSubmission.id
    } else {
      const { error: updateSubmissionError } = await supabase
        .from('rsvp_submissions')
        .update({
          submitted_household_name: householdName,
          attending_count: attendingCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId)

      if (updateSubmissionError) {
        throw updateSubmissionError
      }

      const { error: deleteResponsesError } = await supabase
        .from('rsvp_guest_responses')
        .delete()
        .eq('submission_id', submissionId)

      if (deleteResponsesError) {
        throw deleteResponsesError
      }
    }

    const responseRows = guests.map((guest: GuestSubmission) => ({
      submission_id: submissionId,
      guest_id: guest.guestId,
      submitted_guest_name: guest.guestName.trim(),
      attending: guest.attending,
      dietary_restrictions: guest.attending ? guest.dietaryRestrictions?.trim() ?? '' : '',
    }))

    const { error: insertResponsesError } = await supabase.from('rsvp_guest_responses').insert(responseRows)

    if (insertResponsesError) {
      throw insertResponsesError
    }

    return json({
      confirmationCode,
      attendingCount,
    })
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Unable to submit the RSVP right now.' },
      500,
    )
  }
})
