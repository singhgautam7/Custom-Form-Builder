"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { useSearchParams } from "next/navigation"

// Fake schema to represent a realistic Typeform survey
const schema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  satisfaction: z.enum(["1", "2", "3", "4", "5"]),
  feedback: z.string().optional()
})

type FormData = z.infer<typeof schema>

function SubmitContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') // normally fetch form data via this id
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const { control, handleSubmit, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  const formSteps = [
    {
      id: "fullName",
      title: "What's your full name?",
      description: "We'd love to know who we're talking to.",
      render: () => (
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Input {...field} autoFocus placeholder="Jane Doe" className="text-2xl h-14 border-0 border-b-2 border-border/50 rounded-none focus-visible:ring-0 px-0 shadow-none bg-transparent" />
          )}
        />
      )
    },
    {
      id: "email",
      title: "What's the best email to reach you?",
      description: "We promise not to spam you.",
      render: () => (
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input {...field} autoFocus type="email" placeholder="jane@example.com" className="text-2xl h-14 border-0 border-b-2 border-border/50 rounded-none focus-visible:ring-0 px-0 shadow-none bg-transparent" />
          )}
        />
      )
    },
    {
      id: "satisfaction",
      title: "How satisfied are you with our service?",
      description: "1 is terrible, 5 is amazing.",
      render: () => (
        <Controller
          name="satisfaction"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-3 mt-4">
              {[1, 2, 3, 4, 5].map((val) => (
                <div
                  key={val}
                  className={cn(
                    "flex items-center p-4 border rounded-xl cursor-pointer transition-all active:scale-[0.98]",
                    field.value === String(val) ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80 hover:bg-card"
                  )}
                  onClick={() => field.onChange(String(val))}
                >
                  <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center mr-4", field.value === String(val) ? "border-primary bg-primary" : "border-border")}>
                    {field.value === String(val) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-lg font-medium">{val} - {val === 1 ? 'Terrible' : val === 5 ? 'Amazing' : 'Okay'}</span>
                </div>
              ))}
            </div>
          )}
        />
      )
    },
    {
      id: "feedback",
      title: "Any additional feedback?",
      description: "Optional.",
      render: () => (
        <Controller
          name="feedback"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              autoFocus
              className="w-full min-h-[120px] text-xl p-0 border-0 border-b-2 border-border/50 bg-transparent focus:ring-0 resize-none outline-none"
              placeholder="Tell us more..."
            />
          )}
        />
      )
    }
  ]

  const nextStep = async () => {
    const fieldId = formSteps[currentStep].id as keyof FormData
    const valid = await trigger(fieldId)
    if (valid) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        handleSubmit(onSubmit)()
      }
    }
  }

  const onSubmit = async () => {
    await new Promise(resolve => setTimeout(resolve, 800)) // simulate network
    setIsSubmitted(true)
    toast.success("Response recorded successfully")
  }

  // Allow enter key to submit/progress except on textarea
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && formSteps[currentStep].id !== 'feedback') {
        e.preventDefault()
        nextStep()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6 selection:bg-primary/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Thank you!</h1>
          <p className="text-muted-foreground">Your response has been recorded. You may close this tab.</p>
        </motion.div>
      </div>
    )
  }

  const currentField = formSteps[currentStep]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 view-transitions">

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-muted/30 z-50">
        <motion.div
           className="h-full bg-primary"
           initial={{ width: 0 }}
           animate={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
           transition={{ ease: "easeInOut", duration: 0.3 }}
        />
      </div>

      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
         <AnimatePresence mode="wait">
           <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl"
           >
              <div className="mb-8">
                 <div className="flex items-center text-primary font-semibold mb-2 text-sm tracking-widest uppercase">
                   Step {currentStep + 1} of {formSteps.length}
                 </div>
                 <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-3 leading-tight">
                   {currentField.title}
                 </h1>
                 {currentField.description && (
                   <p className="text-lg md:text-xl text-muted-foreground">
                     {currentField.description}
                   </p>
                 )}
              </div>

              <div className="mb-8">
                 {currentField.render()}
                 {errors[currentField.id as keyof FormData] && (
                   <motion.p
                     initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                     className="text-destructive font-medium mt-3 text-sm flex items-center"
                   >
                     {errors[currentField.id as keyof FormData]?.message}
                   </motion.p>
                 )}
              </div>

              <div className="flex items-center gap-4 mt-12">
                 <Button
                   size="lg"
                   onClick={nextStep}
                   className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group"
                 >
                   {currentStep === formSteps.length - 1 ? 'Submit' : 'OK'}
                   {currentStep < formSteps.length - 1 && <Check className="ml-2 w-5 h-5 opacity-70 group-hover:opacity-100" />}
                 </Button>
                 {currentStep < formSteps.length - 1 && (
                   <span className="text-xs font-semibold text-muted-foreground hidden sm:inline-block">
                     press <strong className="font-bold text-foreground mx-1">Enter ↵</strong>
                   </span>
                 )}
              </div>

           </motion.div>
         </AnimatePresence>
      </main>

      <footer className="p-6 md:p-8 flex justify-between items-center text-xs font-medium text-muted-foreground z-40">
         <div>Powered by FormBuilder</div>
         <div className="flex items-center gap-1">
           <button
             onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
             disabled={currentStep === 0}
             className="w-8 h-8 flex items-center justify-center rounded border border-border/50 hover:bg-muted/50 disabled:opacity-30 transition-colors"
           >
             <ArrowRight className="w-4 h-4 rotate-180" />
           </button>
           <button
             onClick={nextStep}
             disabled={currentStep === formSteps.length - 1}
             className="w-8 h-8 flex items-center justify-center rounded border border-border/50 hover:bg-muted/50 disabled:opacity-30 transition-colors"
           >
             <ArrowRight className="w-4 h-4" />
           </button>
         </div>
      </footer>
    </div>
  )
}

export default function SubmitPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading form...</div>}>
      <SubmitContent />
    </React.Suspense>
  )
}
