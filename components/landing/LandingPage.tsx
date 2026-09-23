"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";
import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import How from "@/components/landing/How";
import Insight from "@/components/landing/Insight";
import Intro from "@/components/landing/Intro";
import Marquee from "@/components/landing/Marquee";
import Navbar from "@/components/landing/Navbar";
import SmoothScroll from "@/components/landing/SmoothScroll";
import Templates from "@/components/landing/Templates";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("raple-intro-v2") === "1") {
      setIntro(false);
    }
  }, []);

  const skipIntro = useCallback(() => {
    sessionStorage.setItem("raple-intro-v2", "1");
    setIntro(false);
  }, []);

  return (
    <SmoothScroll>
      <Intro open={intro} onSkip={skipIntro} />
      <main id="top" className="landing-root bg-white text-black">
        <motion.div
          className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[#4C9AFF]"
          style={{ scaleX: scrollYProgress }}
        />
        <Navbar />
        <Hero />
        <Marquee />
        <How />
        <Insight />
        <Templates />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
