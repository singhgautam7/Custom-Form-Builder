import type { Question, QuestionErrors, Option, DateOptions } from "../types"

export function validateQuestion(q: Question): QuestionErrors {
    const errs: QuestionErrors = {}
    if (!q.question_text.trim()) errs.question_text = "Question text is required."

    const t = q.question_type

    // Choice fields
    if (["radio", "checkbox", "dropdown", "multiselect"].includes(t)) {
        const opts = q.options as Option[] | undefined
        if (!opts || !Array.isArray(opts) || opts.length === 0) {
            errs.options = "At least one option is required."
        } else {
            for (let i = 0; i < opts.length; i++) {
                if (!opts[i].label.trim()) { errs.options = `Option ${i + 1} cannot be empty.`; break }
            }
            const vals = opts.map(o => o.value)
            if (new Set(vals).size !== vals.length) errs.options = "Duplicate option values."
        }
    }

    // Number
    if (t === "number") {
        if (q.min_value !== undefined && q.max_value !== undefined && q.min_value > q.max_value) {
            errs.min_value = "Min value cannot exceed max value."
        }
    }

    // Text / Textarea
    if (t === "text" || t === "textarea") {
        if (q.min_length !== undefined && q.max_length !== undefined && q.min_length > q.max_length) {
            errs.min_length = "Min length cannot exceed max length."
        }
    }

    // Date
    if (t === "date" && q.options && typeof q.options === "object" && !Array.isArray(q.options)) {
        const d = q.options as DateOptions
        if (d.min_date && d.max_date && new Date(d.min_date) > new Date(d.max_date)) {
            errs.min_date = "Min date cannot be after max date."
        }
    }

    return errs
}
