"use client"
import { TextEditor } from "./TextEditor"
import type { Question, QuestionErrors } from "../types"

// TextareaEditor uses same fields as TextEditor (min_length / max_length)
export function TextareaEditor({ question, errors, onUpdate }: {
  question: Question; errors: QuestionErrors; onUpdate: (patch: Partial<Question>) => void
}) {
  return <TextEditor question={question} errors={errors} onUpdate={onUpdate} />
}
