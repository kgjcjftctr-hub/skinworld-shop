import { HeroSection } from '@/components/sections/hero';
import { CategoriesSection } from '@/components/sections/categories';
import { SkinworldEdit } from '@/components/sections/skinworld-edit';
import { BrandsSection } from '@/components/sections/brands';
import { EditorialSection } from '@/components/sections/editorial';
import { ExpertiseSection } from '@/components/sections/expertise';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { BlogPreview } from '@/components/sections/blog-preview';
import { CTASection } from '@/components/sections/cta';
import { datosDeLaPortada } from '@/lib/escaparate';

export const revalidate = 3600;

export default async function Home() {
  const { totalProductos, marcas, porCategoria, destacados, portada } = await datosDeLaPortada();

  return (
    <>
      <HeroSection productCount={totalProductos} portada={portada} />
      <CategoriesSection porCategoria={porCategoria} />
      <SkinworldEdit destacados={destacados} />
      <BrandsSection marcas={marcas} />
      <EditorialSection />
      <ExpertiseSection />
      <TestimonialsSection />
      <BlogPreview />
      <CTASection />
    </>
  );
}
