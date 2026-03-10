const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');

Given('I navigate to the contact detail form page', async function () {
  await this.page.goto('http://127.0.0.1:3000');
  const addContactButton = this.page.getByRole('button', { name: /add new contact/i });
  if (await addContactButton.isVisible()) {
    await addContactButton.click();
  }
});

Given('the form is displayed', async function () {
  const visible = await this.page.locator('.detail-form').isVisible();
  assert.equal(visible, true);
});

When('I enter {string} into the Forename field', async function (text) {
  await this.page.fill('#firstName', text);
});

When('I enter {string} into the Last Name field', async function (text) {
  await this.page.fill('#lastName', text);
});

When('I enter {string} into the Telephone field', async function (text) {
  await this.page.fill('#telephone', text);
});

When('I enter {string} into the Mobile field', async function (text) {
  await this.page.fill('#mobile', text);
});

When('I enter {string} into the Email field', async function (text) {
  await this.page.fill('#email', text);
});

When('I select {string} as the Primary Contact', async function (value) {
  if (value) {
    await this.page.selectOption('#primaryContact', { label: value });
    return;
  }

  await this.page.selectOption('#primaryContact', { value: '' });
});

When('I click the Save button', async function () {
  await this.page.click('button[type="submit"]');
});

Then(/^I should see a success message "(.*)"$/, async function (message) {
  const expected = message.replace(/^"+|"+$/g, '');
  const text = await this.page.locator('.success-message').textContent();
  assert.equal((text || '').trim(), expected);
});

Then(/^I should see an error message "(.*)"$/, async function (message) {
  const expected = message.replace(/^"+|"+$/g, '');
  const text = await this.page.locator('.error-message').textContent();
  assert.equal((text || '').trim(), expected);
});
