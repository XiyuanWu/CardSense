import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import ButtonFull from "../../components/button/buttonFull";
import TextInputFull from "../../components/textInput/textInputFull";
import { loginUser } from "@/utils/api";

// Storage utility for "Remember me" functionality
const REMEMBER_ME_KEY = "@CardSense:rememberedEmail";

async function getRememberedEmail(): Promise<string | null> {
  try {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      return window.localStorage.getItem(REMEMBER_ME_KEY);
    }
    // For React Native, we can add AsyncStorage support later if needed
    return null;
  } catch (error) {
    console.error("Error getting remembered email:", error);
    return null;
  }
}

async function setRememberedEmail(email: string | null): Promise<void> {
  try {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      if (email) {
        window.localStorage.setItem(REMEMBER_ME_KEY, email);
      } else {
        window.localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
    // For React Native, we can add AsyncStorage support later if needed
  } catch (error) {
    console.error("Error setting remembered email:", error);
  }
}

export default function LogInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load remembered email on component mount
  useEffect(() => {
    const loadRememberedEmail = async () => {
      const rememberedEmail = await getRememberedEmail();
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    };
    loadRememberedEmail();
  }, []);

  const validateForm = (): boolean => {
    setError(null);

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

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      if (response.success) {
        // Handle "Remember me" functionality
        if (rememberMe) {
          // Save email for next time
          await setRememberedEmail(email.trim());
        } else {
          // Clear saved email if "Remember me" is unchecked
          await setRememberedEmail(null);
        }

        // Login successful - navigate to dashboard
        router.push("/(tabs)/dashboard");
      } else {
        // Handle API errors
        const errorResponse = response as any;
        let errorMessage = errorResponse.error?.message || "Login failed";

        // Check for details in different possible locations
        if (
          errorResponse.error?.details &&
          Object.keys(errorResponse.error.details).length > 0
        ) {
          errorMessage = Object.values(errorResponse.error.details)
            .flat()
            .join(", ");
        } else if (errorResponse.error?.detail) {
          errorMessage = errorResponse.error.detail;
        }

        // Handle CSRF errors specifically
        if (
          errorMessage.includes("CSRF") ||
          errorResponse.error?.code === "CSRF_ERROR"
        ) {
          errorMessage = "Session expired. Please try logging in again.";
        }

        console.error("[Login] Login error response:", errorResponse);
        setError(errorMessage);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/CardSense logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome Back!</Text>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <TextInputFull
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.inputSpacing} />
          <TextInputFull
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Remember Me & Forgot Password */}
        <View style={styles.optionsContainer}>
          <Pressable
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </Pressable>
          <Pressable onPress={() => {}}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5E17EB" />
            </View>
          ) : (
            <ButtonFull
              color="#5E17EB"
              text="Sign In"
              textColor="#FFFFFF"
              onPress={handleLogin}
            />
          )}
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>
            Not a member?{" "}
            <Text
              style={styles.signUpLink}
              onPress={() => router.push("/(auth)/signup")}
            >
              Create new account
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
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 400,
    height: 250,
  },
  welcomeText: {
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 5,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#222222",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  signUpContainer: {
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 40,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  signUpLink: {
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
