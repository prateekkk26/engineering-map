import { Compass, Link2, Search } from "lucide-react";

/**
 * Three sentences about how to use the thing.
 *
 * Not a feature grid: the point is to tell a first-time reader that the tree is
 * browsable, that ⌘K spans all of it, and that every page is a jumping-off
 * point rather than a destination — which is the one structural fact about this
 * site that is not obvious from looking at it.
 *
 * Icons for recognition only, per PRD §7, and no accent on them.
 */
const steps = [
  {
    icon: Compass,
    title: "Browse the tree",
    body: "Eight sections, then subsections, then topics. Four levels and it stops there, so you always know where you are.",
  },
  {
    icon: Search,
    title: "Or search all of it",
    body: "⌘K from any page searches every title, summary and tag. If you already know the name of the thing, that is one keystroke away.",
  },
  {
    icon: Link2,
    title: "Follow the links out",
    body: "Every topic names one thing to read first and a few to go deeper. The map is the index; the depth lives at the other end of the links.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how" className="py-16">
      <h2 id="how" className="text-2xl font-medium tracking-tight">
        How to use it
      </h2>
      <ul className="mt-6 grid gap-8 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }) => (
          <li key={title}>
            <Icon className="size-5 text-muted-foreground" aria-hidden />
            <h3 className="mt-3 font-medium">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
