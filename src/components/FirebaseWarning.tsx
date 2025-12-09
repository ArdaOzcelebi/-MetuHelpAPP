import React from ""react"";
import { View, Text, StyleSheet } from ""react-native"";
import { DEMO_MODE } from ""../firebase/firebaseConfig"";

export default function FirebaseWarning() {
  if (!DEMO_MODE) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo mode: Authentication disabled</Text>
      <Text style={styles.text}>
        Firebase configuration missing. Authentication is disabled. See FIREBASE_AUTH_SETUP.md in the repo root.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ""#FFF4E5"",
    borderColor: ""#FFA500"",
    borderWidth: 1,
    padding: 10,
  },
  title: {
    color: ""#6b3e00"",
    fontWeight: ""700"",
  },
  text: {
    color: ""#6b3e00"",
  },
});
