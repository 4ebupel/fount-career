"npx expo run:android" to rebuild

DO NOT USE && WHEN RENDERING COMPONENTS, use ternary {boolean ? </MyComponent> : null} instead - React Native cannot comprehend undefined returned by && apparently

Seems like you can do a mirriad of clicks on the task/habit/goal before it opens - very sussy solution was implemented using useNavigation from react-navigation/native, transitionEnd and e.data.closing; TS errors had to be silenced buuut the solution works, unlike expo's useFocusEffect