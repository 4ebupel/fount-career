import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.expo?.extra,
    eas: {
      projectId: "94b29537-926b-498b-a4d7-b8cb1bb5df77",
    },
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  android: {
    package: "com.fount.career",
  },
  plugins: ['expo-sqlite', 'expo-router'],
});