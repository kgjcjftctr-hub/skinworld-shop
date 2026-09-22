import { HeroSection } from '@/components/sections/hero';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { CategoriesSection } from '@/components/sections/categories';
import { BrandsSection } from '@/components/sections/brands';
import { ExpertiseSection } from '@/components/sections/expertise';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { BlogPreview } from '@/components/sections/blog-preview';
import { CTASection } from '@/components/sections/cta';

export const revalidate = 3600;

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <BrandsSection />
      <ExpertiseSection />
      <TestimonialsSection />
      <BlogPreview />
      <CTASection />
    </div>
  );
}
