import React, { useState } from ""react"";
import { View, TextInput, Button, Text, Alert } from ""react-native"";
import { useAuth } from ""../../src/contexts/AuthContext"";

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("""");
  const [password, setPassword] = useState("""");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    setLoading(true);
    try {
      await signUp(email.trim(), password, remember);
      Alert.alert(""Check your email"", ""Verification email sent. Verify before logging in."");
      navigation.navigate(""Login"");
    } catch (e: any) {
      Alert.alert(""Registration error"", e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Email (@metu.edu.tr)</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize=""none"" keyboardType=""email-address"" />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={remember ? ""✔ Remember"" : ""Remember""} onPress={() => setRemember(!remember)} />
      <Button title={loading ? ""Registering..."" : ""Register""} onPress={onRegister} disabled={loading} />
    </View>
  );
}
