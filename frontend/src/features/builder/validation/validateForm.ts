import type { Question, FormData, FormErrors, AllQuestionErrors } from "../types"
import { validateQuestion } from "./validateQuestion"

export function validateForm(
    form: FormData,
    questions: Question[]
): { formErrors: FormErrors; questionErrors: AllQuestionErrors; valid: boolean } {
    const formErrors: FormErrors = {}

    if (!form.title.trim()) formErrors.title = "Form title is required."
    if (form.is_password_protected && !form.access_code.trim()) {
        formErrors.access_code = "Access code is required when password protection is enabled."
    }

    const questionErrors: AllQuestionErrors = {}
    for (const q of questions) {
        const e = validateQuestion(q)
        if (Object.keys(e).length > 0) questionErrors[q.id] = e
    }

    const valid =
        Object.keys(formErrors).length === 0 &&
        Object.keys(questionErrors).length === 0 &&
        questions.length > 0

    return { formErrors, questionErrors, valid }
}
