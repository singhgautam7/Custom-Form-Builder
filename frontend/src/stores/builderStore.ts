import { create } from 'zustand'

export type QuestionType = 'text' | 'email' | 'number' | 'date' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'multiselect'

export interface FormField {
    id: string
    type: QuestionType
    question_text: string
    is_required: boolean
    placeholder?: string
    help_text?: string
    options?: unknown
    min_length?: number
    max_length?: number
    min_value?: number
    max_value?: number
    regex?: string
    custom_error?: string
    conditional_logic?: {
        depends_on: string
        condition: 'equals' | 'not_equals' | 'contains'
        value: string
    }
}

interface FormMetadata {
    title: string
    description: string
    submission_limit?: number
    success_message?: string
    status?: string
}

interface HistoryState {
    past: FormField[][]
    future: FormField[][]
}

interface BuilderState {
    fields: FormField[]
    metadata: FormMetadata
    activeFieldId: string | null
    history: HistoryState

    // Actions
    setFields: (fields: FormField[]) => void
    setMetadata: (updates: Partial<FormMetadata>) => void
    addField: (field: Omit<FormField, 'id'>) => void
    updateField: (id: string, updates: Partial<FormField>) => void
    duplicateField: (id: string) => void
    removeField: (id: string) => void
    reorderFields: (activeId: string, overId: string) => void
    setActiveField: (id: string | null) => void

    // History Actions
    undo: () => void
    redo: () => void
    _saveHistory: (fields: FormField[]) => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
    fields: [],
    metadata: { title: "Untitled Form", description: "This is a new form.", status: "DRAFT" },
    activeFieldId: null,
    history: { past: [], future: [] },

    _saveHistory: (currentFields) => {
        set((state) => ({
            history: {
                past: [...state.history.past, currentFields],
                future: []
            }
        }))
    },

    setFields: (fields) => {
        get()._saveHistory(get().fields)
        set({ fields })
    },

    setMetadata: (updates) => set((state) => ({ metadata: { ...state.metadata, ...updates } })),

    addField: (fieldConfig) => {
        get()._saveHistory(get().fields)
        set((state) => ({
            fields: [...state.fields, { ...fieldConfig, id: crypto.randomUUID() }]
        }))
    },

    updateField: (id, updates) => {
        // We don't save history on EVERY keystroke, ideally debounced in the component.
        // For now, we update directly.
        set((state) => ({
            fields: state.fields.map(f => f.id === id ? { ...f, ...updates } : f)
        }))
    },

    duplicateField: (id) => {
        get()._saveHistory(get().fields)
        set((state) => {
            const field = state.fields.find(f => f.id === id)
            if (!field) return state
            const newField = { ...field, id: crypto.randomUUID(), question_text: `${field.question_text} (Copy)` }
            const idx = state.fields.findIndex(f => f.id === id)
            const newFields = [...state.fields]
            newFields.splice(idx + 1, 0, newField)
            return { fields: newFields, activeFieldId: newField.id }
        })
    },

    removeField: (id) => {
        get()._saveHistory(get().fields)
        set((state) => ({
            fields: state.fields.filter(f => f.id !== id),
            activeFieldId: state.activeFieldId === id ? null : state.activeFieldId
        }))
    },

    reorderFields: (activeId, overId) => {
        get()._saveHistory(get().fields)
        set((state) => {
            const oldIndex = state.fields.findIndex(f => f.id === activeId)
            const newIndex = state.fields.findIndex(f => f.id === overId)
            if (oldIndex === -1 || newIndex === -1) return state
            const newFields = [...state.fields]
            const [movedItem] = newFields.splice(oldIndex, 1)
            newFields.splice(newIndex, 0, movedItem)
            return { fields: newFields }
        })
    },

    setActiveField: (id) => set({ activeFieldId: id }),

    undo: () => set((state) => {
        const { past, future } = state.history
        if (past.length === 0) return state
        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)
        return {
            fields: previous,
            history: { past: newPast, future: [state.fields, ...future] }
        }
    }),

    redo: () => set((state) => {
        const { past, future } = state.history
        if (future.length === 0) return state
        const next = future[0]
        const newFuture = future.slice(1)
        return {
            fields: next,
            history: { past: [...past, state.fields], future: newFuture }
        }
    })
}))
