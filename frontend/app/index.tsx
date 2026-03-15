import { Redirect } from 'expo-router';

export default function RootIndex() {
    // Change this to "/(employee)/chat" or "/(manager)/chat" to switch default screen
    return <Redirect href="/(employee)/chat" />;
}
