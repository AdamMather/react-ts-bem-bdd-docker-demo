Feature: Kennel boarding enrolment journey
  As a boarding administrator
  I want to manage kennel boarding enrolments
  So that I can capture, review and confirm pet boarding details

  Background:
    Given I navigate to the kennel boarding page

  Scenario: Kennel boarding list view displays the main elements
    Then I should see the kennel boarding page heading
    And I should see the owner search field
    And I should see the add owner button
    And I should see the owner results table

  Scenario: Required fields are validated before moving between steps
    Given I start a new kennel boarding enrolment
    When I submit the current kennel boarding step
    Then I should see the kennel boarding error message "Owner Details: full name is required."
    When I enter "Jordan Miles" into the kennel field "Full name"
    And I submit the current kennel boarding step
    Then I should see the kennel boarding error message "Owner Details: phone number is required."
    When I enter "07123456789" into the kennel field "Phone number"
    And I submit the current kennel boarding step
    Then I should see the kennel step "Pet Details"
    When I submit the current kennel boarding step
    Then I should see the kennel boarding error message "Pet Details: pet name is required."

  Scenario: User can review, edit and confirm a kennel boarding enrolment
    Given I start a new kennel boarding enrolment
    When I complete the kennel boarding journey with valid data
    Then I should see the kennel confirmation page
    When I edit the kennel section "Feeding & Routine"
    Then I should see the kennel step "Feeding & Routine"
    When I enter "Salmon kibble" into the kennel field "Food type"
    And I advance to the kennel confirmation page
    Then I should see "Salmon kibble" in the kennel review content
    When I confirm the kennel boarding enrolment
    Then I should return to the kennel boarding list view
    And I should see a kennel boarding success banner
