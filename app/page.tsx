import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); // 🔁 Redirect to /login if no session
  }

  redirect("/home") // ✅ Show inbox if logged in
}
