import { Redirect } from 'expo-router';

// Redirect the root tab to the Initiate Swap screen so the default
// Expo starter page is never shown.
export default function Index() {
  return <Redirect href="/(employee)/swap/initiate" />;
}
