import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ButtonFull from "@/components/button/buttonFull";
import { useEffect, useState } from "react";
import { checkAuth } from "@/utils/api";

export default function AccountPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const loadUser = async () => {
      const res = await checkAuth();
      if (res.success) {
        const user = res.data?.user;
        const name =
          (user?.first_name as string) ||
          (user?.firstName as string) ||
          (user?.username as string) ||
          "";
        setFirstName(name);
      } else {
        // not authenticated
        setFirstName("");
      }
    };

    loadUser();
  }, []);

  const handleLogOut = () => {
    router.push("/(auth)/welcome");
  };

  const handleFeedback = () => {
    // Placeholder - not implemented
    console.log("Feedback");
  };

  const handleShare = () => {
    // Placeholder - not implemented
    console.log("Share with Friends");
  };

  const handleReview = () => {
    // Placeholder - not implemented
    console.log("Leave a Review");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message Card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>
              Hello, {firstName || "there"}!
            </Text>
            <Text style={styles.welcomeSubtext}>
              Thanks for choosing CardSense.
            </Text>
          </View>

          {/* General Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            <View style={styles.sectionContent}>
              {/* Region */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Region</Text>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>USA</Text>
                  <Ionicons name="chevron-down" size={24} color="#000000" />
                </View>
              </View>

              {/* Appearance */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Appearance</Text>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>Light</Text>
                  <Ionicons name="chevron-down" size={24} color="#000000" />
                </View>
              </View>

              {/* Language */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Language</Text>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>English</Text>
                  <Ionicons name="chevron-down" size={24} color="#000000" />
                </View>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.sectionContent}>
              {/* Feedback */}
              <Pressable style={styles.settingRow} onPress={handleFeedback}>
                <Text style={styles.settingLabel}>Feedback</Text>
                <Ionicons name="chevron-forward" size={24} color="#000000" />
              </Pressable>

              {/* Share with Friends */}
              <Pressable style={styles.settingRow} onPress={handleShare}>
                <Text style={styles.settingLabel}>Share with Friends</Text>
                <Ionicons name="chevron-forward" size={24} color="#000000" />
              </Pressable>

              {/* Leave a Review */}
              <Pressable style={styles.settingRow} onPress={handleReview}>
                <Text style={styles.settingLabel}>Leave a Review</Text>
                <Ionicons name="chevron-forward" size={24} color="#000000" />
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Log Out Button */}
        <View style={styles.logOutContainer}>
          <View style={styles.logOutButtonWrapper}>
            <ButtonFull
              text="Log Out"
              onPress={handleLogOut}
              color="#DC2527"
              textColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for log out button
  },
  welcomeCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 20,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  welcomeSubtext: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 6,
  },
  sectionContent: {
    gap: 6,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    height: 35,
    paddingHorizontal: 15,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  logOutContainer: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    paddingHorizontal: 35,
  },
  logOutButtonWrapper: {
    marginHorizontal: -15, // Cancel out ButtonFull's marginHorizontal: 15
  },
});
