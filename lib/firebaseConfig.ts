import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { FirebaseApp } from 'firebase/app';
const firebaseConfig = require('../google-services.json');

// Firebase initialization for React Native
// This ensures Firebase is properly initialized before any Firebase services are used
let firebaseInitialized = false;

export const initializeFirebase = async () => {
  if (firebaseInitialized) {
    return;
  }

  try {
    if (Platform.OS === 'android') {
      const app = await initializeApp(firebaseConfig, 'com.fount.career');
      console.log(app);
      // Firebase is automatically initialized on Android through google-services.json
      // But we can add additional configuration here if needed
      console.log('Firebase auto-initialized on Android');
    } else if (Platform.OS === 'ios') {
      // For iOS, you would need to add GoogleService-Info.plist
      // and potentially manual initialization
      console.log('Firebase configuration needed for iOS');
    }
    
    firebaseInitialized = true;
    console.log('Firebase initialization completed');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}; 