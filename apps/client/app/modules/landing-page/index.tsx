import { Header } from "@/components/layout/index.ts"
import { HeroSection } from "./components/hero-section/index.tsx"
import { useInView } from 'react-intersection-observer';


export const LandingPageModule = () => {
    const { ref: heroRef, inView, } = useInView({
        threshold: 0,
    });


    return (
        <div className="relative">
            <div ref={heroRef}>
                <HeroSection />
            </div>
            {
                inView ? null : (
                    <Header isHeroSearchInVisible={false} />
                )
            }
        </div>
    )
}