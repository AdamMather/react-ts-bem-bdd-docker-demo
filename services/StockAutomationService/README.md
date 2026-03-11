# Stock Automation Service (Scala)

This service encapsulates the business rules for:
- Generating purchase orders when stock lines fall below threshold.
- Generating invoices for counterparties that are both customers and suppliers.

## Key Rules
- Purchase orders are created per preferred supplier when `onHand < threshold`.
- Order quantity is `threshold + reorderBuffer - onHand`, with a minimum of 1 unit.
- Invoices are created when `isCustomer && isSupplier && balanceDue > 0`.
- Default payment terms are 30 days from the issue date.

## Usage
The core logic lives in `StockAutomationService.scala`.

Example (pseudo):
- Call `StockAutomationService.runAutomation(stockLines, counterparties, Instant.now, LocalDate.now)`.
- Persist the resulting `purchaseOrders` and `invoices` in your infrastructure layer.
