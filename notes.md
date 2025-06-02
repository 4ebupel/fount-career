Fix Reminder (time selector);

Revisit types in the database;

onFocus/onBlur doesn't seem to work on inputs inside the modal, look into that;

In addTask.tsx when redirecting back and forcing refresh with router.replace('url') leaves old state in history so when you swipe right after redirect you go back to the same screen but with the old state;

"npx expo run:android" to rebuild

DO NOT USE && WHEN RENDERING COMPONENTS, use ternary {boolean ? </MyComponent> : null} instead - React Native cannot comprehend undefined returned by && apparently