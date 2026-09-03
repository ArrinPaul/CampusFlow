import re

filepath = r'F:\Project\Hackathon\frontend\src\app\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add GSAP imports
imports = """import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
"""
content = content.replace('import { useAuth } from "@/hooks/useAuth";', 'import { useAuth } from "@/hooks/useAuth";\n' + imports)

# 2. Refactor Hero component
old_hero_start = """function Hero() {"""
old_hero_end = """    </section>
  );
}"""

# We'll isolate the Hero function using regex
hero_pattern = re.compile(r'function Hero\(\) \{.*?</section>\s*\}\s*;?\s*\}', re.DOTALL)
# Actually, the best way to match function Hero() { ... } without matching too much is tricky.
# We can just use string replace on the exact known Hero component.

# Let's extract the exact old Hero component from the file.
start_idx = content.find('function Hero() {')
end_idx = content.find('const modules = [')

if start_idx != -1 and end_idx != -1:
    old_hero = content[start_idx:end_idx].strip()
    
    new_hero = """function Hero() {
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    tl.fromTo(".hero-badge", 
      { opacity: 0, y: -20 }, 
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo(".hero-title", 
      { opacity: 0, y: 40, rotationX: -20 }, 
      { opacity: 1, y: 0, rotationX: 0, duration: 1, stagger: 0.2 },
      "-=0.5"
    )
    .fromTo(".hero-desc", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    .fromTo(".hero-buttons", 
      { opacity: 0, scale: 0.9 }, 
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1 },
      "-=0.5"
    )
    .fromTo(".hero-scroll",
      { opacity: 0 },
      { opacity: 1, duration: 1 },
      "-=0.2"
    );
    
    // Floating background shapes
    gsap.to(".bg-shape-1", {
      y: "random(-30, 30)",
      x: "random(-30, 30)",
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(".bg-shape-2", {
      y: "random(-40, 40)",
      x: "random(-40, 40)",
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, { scope: container });

  return (
    <section ref={container} className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden perspective-[1000px]">
      <div className="absolute inset-0 -z-10">
        <div className="bg-shape-1 absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
        <div className="bg-shape-2 absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="hero-badge opacity-0 inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-[10px] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Student Hub
        </div>

        <h1 className="hero-title opacity-0 text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground tracking-tight mb-6 leading-[1.1] transform-style-3d">
          Your Smart {" "}
          <span className="relative inline-block">
            Campus
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary/20 -z-10 rounded-full" />
          </span> {" "}
          <br className="hidden sm:block" />
          Workflow Suite
        </h1>

        <p className="hero-desc opacity-0 text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          CampusFlow unifies deadlines, attendance, notices, and AI tools so your academic life
          moves from chaos to clarity — automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="hero-buttons opacity-0 inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-standard shadow-lg shadow-primary/25"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#modules"
            className="hero-buttons opacity-0 inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-foreground border border-border rounded-[10px] hover:bg-accent transition-standard"
          >
            Learn More
          </a>
        </div>

        <div className="hero-scroll opacity-0 mt-12 flex justify-center">
          <button
            onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}
            className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="text-sm font-medium mb-2">Discover More</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
}"""

    content = content.replace(old_hero, new_hero + '\n')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
