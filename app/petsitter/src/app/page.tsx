import { redirect } from "next/navigation";

/** Entry point — middleware guards the app, so land on the dashboard. */
export default function Home() {
  redirect("/dashboard");
}
