import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">
          안녕하세요, {session.user.name}님!
        </h1>
        <p className="mt-4 text-zinc-400">
          비밀클럽에 오신 걸 환영합니다.
        </p>
      </div>
    </div>
  );
}
