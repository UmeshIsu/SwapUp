import { Redirect } from 'expo-router';

export default function RootIndex() {
    return <Redirect href="/(employee)/leave" />;
}
//(manager)/leaveManagment  ,    /(employee)/leave  for look the manager one