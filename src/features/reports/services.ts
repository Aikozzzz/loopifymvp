import { requireCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { reportSchema, type ReportFormValues } from './schemas'

export async function submitEventReport(
  eventId: string,
  input: ReportFormValues,
): Promise<void> {
  const user = await requireCurrentUser()
  const values = reportSchema.parse(input)

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: 'event',
    event_id: eventId,
    reason: values.reason,
    details: values.details.trim() || null,
  })

  if (error?.code === '23505') {
    throw new Error('You have already reported this event.')
  }

  if (error) {
    throw new Error(error.message)
  }
}
