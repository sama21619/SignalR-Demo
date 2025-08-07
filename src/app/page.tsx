import SignalRClient from "@/components/SignalRClient";

export default function HomePage() {
  return (
    <main>
      <h1 className="text-center text-2xl font-semibold mt-4">Next.js + SignalR</h1>
      <SignalRClient />
    </main>
  );
}
