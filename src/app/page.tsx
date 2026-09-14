import { HeroSection } from '@/components/sections/hero';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { CategoriesSection } from '@/components/sections/categories';
import { ExpertiseSection } from '@/components/sections/expertise';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { BlogPreview } from '@/components/sections/blog-preview';
import { CTASection } from '@/components/sections/cta';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <ExpertiseSection />
      <TestimonialsSection />
      <BlogPreview />
      <CTASection />
    </div>
  );
}
