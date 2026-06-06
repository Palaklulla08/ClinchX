import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-32">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              The AI-powered operating system for your entire career.
            </p>
          </div>
          {[
            { title: "Product", items: ["Resume Analyzer", "ATS Engine", "Interview Coach", "Career Roadmap"] },
            { title: "Intelligence", items: ["GitHub Score", "LinkedIn Score", "Salary Estimator", "Rejection Predictor"] },
            { title: "Company", items: ["About", "Pricing", "Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.items.map((i) => (
                  <li key={i} className="hover:text-foreground transition cursor-pointer">{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} CareerOS AI. All rights reserved.</p>
          <p>Built for ambitious people.</p>
        </div>
      </div>
    </footer>
  );
}