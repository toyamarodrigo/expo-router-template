import type { ComponentType } from "react";
import { Link, Slot, usePathname } from "expo-router";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import ChatActive from "@assets/images/Type=Chat, State=Active.svg";
import ChatDefault from "@assets/images/Type=Chat, State=Default.svg";
import HomeActive from "@assets/images/Type=Home, State=Active.svg";
import HomeDefault from "@assets/images/Type=Home, State=Default.svg";
import NoteActive from "@assets/images/Type=Note, State=Active.svg";
import NoteDefault from "@assets/images/Type=Note, State=Default.svg";
import NotifActive from "@assets/images/Type=Notif, State=Active.svg";
import NotifDefault from "@assets/images/Type=Notif, State=Default.svg";
import ProfileActive from "@assets/images/Type=Profile, State=Active.svg";
import ProfileDefault from "@assets/images/Type=Profile, State=Default.svg";
import { tokens } from "@theme/tokens";

const TABLET_BREAKPOINT = 768;
const TABLET_NAV_WIDTH = tokens.sizes.navWidthTablet;
const CONTENT_MAX_WIDTH = tokens.sizes.contentMaxWidth;
const LAYOUT_VERTICAL_PADDING = tokens.spacing.screenPaddingY;

type NavIconSet = {
  active: ComponentType<SvgProps>;
  inactive: ComponentType<SvgProps>;
};

const NAV_ITEMS = [
  {
    key: "home",
    href: "/",
    icon: { active: HomeActive, inactive: HomeDefault },
  },
  {
    key: "notes",
    href: "/home",
    icon: { active: NoteActive, inactive: NoteDefault },
    showDot: true,
  },
  {
    key: "chat",
    href: "/details",
    params: { user: "evanbacon" },
    icon: { active: ChatActive, inactive: ChatDefault },
  },
  {
    key: "notifications",
    href: "/counter",
    icon: { active: NotifActive, inactive: NotifDefault },
    showDot: true,
  },
  {
    key: "profile",
    href: "/profile",
    icon: { active: ProfileActive, inactive: ProfileDefault },
  },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

const NavButton = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
  const Icon = (isActive ? item.icon.active : item.icon.inactive) as NavIconSet["active"];
  return (
    <Link href={item.params ? { pathname: item.href, params: item.params } : item.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.navButton}
      >
        <View style={styles.iconWrap}>
          <Icon height={tokens.sizes.navIcon} width={tokens.sizes.navIcon} />
          {item.showDot ? <View style={styles.dot} /> : null}
        </View>
      </Pressable>
    </Link>
  );
};

const TabsLayout = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isTablet = width >= TABLET_BREAKPOINT;
  const navHeight = tokens.sizes.navIcon + tokens.spacing.navPaddingY * 2 + insets.bottom;
  const mobileBottomPadding = LAYOUT_VERTICAL_PADDING + navHeight;
  const tabletBottomPadding = LAYOUT_VERTICAL_PADDING + insets.bottom;

  const containerStyle = {
    paddingTop: insets.top + LAYOUT_VERTICAL_PADDING,
    paddingBottom: isTablet ? tabletBottomPadding : mobileBottomPadding,
    paddingLeft: isTablet ? TABLET_NAV_WIDTH : tokens.spacing.screenPaddingXMobile,
    paddingRight: isTablet ? tokens.spacing.screenPaddingXTablet : tokens.spacing.screenPaddingXMobile,
  };

  const navStyle = isTablet
    ? {}
    : {
        paddingBottom: tokens.spacing.navPaddingY + insets.bottom,
      };

  return (
    <View style={[styles.canvas, containerStyle]}>
      <View style={styles.content}>
        <Slot />
      </View>
      <View style={[styles.navBase, isTablet ? styles.navTablet : styles.navMobile, navStyle]}>
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.key} isActive={pathname === item.href} item={item} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    alignItems: "center",
    backgroundColor: tokens.colors.canvas,
  },
  content: {
    alignSelf: "center",
    flex: 1,
    maxWidth: CONTENT_MAX_WIDTH,
    width: "100%",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: tokens.spacing.xs,
    borderRadius: tokens.radii.sm,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: tokens.sizes.navIcon,
    position: "relative",
    width: tokens.sizes.navIcon,
  },
  navBase: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.borderDefault,
    position: "absolute",
  },
  navMobile: {
    alignSelf: "center",
    borderTopWidth: tokens.borders.hairline,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    maxWidth: tokens.sizes.navWidthMobile,
    paddingHorizontal: tokens.spacing.navPaddingX,
    paddingTop: tokens.spacing.navPaddingY,
    right: 0,
    width: "100%",
  },
  navTablet: {
    alignItems: "center",
    borderRightWidth: tokens.borders.hairline,
    bottom: 0,
    gap: tokens.spacing.navGap,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: tokens.spacing.navPaddingX,
    paddingVertical: tokens.spacing.navPaddingX,
    top: 0,
    width: TABLET_NAV_WIDTH,
  },
  dot: {
    backgroundColor: tokens.colors.accentAlert,
    borderColor: tokens.colors.white,
    borderRadius: tokens.sizes.navDot / 2,
    borderWidth: tokens.borders.hairline,
    height: tokens.sizes.navDot,
    position: "absolute",
    right: tokens.sizes.navDotOffset,
    top: tokens.sizes.navDotOffset,
    width: tokens.sizes.navDot,
  },
});

export default TabsLayout;
