-- Create FAQs table for managing frequently asked questions from admin
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_faqs_active_order ON public.faqs (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs (category);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active FAQs
CREATE POLICY "Anyone can read active FAQs" ON public.faqs
  FOR SELECT USING (is_active = true);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role has full access" ON public.faqs
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default FAQs (migrate from JSON)
INSERT INTO public.faqs (question, answer, category, sort_order, is_active) VALUES
  ('¿Envían a todo el país?', 'Sí, enviamos a todo el país a través de Correo Argentino y otros transportes. Los envíos son gratuitos para pedidos superiores a $100.000. Para Mar del Plata tenemos envío local con tarifa especial.', 'envios', 1, true),
  ('¿Cuál es la guía de talles?', 'Puedes encontrar nuestra guía de talles detallada en cada página de producto y en nuestra calculadora de talles. Generalmente, nuestras prendas tienen un ajuste regular. Si tienes dudas, te recomendamos elegir una talla más grande para mayor comodidad.', 'productos', 2, true),
  ('¿Cuál es su política de devoluciones?', 'Ofrecemos cambios dentro de los 30 días posteriores a la compra. Los artículos deben estar en condiciones originales con etiquetas. Coordinamos el cambio por WhatsApp.', 'cambios', 3, true),
  ('¿Cómo puedo rastrear mi pedido?', 'Una vez que tu pedido sea enviado, recibirás un email con el número de seguimiento. Puedes usar este número en el sitio web del transportista para rastrear tu paquete en tiempo real.', 'envios', 4, true),
  ('¿Qué métodos de pago aceptan?', 'Aceptamos Mercado Pago (tarjetas de crédito, débito, dinero en cuenta), transferencias bancarias y efectivo en el showroom. Todos los pagos son procesados de forma segura.', 'pagos', 5, true),
  ('¿Cómo debo cuidar mis prendas Busy?', 'Para mantener la calidad de tus prendas, recomendamos lavar en agua fría, del lado del revés, secar al aire cuando sea posible, y planchar a baja temperatura si es necesario. Evita el uso de blanqueadores. Tenemos una guía completa en nuestro blog.', 'productos', 6, true),
  ('¿Tienen showroom físico?', 'Sí, tenemos un showroom privado en Mar del Plata. Coordinamos las visitas por WhatsApp para brindarte una atención personalizada.', 'general', 7, true),
  ('¿Puedo cambiar o cancelar mi pedido?', 'Puedes cambiar o cancelar tu pedido contactándonos por WhatsApp antes de que sea despachado. Una vez enviado, coordinamos el cambio cuando lo recibas.', 'cambios', 8, true)
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE public.faqs IS 'Frequently asked questions managed from admin panel';
