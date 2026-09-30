import { HeroSection } from '@/components/sections/hero';
import { FeaturedProducts } from '@/components/sections/featured-products';
import { CategoriesSection } from '@/components/sections/categories';
import { BrandsSection } from '@/components/sections/brands';
import { ExpertiseSection } from '@/components/sections/expertise';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { BlogPreview } from '@/components/sections/blog-preview';
import { CTASection } from '@/components/sections/cta';
import { getAllProducts, getBrandSummary, dedupeVariants } from '@/lib/products';

export const revalidate = 3600;

export default async function Home() {
  const [productos, marcas] = await Promise.all([getAllProducts(), getBrandSummary()]);
  const productCount = dedupeVariants(productos).length;

  return (
    <div className="min-h-screen">
      <HeroSection productCount={productCount} />
      <FeaturedProducts />
      <CategoriesSection />
      <BrandsSection marcas={marcas} />
      <ExpertiseSection />
      <TestimonialsSection />
      <BlogPreview />
      <CTASection />
    </div>
  );
}
