## Basic

- [ ] Page loads and there's no console error when the page finished loading

## Fight Section (`src/components/FightSection.jsx`)

- Manually test it a lot and fix regressions
- Bug: after graveyard is loaded it should auto-scroll to the bottom of the list

## Last touches

- Remove unused code
- Fix comments like // Kept for backward compatibility
- Fix todos
- [ ] Calculate test coverage, to see if we missed any spots
- [ ] Run other code quality metrics, maybe complexity?, to look for refactor opportunities
- [ ] Run tests as part of the GitHub pipeline

## 📝 Notes

- Focus on **unit tests** (pure functions) first
- Add **integration tests** for state management
- Keep tests **simple and focused** - one concept per test
- Test **behavior, not implementation**
- Let the **tests improve the code**, we might need to refactor our code to simplify our tests
- Use **descriptive test names** that explain what's being tested
