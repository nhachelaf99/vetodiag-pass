-- Adds purchase_price to inventory_item and extends inventory_get_stats with financial totals

alter table public.inventory_item
  add column if not exists purchase_price numeric;

create or replace function public.inventory_get_stats(clinic_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'totalItems', count(*),
    'totalValue', coalesce(sum(coalesce(unit_price,0) * coalesce(quantity,0)), 0),
    'totalPurchaseValue', coalesce(sum(coalesce(purchase_price,0) * coalesce(quantity,0)), 0),
    'totalSaleValue', coalesce(sum(coalesce(unit_price,0) * coalesce(quantity,0)), 0),
    'totalProfitValue', coalesce(sum((coalesce(unit_price,0) - coalesce(purchase_price,0)) * coalesce(quantity,0)), 0),
    'lowStockItems', count(*) filter (where coalesce(quantity,0) <= coalesce(quantity_min,0)),
    'expiringItems', count(*) filter (
      where expiration_date is not null
        and expiration_date > (now() at time zone 'utc')
        and expiration_date <= ((now() at time zone 'utc') + interval '30 days')
    ),
    'expiredItems', count(*) filter (
      where expiration_date is not null
        and expiration_date <= (now() at time zone 'utc')
    )
  )
  into result
  from public.inventory_item
  where clinic_id = clinic_uuid
    and coalesce(is_archived,false) = false;

  return coalesce(result, jsonb_build_object(
    'totalItems', 0,
    'totalValue', 0,
    'totalPurchaseValue', 0,
    'totalSaleValue', 0,
    'totalProfitValue', 0,
    'lowStockItems', 0,
    'expiringItems', 0,
    'expiredItems', 0
  ));
end;
$$;
