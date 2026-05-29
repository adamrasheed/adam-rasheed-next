"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function SignUpForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  async function onSubmit(data: FormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/mailchimp/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        let message = "Something went wrong. Please try again.";
        try {
          const body = await res.json();
          if (typeof body?.error === "string") message = body.error;
        } catch {
          // non-JSON response — use fallback
        }
        setServerError(message);
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-xl font-medium mb-2">You&apos;re on the list!</p>
        <p className="text-sm opacity-60">
          I&apos;ll reach out when new pieces are available.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          autoComplete="given-name"
          aria-invalid={!!errors.firstName}
          aria-describedby={errors.firstName ? "firstName-error" : undefined}
          className="border border-slate-400 focus:border-slate-400"
          {...register("firstName", { required: "First name is required." })}
        />
        {errors.firstName && (
          <p id="firstName-error" role="alert" className="text-xs text-red-500 mt-1">
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="border border-slate-400 focus:border-slate-400"
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address.",
            },
          })}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-red-500 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {serverError && <p role="alert" className="text-xs text-red-500">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn primary mt-2 px-6 py-3 w-full text-center justify-center disabled:opacity-50"
      >
        {isSubmitting ? "Subscribing…" : "Sign up"}
      </button>

      <p className="text-xs opacity-40 text-center">
        No spam. Unsubscribe any time.
      </p>
    </form>
  );
}
