import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

interface NavItem {
  name: string;
  route: string;
  icon:
    | keyof typeof MaterialCommunityIcons.glyphMap
    | keyof typeof Ionicons.glyphMap;
  iconSet: "MaterialCommunityIcons" | "Ionicons";
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    route: "/dashboard",
    icon: "view-dashboard-outline",
    iconSet: "MaterialCommunityIcons",
  },
  {
    name: "Transcation",
    route: "/transactions",
    icon: "swap-horizontal",
    iconSet: "MaterialCommunityIcons",
  },
  {
    name: "Cards",
    route: "/cards",
    icon: "credit-card-outline",
    iconSet: "MaterialCommunityIcons",
  },
  {
    name: "Account",
    route: "/settings",
    icon: "person-outline",
    iconSet: "Ionicons",
  },
];

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Hide nav bar on detail/add pages
  const hiddenRoutes = [
    "addCards",
    "addBudget",
    "addTransactions",
    "transactionsDetail",
    "budget",
  ];
  const shouldHideNavBar = hiddenRoutes.some((route) => {
    // Check if pathname includes the route (case-insensitive)
    const normalizedPathname = pathname.toLowerCase();
    const normalizedRoute = route.toLowerCase();
    return normalizedPathname.includes(normalizedRoute);
  });

  // Don't render nav bar if it should be hidden
  if (shouldHideNavBar) {
    return null;
  }

  const isActive = (route: string) => {
    // Normalize paths for comparison
    const normalizedPathname = pathname.replace(/\/$/, ""); // Remove trailing slash
    const normalizedRoute = route.replace(/\/$/, ""); // Remove trailing slash

    // Extract the route name (last part after /)
    const routeName = normalizedRoute.split("/").pop() || "";

    // Check multiple formats:
    // 1. Exact match
    if (normalizedPathname === normalizedRoute) return true;

    // 2. Match with (tabs) prefix
    if (normalizedPathname === `/(tabs)${normalizedRoute}`) return true;

    // 3. Match if pathname ends with the route name
    if (normalizedPathname.endsWith(`/${routeName}`)) return true;

    // 4. Match if pathname equals the route name (for root routes)
    if (normalizedPathname === routeName) return true;

    return false;
  };

  const handlePress = (route: string) => {
    // Use the full route path with (tabs) prefix for navigation
    const fullRoute = route.startsWith("/(tabs)") ? route : `/(tabs)${route}`;
    router.push(fullRoute as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {navItems.map((item) => {
        const active = isActive(item.route);
        const color = active ? "#5E17EB" : "#000000";

        return (
          <Pressable
            key={item.route}
            style={styles.navItem}
            onPress={() => handlePress(item.route)}
          >
            <View style={styles.iconContainer}>
              {item.iconSet === "MaterialCommunityIcons" ? (
                <MaterialCommunityIcons
                  name={
                    item.icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={24}
                  color={color}
                />
              ) : (
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={color}
                />
              )}
            </View>
            <Text style={[styles.label, { color }]}>{item.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E6EAEF",
    height: 63,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 43,
  },
  iconContainer: {
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});
