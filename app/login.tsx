import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleAuth = () => {
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Brand */}
      <View style={styles.header}>
        <Text style={styles.brand}>THUNKIN</Text>
        <Text style={styles.subtitle}>Food Reservation Platform</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </Text>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#AAA"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#AAA"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#AAA"
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
          <Text style={styles.primaryText}>
            {isLogin ? "Login" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Don’t have an account?  Sign up"
              : "Already have an account?  Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1F6",
    justifyContent: "center",
    padding: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  brand: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#1F2933",
  },

  subtitle: {
    fontSize: 15,
    color: "#E95D91",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 26,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },

  primaryButton: {
    backgroundColor: "#E95D91",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  switchText: {
    textAlign: "center",
    marginTop: 22,
    color: "#E95D91",
    fontWeight: "600",
  },
});
