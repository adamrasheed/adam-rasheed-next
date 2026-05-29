import SignUpForm from "./_components/SignUpForm";

export const metadata = {
  title: "Stay in the Loop — Adam Rasheed Ceramics",
  description:
    "Sign up to get notified when new handmade ceramic pieces are available.",
};

export default function CeramicsSignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="small-caps tracking-widest text-xs opacity-50 mb-3">
            Adam Rasheed Ceramics
          </p>
          <h1 className="text-3xl font-semibold mb-4 leading-tight">
            Stay updated about the latest drops
          </h1>
          <p className="text-sm opacity-60 leading-relaxed">
            Sign up and I&apos;ll let you know when new handmade pieces are
            available.
          </p>
        </div>

        <SignUpForm />
      </div>
    </div>
  );
}
