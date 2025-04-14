Fix Reminder (time selector);

Revisit types in the database;

Adjust the title on LastDetails.tsx when used in modal creation/editing;

onFocus/onBlur doesn't seem to work on inputs inside the modal, look into that:

DO NOT USE && WHEN RENDERING COMPONENTS, use ternary {boolean ? </MyComponent> : null} instead - React Native cannot comprehend undefined returned by && apparently