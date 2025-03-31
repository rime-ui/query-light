import { PageRoutes } from "@/lib/pageroutes"

export const Navigations = [
  {
    title: "Docs",
    href: `/docs${PageRoutes[0].href}`,
  },
  {
    title: "Home",
    href: "#",
    external: true,
  },
]

export const GitHubLink = {
  href: "https://github.com/rime-ui/query-light",
}
