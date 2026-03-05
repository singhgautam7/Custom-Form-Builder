// ─── Shared Types for Form Builder ─────────────────────

export type QuestionType =
    | "text"
    | "textarea"
    | "email"
    | "number"
    | "date"
    | "radio"
    | "checkbox"
    | "dropdown"
    | "multiselect"

export interface Option {
    label: string
    value: string
}

export interface DateOptions {
    allow_past?: boolean
    min_date?: string
    max_date?: string
}

export interface Question {
    id: string
    question_text: string
    question_type: QuestionType
    is_required: boolean
    help_text?: string
    placeholder?: string
    min_length?: number
    max_length?: number
    min_value?: number
    max_value?: number
    options?: Option[] | DateOptions
    order: number
}

export interface FormData {
    title: string
    description: string
    allow_multiple_submissions: boolean
    is_password_protected: boolean
    access_code: string
    submission_limit?: number
    success_message?: string
}

export interface BuilderSnapshot {
    form: FormData
    questions: Question[]
}

export type QuestionErrors = Record<string, string>
export type AllQuestionErrors = Record<string, QuestionErrors>
export type FormErrors = Record<string, string>

export const QUESTION_TYPES: {
    type: QuestionType
    label: string
    iconName: string
    color: string
}[] = [
        { type: "text", label: "Short Text", iconName: "Type", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900" },
        { type: "textarea", label: "Long Text", iconName: "AlignLeft", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900" },
        { type: "email", label: "Email", iconName: "Mail", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900" },
        { type: "number", label: "Number", iconName: "Hash", color: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900" },
        { type: "date", label: "Date", iconName: "CalendarIcon", color: "bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-900" },
        { type: "radio", label: "Single Choice", iconName: "CircleDot", color: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900" },
        { type: "checkbox", label: "Checkbox", iconName: "CheckSquare", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900" },
        { type: "dropdown", label: "Dropdown", iconName: "ChevronDown", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-900" },
        { type: "multiselect", label: "Multiple Select", iconName: "List", color: "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-900" },
    ]

export const BADGE_COLORS: Record<QuestionType, string> = {
    text: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    textarea: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    email: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    number: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    date: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    radio: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    checkbox: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dropdown: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    multiselect: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
}
