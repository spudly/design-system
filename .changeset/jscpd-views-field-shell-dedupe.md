---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: the views' duplicated field and section wiring now lives in shared internal helpers instead of identical copies — TextField and SearchField render through one FieldShell (label, column rhythm, and the IME composition guard call), TextField and TextAreaField build their accessibility props and field ids through one useFieldA11y hook, SignInForm and SignUpForm extend one shared EmailPasswordFormProps type for their credential fields, and AccountDataView and TransferRecipesView render their muted intro line and its two-line loading skeleton through one SectionMutedText — so every named view keeps rendering exactly as before and the copies cannot drift apart.
