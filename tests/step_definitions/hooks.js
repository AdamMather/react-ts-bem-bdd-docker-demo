const { BeforeAll, AfterAll, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

setDefaultTimeout(60 * 1000);

BeforeAll(async function () {
  global.browser = await chromium.launch({ headless: true });
});

AfterAll(async function () {
  if (global.browser) {
    await global.browser.close();
    global.browser = undefined;
  }
});

Before(async function () {
  this.context = await global.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  if (this.page) {
    await this.page.close();
  }

  if (this.context) {
    await this.context.close();
  }
});
