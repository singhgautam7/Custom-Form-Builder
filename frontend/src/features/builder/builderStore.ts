import { create } from "zustand"
import type { Question, FormData, BuilderSnapshot, QuestionType, Option } from "./types"

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

function createDefaultForm(): FormData {
    return {
        title: "",
        description: "",
        allow_multiple_submissions: false,
        is_password_protected: false,
        access_code: "",
        submission_limit: undefined,
        success_message: "",
    }
}

function createQuestion(type: QuestionType, order: number): Question {
    const q: Question = {
        id: crypto.randomUUID(),
        question_text: "",
        question_type: type,
        is_required: false,
        order,
    }
    if (["radio", "checkbox", "dropdown", "multiselect"].includes(type)) {
        q.options = [
            { label: "Option 1", value: "option-1" },
            { label: "Option 2", value: "option-2" },
        ]
    }
    if (type === "date") {
        q.options = { allow_past: true }
    }
    return q
}

// ─── Store ──────────────────────────────────────────────

interface BuilderState {
    form: FormData
    questions: Question[]
    selectedQuestionId: string | null
    dirty: boolean
    slug: string | null

    history: {
        past: BuilderSnapshot[]
        future: BuilderSnapshot[]
    }

    // Actions
    updateForm: (patch: Partial<FormData>) => void
    addQuestion: (type: QuestionType) => string
    deleteQuestion: (id: string) => void
    duplicateQuestion: (id: string) => string | null
    updateQuestion: (id: string, patch: Partial<Question>) => void
    reorderQuestions: (sourceIndex: number, targetIndex: number) => void
    setSelectedQuestion: (id: string | null) => void
    undo: () => void
    redo: () => void
    loadFromApi: (data: any) => void
    serializeForApi: () => any
    reset: () => void
    setSlug: (slug: string) => void
    markClean: () => void
}

export const useBuilderStore = create<BuilderState>((set, get) => {
    function pushHistory() {
        const { form, questions, history } = get()
        set({
            history: {
                past: [...history.past.slice(-50), { form: { ...form }, questions: questions.map(q => ({ ...q })) }],
                future: [],
            },
            dirty: true,
        })
    }

    return {
        form: createDefaultForm(),
        questions: [],
        selectedQuestionId: null,
        dirty: false,
        slug: null,
        history: { past: [], future: [] },

        updateForm: (patch) => {
            pushHistory()
            set(s => ({ form: { ...s.form, ...patch } }))
        },

        addQuestion: (type) => {
            pushHistory()
            const q = createQuestion(type, get().questions.length + 1)
            set(s => ({ questions: [...s.questions, q] }))
            return q.id
        },

        deleteQuestion: (id) => {
            pushHistory()
            set(s => {
                const questions = s.questions.filter(q => q.id !== id)
                questions.forEach((q, i) => (q.order = i + 1))
                return {
                    questions,
                    selectedQuestionId: s.selectedQuestionId === id ? null : s.selectedQuestionId,
                }
            })
        },

        duplicateQuestion: (id) => {
            pushHistory()
            const state = get()
            const idx = state.questions.findIndex(q => q.id === id)
            if (idx === -1) return null
            const clone: Question = {
                ...state.questions[idx],
                id: crypto.randomUUID(),
                question_text: `${state.questions[idx].question_text} (Copy)`,
            }
            // Deep-clone options
            if (Array.isArray(clone.options)) {
                clone.options = clone.options.map(o => ({ ...o }))
            } else if (clone.options) {
                clone.options = { ...clone.options }
            }
            const newQuestions = [...state.questions]
            newQuestions.splice(idx + 1, 0, clone)
            newQuestions.forEach((q, i) => (q.order = i + 1))
            set({ questions: newQuestions })
            return clone.id
        },

        updateQuestion: (id, patch) => {
            // No history push on every keystroke — components should debounce if needed
            set(s => ({
                questions: s.questions.map(q => (q.id === id ? { ...q, ...patch } : q)),
                dirty: true,
            }))
        },

        reorderQuestions: (sourceIndex, targetIndex) => {
            pushHistory()
            set(s => {
                const newQuestions = [...s.questions]
                const [moved] = newQuestions.splice(sourceIndex, 1)
                newQuestions.splice(targetIndex, 0, moved)
                newQuestions.forEach((q, i) => (q.order = i + 1))
                return { questions: newQuestions }
            })
        },

        setSelectedQuestion: (id) => set({ selectedQuestionId: id }),

        undo: () => {
            const { history, form, questions } = get()
            if (history.past.length === 0) return
            const previous = history.past[history.past.length - 1]
            set({
                form: previous.form,
                questions: previous.questions,
                history: {
                    past: history.past.slice(0, -1),
                    future: [{ form: { ...form }, questions: questions.map(q => ({ ...q })) }, ...history.future],
                },
                dirty: true,
            })
        },

        redo: () => {
            const { history, form, questions } = get()
            if (history.future.length === 0) return
            const next = history.future[0]
            set({
                form: next.form,
                questions: next.questions,
                history: {
                    past: [...history.past, { form: { ...form }, questions: questions.map(q => ({ ...q })) }],
                    future: history.future.slice(1),
                },
                dirty: true,
            })
        },

        loadFromApi: (data) => {
            const form: FormData = {
                title: data.title || "",
                description: data.description || "",
                allow_multiple_submissions: data.allow_multiple_submissions ?? false,
                is_password_protected: data.is_password_protected ?? false,
                access_code: data.access_code || "",
                submission_limit: data.submission_limit ?? undefined,
                success_message: data.success_message || "",
            }
            const questions: Question[] = (data.questions || []).map((q: any, i: number) => ({
                id: q.id || crypto.randomUUID(),
                question_text: q.question_text || "",
                question_type: q.question_type || "text",
                is_required: q.is_required ?? false,
                help_text: q.help_text || "",
                placeholder: q.placeholder || "",
                min_length: q.min_length,
                max_length: q.max_length,
                min_value: q.min_value,
                max_value: q.max_value,
                options: q.options,
                order: q.order ?? i + 1,
            }))
            set({ form, questions, dirty: false, slug: data.slug || null, history: { past: [], future: [] } })
        },

        serializeForApi: () => {
            const { form, questions } = get()
            return {
                title: form.title || "Untitled Form",
                description: form.description,
                allow_multiple_submissions: form.allow_multiple_submissions,
                is_password_protected: form.is_password_protected,
                access_code: form.is_password_protected ? form.access_code : "",
                submission_limit: form.submission_limit || null,
                success_message: form.success_message || "",
                questions: questions.map(q => {
                    const out: any = {
                        question_text: q.question_text,
                        question_type: q.question_type,
                        is_required: q.is_required,
                        order: q.order,
                        help_text: q.help_text || "",
                        placeholder: q.placeholder || "",
                    }
                    if (q.min_length !== undefined) out.min_length = q.min_length
                    if (q.max_length !== undefined) out.max_length = q.max_length
                    if (q.min_value !== undefined) out.min_value = q.min_value
                    if (q.max_value !== undefined) out.max_value = q.max_value
                    if (q.options !== undefined) out.options = q.options
                    return out
                }),
            }
        },

        reset: () =>
            set({
                form: createDefaultForm(),
                questions: [],
                selectedQuestionId: null,
                dirty: false,
                slug: null,
                history: { past: [], future: [] },
            }),

        setSlug: (slug) => set({ slug }),
        markClean: () => set({ dirty: false }),
    }
})
