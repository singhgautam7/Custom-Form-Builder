"use client"
import { useRef, forwardRef, useImperativeHandle } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { QuestionCard } from "./QuestionCard"
import { useBuilderStore } from "../builderStore"
import { validateQuestion } from "../validation/validateQuestion"
import type { Question, AllQuestionErrors } from "../types"

function SortableQuestion({ question, index, errors, highlightedId }: {
  question: Question; index: number; errors: AllQuestionErrors; highlightedId: string | null
}) {
  const { updateQuestion, duplicateQuestion, deleteQuestion } = useBuilderStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionCard
        question={question}
        index={index}
        errors={errors[question.id] || {}}
        onUpdate={patch => updateQuestion(question.id, patch)}
        onDuplicate={() => duplicateQuestion(question.id)}
        onDelete={() => deleteQuestion(question.id)}
        highlighted={highlightedId === question.id}
      />
    </div>
  )
}

export interface QuestionListRef {
  scrollToQuestion: (id: string) => void
}

export const QuestionList = forwardRef<QuestionListRef, { errors: AllQuestionErrors; highlightedId: string | null }>(
  function QuestionList({ errors, highlightedId }, ref) {
    const { questions, reorderQuestions } = useBuilderStore()
    const containerRef = useRef<HTMLDivElement>(null)

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useImperativeHandle(ref, () => ({
      scrollToQuestion: (id: string) => {
        setTimeout(() => {
          const el = containerRef.current?.querySelector(`[data-question-id="${id}"]`)
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
            const input = el.querySelector('input[placeholder="Enter your question"]') as HTMLInputElement | null
            input?.focus()
          }
        }, 100)
      },
    }))

    const handleDragEnd = (event: any) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = questions.findIndex(q => q.id === active.id)
      const newIndex = questions.findIndex(q => q.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) reorderQuestions(oldIndex, newIndex)
    }

    return (
      <div ref={containerRef} className="space-y-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            {questions.map((q, i) => (
              <div key={q.id} data-question-id={q.id}>
                <SortableQuestion question={q} index={i} errors={errors} highlightedId={highlightedId} />
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    )
  }
)
