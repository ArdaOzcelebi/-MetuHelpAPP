import React from ""react"";
import { View, Text, Button, Alert } from ""react-native"";
import { useAuth } from ""../src/contexts/AuthContext"";

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();

  const onLogout = async () => {
    try {
      await signOut();
      navigation.navigate(""Login"");
    } catch (e: any) {
      Alert.alert(""Error"", e.message || String(e));
    }
  };

  if (!user)
    return (
      <View style={{ padding: 16 }}>
        <Text>No user signed in.</Text>
        <Button title=""Go to Login"" onPress={() => navigation.navigate(""Login"")} />
      </View>
    );

  return (
    <View style={{ padding: 16 }}>
      <Text>Email: {user.email}</Text>
      <Text>Verified: {user.emailVerified ? ""Yes"" : ""No""}</Text>
      <Button title=""Log Out"" onPress={onLogout} />
    </View>
  );
}
