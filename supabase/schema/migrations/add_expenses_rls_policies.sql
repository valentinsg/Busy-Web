-- Agregar políticas RLS faltantes para la tabla expenses
-- Esto soluciona el error "Unexpected error" al crear gastos

-- Políticas de escritura para expenses
create policy if not exists expenses_insert for insert on public.expenses with check (true);
create policy if not exists expenses_update for update on public.expenses using (true) with check (true);
create policy if not exists expenses_delete for delete on public.expenses using (true);
