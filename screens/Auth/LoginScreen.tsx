import React, { useState } from ""react"";
import { View, TextInput, Button, Text, Alert } from ""react-native"";
import { useAuth } from ""../../src/contexts/AuthContext"";

export default function LoginScreen({ navigation }: any) {
  const { signIn, resendVerification } = useAuth();
  const [email, setEmail] = useState("""");
  const [password, setPassword] = useState("""");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password, remember);
    } catch (e: any) {
      if (String(e.message).toLowerCase().includes(""verify"")) {
        Alert.alert(""Email not verified"", ""Resend verification?"", [
          { text: ""Cancel"" },
          {
            text: ""Resend"",
            onPress: async () => {
              try {
                await resendVerification();
                Alert.alert(""Sent"", ""Verification email resent."");
              } catch (err: any) {
                Alert.alert(""Error"", err.message || String(err));
              }
            },
          },
        ]);
      } else {
        Alert.alert(""Login error"", e.message || String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize=""none"" keyboardType=""email-address"" />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={remember ? ""✔ Remember"" : ""Remember""} onPress={() => setRemember(!remember)} />
      <Button title={loading ? ""Signing in..."" : ""Sign in""} onPress={onLogin} disabled={loading} />
      <Text style={{ marginTop: 12 }}>
        Don't have an account? <Text onPress={() => navigation.navigate(""Register"")}>Register</Text>
      </Text>
    </View>
  );
}
