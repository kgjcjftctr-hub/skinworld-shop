import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="w-16 h-16 text-yellow-500" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900">
            Pago próximamente
          </h1>
          
          <p className="text-xl text-slate-600">
            Estamos preparando nuestro sistema de pagos. Por favor, intenta de nuevo en breve.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-900">
              Nos disculpamos por las molestias. Pronto podrás completar tu compra de manera segura.
            </p>
          </div>

          <div className="space-x-4">
            <Link
              href="/tienda"
              className="inline-block bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600"
            >
              Seguir comprando
            </Link>
            <Link
              href="/"
              className="inline-block border-2 border-primary-500 text-primary-600 px-8 py-3 rounded-lg font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
