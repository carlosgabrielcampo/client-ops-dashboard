import type { ComponentType, FormEvent, ReactNode } from "react"

function normalizeError(error: unknown): string {
  if (typeof error === "string") {
    return error
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message)
  }

  return ""
}

export type FormFieldApi = {
  name: string
  state: {
    value: string | number
    meta: {
      isTouched: boolean
      errors: unknown[]
    }
  }
  handleBlur: () => void
  handleChange: (value: string | number) => void
}

export type ValidationErrorsRender = (field: FormFieldApi) => ReactNode

type SubscribeState = {
  canSubmit?: boolean
}

type GeneratedFormApi = {
  handleSubmit: () => void
  Field: ComponentType<{
    name: string
    validators?: unknown
    children: (field: FormFieldApi) => ReactNode
  }>
  Subscribe: ComponentType<{
    selector?: (state: SubscribeState) => unknown
    children: (state: SubscribeState) => ReactNode
  }>
}

const validationErrorsRender = (field: FormFieldApi): ReactNode => {
  const isTouched = field?.state?.meta?.isTouched
  const rawErrors = field?.state?.meta?.errors ?? []

  if (!isTouched || rawErrors.length === 0) {
    return null
  }

  const messages = rawErrors
    .map((error: unknown) => normalizeError(error))
    .filter(Boolean)

  if (messages.length === 0) {
    return null
  }

  return <p>{messages.join(", ")}</p>
}

export type FormStructureItem =
  | {
    type: "field"
    name: string
    validators?: unknown
    children: (field: FormFieldApi, validationErrors: ValidationErrorsRender) => ReactNode
  }
  | {
    type: "subscribe"
    selector?: (state: SubscribeState) => unknown
    children: (state: SubscribeState) => ReactNode
  }

type GenerateFormProps = {
  form: unknown
  formStructure: FormStructureItem[]
  footer?: ReactNode
}

export const GenerateForm = ({ form, formStructure, footer }: GenerateFormProps) => {
  const generatedForm = form as GeneratedFormApi

  return (
    <form
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        event.stopPropagation()
        generatedForm.handleSubmit()
      }}
    >
      {formStructure.map((fieldItem: FormStructureItem, index: number) => {
        switch (fieldItem.type) {
          case "subscribe":
            return (
              <generatedForm.Subscribe
                key={`subscribe-${index}`}
                selector={(state: SubscribeState) => fieldItem?.selector?.(state)}
              >
                {(field: SubscribeState) => fieldItem.children(field)}
              </generatedForm.Subscribe>
            )

          case "field":
            return (
              <generatedForm.Field
                key={fieldItem.name ?? `field-${index}`}
                name={fieldItem.name ?? ""}
                validators={fieldItem.validators}
              >
                {(field: FormFieldApi) => fieldItem.children(field, validationErrorsRender)}
              </generatedForm.Field>
            )

          default:
            return null
        }
      })}
      {footer}
    </form>
  )
}
