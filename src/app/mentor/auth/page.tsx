import { redirect } from 'next/navigation'

export default function MentorAuthRedirect() {
  redirect('/mentor/apply')
}
