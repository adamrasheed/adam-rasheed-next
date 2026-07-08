"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faApple } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleCheck,
  faLock,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";

const CLINIC_NAME = "Restwell Sleep Diagnostics";
const INVOICE_NUMBER = "RW-1042";
const AMOUNT = "$95.00";
const TEST_CARD = "4242 4242 4242 4242";

type Fields = {
  email: string;
  name: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  zip: string;
};

const EMPTY_FIELDS: Fields = {
  email: "",
  name: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  zip: "",
};

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const validate = (fields: Fields): Partial<Record<keyof Fields, string>> => {
  const errors: Partial<Record<keyof Fields, string>> = {};

  if (!fields.email.trim() || !fields.email.includes("@")) {
    errors.email = "Enter the email where your receipt should go.";
  }
  if (!fields.name.trim()) {
    errors.name = "Enter the name on the card.";
  }
  if (fields.cardNumber.replace(/\D/g, "").length !== 16) {
    errors.cardNumber = `Enter a 16-digit card number (demo: ${TEST_CARD}).`;
  }
  const [month] = fields.expiry.split("/");
  if (
    fields.expiry.replace(/\D/g, "").length !== 4 ||
    Number(month) < 1 ||
    Number(month) > 12
  ) {
    errors.expiry = "Enter an expiration date as MM/YY.";
  }
  if (!/^\d{3,4}$/.test(fields.cvc)) {
    errors.cvc = "Enter the 3 or 4 digit code.";
  }
  if (!/^\d{5}$/.test(fields.zip.trim())) {
    errors.zip = "Enter a 5-digit ZIP code.";
  }

  return errors;
};

const DemoBanner = () => (
  <div
    className={clsx(
      "bg-slate-900",
      "text-white",
      "text-center",
      "text-sm",
      "px-4",
      "py-3"
    )}
  >
    <p>
      <span className={clsx("font-bold", "small-caps", "tracking-wider")}>
        Interactive demo
      </span>
      : no real charge. This is what your patient sees.{" "}
      <Link
        href="/patient-payments"
        className={clsx("underline", "text-white")}
      >
        Back to the service page
      </Link>
    </p>
  </div>
);

const ClinicHeader = () => (
  <div className={clsx("flex", "items-center", "gap-3", "mb-6")}>
    <span
      className={clsx(
        "grid",
        "place-items-center",
        "w-10",
        "h-10",
        "rounded-full",
        "bg-indigo-900",
        "text-white"
      )}
    >
      <FontAwesomeIcon icon={faMoon} />
    </span>
    <div>
      <p className={clsx("font-bold", "leading-tight")}>{CLINIC_NAME}</p>
      <p className={clsx("text-xs", "text-slate-500")}>
        Patient payment portal
      </p>
    </div>
  </div>
);

const OrderSummary = () => (
  <div
    className={clsx(
      "flex",
      "justify-between",
      "items-baseline",
      "border-b",
      "border-slate-200",
      "pb-4",
      "mb-6"
    )}
  >
    <div>
      <p className="font-bold">Home Sleep Study</p>
      <p className={clsx("text-xs", "text-slate-500")}>
        Invoice #{INVOICE_NUMBER}
      </p>
    </div>
    <p className={clsx("text-2xl", "font-black")}>{AMOUNT}</p>
  </div>
);

type FieldProps = {
  id: keyof Fields;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "numeric";
  onChange: React.Dispatch<string>;
};

const Field = ({
  id,
  label,
  value,
  error,
  placeholder,
  inputMode = "text",
  onChange,
}: FieldProps) => (
  <div>
    <label htmlFor={id} className="text-slate-600">
      {label}
    </label>
    <input
      id={id}
      name={id}
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      autoComplete="off"
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={clsx(
        "rounded-md",
        "border",
        "bg-white",
        "text-slate-900",
        error ? "border-red-500" : "border-slate-300"
      )}
    />
    {error && (
      <p id={`${id}-error`} role="alert" className={clsx("text-xs", "text-red-600", "mt-1")}>
        {error}
      </p>
    )}
  </div>
);

const SuccessView = ({ email, onReset }: { email: string; onReset: () => void }) => (
  <div className="text-center">
    <FontAwesomeIcon
      icon={faCircleCheck}
      className={clsx("text-green-600", "text-5xl", "mb-4")}
    />
    <h1 className={clsx("text-2xl", "font-black", "mb-2")}>Payment received</h1>
    <p className={clsx("text-slate-600", "mb-6")}>
      {AMOUNT} &middot; Invoice #{INVOICE_NUMBER}
    </p>
    <div
      className={clsx(
        "text-left",
        "text-sm",
        "text-slate-600",
        "bg-slate-50",
        "border",
        "border-slate-200",
        "rounded-md",
        "p-4",
        "mb-6",
        "grid",
        "gap-2"
      )}
    >
      <p>
        A receipt was sent to <span className="font-bold">{email}</span>.
      </p>
      <p>
        Your sleep study device ships within{" "}
        <span className="font-bold">2 business days</span>. You’ll get an email
        with the app to download and your activation code.
      </p>
    </div>
    <p className={clsx("text-xs", "text-slate-400", "mb-6")}>
      In a real install, your front desk just got a payment notification. No
      phone call happened, and nobody handled a card number.
    </p>
    <div className={clsx("flex", "justify-center", "gap-4", "flex-wrap")}>
      <button onClick={onReset} className="btn">
        Run the demo again
      </button>
      <Link href="/patient-payments" className="btn primary">
        Back to the service page
      </Link>
    </div>
  </div>
);

export default function DemoCheckout() {
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {}
  );
  const [status, setStatus] = useState<"idle" | "processing" | "paid">("idle");

  const setField = (id: keyof Fields, value: string) => {
    const formatted =
      id === "cardNumber"
        ? formatCardNumber(value)
        : id === "expiry"
          ? formatExpiry(value)
          : id === "cvc" || id === "zip"
            ? value.replace(/\D/g, "").slice(0, id === "cvc" ? 4 : 5)
            : value;
    setFields((prev) => ({ ...prev, [id]: formatted }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const simulatePayment = () => {
    setStatus("processing");
    setTimeout(() => setStatus("paid"), 1400);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    simulatePayment();
  };

  const handleWalletPay = () => {
    if (!fields.email.trim() || !fields.email.includes("@")) {
      setFields((prev) => ({ ...prev, email: "patient@example.com" }));
    }
    simulatePayment();
  };

  const handleReset = () => {
    setFields(EMPTY_FIELDS);
    setErrors({});
    setStatus("idle");
  };

  const isProcessing = status === "processing";

  return (
    <div
      className={clsx(
        "min-h-screen",
        "w-full",
        "bg-slate-100",
        "text-slate-900"
      )}
    >
      <DemoBanner />
      <div className={clsx("max-w-md", "mx-auto", "px-4", "py-8", "md:py-12")}>
        <div
          className={clsx(
            "bg-white",
            "rounded-xl",
            "shadow-md",
            "p-6",
            "md:p-8"
          )}
        >
          {status === "paid" ? (
            <SuccessView
              email={fields.email || "patient@example.com"}
              onReset={handleReset}
            />
          ) : (
            <>
              <ClinicHeader />
              <OrderSummary />

              <button
                type="button"
                onClick={handleWalletPay}
                disabled={isProcessing}
                className={clsx(
                  "w-full",
                  "bg-black",
                  "text-white",
                  "rounded-md",
                  "py-3",
                  "font-semibold",
                  "mb-4",
                  "disabled:opacity-60"
                )}
              >
                <FontAwesomeIcon icon={faApple} className="mr-2" />
                Pay
              </button>

              <div
                className={clsx(
                  "flex",
                  "items-center",
                  "gap-3",
                  "text-xs",
                  "text-slate-400",
                  "mb-4"
                )}
              >
                <span className={clsx("h-px", "flex-1", "bg-slate-200")} />
                or pay with card
                <span className={clsx("h-px", "flex-1", "bg-slate-200")} />
              </div>

              <form
                onSubmit={handleCardSubmit}
                noValidate
                className={clsx("grid", "gap-4")}
              >
                <Field
                  id="email"
                  label="Email for receipt"
                  value={fields.email}
                  error={errors.email}
                  placeholder="you@example.com"
                  inputMode="email"
                  onChange={(v) => setField("email", v)}
                />
                <Field
                  id="name"
                  label="Name on card"
                  value={fields.name}
                  error={errors.name}
                  placeholder="Jane Doe"
                  onChange={(v) => setField("name", v)}
                />
                <Field
                  id="cardNumber"
                  label="Card number"
                  value={fields.cardNumber}
                  error={errors.cardNumber}
                  placeholder={TEST_CARD}
                  inputMode="numeric"
                  onChange={(v) => setField("cardNumber", v)}
                />
                <div className={clsx("grid", "grid-cols-3", "gap-4")}>
                  <Field
                    id="expiry"
                    label="Expires"
                    value={fields.expiry}
                    error={errors.expiry}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    onChange={(v) => setField("expiry", v)}
                  />
                  <Field
                    id="cvc"
                    label="CVC"
                    value={fields.cvc}
                    error={errors.cvc}
                    placeholder="123"
                    inputMode="numeric"
                    onChange={(v) => setField("cvc", v)}
                  />
                  <Field
                    id="zip"
                    label="ZIP"
                    value={fields.zip}
                    error={errors.zip}
                    placeholder="90001"
                    inputMode="numeric"
                    onChange={(v) => setField("zip", v)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={clsx(
                    "w-full",
                    "bg-indigo-900",
                    "text-white",
                    "rounded-md",
                    "py-3",
                    "font-semibold",
                    "disabled:opacity-60"
                  )}
                >
                  {isProcessing ? "Processing…" : `Pay ${AMOUNT}`}
                </button>
              </form>

              <p
                className={clsx(
                  "text-xs",
                  "text-slate-400",
                  "text-center",
                  "mt-4"
                )}
              >
                <FontAwesomeIcon icon={faLock} className="mr-1" />
                Encrypted and secure. Demo mode: use card {TEST_CARD}, any
                future date, any CVC.
              </p>
            </>
          )}
        </div>
        <p
          className={clsx(
            "text-center",
            "text-xs",
            "text-slate-400",
            "mt-6",
            "max-w-[40ch]",
            "mx-auto"
          )}
        >
          {CLINIC_NAME} is a fictional clinic. Your install gets your clinic’s
          name, your invoice numbers, and your bank account.
        </p>
      </div>
    </div>
  );
}
