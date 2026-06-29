import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import TextInputFull from "@/components/textInput/textInputFull";
import ButtonFull from "@/components/button/buttonFull";
import ButtonHalf from "@/components/button/buttonHalf";
import {
  getUserProfile,
  updateUserProfile,
  logoutUser,
  requestPasswordReset,
  UserProfile,
} from "@/utils/api";

function formatMemberDate(dateValue?: string): string {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(user: UserProfile): string {
  const first = user.first_name?.[0] || "";
  const last = user.last_name?.[0] || "";
  return (first + last).toUpperCase() || "U";
}

function displayName(user: UserProfile): string {
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return name || user.username || "User";
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const response = await getUserProfile();
    if (response.success && response.data) {
      setUser(response.data);
      setFormData({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email || "",
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setMessage({ type: "error", text: "First and last name are required." });
      return;
    }
    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "Email is required." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const response = await updateUserProfile({
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
    });

    if (response.success && response.data) {
      setUser(response.data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } else {
      const errorText =
        "error" in response
          ? response.error.message
          : "Failed to update profile. Please try again.";
      setMessage({ type: "error", text: errorText });
    }

    setSaving(false);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    const response = await requestPasswordReset(user.email);
    if (response.success) {
      Alert.alert(
        "Password reset",
        response.data?.message ||
          "If that email exists, a password reset link has been sent.",
      );
    } else {
      Alert.alert(
        "Error",
        "error" in response
          ? response.error.message
          : "Failed to send password reset email.",
      );
    }
  };

  const handleLogOut = async () => {
    await logoutUser();
    router.replace("/(auth)/welcome");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5E17EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorStateText}>Unable to load profile.</Text>
          <ButtonFull text="Try Again" onPress={loadProfile} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {message ? (
          <View
            style={[
              styles.messageBox,
              message.type === "success"
                ? styles.messageSuccess
                : styles.messageError,
            ]}
          >
            <Text
              style={
                message.type === "success"
                  ? styles.messageTextSuccess
                  : styles.messageTextError
              }
            >
              {message.text}
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          {isEditing ? "Edit Profile" : "Profile"}
        </Text>

        <View style={styles.card}>
          {!isEditing ? (
            <>
              <View style={styles.profileTopRow}>
                <View style={styles.profileIdentity}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(user)}</Text>
                  </View>
                  <View style={styles.profileMeta}>
                    <Text style={styles.profileName} numberOfLines={1}>
                      {displayName(user)}
                    </Text>
                    <Text style={styles.profileEmail} numberOfLines={1}>
                      {user.email}
                    </Text>
                    <Text style={styles.memberSince}>
                      Member since {formatMemberDate(user.date_joined)}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.editLink}
                  onPress={() => {
                    setMessage(null);
                    setIsEditing(true);
                  }}
                >
                  <Text style={styles.editLinkText}>Edit</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <View style={styles.inputWrapper}>
                <TextInputFull
                  placeholder="First Name"
                  value={formData.first_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, first_name: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.fieldLabel}>Last Name</Text>
              <View style={styles.inputWrapper}>
                <TextInputFull
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, last_name: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <TextInputFull
                  placeholder="Email Address"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formActions}>
                <ButtonHalf
                  button1={{
                    color: "#FFFFFF",
                    text: "Cancel",
                    border: "#E6EAEF",
                    textColor: "#222222",
                    onPress: handleCancelEdit,
                  }}
                  button2={{
                    color: "#5E17EB",
                    text: saving ? "Saving..." : "Save",
                    textColor: "#FFFFFF",
                    onPress: handleSave,
                    disabled: saving,
                  }}
                />
              </View>
            </View>
          )}
        </View>

        {!isEditing ? (
          <>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.card}>
              <Text style={styles.securityLabel}>Password</Text>
              <Text style={styles.securityDescription}>
                We&apos;ll email a reset link to {user.email}
              </Text>
              <View style={styles.securityButtonWrap}>
                <ButtonFull
                  text="Reset Password"
                  onPress={handlePasswordReset}
                  color="#FFFFFF"
                  textColor="#5E17EB"
                  border="#E6EAEF"
                />
              </View>
            </View>

            <View style={styles.logOutWrap}>
              <ButtonFull
                text="Log Out"
                onPress={handleLogOut}
                color="#DC2527"
                textColor="#FFFFFF"
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
    gap: 16,
  },
  errorStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777777",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },
  messageBox: {
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  messageSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  messageError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  messageTextSuccess: {
    fontSize: 13,
    fontWeight: "600",
    color: "#15803D",
  },
  messageTextError: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C",
  },
  card: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  profileIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#5E17EB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileMeta: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
  },
  profileEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: "#777777",
    marginTop: 2,
  },
  memberSince: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999999",
    marginTop: 6,
  },
  editLink: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    flexShrink: 0,
  },
  editLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5E17EB",
  },
  formSection: {
    marginTop: 0,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    marginHorizontal: -15,
    marginBottom: 10,
  },
  formActions: {
    marginTop: 8,
    marginHorizontal: -15,
  },
  securityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  securityDescription: {
    fontSize: 12,
    fontWeight: "600",
    color: "#777777",
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  securityButtonWrap: {
    marginHorizontal: -15,
  },
  logOutWrap: {
    marginHorizontal: -15,
    marginTop: 4,
  },
});
