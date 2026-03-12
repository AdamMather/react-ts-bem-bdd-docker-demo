# Stock Control Lecture Guide

This document is a step-by-step lecture script showing how the Stock Control service and UI are implemented, how the UI facilitates the service features, and how these parts are typically wired together using Scala and React best practices.

## 1. Lecture Goals
- Explain the business rules and map them to domain models.
- Show how the Scala service is structured as a functional core.
- Demonstrate the React UI that mirrors the service behaviors.
- Illustrate standard integration patterns (API + UI data flow).
- Highlight accessibility and CSS conventions (WCAG AA, BEM).

## 2. Agenda
1. Requirements and domain mapping
2. Scala service design and implementation
3. React UI composition and state modeling
4. Wiring patterns for real systems
5. Testing strategy with Gherkin
6. QA and accessibility notes

## 3. Step-by-Step Development

### Step 1: Map Requirements to Domain Concepts
Requirements:
- If `onHand < threshold`, generate a purchase order.
- If a counterparty is both customer and supplier, generate an invoice.

Domain mapping:
- `StockLine` captures inventory state and preferred supplier.
- `Counterparty` captures customer/supplier status and balance.
- `PurchaseOrder` and `Invoice` are generated outputs.

### Step 2: Implement the Scala Service (Functional Core)
Location:
- `services/StockAutomationService/src/main/scala/com/example/stock/StockAutomationService.scala`

Key principles shown in lecture:
- Stateless, pure functions make logic testable.
- No I/O in the core. I/O belongs in a separate adapter or API layer.

Core methods:
- `generatePurchaseOrders(lines, now)`
- `generateInvoices(counterparties, today)`
- `runAutomation(stockLines, counterparties, now, today)`

Example (logic shape, not full source):
```scala
val belowThreshold = lines.filter(_.onHand < _.threshold)
val groupedBySupplier = belowThreshold.groupBy(_.preferredSupplierId)
```

Why this matters:
- Deterministic outputs make regression tests straightforward.
- Integration layers can be swapped without changing the core.

### Step 3: Add a Readme to Anchor the Rules
Location:
- `services/StockAutomationService/README.md`

Explain:
- Threshold logic
- Invoice logic
- Payment terms
- Example usage

### Step 4: Create the React UI Page
Location:
- `src/pages/StockControl/StockControl.tsx`
- `src/pages/StockControl/StockControl.css`

Lecture points:
- Use local state for a prototype, API hooks for production.
- Derive computed outputs with `useMemo`.
- Mirror service rules in the UI for traceability.

Key UI sections:
1. Stock Lines table
2. Auto-Generated Purchase Orders
3. Customer/Supplier Accounts
4. Auto-Generated Invoices

### Step 5: Add Navigation and Routing
Locations:
- `src/components/ActionBar/ActionBar.tsx`
- `src/App.jsx`
- `src/pages/Home/Home.tsx`

Lecture points:
- Make features discoverable from the ActionBar.
- Use route-level isolation for distinct workflows.

### Step 6: Apply BEM and WCAG AA Practices
BEM conventions:
- `stock-control__section`
- `stock-control__row--alert`
- `action-bar__link`

Accessibility practices:
- `aria-label` on inputs
- Focus-visible outlines on links and inputs
- Clear contrast between text and background

### Step 7: Add Gherkin Tests
Locations:
- `tests/features/stock-control.feature`
- `tests/step_definitions/stockControlSteps.js`

Command:
```bash
npm run test:gherkin:stock-control
```

Lecture points:
- Gherkin scenarios map to business outcomes.
- Step definitions use stable `data-testid` selectors.

## 4. Typical Wiring in Production
The current UI is local-state only. In production, wire as follows:

### API Layer
Suggested endpoints:
- `GET /api/stock-lines`
- `GET /api/counterparties`
- `POST /api/automation/run`

Suggested flow:
1. UI fetches stock lines and counterparties.
2. UI posts to automation endpoint for results.
3. API calls `StockAutomationService.runAutomation`.
4. API persists purchase orders and invoices.

### Frontend Data Flow
- Use a query layer (React Query or SWR).
- Use a mutation for automation runs.
- Cache results and update UI state on success.

### Example Request/Response
Request:
```json
{
  "stockLines": [ ... ],
  "counterparties": [ ... ]
}
```
Response:
```json
{
  "purchaseOrders": [ ... ],
  "invoices": [ ... ]
}
```

## 5. Testing Strategy for the Lecture
- Unit test the Scala service with small data sets.
- UI tests validate generation logic and visibility.
- Gherkin tests communicate intent to stakeholders.

## 6. Common Pitfalls to Call Out
- Generating duplicate POs without idempotency controls.
- Mixing I/O with domain logic in the Scala service.
- Using dynamic selectors in tests instead of stable IDs.
- Neglecting accessibility for inputs and focus states.

## 7. Suggested Demo Flow
1. Show requirements on a slide.
2. Walk through the Scala data model and logic.
3. Open the Stock Control UI and edit stock levels live.
4. Trigger visible purchase orders and invoices.
5. Run the Gherkin suite to validate behavior.

## 8. Reference Files
- `services/StockAutomationService/src/main/scala/com/example/stock/StockAutomationService.scala`
- `services/StockAutomationService/README.md`
- `src/pages/StockControl/StockControl.tsx`
- `src/pages/StockControl/StockControl.css`
- `tests/features/stock-control.feature`
- `tests/step_definitions/stockControlSteps.js`
- `docs/stock-control-service-ui.md`
