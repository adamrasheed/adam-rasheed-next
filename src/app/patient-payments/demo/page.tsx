import type { Metadata } from "next";
import DemoCheckout from "./_components/DemoCheckout";

export const metadata: Metadata = {
  title: "Demo: Patient Payment Page | Adam Rasheed",
  description:
    "A live demo of the patient payment experience I install for sleep clinics. No real charge. Click through exactly what your patient sees.",
  robots: { index: false },
};

export default function PatientPaymentsDemoPage() {
  return <DemoCheckout />;
}
