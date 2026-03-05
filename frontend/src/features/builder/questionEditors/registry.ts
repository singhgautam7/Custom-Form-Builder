import type { QuestionType } from "../types"
import { TextEditor } from "./TextEditor"
import { TextareaEditor } from "./TextareaEditor"
import { EmailEditor } from "./EmailEditor"
import { NumberEditor } from "./NumberEditor"
import { DateEditor } from "./DateEditor"
import { ChoiceEditor } from "./ChoiceEditor"

export const questionEditorRegistry: Record<QuestionType, React.ComponentType<any>> = {
    text: TextEditor,
    textarea: TextareaEditor,
    email: EmailEditor,
    number: NumberEditor,
    date: DateEditor,
    radio: ChoiceEditor,
    checkbox: ChoiceEditor,
    dropdown: ChoiceEditor,
    multiselect: ChoiceEditor,
}
