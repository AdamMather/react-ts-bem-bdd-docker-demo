Feature: Detail Form Validation
  As a user
  I want to see proper error messages when I submit invalid data
  So that I can correct my input

  Background:
    Given I navigate to the contact detail form page

  Scenario Outline: Attempt to submit form with invalid data
    Given the form is displayed
    When I enter "<Forename>" into the Forename field
    And I enter "<LastName>" into the Last Name field
    And I enter "<Telephone>" into the Telephone field
    And I enter "<Mobile>" into the Mobile field
    And I enter "<Email>" into the Email field
    And I select "<PrimaryContact>" as the Primary Contact
    And I click the Save button
    Then I should see an error message "<ErrorMessage>"

    Examples:
      | Forename | LastName | Telephone  | Mobile      | Email             | PrimaryContact | ErrorMessage                       |
      |          | Doe      | 0123456789 | 07123456789 | john.doe@mail.com | Telephone      | "Forename is required"             |
      | John     |          | 0123456789 | 07123456789 | john.doe@mail.com | Telephone      | "Last Name is required"            |
      | John     | Doe      | abcdef     | 07123456789 | john.doe@mail.com | Telephone      | "Telephone must be a valid number" |
      | John     | Doe      | 0123456789 | abcdef      | john.doe@mail.com | Mobile         | "Mobile must be a valid number"    |
      | John     | Doe      | 0123456789 | 07123456789 | not-an-email      | Email          | "Email must be valid"              |
      | John     | Doe      | 0123456789 | 07123456789 | john.doe@mail.com |                | "Primary Contact must be selected" |
      |          |          |            |             |                   |                | "All fields are required"          |
