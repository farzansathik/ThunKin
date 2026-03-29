import { useRouter } from "expo-router";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
} from "react-native";
import { useUser } from "../context/UserContext";
import Typography from "@/components/typography";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<"user" | "vendor">("user");
  const router = useRouter();
  const { setUserId, setRestId, setIsVendor } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [restaurantId, setRestaurantId] = useState("");

  const handleAuth = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // ── LOGIN ────────────────────────────────────────────────
    if (isLogin) {

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });
      if (error) { alert(error.message); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Auth failed."); return; }

      if (accountType === "vendor") {
        const { data: restData, error: restError } = await supabase
          .from("restaurant")
          .select("id, vendor_name")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (restError || !restData) {
          alert("No restaurant found for this account.");
          return;
        }

        setRestId(restData.id);
        setIsVendor(true);
        console.log("Vendor login, restId:", restData.id);
        router.replace("/vendor");

      } else {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (profileError || !profile) { alert("User profile not found"); return; }

        setUserId(profile.id);
        setIsVendor(false);
        console.log("User login, userId:", profile.id);
        router.replace("/(tabs)");
      }

    // ── SIGN UP ──────────────────────────────────────────────
    } else {

      if (accountType === "vendor") {
        if (!vendorName.trim()) { alert("Please enter your vendor name."); return; }
        if (!restaurantId.trim()) { alert("Please enter your Restaurant ID."); return; }

        const { data: restCheck, error: restCheckError } = await supabase
          .from("restaurant")
          .select("id, auth_id")
          .eq("id", Number(restaurantId.trim()))
          .maybeSingle();

        if (restCheckError || !restCheck) {
          alert("Restaurant ID not found. Please check and try again.");
          return;
        }

        if (restCheck.auth_id !== null) {
          alert("This restaurant already has an owner account.");
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (signUpError) { alert(signUpError.message); return; }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert("Sign up failed."); return; }

        const { error: updateError } = await supabase
          .from("restaurant")
          .update({
            auth_id: user.id,
            email: cleanEmail,
            vendor_name: vendorName.trim(),
          })
          .eq("id", Number(restaurantId.trim()));

        if (updateError) {
          alert("Account created but failed to link restaurant. Contact support.");
          return;
        }

        alert("Vendor account created! Please log in.");
        setIsLogin(true);

      } else {
        if (!username.trim()) { alert("Please enter your username."); return; }

        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (signUpError) { alert(signUpError.message); return; }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert("Sign up failed."); return; }

        const { data: userRow, error: insertError } = await supabase
          .from("users")
          .insert([{
            email: cleanEmail,
            account_name: username.trim(),
            auth_id: user.id,
          }])
          .select()
          .single();

        if (insertError) { alert(insertError.message); return; }

        const { data: roleData } = await supabase
          .from("role")
          .select("id")
          .eq("role_name", "user")
          .single();

        if (roleData) {
          await supabase.from("user_role").insert({
            user_id: userRow.id,
            role_id: roleData.id,
          });
        }

        alert("Account created! Please log in.");
        setIsLogin(true);
      }
    }
  };

  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   style={styles.container}
    // >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={require("../assets/images/Thunkin_images/THUNKIN_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Typography 
            weight="bold" 
            fontType={3}
            size={16} 
            color="#252525"
            style={styles.subtitle}
          >
            Login to reserve your favorite meals
          </Typography>
        </View>

        <View style={styles.card}>
          <Typography 
            weight="bold" 
            size={22}
            color="#3D3D3D"
            style={styles.title}
          >
            {isLogin ? "Welcome Back !" : "Create Account"}
          </Typography>

          {/* ── Username input ABOVE the toggle (user sign-up only) ── */}
          {!isLogin && accountType === "user" && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#AAA"
              value={username}
              onChangeText={setUsername}
            />
          )}

          {/* ── Vendor name input ABOVE the toggle (vendor sign-up only) ── */}
          {!isLogin && accountType === "vendor" && (
            <TextInput
              style={styles.input}
              placeholder="Vendor name"
              placeholderTextColor="#AAA"
              value={vendorName}
              onChangeText={setVendorName}
            />
          )}

          {/* ── User / Vendor toggle ── */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, accountType === "user" && styles.toggleActive]}
              onPress={() => setAccountType("user")}
            >
              <Typography 
                weight={accountType === "user" ? "semibold" : "medium"}
                size={14}
                color={accountType === "user" ? "#FFF" : "#999"}
              >
                User
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, accountType === "vendor" && styles.toggleActive]}
              onPress={() => setAccountType("vendor")}
            >
              <Typography 
                weight={accountType === "vendor" ? "semibold" : "medium"}
                size={14}
                color={accountType === "vendor" ? "#FFF" : "#999"}
              >
                Vendor
              </Typography>
            </TouchableOpacity>
          </View>

          {/* ── Vendor sign-up extra fields ── */}
          {!isLogin && accountType === "vendor" && (
            <View style={styles.vendorBox}>
              <Typography weight="bold" size={14} color="#E15284" style={styles.vendorBoxLabel}>
                Vendor Registration
              </Typography>
              <Typography size={10.5} color="#999" style={styles.vendorBoxHint}>
                Your restaurant must already be registered in the system.
              </Typography>
              <TextInput
                style={styles.input}
                placeholder="Restaurant ID (e.g. 1)"
                placeholderTextColor="#AAA"
                keyboardType="numeric"
                value={restaurantId}
                onChangeText={setRestaurantId}
              />
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
            <Typography weight="bold" size={17} color="#FFFFFF">
              {isLogin ? "Login" : "Sign Up"}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchRow}>
            <Typography weight="medium" size={14} color="#3D3D3D">
              {isLogin ? "Don't have an account?  " : "Already have an account?  "}
            </Typography>
            <Typography weight="semibold" size={14} color="#E15284">
              {isLogin ? "Sign up" : "Login"}
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    // </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E15284", 
  },
  scroll: {
    flexGrow: 1,
    // justifyContent: "flex-start", // pushed content toward the top
    padding: 24,
    paddingTop: 48,              
  },
  header: {
    alignItems: "center",
    marginBottom: 24,        
  },
  logo: {
    width: 350,
    height: 125,
    top: 60
  },
  subtitle: {
    textAlign: "center",
    marginTop: 4,
    top: 30
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    paddingBottom: 15,
    top: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    marginBottom: 22,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: "#E5E7EB",     
    backgroundColor: "#FFF",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  toggleActive: {
    backgroundColor: "#E15284",
  },
  vendorBox: {
    backgroundColor: "#FFF5F8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.2,
    borderColor: "#F4B8CF",      
  },
  vendorBoxLabel: {
    marginBottom: 6,
  },
  vendorBoxHint: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1.2,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    fontFamily: "Inter_400Regular",
  },
  primaryButton: {
    backgroundColor: "#E15284",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#E15284",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  switchText: {
    textAlign: "center",
    marginTop: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
});


// Authentication & Role Design Summary

// Normal user login → checks users table by auth_id
// Vendor login → checks restaurant table by auth_id

// Normal user signup → creates users row + user_role "user"
// Vendor signup → validates restaurant ID exists + unclaimed → creates Supabase auth account → updates restaurant row with auth_id, email, vendor_name

// role table → "user", "admin", "superadmin" (only user used now)
// user_role → links users ↔ role (vendors not involved)