import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBarIcon, TabIconName } from "./icons/tabIcons";

interface NavItem {
  name: string;
  route: string;
  icon: TabIconName;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    route: "/dashboard",
    icon: "dashboard",
  },
  {
    name: "Transaction",
    route: "/transactions",
    icon: "transactions",
  },
  {
    name: "Cards",
    route: "/cards",
    icon: "cards",
  },
  {
    name: "Assistant",
    route: "/chat",
    icon: "chat",
  },
  {
    name: "Account",
    route: "/settings",
    icon: "account",
  },
];

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const hiddenRoutes = [
    "addCards",
    "addBudget",
    "addTransactions",
    "importCSV",
    "transactionsDetail",
    "budget",
  ];
  const shouldHideNavBar = hiddenRoutes.some((route) => {
    const normalizedPathname = pathname.toLowerCase();
    const normalizedRoute = route.toLowerCase();
    return normalizedPathname.includes(normalizedRoute);
  });

  if (shouldHideNavBar) {
    return null;
  }

  const isActive = (route: string) => {
    const normalizedPathname = pathname.replace(/\/$/, "");
    const normalizedRoute = route.replace(/\/$/, "");
    const routeName = normalizedRoute.split("/").pop() || "";

    if (normalizedPathname === normalizedRoute) return true;
    if (normalizedPathname === `/(tabs)${normalizedRoute}`) return true;
    if (normalizedPathname.endsWith(`/${routeName}`)) return true;
    if (normalizedPathname === routeName) return true;

    return false;
  };

  const handlePress = (route: string) => {
    const fullRoute = route.startsWith("/(tabs)") ? route : `/(tabs)${route}`;
    router.push(fullRoute as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {navItems.map((item) => {
        const active = isActive(item.route);
        const color = active ? "#5E17EB" : "#222222";

        return (
          <Pressable
            key={item.route}
            style={styles.navItem}
            onPress={() => handlePress(item.route)}
          >
            <View style={styles.iconContainer}>
              <TabBarIcon name={item.icon} size={24} color={color} />
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
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 43,
    minWidth: 0,
  },
  iconContainer: {
    marginBottom: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
});
