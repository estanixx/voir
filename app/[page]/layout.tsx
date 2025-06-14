import { BackgroundTransition } from "@/components/shared/background-transition";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundTransition />

      <div className="w-full">
        <div className="mx-8 max-w-2xl py-20 sm:mx-auto">{children}</div>
      </div>
    </>
  );
}
