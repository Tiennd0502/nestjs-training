import { SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <SignUp appearance={{ baseTheme: dark }} />
    </div>
  )
}
