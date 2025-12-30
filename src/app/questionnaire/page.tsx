import { Suspense } from 'react'
import Loading from '../loading'
import QuestionnaireContent from './QuestionnaireContent'

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<Loading />}>
      <QuestionnaireContent />
    </Suspense>
  )
}
