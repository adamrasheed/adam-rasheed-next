import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import PageWrapper from "../_components/PageWrapper";

export const metadata: Metadata = {
  title: "Patient Payment Links for Sleep Clinics | Adam Rasheed",
  description:
    "Stop chasing copays over the phone. I set up secure payment links for independent sleep clinics. Patients pay from their phone in two minutes, and the device ships the same day.",
};

const CONTACT_EMAIL = "adamrasheed91@gmail.com";
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Patient payment links for our clinic"
)}`;

const STEPS = [
  {
    title: "You send a link",
    body: "Your staff adds one line to the email they already send: “Pay securely here.” No new software to learn, no change to how you verify insurance or quote costs.",
  },
  {
    title: "The patient pays in two minutes",
    body: "From their phone, with Apple Pay, Google Pay, or card. No account to create, no phone call to schedule, no card number read aloud to a stranger.",
  },
  {
    title: "You ship the same day",
    body: "The payment lands directly in your bank account and your staff gets an instant notification. The device goes out while the referral is still warm.",
  },
];

const INCLUDED = [
  "A branded payment page for your clinic, wired into the emails and texts your staff already send",
  "Built in your own Stripe account, connected to your own bank. The money is always yours; I never touch funds",
  "Automatic receipts for patients and instant payment notifications for your staff",
  "A live training call so your whole front desk can send links on day one",
  "90-day guarantee: if anything I installed breaks, I fix it free",
];

const FAQS = [
  {
    question: "Doesn’t our billing software already do this?",
    answer:
      "Maybe on paper. Most practice-management systems have a payment feature that nobody ever set up, tested, or trusts. If your existing system can genuinely do the job, I’ll configure that instead. You’re paying for working payment links in a week, not for me to build something for the sake of building it.",
  },
  {
    question: "Whose account does the money go into?",
    answer:
      "Yours. Everything is set up in your own Stripe account, connected to your own bank. I never hold, route, or touch your funds. I couldn’t if I wanted to.",
  },
  {
    question: "What does the patient actually see?",
    answer:
      "Try it yourself: the demo below is exactly what your patient gets, start to finish, on their own phone.",
  },
  {
    question: "Is patient information kept out of it?",
    answer:
      "Yes, by design. The payment page shows an invoice number and an amount. No diagnosis, no service details, no clinical information anywhere in the payment flow.",
  },
  {
    question: "What happens if something breaks after you’re done?",
    answer:
      "Anything I installed is covered free for 90 days. After that, fixes are billed hourly, or covered under the monthly retainer if you’d rather never think about it.",
  },
  {
    question: "How fast is “a week”?",
    answer:
      "Five business days from our kickoff call to your staff sending real payment links, in most cases. The slowest step is usually Stripe verifying your business details, and I walk you through that on day one.",
  },
];

export default function PatientPaymentsPage() {
  return (
    <PageWrapper className="px-8 lg:px-0">
      {/* Hero */}
      <section className={clsx("max-w-3xl", "!pt-10", "md:!pt-16")}>
        <p className={clsx("small-caps", "tracking-wider", "text-sm", "mb-4")}>
          Patient payments for sleep clinics
        </p>
        <h1
          className={clsx(
            "font-black",
            "text-4xl",
            "md:text-5xl",
            "text-balance",
            "mb-6"
          )}
        >
          Stop chasing copays over the phone.
        </h1>
        <p className={clsx("text-lg", "max-w-[55ch]", "mb-8")}>
          I set up secure payment links for independent sleep clinics. Patients
          pay from their phone in two minutes, the money lands in your account,
          and the device ships the same day. One flat fee, installed in a week.
        </p>
        <div className={clsx("flex", "flex-wrap", "gap-4")}>
          <Link href="/patient-payments/demo" className="btn primary">
            See what your patient gets
          </Link>
          <a href={CONTACT_HREF} className="btn">
            Get in touch
          </a>
        </div>
      </section>

      {/* The bottleneck */}
      <section className="max-w-3xl">
        <h2 className={clsx("font-black", "text-3xl", "text-balance", "mb-6")}>
          Your workflow is digital, except the step that starts it.
        </h2>
        <div className={clsx("grid", "gap-4", "max-w-[65ch]")}>
          <p>
            A referral comes in. You verify insurance and quote the patient
            their cost. The study itself is fully remote: an app with
            step-by-step instructions, a device shipped to their door, a
            prepaid return envelope.
          </p>
          <p>
            Then everything stops, because payment means catching the patient
            on the phone and taking a card number by voice. They don’t pick up.
            They mean to call back. Days go by, sometimes weeks. The device
            can’t ship until the payment lands, so the study waits, the results
            wait, and the referring physician wonders what happened to their
            patient.
          </p>
          <p className="font-bold">
            A stalled payment isn’t a billing problem. It’s a referral sitting
            in limbo.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl">
        <h2 className={clsx("font-black", "text-3xl", "text-balance", "mb-8")}>
          One link replaces the phone tag.
        </h2>
        <ol className={clsx("grid", "gap-8", "mb-8")}>
          {STEPS.map((step, i) => (
            <li key={step.title} className={clsx("grid", "gap-1")}>
              <h3 className={clsx("font-bold", "text-xl")}>
                <span
                  className={clsx(
                    "small-caps",
                    "tracking-wider",
                    "text-sm",
                    "font-semibold",
                    "block"
                  )}
                >
                  Step {i + 1}
                </span>
                {step.title}
              </h3>
              <p className="max-w-[60ch]">{step.body}</p>
            </li>
          ))}
        </ol>
        <p
          className={clsx(
            "max-w-[60ch]",
            "border-l-2",
            "border-current",
            "pl-4",
            "text-sm"
          )}
        >
          Card numbers never end up in voicemails, inboxes, or on sticky notes.
          Patients enter their card once, on an encrypted page, and your staff
          never see or handle it. The payment page carries no clinical
          information: an invoice number and an amount, nothing else.
        </p>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl">
        <h2 className={clsx("font-black", "text-3xl", "text-balance", "mb-6")}>
          Flat fee. Installed in a week.
        </h2>
        <p className={clsx("text-4xl", "font-black", "mb-1")}>$2,500</p>
        <p className={clsx("small-caps", "tracking-wider", "text-sm", "mb-8")}>
          One-time. No percentage of your payments, no contract
        </p>
        <ul className={clsx("grid", "gap-3", "mb-8", "max-w-[65ch]")}>
          {INCLUDED.map((item) => (
            <li key={item} className={clsx("grid", "grid-cols-[auto_1fr]", "gap-3")}>
              <span aria-hidden="true" className="font-bold">
                &ndash;
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className={clsx("max-w-[60ch]", "mb-8")}>
          If your front desk spends even a few hours a week chasing payments,
          the install pays for itself in staff time alone, before counting the
          studies that stall out entirely.
        </p>
        <div
          className={clsx(
            "bg-bgSecondaryHover",
            "dark:bg-sky-900",
            "p-6",
            "max-w-[65ch]"
          )}
        >
          <h3 className={clsx("font-bold", "mb-2")}>
            Optional: $200/month retainer
          </h3>
          <p className="text-sm">
            Keeps me on call after the install: copy changes, additional
            payment pages, re-training new front-desk staff, and monitoring so
            problems get fixed before you notice them.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl">
        <h2 className={clsx("font-black", "text-3xl", "mb-8")}>
          Questions owners ask
        </h2>
        <div className={clsx("grid", "gap-8")}>
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <h3 className={clsx("font-bold", "text-lg", "mb-1")}>
                {faq.question}
              </h3>
              <p className={clsx("max-w-[65ch]")}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who I am */}
      <section className="max-w-3xl">
        <h2 className={clsx("font-black", "text-3xl", "mb-6")}>
          Who’s behind this
        </h2>
        <div className={clsx("grid", "gap-4", "max-w-[65ch]")}>
          <p>
            I’m Adam Rasheed, a software engineer in Los Angeles. I’ve spent
            years building payment and e-commerce systems on Stripe and
            Shopify, the same infrastructure behind this service. You can see
            my work in my <Link href="/case-studies">case studies</Link>.
          </p>
          <p>
            This page exists because I was a home-sleep-study patient myself,
            and paying by phone was the one broken step in an otherwise
            seamless experience.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl">
        <h2 className={clsx("font-black", "text-3xl", "text-balance", "mb-4")}>
          Try the demo, then let’s talk.
        </h2>
        <p className={clsx("max-w-[60ch]", "mb-8")}>
          Email me at <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a>. Tell me
          roughly how many studies you run a month, and I’ll tell you honestly
          whether this is worth it for your clinic.
        </p>
        <div className={clsx("flex", "flex-wrap", "gap-4")}>
          <Link href="/patient-payments/demo" className="btn primary">
            See what your patient gets
          </Link>
          <a href={CONTACT_HREF} className="btn">
            Email me
          </a>
        </div>
      </section>
    </PageWrapper>
  );
}
