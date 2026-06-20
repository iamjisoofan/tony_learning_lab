import { createFileRoute } from '@tanstack/react-router'
import { DictationApp } from '../features/dictation/DictationApp'

export const Route = createFileRoute('/dictation')({
  component: DictationApp,
})
