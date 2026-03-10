# AutoCompleteTextbox listbox styling refactor

## Summary
- Refactored AutoCompleteTextbox styling to align with the vehicle contact field proportions and look.
- Retained combobox ARIA attributes and listbox wiring to improve screen reader affordances.
- Moved the root wrapper to a semantic section element and kept BEM-notated CSS.

## Files changed
- /home/administrator/Documents/_dev/project/react/vac-test/src/components/organisms/AutoCompleteTextbox.tsx
- /home/administrator/Documents/_dev/project/react/vac-test/src/components/organisms/styles/AutoCompleteTextbox.module.css
- /home/administrator/Documents/_dev/project/react/vac-test/src/components/molecules/LabelledInput.tsx
- /home/administrator/Documents/_dev/project/react/vac-test/src/components/atoms/Input.tsx

## Key styling updates
- Introduced `autocomplete-textbox` BEM block with `__control`, `__field`, `__input`, `__icon`, `__listbox`, `__option`, and `--open` modifier.
- Implemented a listbox-aligned control surface with the same padding, border width, and radius used by the vehicle contact select.
- Anchored the dropdown to the bottom of the input with hairline spacing using absolute positioning.
- Adjusted listbox padding, radius, and shadow to mirror the contact field proportions.
- Maintained visible focus indicator and sufficient contrast to align with WCAG 2.2 AA.

## Accessibility updates
- Input now declares `role="combobox"`, `aria-expanded`, `aria-controls`, and `aria-haspopup="listbox"`.
- Listbox is labeled and linked to the input for assistive technologies.

## Semantic HTML updates
- Converted the root wrapper to a `section` with a descriptive `aria-label`.

## Notes
- The input component now supports optional `className` and ARIA pass-through props so styles can be tailored per usage without global overrides.
