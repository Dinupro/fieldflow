import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Statistics from "@/components/landing/Statistics";
import Services from "@/components/landing/Services";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import About from "@/components/landing/About";
import Contact from "@/components/landing/Contact";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Sticky Glassmorphism Header */}
      <Navbar />

      {/* 2. Hero Section targeting customers looking for trusted field technicians */}
      <Hero />

      {/* 3. Operational Impact & Statistics */}
      <Statistics />

      {/* 4. Full Field Services Directory & Filtering */}
      <Services />

      {/* 5. Core SaaS Platform Features & Interactive Deep Dive */}
      <Features />

      {/* 6. Step-by-Step Workflow for Clients and Technicians */}
      <HowItWorks />

      {/* 7. Enterprise Customer Testimonials & Proof */}
      <Testimonials />

      {/* 8. Capstone-Grade Architecture & Mission */}
      <About />

      {/* 9. Interactive Work Order & Consultation Request Form */}
      <Contact />

      {/* 10. High Conversion Call-To-Action Banner */}
      <CTA />

      {/* 11. Multi-Column Enterprise Footer */}
      <Footer />
    </main>
  );
}