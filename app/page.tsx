import { About } from "@/components/About/page";
import { HomeSection } from "@/components/home_section/page";
import { Projects } from "@/components/Projects/page";
import { Skills } from "@/components/Skills/page";
import { Experience } from "@/components/Experience/page";
import { Blog } from "@/components/Blog/page";
import { Contact } from "@/components/Contact/page";
import { VisitorTracker } from "@/components/VisitorTracker";
export default function Home() {
  return (
    <>
      <VisitorTracker />
      <div id="section1" className="scroll-mt-0">
        <HomeSection />
      </div>
      <div id="section2" className="scroll-mt-20">
        <About />
      </div>

      <div id="section3" className="scroll-mt-20">
        <Skills />
      </div>
      <div id="section4" className="">
        <Projects />
      </div>
      <div id="section5">
        <Experience />
      </div>
      <div id="section6">
        <Blog />
      </div>
      <div id="section7">
        <Contact />
      </div>
    </>
  );
}
