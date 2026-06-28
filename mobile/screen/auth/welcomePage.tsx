import { View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonFull from "../../components/button/buttonFull";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/CardSense logo.png")}
            style={styles.logo}
            resizeMode="cover"
          />
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Maximize Your Credit Card</Text>
            <Text style={[styles.titleText, styles.titleTextPurple]}>
              Rewards & Savings
            </Text>
          </View>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsContainer}>
          <ButtonFull
            color="#FFFFFF"
            text="Log In"
            border="#E6EAEF"
            textColor="#222222"
            onPress={() => router.push("/(auth)/login")}
          />
          <View style={styles.buttonSpacing} />
          <ButtonFull
            color="#5E17EB"
            text="Get Started"
            textColor="#FFFFFF"
            onPress={() => router.push("/(auth)/signup")}
          />
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
    justifyContent: "space-between",
    paddingHorizontal: 35,
    paddingBottom: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  logo: {
    width: 500,
    height: 300,
    maxWidth: "100%",
    marginBottom: -20,
  },
  textContainer: {
    alignItems: "center",
    marginTop: -20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
  },
  titleTextPurple: {
    color: "#5E17EB",
  },
  buttonsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  buttonSpacing: {
    height: 20,
  },
});
