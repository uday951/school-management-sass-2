import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  Compass, 
  Award, 
  ShieldCheck, 
  Activity,
  ArrowRight,
  Menu
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#0C4A6E] font-nunito selection:bg-[#38BDF8] selection:text-white">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#38BDF8]/10 h-16 w-full flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-[#0EA5E9] flex items-center justify-center text-white font-fredoka font-bold text-xl shadow-md shadow-[#0EA5E9]/20">
            M
          </div>
          <span className="font-fredoka font-bold text-lg text-[#0C4A6E] tracking-tight hidden sm:inline-block">
            Metropolitan Academy
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <a href="#about" className="hover:text-[#0EA5E9] transition-colors">About Us</a>
          <a href="#features" className="hover:text-[#0EA5E9] transition-colors">Chapters</a>
          <a href="#testimonials" className="hover:text-[#0EA5E9] transition-colors">Parents Hub</a>
          <a href="#contact" className="hover:text-[#0EA5E9] transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-[#F97316] text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F97316]/95 transition-all shadow-md shadow-[#F97316]/20 hover:shadow-[#F97316]/40 cursor-pointer"
          >
            Portal Access
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="px-4 py-16 md:py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#0EA5E9] text-xs font-bold uppercase tracking-wide">
            <Compass className="h-4 w-4" /> Shaping Creative Leaders
          </div>
          <h1 className="font-fredoka font-extrabold text-4xl md:text-5xl lg:text-6xl text-[#0C4A6E] leading-tight">
            Where Curiosity <br /> Meets <span className="text-[#0EA5E9]">Excellence</span>
          </h1>
          <p className="text-base md:text-lg text-[#0C4A6E]/80 max-w-lg leading-relaxed">
            Our progressive K-12 curriculum fosters creativity, technical excellence, and critical thinking. Welcome to an educational journey focused on collaboration and dynamic learning.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-[#F97316] text-white font-bold text-sm rounded-full hover:bg-[#F97316]/95 hover:translate-y-[-1px] transition-all shadow-lg shadow-[#F97316]/20 flex items-center gap-2 cursor-pointer"
            >
              Access Parent Portal <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#about"
              className="px-6 py-3 bg-white text-[#0C4A6E] border border-[#38BDF8]/20 font-bold text-sm rounded-full hover:bg-slate-50 transition-all shadow-sm"
            >
              Explore Curriculum
            </a>
          </div>
        </div>
        
        {/* Creative Vector Illustration Placeholder */}
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#38BDF8]/20 to-[#0EA5E9]/20 rounded-full blur-2xl -z-10" />
          <svg viewBox="0 0 200 200" className="w-72 h-72 md:w-96 md:h-96 text-[#0EA5E9]">
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
            <circle cx="100" cy="100" r="60" fill="currentColor" className="opacity-10 animate-pulse" />
            <path d="M70,80 Q100,50 130,80 T190,80" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
            <rect x="80" y="90" width="40" height="40" rx="8" fill="currentColor" className="opacity-20" />
            <GraduationCap className="h-20 w-20 text-[#0EA5E9] absolute translate-y-[-10px]" />
          </svg>
        </div>
      </section>

      {/* 3. Stat widgets */}
      <section className="bg-white border-y border-[#38BDF8]/10 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="font-fredoka font-bold text-3xl md:text-4xl text-[#0EA5E9]">1,200+</div>
            <p className="text-xs text-[#0C4A6E]/70 uppercase font-semibold">Active Students</p>
          </div>
          <div className="space-y-1">
            <div className="font-fredoka font-bold text-3xl md:text-4xl text-[#0EA5E9]">95+</div>
            <p className="text-xs text-[#0C4A6E]/70 uppercase font-semibold">Expert Faculty</p>
          </div>
          <div className="space-y-1">
            <div className="font-fredoka font-bold text-3xl md:text-4xl text-[#0EA5E9]">15:1</div>
            <p className="text-xs text-[#0C4A6E]/70 uppercase font-semibold">Student Ratio</p>
          </div>
          <div className="space-y-1">
            <div className="font-fredoka font-bold text-3xl md:text-4xl text-[#0EA5E9]">100%</div>
            <p className="text-xs text-[#0C4A6E]/70 uppercase font-semibold">Graduation Rate</p>
          </div>
        </div>
      </section>

      {/* 4. Narrative Storytelling Chapters */}
      <section id="features" className="py-16 md:py-24 max-w-6xl mx-auto px-4 space-y-20">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="font-fredoka font-bold text-3xl md:text-4xl text-[#0C4A6E]">Our Educational Philosophy</h2>
          <p className="text-sm text-[#0C4A6E]/80">We follow a progressive, narrative-driven curriculum model designed to engage students in dynamic learning loops.</p>
        </div>

        {/* Chapter 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center font-bold">01</div>
            <h3 className="font-fredoka font-bold text-2xl text-[#0C4A6E]">Chapter 1: Curiosity & Discovery</h3>
            <p className="text-sm text-[#0C4A6E]/80 leading-relaxed">
              We design classrooms as exploration labs. Students learn sciences, programming, and humanities through inquiry-based models, developing a passion for lifelong learning.
            </p>
          </div>
          <div className="bg-white border border-[#38BDF8]/10 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <BookOpen className="h-12 w-12 text-[#0EA5E9] shrink-0" />
            <div className="space-y-1">
              <h5 className="font-bold text-foreground">Interactive Syllabus</h5>
              <p className="text-xs text-muted-foreground">Digital textbooks and curriculum modules, parsed instantly in parent registers.</p>
            </div>
          </div>
        </div>

        {/* Chapter 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div className="space-y-4 md:order-2">
            <div className="h-10 w-10 rounded bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold">02</div>
            <h3 className="font-fredoka font-bold text-2xl text-[#0C4A6E]">Chapter 2: Creative Collaboration</h3>
            <p className="text-sm text-[#0C4A6E]/80 leading-relaxed">
              Education is cooperative. Group science models, arts workshops, and physical teams train students to speak, share, build, and lead alongside peers.
            </p>
          </div>
          <div className="bg-white border border-[#38BDF8]/10 p-6 rounded-2xl shadow-sm flex items-center gap-4 md:order-1">
            <Users className="h-12 w-12 text-[#F97316] shrink-0" />
            <div className="space-y-1">
              <h5 className="font-bold text-foreground">Teamwork & PTM</h5>
              <p className="text-xs text-muted-foreground">Direct teacher communication channels keep parents connected with the school.</p>
            </div>
          </div>
        </div>

        {/* Chapter 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">03</div>
            <h3 className="font-fredoka font-bold text-2xl text-[#0C4A6E]">Chapter 3: Measured Excellence</h3>
            <p className="text-sm text-[#0C4A6E]/80 leading-relaxed">
              We monitor academic growth transparently. Parents inspect weekly homework progress, terminal grades records, and attendance cycles from their portal.
            </p>
          </div>
          <div className="bg-white border border-[#38BDF8]/10 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <Award className="h-12 w-12 text-emerald-600 shrink-0" />
            <div className="space-y-1">
              <h5 className="font-bold text-foreground">Excellence Registry</h5>
              <p className="text-xs text-muted-foreground">Automated grading cards compile term results instantly and transparently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Credibility Testimonial Slider */}
      <section id="testimonials" className="bg-[#38BDF8]/5 border-y border-[#38BDF8]/10 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-fredoka font-bold text-3xl text-[#0C4A6E]">Parent Endorsements</h2>
            <p className="text-sm text-[#0C4A6E]/80">Discover how parents rate our collaborative child-centered learning structures.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#38BDF8]/15 space-y-4">
              <div className="flex text-[#F97316] gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-xs italic leading-relaxed text-[#0C4A6E]/80">
                "The lack of student accounts made us hesitant, but managing both kids under a single Parent account switcher is incredibly seamless. We track all details easily."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center font-bold text-xs">SM</div>
                <div>
                  <h6 className="text-xs font-bold text-foreground">Sarah Miller</h6>
                  <p className="text-[10px] text-muted-foreground">Parent of Grade 8 Student</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#38BDF8]/15 space-y-4">
              <div className="flex text-[#F97316] gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-xs italic leading-relaxed text-[#0C4A6E]/80">
                "We love the transparent homework diary and direct teacher chat channels. The notifications keep us informed of child absences or calendar holidays instantly."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-xs">JD</div>
                <div>
                  <h6 className="text-xs font-bold text-foreground">John Doe</h6>
                  <p className="text-[10px] text-muted-foreground">Parent of Grade 10 Student</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#38BDF8]/15 space-y-4">
              <div className="flex text-[#F97316] gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-xs italic leading-relaxed text-[#0C4A6E]/80">
                "Excellent administrative transparency. Invoices details and checkout payment triggers work beautifully. I can reconcile transactions in seconds."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">RK</div>
                <div>
                  <h6 className="text-xs font-bold text-foreground">Robert King</h6>
                  <p className="text-[10px] text-muted-foreground">Parent of Grade 6 Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action (Climax) */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-fredoka font-bold text-4xl text-[#0C4A6E]">Ready to Join Our Community?</h2>
        <p className="text-sm text-[#0C4A6E]/80 max-w-md mx-auto leading-relaxed">
          Access your personalized administrative dashboard or schedule a physical school tour with our registrar team.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 bg-[#F97316] text-white font-bold text-sm rounded-full hover:bg-[#F97316]/95 hover:translate-y-[-1px] transition-all shadow-lg shadow-[#F97316]/20 cursor-pointer"
          >
            Portal Login
          </button>
        </div>
      </section>

      {/* 7. Footer */}
      <footer id="contact" className="border-t border-[#38BDF8]/10 bg-white py-12 text-center text-xs text-[#0C4A6E]/60 space-y-4">
        <div className="flex justify-center gap-2 items-center">
          <div className="h-6 w-6 rounded bg-[#0EA5E9] flex items-center justify-center text-white font-fredoka font-bold text-sm">
            M
          </div>
          <span className="font-fredoka font-bold text-[#0C4A6E]">Metropolitan Academy</span>
        </div>
        <p>© 2026 Metropolitan Academy. All rights reserved. Registered under school branch structures.</p>
        <p className="text-[10px] text-muted-foreground">Powered by Antigravity Design Systems</p>
      </footer>
    </div>
  )
}
