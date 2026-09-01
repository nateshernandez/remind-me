import { createElement } from "react"

import { defineSpec } from "@redspec/core"

import * as fixtures from "./fixtures"
import * as sketches from "./sketches"

// `redspec status` is the work list. After /draft-skeleton, `surfaces` and
// `flows` are filled and `cases` is empty: every declared state is a stub on
// the board and a red line in status. /render-states fills `cases`.
export default defineSpec({
  slug: "access",
  title: "Account access",

  surfaces: {
    // ---------------------------------------------------------------------
    // The door: /sign-in. One screen creates an account and returns to one.
    // /sign-up redirects here. ADR-0005.
    // ---------------------------------------------------------------------
    door: {
      title: "The door",
      checklist: {
        empty: { state: "STATE-access-door-empty" },
        loading: { state: "STATE-access-door-loading" },
        partial: {
          waived:
            "The door's two affordances -- one email field and one Google button -- are static markup. Nothing on it arrives piecemeal, and a social connection that is misconfigured fails when it is pressed, not when it is drawn: that is STATE-access-door-rejected.",
          witness: "RULE-access-rejection-copy",
        },
        populated: { state: "STATE-access-door-filled" },
        overflowing: { state: "STATE-access-door-long-email" },
        recoverableError: { state: "STATE-access-door-rejected" },
        terminalError: { state: "STATE-access-door-unavailable" },
        permissionDenied: { state: "STATE-access-door-blocked" },
        stale: {
          waived:
            "The door's one piece of fetched state is whether a session already exists, and a door that is out of date about that is the conflict row: STATE-access-door-already-signed-in. Nothing else on it is fetched, and a browser that is offline cannot reach Clerk either, which is STATE-access-door-unavailable. That claim can be up to a minute stale (RULE-access-session), and following it lands on RULE-access-route-guard's app-with-no-session row, which sends the person straight back here -- accepted, because the door they land back on is the one this feature already draws rather than a dead end.",
          witness: "RULE-access-route-guard",
        },
        inFlight: { state: "STATE-access-door-sending" },
        terminalSuccess: { state: "STATE-access-door-signed-out" },
        conflict: { state: "STATE-access-door-already-signed-in" },
      },
    },

    // ---------------------------------------------------------------------
    // The code screen: six digits. Reached from the door, and from the Google
    // callback when Clerk wants a code before it will link an unverified
    // address. Clerk's SignIn attempt is in-memory; a reload is a fresh start
    // at the door.
    // ---------------------------------------------------------------------
    code: {
      title: "The code screen",
      checklist: {
        empty: { state: "STATE-access-code-empty" },
        loading: {
          waived:
            "Nothing reaches this screen without a code already sent. There are two ways in -- the door, and the Google callback on RULE-access-callback-outcome's `authorized | unverified` row -- and both send the code before the screen changes, so it is never entered with nothing to show. A reload drops the attempt and returns the person to the door rather than re-entering here. RULE-access-attempt-lifecycle is the witness because `codeSent` is the only event in it that reaches `awaitingCode`: give the screen a second way in and it goes red.",
          witness: "RULE-access-attempt-lifecycle",
        },
        partial: { state: "STATE-access-code-partial" },
        populated: { state: "STATE-access-code-filled" },
        overflowing: { state: "STATE-access-code-long-email" },
        recoverableError: { state: "STATE-access-code-wrong" },
        terminalError: { state: "STATE-access-code-expired" },
        permissionDenied: { state: "STATE-access-code-throttled" },
        stale: {
          waived:
            "The only fetched thing this screen shows is the address the code went to, fixed when the attempt began. A code that ages out is not stale data on screen: it is STATE-access-code-expired.",
          witness: "RULE-access-code",
        },
        inFlight: { state: "STATE-access-code-verifying" },
        terminalSuccess: { state: "STATE-access-code-verified" },
        conflict: { state: "STATE-access-code-already-signed-in" },
      },
    },

    // ---------------------------------------------------------------------
    // /sso-callback: the interstitial the browser lands on coming back from
    // Google. It resolves once and leaves, which is why most of its rows are
    // waived rather than built.
    // ---------------------------------------------------------------------
    callback: {
      title: "Coming back from Google",
      checklist: {
        empty: {
          waived:
            "This screen exists only while a redirect resolves. It is never reached without an attempt in progress, and one that arrives without one has already failed: STATE-access-callback-failed.",
          witness: "RULE-access-attempt-lifecycle",
        },
        loading: { state: "STATE-access-callback-working" },
        partial: {
          waived:
            "The callback resolves in one call. There is no half-finished result to draw.",
          witness: "RULE-access-callback-outcome",
        },
        populated: {
          waived:
            "An interstitial is never populated. Its only content is the progress of the redirect it is resolving, which is STATE-access-callback-working.",
          witness: "RULE-access-callback-outcome",
        },
        overflowing: {
          waived:
            "Nothing on this screen comes from user data. It shows one fixed line and a spinner.",
          witness: "RULE-access-callback-outcome",
        },
        recoverableError: { state: "STATE-access-callback-declined" },
        terminalError: { state: "STATE-access-callback-failed" },
        permissionDenied: { state: "STATE-access-callback-blocked" },
        stale: {
          waived:
            "The callback holds no data of its own. It resolves once and leaves.",
          witness: "RULE-access-callback-outcome",
        },
        inFlight: {
          waived:
            "The whole screen is the in-flight moment. STATE-access-callback-working is it, and it is on the loading row.",
          witness: "RULE-access-callback-outcome",
        },
        terminalSuccess: {
          waived:
            "A successful callback never stops to say so; it navigates. The success the person sees is STATE-access-app-signed-in.",
          witness: "RULE-access-callback-outcome",
        },
        conflict: {
          waived:
            "A session that appears in another tab mid-callback simply wins. This screen resolves into the app either way.",
          witness: "RULE-access-attempt-lifecycle",
        },
      },
    },

    // ---------------------------------------------------------------------
    // The signed-in shell at /. One control: sign out. Everything that fills
    // it is a later feature.
    // ---------------------------------------------------------------------
    app: {
      title: "Signed in",
      checklist: {
        empty: {
          waived:
            "This feature ships a shell with one control and no collection, so there is nothing here that can be empty. What fills the app is a later feature -- see Non-goals.",
          review: "2027-03-01",
        },
        loading: { state: "STATE-access-app-loading" },
        partial: {
          waived:
            "The shell shows one thing -- who you are signed in as -- and it arrives whole with the session or not at all.",
          witness: "RULE-access-session",
        },
        populated: { state: "STATE-access-app-signed-in" },
        overflowing: { state: "STATE-access-app-long-identity" },
        recoverableError: { state: "STATE-access-app-signout-failed" },
        terminalError: {
          waived:
            "A shell that cannot resolve a session is not a signed-in shell. The person is sent to the door, which says what went wrong -- RULE-access-route-guard routes an unreachable Clerk to STATE-access-door-unavailable, not to a bare door.",
          witness: "RULE-access-route-guard",
        },
        permissionDenied: {
          waived:
            "There is one control and every signed-in person may use it. Nobody looks at this shell without being allowed to act on it. No rule witnesses this because there is nothing yet to decide: roles, teams and invitations are Non-goals, and the day one arrives this row is the first thing that has to change.",
          review: "2027-03-01",
        },
        stale: { state: "STATE-access-app-session-ended" },
        inFlight: { state: "STATE-access-app-signing-out" },
        terminalSuccess: {
          waived:
            "Signing out ends this surface. The confirmation is on the door, and which door is RULE-access-door-arrival's call: arriving signed-out is STATE-access-door-signed-out, not the resting door.",
          witness: "RULE-access-door-arrival",
        },
        conflict: {
          waived:
            "A session ended in another tab is the same fact as a session ended anywhere else, and this shell shows STATE-access-app-session-ended either way.",
          witness: "RULE-access-session",
        },
      },
    },
  },

  // What each declared state *is*, in one line -- said here, where the state is
  // declared, because the board is read from /draft-skeleton until
  // /render-states and nothing renders for the whole of that stretch. The bar
  // is what the person is looking at, not which of the twelve rows it answers.
  states: {
    // --- the door ---------------------------------------------------------
    "STATE-access-door-empty":
      "An empty address field with Continue under it, and Continue with Google below that",
    "STATE-access-door-loading":
      "The sign-in card with \u201cGetting ready\u2026\u201d standing in for both of its buttons",
    "STATE-access-door-filled":
      "An address typed into the field, and Continue ready to press",
    "STATE-access-door-long-email":
      "A 250-character address scrolling inside the field, the card no wider for it",
    "STATE-access-door-rejected":
      "The address still in the field, with one line under it saying what is wrong",
    "STATE-access-door-unavailable":
      "\u201cSign-in is unavailable\u201d where the form was, saying plainly that it is us and not them",
    "STATE-access-door-blocked":
      "\u201cThis address cannot be used to sign in\u201d and a person to email \u2014 and no hint either way about whether an account exists",
    "STATE-access-door-sending":
      "The field frozen and \u201cSending your code\u2026\u201d where Continue was",
    "STATE-access-door-signed-out":
      "\u201cYou are signed out\u201d sitting above the sign-in form, ready to go back in",
    "STATE-access-door-already-signed-in":
      "\u201cYou are already signed in\u201d and a link straight to their reminders, in place of the form",

    // --- the code screen --------------------------------------------------
    "STATE-access-code-empty":
      "Six empty digit boxes, under the address the code was sent to",
    "STATE-access-code-partial":
      "Three of the six boxes filled, with Continue not yet pressable",
    "STATE-access-code-filled":
      "All six digits in, and Continue ready to press",
    "STATE-access-code-long-email":
      "A 250-character address wrapped over the digit boxes in the \u201cwe sent a code to\u201d line",
    "STATE-access-code-wrong":
      "The boxes cleared, and a line saying that code is not right",
    "STATE-access-code-expired":
      "\u201cThat code has expired\u201d and a Start again button, the digit boxes gone",
    "STATE-access-code-throttled":
      "\u201cToo many tries\u201d with no countdown to read, and nothing pressable",
    "STATE-access-code-verifying":
      "The six digits still on screen and \u201cChecking your code\u2026\u201d where Continue was",
    "STATE-access-code-verified":
      "\u201cYou are in\u201d and nothing to press, a moment before the app takes over",
    "STATE-access-code-already-signed-in":
      "\u201cYou signed in in another tab\u201d and a link to their reminders, in place of the digit boxes",

    // --- coming back from Google -----------------------------------------
    "STATE-access-callback-working":
      "A spinner and \u201cFinishing up with Google\u2026\u201d on an otherwise bare page",
    "STATE-access-callback-declined":
      "\u201cGoogle sign-in was cancelled\u201d, saying nothing happened, and a way back to the door",
    "STATE-access-callback-failed":
      "\u201cGoogle could not sign you in\u201d and the offer of a code instead",
    "STATE-access-callback-blocked":
      "\u201cThis address cannot be used here\u201d after Google already accepted them, and a person to email",

    // --- the signed-in shell ---------------------------------------------
    "STATE-access-app-loading":
      "The shell\u2019s frame with \u201cLoading\u2026\u201d where the address will be",
    "STATE-access-app-signed-in":
      "\u201cSigned in as\u201d their address, with one Sign out button",
    "STATE-access-app-long-identity":
      "A 250-character address truncated on the shell rather than pushing Sign out off the screen",
    "STATE-access-app-signout-failed":
      "Still signed in, with \u201cSign out did not go through. Try again.\u201d under the button",
    "STATE-access-app-session-ended":
      "\u201cYour session ended\u201d over the shell, with Sign in as the only thing to press",
    "STATE-access-app-signing-out":
      "\u201cSigning out\u2026\u201d where the Sign out button was",
  },

  // `spec.ts` is not a `.tsx`, so the cases name their sketch rather than
  // writing it as markup. Each one hands its sketch the fixture and nothing
  // else: no props assembled here, no state decided at the call site.
  cases: {
    // --- the door -------------------------------------------------------
    "STATE-access-door-empty": {
      surface: "door",
      render: () => createElement(sketches.DoorEmpty, fixtures.accessDoorEmpty),
    },
    "STATE-access-door-loading": {
      surface: "door",
      render: () =>
        createElement(sketches.DoorLoading, fixtures.accessDoorLoading),
    },
    "STATE-access-door-filled": {
      surface: "door",
      render: () =>
        createElement(sketches.DoorFilled, fixtures.accessDoorFilled),
    },
    "STATE-access-door-long-email": {
      surface: "door",
      render: () =>
        createElement(sketches.DoorLongEmail, fixtures.accessDoorLongEmail),
    },
    "STATE-access-door-rejected": {
      surface: "door",
      render: () =>
        createElement(sketches.DoorRejected, fixtures.accessDoorRejected),
    },
    "STATE-access-door-unavailable": {
      surface: "door",
      render: () =>
        createElement(sketches.DoorUnavailable, fixtures.accessDoorUnavailable),
    },
    "STATE-access-door-blocked": {
      surface: "door",
      render: () =>
        createElement(sketches.DoorBlocked, fixtures.accessDoorBlocked),
    },
    "STATE-access-door-sending": {
      surface: "door",
      render: () =>
        createElement(sketches.DoorSending, fixtures.accessDoorSending),
    },
    "STATE-access-door-signed-out": {
      surface: "door",
      render: () =>
        createElement(sketches.DoorSignedOut, fixtures.accessDoorSignedOut),
    },
    "STATE-access-door-already-signed-in": {
      surface: "door",
      render: () =>
        createElement(
          sketches.DoorAlreadySignedIn,
          fixtures.accessDoorAlreadySignedIn
        ),
    },

    // --- the code screen ------------------------------------------------
    "STATE-access-code-empty": {
      surface: "code",
      render: () => createElement(sketches.CodeEmpty, fixtures.accessCodeEmpty),
    },
    "STATE-access-code-partial": {
      surface: "code",
      render: () =>
        createElement(sketches.CodePartial, fixtures.accessCodePartial),
    },
    "STATE-access-code-filled": {
      surface: "code",
      render: () =>
        createElement(sketches.CodeFilled, fixtures.accessCodeFilled),
    },
    "STATE-access-code-long-email": {
      surface: "code",
      render: () =>
        createElement(sketches.CodeLongEmail, fixtures.accessCodeLongEmail),
    },
    "STATE-access-code-wrong": {
      surface: "code",
      render: () => createElement(sketches.CodeWrong, fixtures.accessCodeWrong),
    },
    "STATE-access-code-expired": {
      surface: "code",
      render: () =>
        createElement(sketches.CodeExpired, fixtures.accessCodeExpired),
    },
    "STATE-access-code-throttled": {
      surface: "code",
      render: () =>
        createElement(sketches.CodeThrottled, fixtures.accessCodeThrottled),
    },
    "STATE-access-code-verifying": {
      surface: "code",
      render: () =>
        createElement(sketches.CodeVerifying, fixtures.accessCodeVerifying),
    },
    "STATE-access-code-verified": {
      surface: "code",
      render: () =>
        createElement(sketches.CodeVerified, fixtures.accessCodeVerified),
    },
    "STATE-access-code-already-signed-in": {
      surface: "code",
      render: () =>
        createElement(
          sketches.CodeAlreadySignedIn,
          fixtures.accessCodeAlreadySignedIn
        ),
    },

    // --- coming back from Google -----------------------------------------
    "STATE-access-callback-working": {
      surface: "callback",
      render: () =>
        createElement(sketches.CallbackWorking, fixtures.accessCallbackWorking),
    },
    "STATE-access-callback-declined": {
      surface: "callback",
      render: () =>
        createElement(
          sketches.CallbackDeclined,
          fixtures.accessCallbackDeclined
        ),
    },
    "STATE-access-callback-failed": {
      surface: "callback",
      render: () =>
        createElement(sketches.CallbackFailed, fixtures.accessCallbackFailed),
    },
    "STATE-access-callback-blocked": {
      surface: "callback",
      render: () =>
        createElement(sketches.CallbackBlocked, fixtures.accessCallbackBlocked),
    },

    // --- the signed-in shell ---------------------------------------------
    "STATE-access-app-loading": {
      surface: "app",
      render: () =>
        createElement(sketches.AppLoading, fixtures.accessAppLoading),
    },
    "STATE-access-app-signed-in": {
      surface: "app",
      render: () =>
        createElement(sketches.AppSignedIn, fixtures.accessAppSignedIn),
    },
    "STATE-access-app-long-identity": {
      surface: "app",
      render: () =>
        createElement(sketches.AppLongIdentity, fixtures.accessAppLongIdentity),
    },
    "STATE-access-app-signout-failed": {
      surface: "app",
      render: () =>
        createElement(
          sketches.AppSignoutFailed,
          fixtures.accessAppSignoutFailed
        ),
    },
    "STATE-access-app-session-ended": {
      surface: "app",
      render: () =>
        createElement(sketches.AppSessionEnded, fixtures.accessAppSessionEnded),
    },
    "STATE-access-app-signing-out": {
      surface: "app",
      render: () =>
        createElement(sketches.AppSigningOut, fixtures.accessAppSigningOut),
    },
  },

  flows: [
    {
      id: "JOURNEY-access-first-account",
      title: "A new visitor gets an account with an emailed code",
      actor: "New visitor",
      spine: [
        {
          case: "STATE-access-door-empty",
          on: "Types the address they read email at",
        },
        { case: "STATE-access-door-filled", on: "Presses Continue" },
        {
          case: "STATE-access-door-sending",
          on: "Clerk sends the code and the screen changes",
        },
        {
          case: "STATE-access-code-empty",
          on: "Types the six digits from the email",
        },
        { case: "STATE-access-code-filled", on: "Presses Continue" },
        {
          case: "STATE-access-code-verifying",
          on: "Clerk accepts the code, then transfers the verified attempt into a new account",
        },
        { case: "STATE-access-code-verified", on: "The app takes over" },
        {
          case: "STATE-access-app-signed-in",
          end: "An account of their own, and a shell that names the address it belongs to.",
        },
      ],
      deviations: [
        {
          from: "STATE-access-door-empty",
          when: "Clerk's script has not finished loading",
          case: "STATE-access-door-loading",
          rejoins: "STATE-access-door-empty",
        },
        {
          from: "STATE-access-door-empty",
          when: "The address runs to 250 characters",
          case: "STATE-access-door-long-email",
          rejoins: "STATE-access-door-filled",
        },
        {
          from: "STATE-access-door-filled",
          when: "What they typed is not an address",
          case: "STATE-access-door-rejected",
          rejoins: "STATE-access-door-filled",
        },
        {
          from: "STATE-access-door-empty",
          when: "Clerk cannot be reached at all",
          case: "STATE-access-door-unavailable",
          end: "No way in, and a screen that makes clear it is us and not them, so they try again later rather than doubting their own address.",
        },
        {
          from: "STATE-access-code-empty",
          when: "Three of the six digits are in",
          case: "STATE-access-code-partial",
          rejoins: "STATE-access-code-filled",
        },
        {
          from: "STATE-access-code-empty",
          when: "The address the code went to runs to 250 characters",
          case: "STATE-access-code-long-email",
          rejoins: "STATE-access-code-filled",
        },
        {
          from: "STATE-access-code-filled",
          when: "The digits do not match",
          case: "STATE-access-code-wrong",
          rejoins: "STATE-access-code-empty",
        },
        {
          from: "STATE-access-code-filled",
          when: "The code is more than ten minutes old",
          case: "STATE-access-code-expired",
          rejoins: "STATE-access-door-filled",
        },
        {
          from: "STATE-access-door-sending",
          when: "A sixth address submitted inside ten seconds",
          case: "STATE-access-door-rejected",
          rejoins: "STATE-access-door-filled",
        },
        {
          from: "STATE-access-code-filled",
          when: "A fourth try inside ten seconds",
          case: "STATE-access-code-throttled",
          rejoins: "STATE-access-code-filled",
        },
      ],
    },

    {
      id: "JOURNEY-access-with-google",
      title: "A new visitor gets an account with their Google account",
      actor: "New visitor",
      spine: [
        { case: "STATE-access-door-empty", on: "Presses Continue with Google" },
        {
          case: "STATE-access-door-sending",
          on: "The browser leaves for Google, they consent, and Google sends them back",
        },
        {
          case: "STATE-access-callback-working",
          on: "Clerk links the account and finalizes the session",
        },
        {
          case: "STATE-access-app-signed-in",
          end: "An account of their own, and a shell that names the Google address it belongs to.",
        },
      ],
      deviations: [
        {
          from: "STATE-access-callback-working",
          when: "Google sends them back having declined consent",
          case: "STATE-access-callback-declined",
          rejoins: "STATE-access-door-empty",
        },
        {
          from: "STATE-access-callback-working",
          when: "Google's address is already claimed by another account, or the exchange fails",
          case: "STATE-access-callback-failed",
          rejoins: "STATE-access-door-empty",
        },
        {
          from: "STATE-access-callback-working",
          when: "Google returns an address it has not verified and an account already holds it, so Clerk sends a code before it will link them",
          case: "STATE-access-code-empty",
          rejoins: "STATE-access-app-signed-in",
        },
        {
          from: "STATE-access-callback-working",
          when: "The Google address is one this instance refuses",
          case: "STATE-access-callback-blocked",
          end: "Told this address cannot be used here and given a person to ask about it, rather than being sent round the Google loop again to the same answer.",
        },
        {
          from: "STATE-access-door-sending",
          when: "Google cannot be started at all",
          case: "STATE-access-door-rejected",
          rejoins: "STATE-access-door-empty",
        },
      ],
    },

    {
      id: "JOURNEY-access-return",
      title: "A returning member gets back in",
      actor: "Returning member",
      spine: [
        {
          case: "STATE-access-door-empty",
          on: "Types the address the account is under",
        },
        { case: "STATE-access-door-filled", on: "Presses Continue" },
        {
          case: "STATE-access-door-sending",
          on: "Clerk sends the code and the screen changes",
        },
        {
          case: "STATE-access-code-empty",
          on: "Types the six digits from the email",
        },
        { case: "STATE-access-code-filled", on: "Presses Continue" },
        {
          case: "STATE-access-code-verifying",
          on: "Clerk accepts the code and revives the session",
        },
        { case: "STATE-access-code-verified", on: "The app takes over" },
        {
          case: "STATE-access-app-signed-in",
          end: "Back in, with everything as they left it and nothing new to remember.",
        },
      ],
      deviations: [
        {
          from: "STATE-access-door-empty",
          when: "They are already signed in in another tab",
          case: "STATE-access-door-already-signed-in",
          rejoins: "STATE-access-app-signed-in",
        },
        {
          from: "STATE-access-code-empty",
          when: "They finish signing in in another tab while this screen waits",
          case: "STATE-access-code-already-signed-in",
          rejoins: "STATE-access-app-signed-in",
        },
        {
          from: "STATE-access-door-filled",
          when: "The address is one this instance refuses -- which says nothing about whether an account exists",
          case: "STATE-access-door-blocked",
          end: "Told this address cannot be used here and given a person to ask about it -- never told whether an account exists behind it, which is the one thing this screen must not say.",
        },
      ],
    },

    {
      id: "JOURNEY-access-sign-out",
      title: "A signed-in member gets out on a machine that is not theirs",
      actor: "Signed-in member",
      spine: [
        { case: "STATE-access-app-signed-in", on: "Presses Sign out" },
        { case: "STATE-access-app-signing-out", on: "Clerk ends the session" },
        {
          case: "STATE-access-door-signed-out",
          end: "Out, told so in as many words, and looking at the way back in.",
        },
      ],
      deviations: [
        {
          from: "STATE-access-app-signed-in",
          when: "The page is still resolving the session",
          case: "STATE-access-app-loading",
          rejoins: "STATE-access-app-signed-in",
        },
        {
          from: "STATE-access-app-signed-in",
          when: "The address on the shell runs to 250 characters",
          case: "STATE-access-app-long-identity",
          rejoins: "STATE-access-app-signed-in",
        },
        {
          from: "STATE-access-app-signed-in",
          when: "The session was ended elsewhere and this tab has not noticed for up to a minute",
          case: "STATE-access-app-session-ended",
          rejoins: "STATE-access-door-signed-out",
        },
        {
          from: "STATE-access-app-signing-out",
          when: "The network drops mid-sign-out",
          case: "STATE-access-app-signout-failed",
          rejoins: "STATE-access-app-signing-out",
        },
      ],
    },
  ],
})
