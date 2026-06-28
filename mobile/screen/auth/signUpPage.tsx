import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import ButtonFull from "../../components/button/buttonFull";
import TextInputFull from "../../components/textInput/textInputFull";
import TextInputHalf from "../../components/textInput/textInputHalf";
import { registerUser } from "@/utils/api";

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setError(null);

    if (!firstName.trim()) {
      setError("First name is required");
      return false;
    }

    if (!lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await registerUser({
        email: email.trim(),
        password,
        confirmPassword,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      console.log("[SignUp] Registration response:", response);
      console.log("[SignUp] Response success:", response.success);

      if (response.success) {
        console.log("[SignUp] Showing success alert and navigating...");

        // Show success alert and navigate to login page
        // On web, Alert.alert might not work, so we'll navigate after a short delay
        if (Platform.OS === "web") {
          // For web, show alert and navigate immediately
          alert(
            "Register Success!\n\nYour account has been created successfully!",
          );
          // Small delay to ensure alert is shown before navigation
          setTimeout(() => {
            console.log("[SignUp] Navigating to login page...");
            router.push("/(auth)/login");
          }, 100);
        } else {
          // For mobile, use Alert.alert
          Alert.alert(
            "Register Success",
            "Your account has been created successfully!",
            [
              {
                text: "OK",
                onPress: () => {
                  console.log(
                    "[SignUp] Alert dismissed, navigating to login...",
                  );
                  router.push("/(auth)/login");
                },
              },
            ],
          );
        }
      } else {
        // Handle API errors
        const maybeError: any = (response as any).error;
        const details: any = maybeError?.details;
        const errorMessage =
          details &&
          typeof details === "object" &&
          Object.keys(details).length > 0
            ? Object.values(details).flat().join(", ")
            : maybeError?.message ||
              (response as any)?.detail ||
              "Registration failed. Please try again.";
        setError(errorMessage);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Create Account</Text>

        {/* Name Fields - Half Width */}
        <TextInputHalf
          placeholder1="First name"
          placeholder2="Last name"
          value1={firstName}
          value2={lastName}
          onChangeText1={setFirstName}
          onChangeText2={setLastName}
          input1Props={{ autoCapitalize: "words" }}
          input2Props={{ autoCapitalize: "words" }}
        />

        {/* Full Width Input Fields */}
        <View style={styles.inputsContainer}>
          <TextInputFull
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.inputSpacing} />
          <TextInputFull
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.inputSpacing} />
          <TextInputFull
            placeholder="Enter your password again"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Create Account Button */}
        <View style={styles.buttonContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5E17EB" />
            </View>
          ) : (
            <ButtonFull
              color="#5E17EB"
              text="Create Account"
              textColor="#FFFFFF"
              onPress={handleSignUp}
            />
          )}
        </View>

        {/* Log In Link */}
        <View style={styles.logInContainer}>
          <Text style={styles.logInText}>
            Already have an account?{" "}
            <Text
              style={styles.logInLink}
              onPress={() => router.push("/(auth)/login")}
            >
              Log in
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 35,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
    marginBottom: 30,
  },
  inputsContainer: {
    marginBottom: 20,
  },
  inputSpacing: {
    height: 18,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  logInContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logInText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  logInLink: {
    color: "#5E17EB",
  },
  errorContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  loadingContainer: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
