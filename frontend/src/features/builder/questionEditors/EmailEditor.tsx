"use client"
import type { Question, QuestionErrors } from "../types"

// Email has no extra validation fields in the builder
export function EmailEditor(_: {
  question: Question; errors: QuestionErrors; onUpdate: (patch: Partial<Question>) => void
}) {
  return null
}
