-- Add payment_method column to orders table
alter table public.orders 
  add column if not exists payment_method text check (payment_method in ('card', 'transfer', 'cash', 'other'));

-- Set default for existing rows
update public.orders 
  set payment_method = 'card' 
  where payment_method is null and channel = 'web';

update public.orders 
  set payment_method = 'other' 
  where payment_method is null;

-- Add comment
comment on column public.orders.payment_method is 'Payment method used: card (Mercado Pago), transfer (bank transfer), cash, or other';
