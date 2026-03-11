# Stock Control Service + UI (Cradle-to-Grave Developer Reference)

This document explains the end-to-end development and integration of the Stock Control automation service (Scala) and the accompanying React/TS UI. It is intended to be a comprehensive reference for future developers.

**Scope**
- Business rules for purchase order creation and customer/supplier invoice creation.
- Scala domain model and orchestration logic.
- React/TS UI component and routing integration.
- Current in-repo usage and extension points.
- Build/run/test guidance and operational considerations.

## 1. Business Requirements
**Purchase orders**
- When a stock line’s `onHand` falls below its `threshold`, a purchase order must be generated.
- Purchase orders are grouped by preferred supplier.
- Quantity ordered is `threshold + reorderBuffer - onHand` with a minimum of 1.

**Invoices**
- Invoices are generated for counterparties that are both customers and suppliers.
- Invoice amount equals `balanceDue`.
- Default payment terms are 30 days from issue date.

## 2. Repository Layout
**Scala service**
- `services/StockAutomationService/src/main/scala/com/example/stock/StockAutomationService.scala`
- `services/StockAutomationService/README.md`

**React/TS UI**
- `src/pages/StockControl/StockControl.tsx`
- `src/pages/StockControl/StockControl.css`
- `src/components/ActionBar/ActionBar.tsx`
- `src/components/ActionBar/ActionBar.css`
- `src/pages/Home/Home.tsx`
- `src/App.jsx`

## 3. Scala Service Design
### 3.1 Domain Model
**StockLine**
- `id`, `productLine`, `sku`, `description`
- `onHand`, `threshold`, `reorderBuffer`
- `unitCost`, `preferredSupplierId`

**Counterparty**
- `id`, `name`
- `isCustomer`, `isSupplier`
- `balanceDue`

**PurchaseOrder**
- `id`, `supplierId`, `createdAt`
- `lines`, `total`

**Invoice**
- `id`, `counterpartyId`
- `issuedOn`, `dueOn`, `amount`

### 3.2 Core Logic
- Purchase orders are produced when `onHand < threshold`. Lines are grouped by `preferredSupplierId`.
- Invoices are produced when `isCustomer && isSupplier && balanceDue > 0`.
- Payment terms are a fixed 30 days (constant).

### 3.3 Entry Points
- `generatePurchaseOrders(lines, now)`
- `generateInvoices(counterparties, today)`
- `runAutomation(stockLines, counterparties, now, today)` returning `AutomationResult`

### 3.4 Integration Strategy (Recommended)
The Scala service is currently a pure domain service. Typical integration patterns:
- Direct library usage within a Scala JVM service (preferred if you already have a Scala API).
- HTTP wrapper via Akka HTTP or http4s (recommended if consumed by JS/TS).
- Event-driven: feed stock events and counterparty updates, then publish PO/Invoice events.

## 4. UI Component Design
### 4.1 Page Component
- `StockControl.tsx` is a standalone route-based page that demonstrates the requirement flow.
- The UI uses local state for prototyping (no API wiring yet).
- Calculations in the UI mirror the Scala rules to validate behavior.
- UI markup and styling follow BEM conventions (including `stock-control__*` elements and `--modifier` states).
- Inputs and navigation elements include accessible labels and focus-visible outlines to align with WCAG AA.

### 4.4 Accessibility (WCAG AA)
- All interactive inputs include `aria-label` or visible labels.
- Focus-visible outlines are applied to primary inputs and navigation links.
- Color choices maintain readable contrast for text, badges, and tags.

### 4.2 Page Sections
1. Stock Lines: Editable `onHand`, `threshold`, `reorderBuffer`.
2. Auto-Generated Purchase Orders: Cards grouped by supplier.
3. Customer/Supplier Accounts: Toggle `isCustomer`/`isSupplier`, adjust `balanceDue`.
4. Auto-Generated Invoices: Cards based on customer+supplier condition.

### 4.3 Navigation Integration
- Added ActionBar link labeled “Stock Control”.
- Route: `/stock-control`.
- Back link on the Stock Control page routes to `/`.

## 5. Development Timeline (Cradle-to-Grave)
### 5.1 Discovery and Requirements Mapping
- Mapped purchase order trigger logic to stock line thresholds.
- Mapped invoice trigger logic to “customer + supplier” counterparties.
- Established reorder quantity and payment term rules.

### 5.2 Service Implementation
- Defined domain entities and output artifacts in Scala.
- Implemented grouping and calculation logic.
- Exposed orchestration entry point `runAutomation`.
- Added readme describing the business rules and usage.

### 5.3 UI Prototyping
- Built a dedicated Stock Control page in React/TS.
- Implemented data tables, cards, and calculated views.
- Added editable inputs to simulate changes.
- Styled with a distinct visual identity to avoid blending with existing UI.

### 5.4 App Integration
- Added ActionBar link for discoverability.
- Registered `/stock-control` route in `src/App.jsx`.
- Ensured route-level isolation from the existing contact management view.

## 6. Data Contracts (Suggested for Real Integration)
### 6.1 Stock Lines API (Suggested)
```json
{
  "id": "line-1",
  "productLine": "Electronics",
  "sku": "ELC-1001",
  "description": "Industrial sensor pack",
  "onHand": 18,
  "threshold": 25,
  "reorderBuffer": 10,
  "unitCost": 42.5,
  "preferredSupplierId": "supplier-1"
}
```

### 6.2 Counterparties API (Suggested)
```json
{
  "id": "party-1",
  "name": "Apex Logistics",
  "isCustomer": true,
  "isSupplier": true,
  "balanceDue": 2450
}
```

### 6.3 Automation Output (Suggested)
```json
{
  "purchaseOrders": [
    {
      "id": "PO-1",
      "supplierId": "supplier-1",
      "createdAt": "2026-03-11T10:20:30Z",
      "total": 1487.5,
      "lines": [
        {
          "sku": "ELC-1001",
          "description": "Industrial sensor pack",
          "quantity": 17,
          "unitCost": 42.5,
          "lineTotal": 722.5
        }
      ]
    }
  ],
  "invoices": [
    {
      "id": "INV-1",
      "counterpartyId": "party-1",
      "issuedOn": "2026-03-11",
      "dueOn": "2026-04-10",
      "amount": 2450
    }
  ]
}
```

## 7. Build and Run
### 7.1 UI
```bash
npm run dev
```
Navigate to:
- `http://localhost:5173/` for Contacts
- `http://localhost:5173/stock-control` for Stock Control

### 7.3 Gherkin Suite (Stock Control)
```bash
npm run test:gherkin:stock-control
```

### 7.2 Scala Service
The Scala service is currently a standalone domain module. If you integrate into a Scala project:
- Add the service source path to your build.
- Wire entry points into your API or job scheduler.

## 8. Testing Strategy
**Unit tests (recommended)**
- Purchase order generation per supplier.
- Boundary conditions: `onHand == threshold`, `onHand < threshold`, `balanceDue == 0`.
- Reorder quantity minimum enforcement.
- Invoice generation only when customer + supplier.

**UI tests (recommended)**
- Verify PO cards appear when `onHand` is lowered below `threshold`.
- Verify invoice cards appear when counterparty is both customer and supplier with positive balance.
- Gherkin suite lives in `tests/features/stock-control.feature` and is executed via `npm run test:gherkin:stock-control`.

## 9. Extensibility Notes
**Service**
- Replace fixed payment terms with a per-counterparty term.
- Support multiple warehouses or location-based thresholds.
- Add tax, shipping, or currency handling to PO totals.

**UI**
- Replace local state with API-backed data.
- Add audit trail for generated POs/invoices.
- Export POs/invoices to PDF or CSV.

## 10. Operational Considerations
**Idempotency**
- Avoid duplicate POs by storing a last-run marker or using deterministic IDs.

**Scheduling**
- Run automation on a schedule (e.g., hourly) or on stock-change events.

**Auditing**
- Persist outputs and present change history to users.

## 11. Quick Reference
**Stock automation service**
- `StockAutomationService.runAutomation(...)`

**UI route**
- `/stock-control`
