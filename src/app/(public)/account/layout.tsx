import { AccountNav } from "./nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
      <AccountNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
