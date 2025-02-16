import React from "react";
import { View, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Image } from "@/src/components/ui/image";
import { useSession } from "@/src/context/AuthContext";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Menu, MenuItem, MenuItemLabel } from "./ui/menu";
import { Button } from "@/src/components/ui/button";
import { Icon, SunIcon, MoonIcon, ArrowLeftIcon } from "./ui/icon";
import { useTheme } from "../context/ThemeContext";
import { Text } from "./ui/text";

interface HeaderProps {
  title: string;
  navigate: (route: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, navigate }) => {
  const { session, signOut } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView className="bg-background-0" edges={["top"]}>
      <View
        className="flex-row items-center justify-between px-4"
        style={{
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <Image
          size="sm"
          // TODO: replace with our logo!
          source={require("@/src/assets/images/react-logo.png")}
          alt="Memento Logo"
          className="mr-2"
        />
        <Text size="xl" className="font-semibold">
          {title}
        </Text>
        <Menu
          className="bg-background-0"
          placement="bottom left"
          offset={4}
          trigger={({ ...triggerProps }) => (
            <Button {...triggerProps} variant="link">
              <Avatar size={"md"} className="ml-2">
                <AvatarFallbackText>
                  {session?.user.user_metadata.full_name}
                </AvatarFallbackText>
                <AvatarImage
                  source={{
                    uri: session?.user.user_metadata.avatar_url,
                  }}
                />
              </Avatar>
            </Button>
          )}
        >
          <MenuItem
            key="Theme"
            textValue="Theme"
            closeOnSelect={false}
            onPress={toggleTheme}
          >
            <Icon
              as={theme === "dark" ? SunIcon : MoonIcon}
              size="md"
              className="mr-2"
            />
            <MenuItemLabel size="md">
              {theme === "dark" ? "Light" : "Dark"} Mode
            </MenuItemLabel>
          </MenuItem>
          <MenuItem onPress={signOut} textValue="Sign out">
            <Icon as={ArrowLeftIcon} size="md" className="mr-2" />
            <MenuItemLabel size="md">Sign out</MenuItemLabel>
          </MenuItem>
        </Menu>
      </View>
    </SafeAreaView>
  );
};

export default Header;
