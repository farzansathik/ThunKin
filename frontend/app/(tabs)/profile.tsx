import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import Typography from "@/components/typography";

export default function ProfileScreen() {
  const router = useRouter();
  const { setRestId, setIsVendor } = useUser();
  const [devZoneOpen, setDevZoneOpen] = useState(false);
  const [restIdInput, setRestIdInput] = useState("");
  const [accountName, setAccountName] = useState("Loading...");
  const [accountEmail, setAccountEmail] = useState("");
  const [joinedDate, setJoinedDate] = useState("2023");
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAccountEmail(user.email || "");

        const { data: dbUser, error: dbError } = await supabase
          .from("users")
          .select("account_name")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (!dbError && dbUser?.account_name) {
          setAccountName(dbUser.account_name);
        } else {
          const fallbackName =
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User";
          setAccountName(fallbackName);
        }

        const createdDate = new Date(user.created_at);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = createdDate.toLocaleDateString('en-US', options);
        setJoinedDate(formattedDate);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            router.replace("/login");
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const handleDeveloperBypass = async () => {
    if (!restIdInput.trim()) {
      Alert.alert("Error", "Please enter a restaurant ID");
      return;
    }

    const restIdNum = parseInt(restIdInput, 10);
    if (isNaN(restIdNum)) {
      Alert.alert("Error", "Restaurant ID must be a number");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("restaurant")
        .select("id, vendor_name")
        .eq("id", restIdNum)
        .maybeSingle();

      if (error || !data) {
        Alert.alert("Invalid Restaurant", `No restaurant with ID ${restIdNum} found in the system.`);
        return;
      }

      setRestId(restIdNum);
      setIsVendor(true);
      setRestIdInput("");
      router.push("/vendor");
    } catch (err) {
      Alert.alert("Error", "Failed to validate restaurant ID");
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBanner} />

      <View style={styles.whiteSheet}>
        <View style={styles.avatarRow}>
          <View>
            <View style={styles.avatar}>
              <Ionicons name="person" size={60} color="#ffffff" />
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileBtn}>
            <Typography size={13} weight="semibold" color="#E95D91">Edit Profile</Typography>
          </TouchableOpacity>
        </View>

        <View>
          <Typography style={styles.accountName} size={32} weight="bold">{accountName}</Typography>
          <Typography style={styles.accountEmail} size={13} weight="medium" color="#6d6d6d">{accountEmail}</Typography>
          <Typography size={11} weight="regular" color="#b1b1b1">Joined since {joinedDate}</Typography>
        </View>
      </View>

      <View style={styles.section}>
        <Typography size={14} weight="bold" color="#333" style={styles.sectionTitle}>Account</Typography>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="person-circle-outline" size={24} color="#E95D91" />
          </View>
          <Typography style={styles.menuItemText} size={15} weight="medium" color="#454545">Profile Settings</Typography>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="card-outline" size={24} color="#E95D91" />
          </View>
          <Typography style={styles.menuItemText} size={15} weight="medium" color="#454545">Payment Methods</Typography>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="notifications-outline" size={24} color="#E95D91" />
          </View>
          <Typography style={styles.menuItemText} size={15} weight="medium" color="#454545">Notifications</Typography>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.devZoneHeader}
          onPress={() => setDevZoneOpen(!devZoneOpen)}
        >
          <Ionicons name="code-outline" size={20} color="#999" />
          <Typography style={styles.devZoneTitle} size={14} weight="medium" color="#666">Developer Zone</Typography>
          <Ionicons 
            name={devZoneOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#999" 
          />
        </TouchableOpacity>

        {devZoneOpen && (
          <View style={styles.devZoneContent}>
            <View style={styles.vendorPortalItem}>
              <View style={styles.vendorPortalLeft}>
                <Ionicons name="storefront" size={24} color="#E95D91" />
                <Typography style={styles.vendorPortalText} size={15} weight="semibold" color="#E95D91">Vendor Portal</Typography>
              </View>
              <Typography style={styles.previewLabel} size={12} weight="semibold" color="#999">Preview</Typography>
            </View>

            <View style={styles.deviderLine} />

            <Typography style={styles.devZoneLabel} size={12} weight="semibold" color="#666">Quick Vendor Access (Testing)</Typography>
            <TextInput
              style={styles.devZoneInput}
              placeholder="Enter Restaurant ID"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={restIdInput}
              onChangeText={setRestIdInput}
            />
            <TouchableOpacity 
              style={styles.devZoneButton}
              onPress={handleDeveloperBypass}
            >
              <Typography size={14} weight="semibold" color="#fff">Access Vendor Mode</Typography>
            </TouchableOpacity>
            <Typography size={11} weight="regular" color="#999" style={styles.devZoneNote}>Note: This bypasses login for testing purposes</Typography>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="log-out-outline" size={24} color="#FF4444" />
          </View>
          <Typography style={styles.menuItemText} size={15} weight="medium" color="#FF4444">Logout</Typography>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  headerBanner: {
    backgroundColor: "#E95D91",
    height: 180,
  },
  whiteSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: -55,
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 75,
    backgroundColor: "#dfdfdf",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#f8f8f8",
  },
  editProfileBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "rgba(233, 93, 145, 0.15)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(233, 93, 145, 0.3)",
  },
  accountName: {
    bottom: 6,
    marginTop: 0,
  },
  accountEmail: {
    bottom: 6,
  },
  section: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderColor: "#e4e4e4",
    borderWidth: 1,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#aa788e2d",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(245, 245, 245, 0.38)",
    borderWidth: 1.5,
    borderColor: "rgba(194, 194, 194, 0.41)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  devZoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  devZoneTitle: {
    flex: 1,
    marginLeft: 10,
  },
  devZoneContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  vendorPortalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  vendorPortalLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  vendorPortalText: {
    marginLeft: 12,
  },
  previewLabel: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deviderLine: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 12,
  },
  devZoneLabel: {
    marginBottom: 10,
  },
  devZoneInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#333",
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  devZoneButton: {
    backgroundColor: "#E95D91",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  devZoneNote: {
    fontStyle: "italic",
  },
  bottomPadding: {
    height: 140,
  },
});