const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');

const toTestId = (name) => name.toLowerCase().replace(/\s+/g, '-');

Given('I navigate to the stock control page', async function () {
  await this.page.goto('http://127.0.0.1:3000/stock-control');
  await this.page.getByRole('heading', { name: /stock thresholds, purchase orders, and supplier invoices/i }).waitFor();
});

When('I set the on hand for {string} to {string}', async function (sku, value) {
  const row = this.page.getByTestId(`stock-line-${sku}`);
  const input = row.getByLabel(`On hand for ${sku}`);
  await input.fill(value);
});

When('I set the balance due for {string} to {string}', async function (name, value) {
  const row = this.page.getByTestId(`counterparty-${toTestId(name)}`);
  const input = row.getByLabel(`Balance due for ${name}`);
  await input.fill(value);
});

When('I ensure {string} is marked as a customer and supplier', async function (name) {
  const row = this.page.getByTestId(`counterparty-${toTestId(name)}`);
  const customer = row.getByRole('checkbox', { name: /customer/i });
  const supplier = row.getByRole('checkbox', { name: /supplier/i });

  if (!(await customer.isChecked())) {
    await customer.check();
  }
  if (!(await supplier.isChecked())) {
    await supplier.check();
  }
});

Then('I should see a purchase order for supplier {string}', async function (supplier) {
  const list = this.page.getByTestId('purchase-orders-list');
  const card = list.getByText(supplier, { exact: true });
  assert.equal(await card.isVisible(), true);
});

Then('the purchase order should include SKU {string}', async function (sku) {
  const list = this.page.getByTestId('purchase-orders-list');
  const line = list.getByText(sku, { exact: true });
  assert.equal(await line.isVisible(), true);
});

Then('I should not see a purchase order for supplier {string}', async function (supplier) {
  const list = this.page.getByTestId('purchase-orders-list');
  const listCount = await list.count();
  if (listCount === 0) {
    assert.equal(true, true);
    return;
  }
  const matches = await list.getByText(supplier, { exact: true }).count();
  assert.equal(matches === 0, true);
});

Then('I should see an invoice for {string}', async function (name) {
  const list = this.page.getByTestId('invoices-list');
  const card = list.getByText(name, { exact: true });
  assert.equal(await card.isVisible(), true);
});

Then('I should not see an invoice for {string}', async function (name) {
  const list = this.page.getByTestId('invoices-list');
  const listCount = await list.count();
  if (listCount === 0) {
    assert.equal(true, true);
    return;
  }
  const matches = await list.getByText(name, { exact: true }).count();
  assert.equal(matches === 0, true);
});
