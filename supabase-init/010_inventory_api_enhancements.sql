-- Migration: Inventory API Enhancements
-- Date: 2025-01-15
-- Description: Document inventory system API implementation and enhancements

-- Ensure inventory status fields are properly indexed for performance
CREATE INDEX IF NOT EXISTS idx_inventory_item_status_flags ON inventory_item (clinic_id, is_low_stock, is_out_of_stock, is_expired, is_expiring_soon);

-- Ensure transaction queries are optimized
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_clinic_date ON inventory_transaction (clinic_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_item_date ON inventory_transaction (item_id, transaction_date DESC);

-- Add comments to document the API structure
COMMENT ON TABLE inventory_item IS 'Core inventory items with quantities, pricing, and status tracking';
COMMENT ON TABLE inventory_transaction IS 'All stock movements including receive, dispense, adjust, return, and waste operations';
COMMENT ON TABLE supplier IS 'Supplier profiles and contact information for inventory management';

-- Document key columns
COMMENT ON COLUMN inventory_item.is_low_stock IS 'Auto-calculated: true when quantity <= quantity_min';
COMMENT ON COLUMN inventory_item.is_out_of_stock IS 'Auto-calculated: true when quantity = 0';
COMMENT ON COLUMN inventory_item.is_expired IS 'Auto-calculated: true when expiration_date <= current_date';
COMMENT ON COLUMN inventory_item.is_expiring_soon IS 'Auto-calculated: true when expiration_date <= current_date + 30 days';

-- Optional custom label when medicament lookup is unavailable
ALTER TABLE public.inventory_item
  ADD COLUMN IF NOT EXISTS custom_medicament_name text;

COMMENT ON COLUMN inventory_transaction.type IS 'Transaction type: receive, dispense, adjust, return, waste';
COMMENT ON COLUMN inventory_transaction.transaction_type IS 'Business type: purchase, sale, adjustment, waste, return';
COMMENT ON COLUMN inventory_transaction.quantity_change IS 'Positive for additions, negative for reductions';

-- Ensure RLS is enabled (already done in previous migrations but documenting here)
-- ALTER TABLE inventory_item ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory_transaction ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;

-- Document API endpoints implemented:
-- GET /api/inventory - List inventory items with filters and pagination
-- POST /api/inventory - Create new inventory item
-- GET /api/inventory/[id] - Get inventory item details
-- PUT /api/inventory/[id] - Update inventory item
-- DELETE /api/inventory/[id] - Archive inventory item (soft delete)
-- POST /api/inventory/receive - Receive new stock shipment
-- POST /api/inventory/use - Dispense/use inventory (existing)
-- POST /api/inventory/adjust - Manual stock adjustment
-- GET /api/inventory/transactions - View transaction history with filters
-- GET /api/inventory/reports - Generate inventory reports (overview, low_stock, expiring, valuation, activity)

-- GET /api/suppliers - List suppliers
-- POST /api/suppliers - Create supplier
-- PUT /api/suppliers/[id] - Update supplier
-- DELETE /api/suppliers/[id] - Delete supplier
