import { Link } from "lib/transition"

import { PageRoutes } from "@/lib/pageroutes"
import { buttonVariants } from "@/components/ui/button"

export default function Home() {
  return (
    <section className="min-h-[86.5vh] flex flex-col justify-center items-center text-center px-2 py-8">

      <h1 className="text-4xl font-bold mb-4 sm:text-7xl">Query Light</h1>
      <p className="max-w-[600px] text-foreground mb-8 sm:text-base">
        A lightweight and efficient library for seamless data fetching.
      </p>

      <div className="flex items-center gap-5">
        <Link
          href={`/docs${PageRoutes[0].href}`}
          className={buttonVariants({ className: "px-6", size: "lg" })}
        >
          Get Started
        </Link>
      </div>

    </section>
  )
}
