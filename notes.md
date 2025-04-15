Fix Reminder (time selector);

Revisit types in the database;

Adjust the title on LastDetails.tsx when used in modal creation/editing;

onFocus/onBlur doesn't seem to work on inputs inside the modal, look into that;

In addTask.tsx when redirecting back and forcing refresh with router.replace('url') leaves old state in history so when you swipe right after redirect you go back to the same screen but with the old state;

DO NOT USE && WHEN RENDERING COMPONENTS, use ternary {boolean ? </MyComponent> : null} instead - React Native cannot comprehend undefined returned by && apparently