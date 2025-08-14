"npx expo run:android" to rebuild

DO NOT USE && WHEN RENDERING COMPONENTS, use ternary {boolean ? </MyComponent> : null} instead - React Native cannot comprehend undefined returned by && apparently

Redefine the DB schema since now we'll have reminders on Tasks aswell (which will probably require a lot of random fixes where I check for 'reminder_days' to determine if the obj is a Habit or a Task...)