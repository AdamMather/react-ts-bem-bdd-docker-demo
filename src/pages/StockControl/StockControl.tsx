import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './StockControl.css';

type StockLine = {
  id: string;
  sku: string;
  productLine: string;
  description: string;
  onHand: number;
  threshold: number;
  reorderBuffer: number;
  unitCost: number;
  preferredSupplier: string;
};

type Counterparty = {
  id: string;
  name: string;
  isCustomer: boolean;
  isSupplier: boolean;
  balanceDue: number;
};

type PurchaseOrderLine = {
  sku: string;
  description: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
};

type PurchaseOrder = {
  id: string;
  supplier: string;
  createdAt: string;
  lines: PurchaseOrderLine[];
  total: number;
};

type Invoice = {
  id: string;
  counterparty: string;
  issuedOn: string;
  dueOn: string;
  amount: number;
};

const initialStockLines: StockLine[] = [
  {
    id: 'line-1',
    sku: 'ELC-1001',
    productLine: 'Electronics',
    description: 'Industrial sensor pack',
    onHand: 18,
    threshold: 25,
    reorderBuffer: 10,
    unitCost: 42.5,
    preferredSupplier: 'Northwind Components'
  },
  {
    id: 'line-2',
    sku: 'FUR-2044',
    productLine: 'Furniture',
    description: 'Adjustable workstation base',
    onHand: 9,
    threshold: 15,
    reorderBuffer: 5,
    unitCost: 110,
    preferredSupplier: 'Cedar Manufacturing'
  },
  {
    id: 'line-3',
    sku: 'SUP-3309',
    productLine: 'Office Supplies',
    description: 'Premium paper boxes (10)',
    onHand: 55,
    threshold: 40,
    reorderBuffer: 15,
    unitCost: 12.75,
    preferredSupplier: 'Stationery Hub'
  }
];

const initialCounterparties: Counterparty[] = [
  {
    id: 'party-1',
    name: 'Apex Logistics',
    isCustomer: true,
    isSupplier: true,
    balanceDue: 2450
  },
  {
    id: 'party-2',
    name: 'Brighton Interiors',
    isCustomer: true,
    isSupplier: false,
    balanceDue: 1200
  },
  {
    id: 'party-3',
    name: 'Copperfield Wholesale',
    isCustomer: true,
    isSupplier: true,
    balanceDue: 0
  }
];

const formatCurrency = (value: number) => `£${value.toFixed(2)}`;

const StockControl: React.FC = () => {
  const [stockLines, setStockLines] = useState<StockLine[]>(initialStockLines);
  const [counterparties, setCounterparties] = useState<Counterparty[]>(initialCounterparties);

  const purchaseOrders = useMemo<PurchaseOrder[]>(() => {
    const now = new Date().toISOString();
    const grouped = stockLines
      .filter((line) => line.onHand < line.threshold)
      .reduce<Record<string, PurchaseOrderLine[]>>((acc, line) => {
        const orderQty = Math.max(1, line.threshold + line.reorderBuffer - line.onHand);
        const lineTotal = orderQty * line.unitCost;
        const orderLine: PurchaseOrderLine = {
          sku: line.sku,
          description: line.description,
          quantity: orderQty,
          unitCost: line.unitCost,
          lineTotal
        };
        if (!acc[line.preferredSupplier]) {
          acc[line.preferredSupplier] = [];
        }
        acc[line.preferredSupplier].push(orderLine);
        return acc;
      }, {});

    return Object.entries(grouped).map(([supplier, lines], index) => {
      const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
      return {
        id: `PO-${index + 1}`,
        supplier,
        createdAt: now,
        lines,
        total
      };
    });
  }, [stockLines]);

  const invoices = useMemo<Invoice[]>(() => {
    const today = new Date();
    return counterparties
      .filter((party) => party.isCustomer && party.isSupplier && party.balanceDue > 0)
      .map((party, index) => {
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + 30);
        return {
          id: `INV-${index + 1}`,
          counterparty: party.name,
          issuedOn: today.toLocaleDateString(),
          dueOn: dueDate.toLocaleDateString(),
          amount: party.balanceDue
        };
      });
  }, [counterparties]);

  const updateStockLine = (id: string, field: keyof StockLine, value: number) => {
    setStockLines((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              [field]: Number.isNaN(value) ? 0 : value
            }
          : line
      )
    );
  };

  const updateCounterparty = (id: string, field: keyof Counterparty, value: boolean | number) => {
    setCounterparties((prev) =>
      prev.map((party) =>
        party.id === id
          ? {
              ...party,
              [field]: value
            }
          : party
      )
    );
  };

  return (
    <div className="stock-control" role="main" aria-label="Stock automation workspace">
      <header className="stock-control__header">
        <div>
          <p className="stock-control__eyebrow">Operations Automation</p>
          <h1>Stock Thresholds, Purchase Orders, and Supplier Invoices</h1>
          <p className="stock-control__lead">
            When stock drops below its threshold the purchase order is created immediately. If a counterparty is both a
            customer and supplier, invoices are raised automatically.
          </p>
        </div>
        <Link className="stock-control__back" to="/">Back to Contacts</Link>
      </header>

      <section className="stock-control__section" aria-labelledby="stock-lines-title" data-testid="stock-lines-section">
        <div className="stock-control__section-header">
          <h2 id="stock-lines-title">Stock Lines</h2>
          <span className="stock-control__meta">Edit on-hand quantities or thresholds to trigger new purchase orders.</span>
        </div>
        <div className="stock-control__table">
          <div className="stock-control__row stock-control__row--head stock-control__row--stock" data-testid="stock-lines-header">
            <span>Product Line</span>
            <span>SKU</span>
            <span>On Hand</span>
            <span>Threshold</span>
            <span>Reorder Buffer</span>
            <span>Status</span>
          </div>
          {stockLines.map((line) => {
            const isBelow = line.onHand < line.threshold;
            return (
              <div
                key={line.id}
                className={`stock-control__row stock-control__row--stock ${isBelow ? 'stock-control__row--alert' : ''}`}
                data-testid={`stock-line-${line.sku}`}
              >
                <span>
                  <strong>{line.productLine}</strong>
                  <small>{line.description}</small>
                </span>
                <span>{line.sku}</span>
                <label>
                  <span className="stock-control__sr-only">On hand for {line.sku}</span>
                  <input
                    type="number"
                    min="0"
                    value={line.onHand}
                    onChange={(event) => updateStockLine(line.id, 'onHand', Number(event.target.value))}
                    aria-label={`On hand for ${line.sku}`}
                  />
                </label>
                <label>
                  <span className="stock-control__sr-only">Threshold for {line.sku}</span>
                  <input
                    type="number"
                    min="0"
                    value={line.threshold}
                    onChange={(event) => updateStockLine(line.id, 'threshold', Number(event.target.value))}
                    aria-label={`Threshold for ${line.sku}`}
                  />
                </label>
                <label>
                  <span className="stock-control__sr-only">Reorder buffer for {line.sku}</span>
                  <input
                    type="number"
                    min="0"
                    value={line.reorderBuffer}
                    onChange={(event) => updateStockLine(line.id, 'reorderBuffer', Number(event.target.value))}
                    aria-label={`Reorder buffer for ${line.sku}`}
                  />
                </label>
                <span className={isBelow ? 'stock-control__badge stock-control__badge--warning' : 'stock-control__badge'}>
                  {isBelow ? 'Below threshold' : 'Healthy'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="stock-control__section" aria-labelledby="purchase-orders-title" data-testid="purchase-orders-section">
        <div className="stock-control__section-header">
          <h2 id="purchase-orders-title">Auto-Generated Purchase Orders</h2>
          <span className="stock-control__meta">Grouped by preferred supplier when stock lines fall below threshold.</span>
        </div>
        {purchaseOrders.length === 0 ? (
          <p className="stock-control__empty">All stock lines are above threshold.</p>
        ) : (
          <div className="stock-control__cards" data-testid="purchase-orders-list">
            {purchaseOrders.map((order) => (
              <article key={order.id} className="stock-control__card" data-testid={`purchase-order-${order.id}`}>
                <header>
                  <div>
                    <h3>{order.id}</h3>
                    <p>{order.supplier}</p>
                  </div>
                  <span className="stock-control__tag">Created {new Date(order.createdAt).toLocaleString()}</span>
                </header>
                <div className="stock-control__lines">
                  {order.lines.map((line) => (
                    <div key={line.sku} className="stock-control__line">
                      <div>
                        <strong>{line.sku}</strong>
                        <p>{line.description}</p>
                      </div>
                      <div>
                        <span>Qty: {line.quantity}</span>
                        <span>{formatCurrency(line.lineTotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <footer>
                  <span>Total</span>
                  <strong>{formatCurrency(order.total)}</strong>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="stock-control__section" aria-labelledby="counterparty-title" data-testid="counterparty-section">
        <div className="stock-control__section-header">
          <h2 id="counterparty-title">Customer/Supplier Accounts</h2>
          <span className="stock-control__meta">Invoices are raised only when a counterparty is both customer and supplier.</span>
        </div>
        <div className="stock-control__table">
          <div className="stock-control__row stock-control__row--head" data-testid="counterparty-header">
            <span>Counterparty</span>
            <span>Customer</span>
            <span>Supplier</span>
            <span>Balance Due</span>
          </div>
          {counterparties.map((party) => (
            <div
              key={party.id}
              className="stock-control__row"
              data-testid={`counterparty-${party.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span>{party.name}</span>
              <label className="stock-control__checkbox">
                <input
                  type="checkbox"
                  checked={party.isCustomer}
                  onChange={(event) => updateCounterparty(party.id, 'isCustomer', event.target.checked)}
                />
                <span>Customer</span>
              </label>
              <label className="stock-control__checkbox">
                <input
                  type="checkbox"
                  checked={party.isSupplier}
                  onChange={(event) => updateCounterparty(party.id, 'isSupplier', event.target.checked)}
                />
                <span>Supplier</span>
              </label>
              <label>
                <span className="stock-control__sr-only">Balance due for {party.name}</span>
                <input
                  type="number"
                  min="0"
                  value={party.balanceDue}
                  onChange={(event) => updateCounterparty(party.id, 'balanceDue', Number(event.target.value))}
                  aria-label={`Balance due for ${party.name}`}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="stock-control__section" aria-labelledby="invoice-title" data-testid="invoices-section">
        <div className="stock-control__section-header">
          <h2 id="invoice-title">Auto-Generated Invoices</h2>
          <span className="stock-control__meta">Issued whenever a customer is also a supplier with balance due.</span>
        </div>
        {invoices.length === 0 ? (
          <p className="stock-control__empty">No invoices are required right now.</p>
        ) : (
          <div className="stock-control__cards" data-testid="invoices-list">
            {invoices.map((invoice) => (
              <article key={invoice.id} className="stock-control__card stock-control__card--invoice" data-testid={`invoice-${invoice.id}`}>
                <header>
                  <div>
                    <h3>{invoice.id}</h3>
                    <p>{invoice.counterparty}</p>
                  </div>
                  <span className="stock-control__tag">Issued {invoice.issuedOn}</span>
                </header>
                <div className="stock-control__invoice-meta">
                  <span>Due {invoice.dueOn}</span>
                  <strong>{formatCurrency(invoice.amount)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StockControl;
