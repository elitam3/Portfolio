/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  ArrowUpRight, 
  Play, 
  X, 
  Cpu, 
  Layers, 
  Zap, 
  FastForward, 
  Sun,
  Moon,
  ExternalLink,
  Laptop,
  ChevronRight,
  Mail,
  Linkedin,
  Terminal
} from 'lucide-react';

// --- TYPES ---
interface CaseStudy {
  id: string;
  title: string;
  client: string;
  category: string;
  thumbnail: string;
  video: string;
  problem: string; // The "Cause" / Client problem
  stack: string[];
  link?: string;
  type?: 'macbook' | 'standard';
  process: {
    sketches: string; // The "Storyboards"
    iterations: string; // The "System Thinking"
    solution: string; // The "Analysis of final solution"
  };
  humanCraft: {
    layers: string;
    grading: string;
    typography: string;
  };
}

// --- MOCK DATA ---
const PROJECTS: CaseStudy[] = [
  {
    id: '01',
    title: 'PODCAST INTROS',
    client: 'High-End Portfolio',
    category: 'Video Editing / Motion',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1600',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-recording-a-podcast-in-a-studio-44558-large.mp4',
    problem: 'Zadavatelé v segmentu prémiových podcastů bojovali s vizuální uniformitou. Cílem bylo vytvořit znělky, které nebudou jen dekorativní, ale budou fungovat jako okamžitý psychologický switch do nálady epizody, a to i bez zapnutého zvuku.',
    stack: ['After Effects', 'Premiere Pro', 'AI Generative Layers'],
    link: 'https://www.youtube.com/',
    type: 'macbook',
    process: {
      sketches: 'Každý projekt začíná analýzou rytmu mluveného slova. Storyboardy nejsou jen obrázky, ale časové mapy, kde definuji, kdy má divák pocítit napětí a kdy uvolnění.',
      iterations: 'Propojením AI generovaných textur s matematicky přesným timingem v After Effects jsme dosáhli organického, a přitom kontrolovaného vzhledu.',
      solution: 'Vytvořili jsme systém 15vteřinových znělek, které zvýšily retenci diváků v prvních sekundách o 25 % díky silné vizuální kotvě.'
    },
    humanCraft: {
      layers: 'Ruční maskování a separace pozadí pro hloubku ostrosti, kterou AI modely stále neumí v pohybu udržet konzistentní.',
      grading: 'Custom barevné křivky vytvořené v Lumetri pro sjednocení AI textur s reálným footage, aby výsledek nepůsobil jako "digitální slop".',
      typography: 'Precizní animace fontu Inter s nulovým zapojením AI – typografie musí zůstat čitelná a technicky dokonalá v každém framu.'
    }
  },
  {
    id: '02',
    title: 'DEBONO SHOWREEL',
    client: 'Debono Marketing',
    category: 'Branding / Animation',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1600',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-animation-of-futuristic-devices-910-large.mp4',
    problem: 'Vizuální identita pro marketingovou agenturu vyžadovala schopnost odprezentovat komplexní služby v 60 sekundách. Problémem byla roztříštěnost vizuálních heritages různých značek, které musely v showreelu působit jako jeden celek.',
    stack: ['After Effects', 'Lottie', 'Illustrator'],
    process: {
      sketches: 'Dekompozice osmi různých brand manuálů do základních geometrických prvků. Vytvořila jsem "vizuální lepidlo" – společný animační princip, který prochází celým videem.',
      iterations: 'Místo náhodných efektů jsem zvolila systém plynulých morphingových přechodů, které symbolizují adaptabilitu agentury.',
      solution: 'Komplexní showreel, který slouží jako hlavní akviziční nástroj a dokazuje schopnost integrovat jakoukoli značku do moderního digitálního ekosystému.'
    },
    humanCraft: {
      layers: 'Vektorová preciznost v Adobe Illustratoru transformovaná do shape layers v AE, což zaručuje technickou čistotu bez kompresních artefaktů.',
      grading: 'Sjednocení osmi různých barevných palet do jednoho vizuálního tónu pomocí master post-processingu.',
      typography: 'Motion design titulků je synchronizován s lottie animacemi pro maximální výkon na webu při minimální datové zátěži.'
    }
  }
];

// --- COMPONENTS ---

/**
 * Reusable Lottie Placeholder
 */
const LottiePlaceholder = ({ className, title }: { className?: string, title?: string }) => (
  <div className={`relative overflow-hidden bg-fg/5 border border-fg/5 rounded-xl flex items-center justify-center group/lottie ${className}`}>
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fg via-transparent to-transparent group-hover/lottie:opacity-20 transition-opacity animate-pulse" />
    <div className="relative z-10 flex flex-col items-center gap-2">
      <Zap size={24} className="text-fg/20 group-hover/lottie:scale-110 transition-transform" />
      <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-fg/30">{title || 'LOTTIE_ANIMATION_PLACEHOLDER'}</span>
    </div>
    {/* Animated corners */}
    <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-fg/10" />
    <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-fg/10" />
    <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-fg/10" />
    <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-fg/10" />
  </div>
);

/**
 * Custom Cursor for the "Premium" feel
 */
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/30 pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out flex items-center justify-center -ml-4 -mt-4 bg-white/5 active:scale-75"
    >
      <div className="w-1 h-1 bg-white rounded-full" />
    </div>
  );
};

/**
 * Case Study Modal with "Brutal Transparency" features
 */
const Modal = ({ project, onClose }: { project: CaseStudy; onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
    >
      <motion.div 
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-3xl" 
      />
      
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-bg border border-fg/10 rounded-2xl md:rounded-[40px] shadow-2xl scroll-smooth"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full h-12 w-12 bg-fg/5 hover:bg-fg/10 transition-colors z-10 flex items-center justify-center text-fg"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Visual Column */}
          <div className="lg:col-span-7 relative h-[60vh] lg:h-[90vh] bg-black">
            <video 
              src={project.video} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent pointer-events-none" />
            
            {/* Context Widget */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em]">Client</span>
                <p className="text-white font-display text-sm uppercase">{project.client}</p>
              </div>
              <div className="flex gap-4">
                {project.stack.map(tech => (
                  <div key={tech} className="px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-[8px] font-mono text-white uppercase">{tech}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="lg:col-span-5 p-8 md:p-16 space-y-16 overflow-y-auto bg-bg transition-colors duration-500">
            <div>
              <span className="text-[10px] font-mono text-fg/40 tracking-[0.2em] uppercase">{project.category}</span>
              <h2 className="text-4xl md:text-5xl font-display font-medium mt-4 tracking-tight text-fg uppercase leading-tight">{project.title}</h2>
            </div>

            {/* Storytelling Section */}
            <section className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-fg/10" />
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg/50">Vize a Strategie</h3>
                </div>
                <p className="text-lg text-fg/80 leading-relaxed font-light">
                  {project.problem}
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-fg/10" />
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg/50">Proces Vývoje</h3>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-fg">01. Storyboardy & Náčrty</h4>
                    <p className="text-sm text-fg/60 leading-relaxed">{project.process.sketches}</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-fg">02. Systémové Myšlení</h4>
                    <p className="text-sm text-fg/60 leading-relaxed">{project.process.iterations}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Brutal Transparency / Breakdown */}
            <section className="space-y-8 pt-12 border-t border-fg/10">
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg font-bold">Brutální Transparentnost</h3>
                <p className="text-[10px] font-mono text-fg/30 uppercase tracking-widest">Lék na "AI Slop" – Kde končí algoritmus a začíná řemeslo</p>
              </div>
              
              <div className="grid gap-6">
                {[
                  { label: "Layer Breakdown", value: project.humanCraft.layers, icon: <Layers size={16} /> },
                  { label: "Color Grading", value: project.humanCraft.grading, icon: <Zap size={16} /> },
                  { label: "Typography & Polish", value: project.humanCraft.typography, icon: <Terminal size={16} /> }
                ].map((item, i) => (
                  <div key={i} className="group/item flex gap-6 items-start p-4 rounded-2xl bg-fg/2 border border-fg/5 hover:bg-fg/5 transition-colors">
                    <div className="mt-1 p-2 rounded-lg bg-fg/5 text-fg/40 group-hover/item:text-fg transition-colors">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-fg font-bold tracking-widest">{item.label}</span>
                      <p className="text-sm text-fg/70 leading-relaxed">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8 pt-12 border-t border-fg/10 bg-fg/[0.02] -mx-8 md:-mx-16 px-8 md:px-16 pb-12">
              <div className="flex flex-col gap-4">
                 <h4 className="text-[10px] font-mono text-fg/30 uppercase tracking-widest font-bold">Analýza konečného řešení</h4>
                 <p className="text-sm text-fg/80 leading-relaxed italic border-l-2 border-fg/20 pl-6">
                    {project.process.solution}
                 </p>
              </div>
              {project.link && (
                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-fg text-bg font-display font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  View live channel <ExternalLink size={14} />
                </a>
              )}
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * MacBook Frame for Podcast Project
 */
const MacbookFrame = ({ video }: { video: string }) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto py-12">
      <div className="relative aspect-[16/10] bg-neutral-800 rounded-3xl p-[2%] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-[4%] bg-neutral-900 rounded-b-xl z-20" />
        <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
          <video 
            src={video} 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="relative w-[110%] -left-[5%] h-4 bg-neutral-700 rounded-b-3xl shadow-xl mt-[-2px] border-t border-white/10" />
    </div>
  );
};

/**
 * Main App
 */
export default function App() {
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="relative min-h-screen selection:bg-white selection:text-black">
      <CustomCursor />
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 px-6 py-6 md:px-12 ${isScrolled ? 'premium-blur translate-y-0' : 'translate-y-0'}`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 bg-fg rounded-full flex items-center justify-center text-bg">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-display font-semibold tracking-tighter text-xl hidden md:block uppercase">E.NGHIEM</span>
          </motion.div>
          
          <div className="flex gap-4 md:gap-8 items-center">
            <a href="#work" className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg/50 hover:text-fg transition-colors">Work</a>
            <a href="#process" className="text-[10px] font-mono uppercase tracking-[0.2em] text-fg/50 hover:text-fg transition-colors">Process</a>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full border border-fg/10 hover:bg-fg/5 transition-colors text-fg"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative h-screen flex flex-col justify-end px-6 md:px-12 pb-16 md:pb-24 overflow-hidden border-b border-fg/5 bg-black">
          {/* Background Showreel Holder */}
          <div className="absolute inset-0 z-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
              src="https://assets.mixkit.co/videos/preview/mixkit-abstract-space-flowing-particles-23258-large.mp4"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
          </div>

          <motion.div 
            style={{ opacity: titleOpacity, scale: titleScale }}
            className="relative z-10 max-w-[1400px] space-y-6"
          >
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[10vw] md:text-[7vw] font-display font-medium leading-[0.95] tracking-tighter uppercase text-white">
                Jsem hybridní <br />
                <span className="text-white/30">motion designérka.</span>
              </h1>
            </motion.div>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl"
            >
              <p className="text-lg md:text-2xl font-light text-white leading-relaxed text-balance">
                Propojuji svoje motion skilly s AI workflow efektivněji
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1 }}
             className="absolute bottom-12 right-12 hidden lg:flex flex-col items-end space-y-4"
          >
             <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">Systems: Online</span>
             </div>
             <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Scroll to explore artifacts</div>
          </motion.div>
        </section>

        <section id="work" className="py-24 md:py-48 px-6 md:px-12 bg-bg transition-colors duration-500">
          <div className="max-w-[1800px] mx-auto space-y-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-fg/10 pb-12">
              <div className="space-y-4">
                <span className="text-xs font-mono text-fg/30 uppercase tracking-[0.4em]">01 / Portfolio</span>
                <h2 className="text-5xl md:text-7xl font-display font-medium tracking-tighter text-fg uppercase">Work artifacts</h2>
              </div>
              <p className="max-w-xs text-sm text-fg/40 font-light leading-relaxed">
                Každý projekt je fúzí algoritmické randomness a matematicky přesné postprodukce.
              </p>
            </div>

            <div className="space-y-32">
              {PROJECTS.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                >
                  <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div>
                      <span className="text-xs font-mono text-fg/40 tracking-[0.2em] uppercase">{project.category}</span>
                      <h3 className="text-4xl md:text-6xl font-display font-medium mt-4 tracking-tighter text-fg uppercase">{project.title}</h3>
                    </div>
                    <p className="text-lg text-fg/70 font-light leading-relaxed max-w-lg">
                      {project.problem}
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {project.stack.map(tech => (
                          <span key={tech} className="px-3 py-1 rounded-full border border-fg/10 text-[10px] font-mono text-fg/60 uppercase">{tech}</span>
                       ))}
                    </div>
                    <div className="flex gap-6 pt-4">
                      <button 
                        onClick={() => setSelectedProject(project)}
                        className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-fg border-b border-fg/20 pb-2 hover:border-fg transition-all"
                      >
                        Vstoupit do detailu <Plus size={14} />
                      </button>
                      {project.link && (
                        <a 
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-fg/40 hover:text-fg transition-all pb-2"
                        >
                          YouTube channel <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    {project.type === 'macbook' ? (
                      <MacbookFrame video={project.video} />
                    ) : (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="relative aspect-video rounded-3xl overflow-hidden border border-fg/10 bg-neutral-900 group cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      >
                         <video 
                            src={project.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                         />
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-fg text-bg flex items-center justify-center">
                               <Play size={24} fill="currentColor" />
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className={`py-24 md:py-48 px-6 md:px-12 transition-all duration-500 rounded-[40px] md:rounded-[80px] mx-2 md:mx-6 ${isDark ? 'bg-white text-black' : 'bg-[#0a0a0a] text-white'}`}>
          <div className="max-w-[1200px] mx-auto space-y-24 md:space-y-36">
             {/* Full Width Header */}
             <div className="text-center space-y-6">
                <span className={`text-xs font-mono uppercase tracking-[0.4em] ${isDark ? 'text-black/40' : 'text-white/40'}`}>02 / Metodologie</span>
                <h2 className="text-6xl md:text-[10vw] font-display font-semibold tracking-tighter leading-none uppercase">THE WORKFLOW</h2>
                <p className={`text-xl md:text-3xl font-light leading-relaxed max-w-3xl mx-auto ${isDark ? 'text-black/70' : 'text-white/70'}`}>
                  AI generování je jen zlomek práce. Můj proces je o kontrole nad halucinací stroje.
                </p>
             </div>

             {/* Vertical Timeline Workflow */}
             <div className="relative">
                {/* Central Vertical Line */}
                <div className={`absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 ${isDark ? 'bg-black/10' : 'bg-white/10'}`} />

                <div className="space-y-32 md:space-y-48">
                  {[
                    {
                      phase: "Fáze 1",
                      title: "Vizuální vývoj",
                      tool: "Midjourney",
                      desc: "Nedílnou součástí začátku projektu je extenzivní vizuální výzkum. Generuji \"style frames\", kterými definuji základní sémantiku obrazu, atmosférické osvětlení a textury před samotným importem do animačních enginů.",
                    },
                    {
                      phase: "Fáze 2",
                      title: "Čištění a separace vrstev",
                      tool: "Photoshop",
                      desc: "Tady nastupuje kritická lidská práce. Odstraňuji sémantické nesmysly, které AI stále produkuje, čistím kompozice a odděluji klíčové objekty od pozadí, čímž vytvářím čisté pláty (clean plates) pro následnou animaci.",
                    },
                    {
                      phase: "Fáze 3",
                      title: "Kontrolované generování pohybu",
                      tool: "Runway / Luma",
                      desc: "Připravené statické obrazové vrstvy nahrávám do video modelů a pomocí \"image-to-video\" promptů definuji přesné parametry pro pohyb virtuální kamery a dynamiku světla, aby výsledek nepůsobil jako halucinace stroje.",
                    },
                    {
                      phase: "Fáze 4",
                      title: "Rigorózní postprodukce",
                      tool: "After Effects",
                      desc: "Finální a časově nejnáročnější fáze. Zahrnuje přesný 3D tracking kamery, vkládání ostrých prvků jako je korporátní typografie a loga (která AI neumí vygenerovat přesně), a sjednocení celého obrazu pomocí pokročilého color gradingu.",
                    }
                  ].map((step, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: "-20%" }}
                      className="relative grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center"
                    >
                      {/* Numbered Circle (Timeline Node) */}
                      <div className="absolute left-6 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10">
                        <motion.div 
                          initial={{ scale: 0.8, backgroundColor: isDark ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)" }}
                          whileInView={{ 
                            scale: 1, 
                            backgroundColor: isDark ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)",
                            color: isDark ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)",
                            boxShadow: isDark ? "0 0 20px rgba(0,0,0,0.2)" : "0 0 20px rgba(255,255,255,0.4)"
                          }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`w-12 h-12 rounded-full border ${isDark ? 'border-black/20 text-black/50' : 'border-white/20 text-white/50'} flex items-center justify-center font-mono text-sm font-bold transition-colors`}
                        >
                          {i + 1}
                        </motion.div>
                      </div>

                      {/* Content Column */}
                      <div className={`pl-16 md:pl-0 space-y-4 ${i % 2 === 1 ? 'md:col-start-2' : 'md:text-right md:pr-24'}`}>
                        <div className={`flex items-center gap-4 ${i % 2 === 1 ? '' : 'md:flex-row-reverse'}`}>
                          <span className={`text-[10px] font-mono uppercase tracking-[0.24em] ${isDark ? 'text-black/50' : 'text-white/50'}`}>{step.phase}</span>
                          <span className={`w-8 h-[1px] ${isDark ? 'bg-black/10' : 'bg-white/10'}`} />
                          <span className="text-[10px] font-mono uppercase font-bold">{step.tool}</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-display font-medium tracking-tight uppercase leading-tight">{step.title}</h3>
                        <p className={`text-lg font-light leading-relaxed ${isDark ? 'text-black/60' : 'text-white/60'}`}>{step.desc}</p>
                      </div>

                      {/* Visualization Column */}
                      <div className={`pl-16 md:pl-0 ${i % 2 === 1 ? 'md:col-start-1 md:row-start-1 md:pr-24' : 'md:pl-24'}`}>
                        <LottiePlaceholder 
                          className="aspect-video md:aspect-square" 
                          title={`VIZ_PHASE_${i+1}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* --- STATIC DESIGN SECTION --- */}
        <section className={`py-24 md:py-48 px-6 md:px-12 transition-colors duration-500 bg-bg`}>
          <div className="max-w-[1400px] mx-auto space-y-24">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-12">
              <div className="max-w-2xl space-y-8">
                <span className="text-xs font-mono text-fg/30 uppercase tracking-[0.4em]">03 / Design & Branding</span>
                <h2 className="text-5xl md:text-7xl font-display font-medium tracking-tighter text-fg uppercase">Statická estetika & Korporátní design</h2>
                <p className="text-xl md:text-2xl font-light text-fg/70 leading-relaxed text-balance">
                  Základem každého dobrého pohybu je perfektní statická grafika. Kromě animací nabízím i komplexní zpracování vizuální identity, které vaší značce zajistí profesionální a konzistentní tvář.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Prezentace & Pitch decky",
                  desc: "Tvorba čistých a přesvědčivých šablon pro Microsoft PowerPoint a Google Slides, se kterými vyhrajete tendry.",
                  details: ["PowerPoint", "Google Slides", "Template Design"]
                },
                {
                  title: "Korporátní identita & Sazba",
                  desc: "Návrhy hlavičkových papírů, vizitek a logomanuálů. Precizní korporátní sazba v Adobe InDesign.",
                  details: ["Logomanuály", "Vizitky", "InDesign Layout"]
                },
                {
                  title: "DTP & Vektorová grafika",
                  desc: "Profesionální předtisková příprava a tvorba čistých vektorových ilustrací v Adobe Illustrator.",
                  details: ["Illustrator", "Vektory", "DTP Příprava"]
                }
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-[32px] border border-fg/5 bg-fg/2 transition-all hover:bg-fg/5 hover:border-fg/10 group flex flex-col justify-between min-h-[500px]"
                >
                  <div className="space-y-6">
                    <h3 className="text-2xl font-display font-medium text-fg uppercase tracking-tight leading-tight">{service.title}</h3>
                    <p className="text-fg/50 text-sm leading-relaxed">{service.desc}</p>
                    <div className="pt-4 flex flex-wrap gap-2">
                       {service.details.map(tag => (
                          <span key={tag} className="text-[10px] font-mono text-fg/30 uppercase tracking-widest">{tag}</span>
                       ))}
                    </div>
                  </div>
                  
                  <LottiePlaceholder 
                    className="mt-12 aspect-video" 
                    title="DESIGN_ANIMATION"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- AI INTERACTIVE ZONE / PLAYGROUND --- */}
        <section id="playground" className="py-36 px-6 md:px-12 bg-bg transition-colors duration-500 overflow-hidden">
          <div className="max-w-[1400px] mx-auto text-center space-y-12">
            <div className="space-y-6">
              <span className="text-xs font-mono text-fg/30 uppercase tracking-[0.6em]">Laboratory_01</span>
              <h2 className="text-6xl md:text-9xl font-display font-medium tracking-tighter uppercase text-fg">PLAYGROUND</h2>
            </div>
            
            <div className="relative aspect-video max-w-5xl mx-auto rounded-[40px] border border-fg/5 bg-fg/5 p-1 flex items-center justify-center overflow-hidden group">
               {/* Animated Background for Placeholder */}
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fg via-transparent to-transparent animate-pulse" />
               
               <div className="relative z-10 space-y-6 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border border-fg/10 flex items-center justify-center bg-fg/5 mb-4 scale-125">
                     <Laptop size={40} className="text-fg/40" />
                  </div>
                  <h3 className="text-2xl font-display font-light uppercase tracking-widest text-fg/80">AI Interaction Logic</h3>
                  <p className="text-fg/40 font-mono text-xs max-w-md">
                    [SYSTEM_READY]: Elegantní placeholder pro budoucí integraci AI chatbota, který bude vysvětlovat moji roli na projektech.
                  </p>
                  <motion.button 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="mt-8 px-8 py-4 rounded-full bg-fg text-bg font-display font-bold text-xs uppercase tracking-widest flex items-center gap-4 cursor-none"
                  >
                     Explore System <ChevronRight size={16} />
                  </motion.button>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-24 px-6 md:px-12 border-t border-fg/5 transition-colors duration-500 bg-bg">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4">
            <h4 className="text-2xl font-display font-medium uppercase tracking-tight text-fg">Pojďme tvořit budoucnost.</h4>
            <div className="flex gap-6">
              <a href="#" className="p-4 rounded-full bg-fg/5 hover:bg-fg/10 transition-colors text-fg"><Mail size={20} /></a>
              <a href="#" className="p-4 rounded-full bg-fg/5 hover:bg-fg/10 transition-colors text-fg"><Linkedin size={20} /></a>
            </div>
          </div>

          <div className="hidden md:block h-32 w-[1px] bg-fg/10" />

          <div className="text-left md:text-right space-y-2">
            <div className="text-[10px] font-mono text-fg/30 uppercase tracking-[0.4em]">Location</div>
            <div className="text-xl font-display text-fg/80 uppercase">Europe / Prague</div>
          </div>

          <div className="text-left md:text-right space-y-2">
             <div className="text-[10px] font-mono text-fg/30 uppercase tracking-[0.4em]">Copyright</div>
             <div className="text-xs font-mono text-fg/20 uppercase text-balance">&copy; {new Date().getFullYear()} ELISKA_NGHIEM. ALL RIGHTS RESERVED.</div>
          </div>
        </div>
      </footer>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {selectedProject && (
          <Modal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const Plus = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
