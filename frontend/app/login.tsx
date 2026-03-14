import { useRouter } from "expo-router";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("user");

const handleAuth = async () => {

  const cleanEmail = email.trim();
  const cleanPassword = password.trim();

  if (isLogin) {

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword
  });

  if (error) {
    alert(error.message);
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("email", cleanEmail)
    .single();

  if (profileError) {
    alert("User profile not found");
    return;
  }

  const userId = profile.id;

  console.log("Logged in user ID:", userId);

  if (profile.account === "vendor") {
  router.replace("/vendor");
} else {
  router.replace("/(tabs)");
}
} else {

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: cleanPassword
  });

  if (error) {
    alert(error.message);
    return;
  }

  const { data: userRow, error: insertError } = await supabase.from("users").insert([
  {
    email: cleanEmail,
    account: accountType
  }
  ])
    .select()
    .single();

  if (insertError) {
    alert(insertError.message);
    return;
  }

  alert("Account created!");
}
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
            {!isLogin && (
      <View style={{ flexDirection: "row", marginBottom: 14 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: accountType === "user" ? "#E95D91" : "#EEE",
            borderRadius: 10,
            marginRight: 6,
            alignItems: "center"
          }}
          onPress={() => setAccountType("user")}
        >
          <Text>User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: accountType === "vendor" ? "#E95D91" : "#EEE",
            borderRadius: 10,
            marginLeft: 6,
            alignItems: "center"
          }}
          onPress={() => setAccountType("vendor")}
        >
          <Text>Vendor</Text>
        </TouchableOpacity>
      </View>
    )}

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#AAA"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#AAA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
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
