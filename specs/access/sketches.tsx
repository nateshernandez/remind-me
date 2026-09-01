// Sketch markup for the cases. Drafts: a slice promotes them into components/
// and the assertions survive unchanged, which is why those are written in
// user intent rather than against a selector.
//
// Built from the shadcn `base-nova` kit this repo is already configured for,
// laid out after the registry's `login-03` block: a centred card on a muted
// ground, its form written with Field/FieldGroup. The door, the code screen
// and the callback share that page frame; the signed-in shell is a bare
// header with one control, because that is all this feature ships.
//
// Every user-facing string comes from copy.ts. A literal here is a finding.
import Link from "next/link"

import {
  AlertCircleIcon,
  ClockIcon,
  MailXIcon,
  ShieldXIcon,
  WifiOffIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"

import { copy } from "./copy"

// --- shared bits ---------------------------------------------------------

type DoorError =
  | "COPY-access-door-error-format"
  | "COPY-access-door-error-google"
  | "COPY-access-door-error-throttled"

// RULE-access-identity-display: an address too long for a sentence keeps the
// start of the local part and the whole domain, because the domain is what
// someone checks to see if they typed the wrong account. The sentence may then
// wrap; it may not scroll the page sideways.
function shorten(email: string, keep = 12) {
  const at = email.lastIndexOf("@")
  if (at < 0 || at <= keep) return email
  return `${email.slice(0, keep)}…${email.slice(at)}`
}

// The sketch substitutes, from its fixture -- never the call site.
function fill(sentence: string, values: Record<string, string>) {
  return sentence.replace(/\{(\w+)\}/g, (whole, key) => values[key] ?? whole)
}

// The `login-03` page frame: one card, centred, on a muted ground.
function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm min-w-0 flex-col gap-6">
        {children}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  )
}

// A screen that has stopped asking for anything and only has something to say.
function Message({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <Empty className="p-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {body ? <EmptyDescription>{body}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}

// --- the door ------------------------------------------------------------

function DoorForm({
  email,
  ready = true,
  error,
  pending,
}: {
  email: string
  ready?: boolean
  error?: DoorError
  pending?: "code" | "google"
}) {
  const busy = pending !== undefined
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {copy["COPY-access-door-title"]}
        </CardTitle>
        <CardDescription>{copy["COPY-access-door-subtitle"]}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={error !== undefined || undefined}>
            <FieldLabel htmlFor="access-email">
              {copy["COPY-access-door-email-label"]}
            </FieldLabel>
            <Input
              id="access-email"
              type="email"
              autoComplete="email"
              placeholder={copy["COPY-access-door-email-placeholder"]}
              defaultValue={email}
              disabled={busy || !ready}
              aria-invalid={error !== undefined}
            />
            {error !== undefined ? (
              <FieldError>{copy[error]}</FieldError>
            ) : null}
          </Field>
          {ready ? (
            <>
              <Field>
                <Button type="submit" disabled={busy}>
                  {pending === "code" ? (
                    <>
                      <Spinner />
                      {copy["COPY-access-door-sending"]}
                    </>
                  ) : pending === "google" ? (
                    <>
                      <Spinner />
                      {copy["COPY-access-door-leaving-for-google"]}
                    </>
                  ) : (
                    copy["COPY-access-door-continue"]
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {copy["COPY-access-door-divider"]}
              </FieldSeparator>
              <Field>
                <Button variant="outline" type="button" disabled={busy}>
                  <GoogleIcon />
                  {copy["COPY-access-door-google"]}
                </Button>
              </Field>
            </>
          ) : (
            // Both buttons are gone until Clerk has loaded: there is nothing
            // to press yet and a card that pretends otherwise lies.
            <Field>
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                <Spinner />
                {copy["COPY-access-door-loading"]}
              </div>
            </Field>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

// STATE-access-door-empty
export function DoorEmpty({ email }: { email: string }) {
  return (
    <AuthPage>
      <DoorForm email={email} />
    </AuthPage>
  )
}

// STATE-access-door-loading
export function DoorLoading({
  email,
  ready,
}: {
  email: string
  ready: boolean
}) {
  return (
    <AuthPage>
      <DoorForm email={email} ready={ready} />
    </AuthPage>
  )
}

// STATE-access-door-filled
export function DoorFilled({ email }: { email: string }) {
  return (
    <AuthPage>
      <DoorForm email={email} />
    </AuthPage>
  )
}

// STATE-access-door-long-email
export function DoorLongEmail({ email }: { email: string }) {
  return (
    <AuthPage>
      <DoorForm email={email} />
    </AuthPage>
  )
}

// STATE-access-door-rejected
export function DoorRejected({
  email,
  error,
}: {
  email: string
  error: DoorError
}) {
  return (
    <AuthPage>
      <DoorForm email={email} error={error} />
    </AuthPage>
  )
}

// STATE-access-door-unavailable
export function DoorUnavailable() {
  return (
    <AuthPage>
      <Card>
        <CardContent>
          <Message
            icon={WifiOffIcon}
            title={copy["COPY-access-door-unavailable-title"]}
            body={copy["COPY-access-door-unavailable-body"]}
          />
        </CardContent>
      </Card>
    </AuthPage>
  )
}

// STATE-access-door-blocked
// INV-access-no-enumeration: this screen says this address cannot be used and
// names a person to ask. It must not add a word either way about whether an
// account exists behind it.
export function DoorBlocked() {
  return (
    <AuthPage>
      <Card>
        <CardContent>
          <Message
            icon={ShieldXIcon}
            title={copy["COPY-access-door-blocked-title"]}
            body={copy["COPY-access-door-blocked-body"]}
          />
        </CardContent>
      </Card>
    </AuthPage>
  )
}

// STATE-access-door-sending
export function DoorSending({
  email,
  pending,
}: {
  email: string
  pending: "code" | "google"
}) {
  return (
    <AuthPage>
      <DoorForm email={email} pending={pending} />
    </AuthPage>
  )
}

// STATE-access-door-signed-out
export function DoorSignedOut({ email }: { email: string }) {
  return (
    <AuthPage>
      <Alert>
        <AlertCircleIcon />
        <AlertTitle>{copy["COPY-access-door-signed-out-title"]}</AlertTitle>
        <AlertDescription>
          {copy["COPY-access-door-signed-out-body"]}
        </AlertDescription>
      </Alert>
      <DoorForm email={email} />
    </AuthPage>
  )
}

// STATE-access-door-already-signed-in
export function DoorAlreadySignedIn() {
  return (
    <AuthPage>
      <Card>
        <CardContent>
          <Message
            icon={AlertCircleIcon}
            title={copy["COPY-access-door-already-signed-in-title"]}
            body={copy["COPY-access-door-already-signed-in-body"]}
            action={
              <Button render={<Link href="/" />}>
                {copy["COPY-access-door-already-signed-in-action"]}
              </Button>
            }
          />
        </CardContent>
      </Card>
    </AuthPage>
  )
}

// --- the code screen -----------------------------------------------------

function CodeForm({
  email,
  digits,
  resendIn,
  wrong,
  pending,
  locked,
}: {
  email: string
  digits: string
  resendIn?: number
  wrong?: boolean
  pending?: boolean
  locked?: boolean
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {copy["COPY-access-code-title"]}
        </CardTitle>
        {/* RULE-access-identity-display: with no address there is no sentence. */}
        {email ? (
          <CardDescription className="break-words">
            {fill(copy["COPY-access-code-subtitle"], { email: shorten(email) })}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={wrong || undefined}>
            <FieldLabel htmlFor="access-code" className="self-center">
              {copy["COPY-access-code-label"]}
            </FieldLabel>
            <InputOTP
              id="access-code"
              maxLength={6}
              value={digits}
              readOnly
              disabled={pending || locked}
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="size-11 text-base"
                    aria-invalid={wrong}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {wrong ? (
              <FieldError className="text-center">
                {copy["COPY-access-code-wrong"]}
              </FieldError>
            ) : null}
          </Field>
          {locked ? (
            // Nothing to press: a control that is only going to be refused is
            // worse than no control.
            <Alert>
              <ClockIcon />
              <AlertTitle>
                {copy["COPY-access-code-throttled-title"]}
              </AlertTitle>
              <AlertDescription>
                {copy["COPY-access-code-throttled-body"]}
              </AlertDescription>
            </Alert>
          ) : (
            <Field>
              <Button type="submit" disabled={digits.length < 6 || pending}>
                {pending ? (
                  <>
                    <Spinner />
                    {copy["COPY-access-code-verifying"]}
                  </>
                ) : (
                  copy["COPY-access-code-continue"]
                )}
              </Button>
              {/* RULE-access-resend: cooling and counting, or live. */}
              {resendIn === undefined ? null : resendIn > 0 ? (
                <FieldDescription className="text-center">
                  {fill(copy["COPY-access-code-resend-waiting"], {
                    seconds: String(resendIn),
                  })}
                </FieldDescription>
              ) : (
                <FieldDescription className="text-center">
                  <Button variant="link" size="sm" type="button">
                    {copy["COPY-access-code-resend"]}
                  </Button>
                </FieldDescription>
              )}
            </Field>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

// STATE-access-code-empty
export function CodeEmpty(props: {
  email: string
  digits: string
  resendIn: number
}) {
  return (
    <AuthPage>
      <CodeForm {...props} />
    </AuthPage>
  )
}

// STATE-access-code-partial
export function CodePartial(props: {
  email: string
  digits: string
  resendIn: number
}) {
  return (
    <AuthPage>
      <CodeForm {...props} />
    </AuthPage>
  )
}

// STATE-access-code-filled
export function CodeFilled(props: {
  email: string
  digits: string
  resendIn: number
}) {
  return (
    <AuthPage>
      <CodeForm {...props} />
    </AuthPage>
  )
}

// STATE-access-code-long-email
export function CodeLongEmail(props: {
  email: string
  digits: string
  resendIn: number
}) {
  return (
    <AuthPage>
      <CodeForm {...props} />
    </AuthPage>
  )
}

// STATE-access-code-wrong
export function CodeWrong(props: {
  email: string
  digits: string
  wrong: boolean
  resendIn: number
}) {
  return (
    <AuthPage>
      <CodeForm {...props} />
    </AuthPage>
  )
}

// STATE-access-code-expired
export function CodeExpired() {
  return (
    <AuthPage>
      <Card>
        <CardContent>
          <Message
            icon={ClockIcon}
            title={copy["COPY-access-code-expired-title"]}
            body={copy["COPY-access-code-expired-body"]}
            action={<Button>{copy["COPY-access-code-expired-action"]}</Button>}
          />
        </CardContent>
      </Card>
    </AuthPage>
  )
}

// STATE-access-code-throttled
export function CodeThrottled(props: { email: string; digits: string }) {
  return (
    <AuthPage>
      <CodeForm {...props} locked />
    </AuthPage>
  )
}

// STATE-access-code-verifying
export function CodeVerifying(props: { email: string; digits: string }) {
  return (
    <AuthPage>
      <CodeForm {...props} pending />
    </AuthPage>
  )
}

// STATE-access-code-verified
export function CodeVerified() {
  return (
    <AuthPage>
      <Card>
        <CardContent>
          <Message icon={Spinner} title={copy["COPY-access-code-verified"]} />
        </CardContent>
      </Card>
    </AuthPage>
  )
}

// STATE-access-code-already-signed-in
export function CodeAlreadySignedIn() {
  return (
    <AuthPage>
      <Card>
        <CardContent>
          <Message
            icon={AlertCircleIcon}
            title={copy["COPY-access-code-already-signed-in-title"]}
            body={copy["COPY-access-code-already-signed-in-body"]}
            action={
              <Button render={<Link href="/" />}>
                {copy["COPY-access-code-already-signed-in-action"]}
              </Button>
            }
          />
        </CardContent>
      </Card>
    </AuthPage>
  )
}

// --- coming back from Google ---------------------------------------------

// The interstitial is not a card. It is a bare page that resolves and leaves.
function CallbackPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}

// STATE-access-callback-working
export function CallbackWorking() {
  return (
    <CallbackPage>
      <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
        <Spinner className="size-6" />
        {copy["COPY-access-callback-working"]}
      </div>
    </CallbackPage>
  )
}

// STATE-access-callback-declined
export function CallbackDeclined() {
  return (
    <CallbackPage>
      <Message
        icon={AlertCircleIcon}
        title={copy["COPY-access-callback-declined-title"]}
        body={copy["COPY-access-callback-declined-body"]}
        action={
          <Button render={<Link href="/sign-in" />}>
            {copy["COPY-access-callback-declined-action"]}
          </Button>
        }
      />
    </CallbackPage>
  )
}

// STATE-access-callback-failed
export function CallbackFailed() {
  return (
    <CallbackPage>
      <Message
        icon={MailXIcon}
        title={copy["COPY-access-callback-failed-title"]}
        body={copy["COPY-access-callback-failed-body"]}
        action={
          <Button render={<Link href="/sign-in" />}>
            {copy["COPY-access-callback-failed-action"]}
          </Button>
        }
      />
    </CallbackPage>
  )
}

// STATE-access-callback-blocked
// INV-access-no-enumeration again: Google has already said who they are, and
// this screen still may not say whether an account exists here.
export function CallbackBlocked() {
  return (
    <CallbackPage>
      <Message
        icon={ShieldXIcon}
        title={copy["COPY-access-callback-blocked-title"]}
        body={copy["COPY-access-callback-blocked-body"]}
      />
    </CallbackPage>
  )
}

// --- the signed-in shell -------------------------------------------------

// One control, and the address it belongs to. What fills the rest of it is a
// later feature -- SURFACE-access-app waives the empty row for exactly that.
function AppShell({
  email,
  pending,
  failed,
  disabled,
  children,
}: {
  email?: string
  pending?: boolean
  failed?: boolean
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <header className="shrink-0 border-b px-6 py-3">
        <div className="flex items-center justify-end gap-4">
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            {email === undefined
              ? copy["COPY-access-app-loading"]
              : fill(copy["COPY-access-app-signed-in"], {
                  email: shorten(email),
                })}
          </span>
          <Button
            variant="outline"
            disabled={pending || disabled || email === undefined}
          >
            {pending ? (
              <>
                <Spinner />
                {copy["COPY-access-app-signing-out"]}
              </>
            ) : (
              copy["COPY-access-app-sign-out"]
            )}
          </Button>
        </div>
        {failed ? (
          <p role="alert" className="mt-2 text-right text-sm text-destructive">
            {copy["COPY-access-app-signout-failed"]}
          </p>
        ) : null}
      </header>
      <main className="flex-1" />
      {children}
    </div>
  )
}

// STATE-access-app-loading
export function AppLoading() {
  return <AppShell />
}

// STATE-access-app-signed-in
export function AppSignedIn({ email }: { email: string }) {
  return <AppShell email={email} />
}

// STATE-access-app-long-identity
export function AppLongIdentity({ email }: { email: string }) {
  return <AppShell email={email} />
}

// STATE-access-app-signout-failed
export function AppSignoutFailed({
  email,
  failed,
}: {
  email: string
  failed: boolean
}) {
  return <AppShell email={email} failed={failed} />
}

// STATE-access-app-session-ended
export function AppSessionEnded({ email }: { email: string }) {
  return (
    <AppShell email={email} disabled>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
        <Card className="w-full max-w-sm">
          <CardContent>
            <Message
              icon={AlertCircleIcon}
              title={copy["COPY-access-app-session-ended-title"]}
              body={copy["COPY-access-app-session-ended-body"]}
              action={
                <Button render={<Link href="/sign-in" />}>
                  {copy["COPY-access-app-session-ended-action"]}
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

// STATE-access-app-signing-out
export function AppSigningOut({
  email,
  pending,
}: {
  email: string
  pending: boolean
}) {
  return <AppShell email={email} pending={pending} />
}
