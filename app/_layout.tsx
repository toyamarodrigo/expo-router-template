import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Linking } from "react-native";
import { Link } from "expo-router";
import { useSegments } from "expo-router";
import { Drawer } from "@layouts/Drawer";

const RootLayout = () => {
  const segments = useSegments();

  const isLogin = segments[segments.length - 1] === "(tabs)";
  const drawerTitle = isLogin ? "LOGIN" : segments[segments.length - 1].toLocaleUpperCase();

  return (
    <Drawer
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView {...props}>
            <DrawerItem label="Website" onPress={() => Linking.openURL("https://www.expo.dev/")} />
            <Link href={"/"} onPress={() => props.navigation.closeDrawer()}>
              Login
            </Link>
            <Link href={"/home"} onPress={() => props.navigation.closeDrawer()}>
              Home
            </Link>
            <Link
              href={{ pathname: "/details", params: { user: "evanbacon" } }}
              onPress={() => props.navigation.closeDrawer()}
            >
              Details
            </Link>
            <Link href={"/counter"} onPress={() => props.navigation.closeDrawer()}>
              Counter
            </Link>
          </DrawerContentScrollView>
        );
      }}
      initialRouteName="/"
      screenOptions={{
        title: drawerTitle,
      }}
    />
  );
};

export default RootLayout;
