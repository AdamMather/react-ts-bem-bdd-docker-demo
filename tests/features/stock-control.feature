Feature: Stock control automation
  As an operations manager
  I want purchase orders and invoices to be generated automatically
  So that stock and counterparty activity is kept in sync

  Background:
    Given I navigate to the stock control page

  Scenario: Purchase orders are generated when stock is below threshold
    When I set the on hand for "ELC-1001" to "10"
    Then I should see a purchase order for supplier "Northwind Components"
    And the purchase order should include SKU "ELC-1001"

  Scenario: Purchase orders are not generated when stock is healthy
    When I set the on hand for "ELC-1001" to "60"
    Then I should not see a purchase order for supplier "Northwind Components"

  Scenario: Invoices are generated only for customer suppliers with balance due
    When I set the balance due for "Apex Logistics" to "3000"
    And I ensure "Apex Logistics" is marked as a customer and supplier
    Then I should see an invoice for "Apex Logistics"

  Scenario: Invoices are not generated for non-suppliers or zero balance
    When I set the balance due for "Apex Logistics" to "0"
    Then I should not see an invoice for "Apex Logistics"
