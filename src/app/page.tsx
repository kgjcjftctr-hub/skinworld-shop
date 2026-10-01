import { IntroCinematica } from '@/components/intro/intro-cinematica';
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
  const { marcas, porCategoria, destacados } = await datosDeLaPortada();

  return (
    <>
      <IntroCinematica />
      {/* El resto del inicio sube sobre el final de la intro, como una hoja que
          entra desde abajo; por eso va por encima (z-10) y con fondo propio. */}
      <div className="relative z-10 bg-sw-warm-white">
        <CategoriesSection porCategoria={porCategoria} />
        <SkinworldEdit destacados={destacados} />
        <BrandsSection marcas={marcas} />
        <EditorialSection />
        <ExpertiseSection />
        <TestimonialsSection />
        <BlogPreview />
        <CTASection />
      </div>
    </>
  );
}
