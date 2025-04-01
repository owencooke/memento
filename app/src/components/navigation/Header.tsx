import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/src/context/AuthContext";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Menu, MenuItem, MenuItemLabel } from "../ui/menu";
import { Button, ButtonIcon } from "@/src/components/ui/button";
import {
  Icon,
  SunIcon,
  MoonIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
} from "../ui/icon";
import { useTheme } from "../../context/ThemeContext";
import { Text } from "../ui/text";
import { router } from "expo-router";
import { MementoLogo } from "../MementoLogo";

interface HeaderProps {
  title?: string;
  mode?: "avatar" | "goBack";
}

const Header: React.FC<HeaderProps> = ({ title, mode = "avatar" }) => {
  const { session, signOut } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView className="bg-background-0" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4">
        {mode === "goBack" && (
          <Button
            className="p-0"
            variant="link"
            onPress={() => router.dismiss()}
            testID="header-back-button"
          >
            <ButtonIcon className="w-8 h-8" as={ChevronLeftIcon} />
          </Button>
        )}
        <MementoLogo size="sm" className="mr-2" />
        {title && mode === "avatar" && (
          <Text size="xl" className="font-semibold">
            {title}
          </Text>
        )}
        {mode === "avatar" && (
          <Menu
            className="bg-background-0"
            placement="bottom left"
            offset={4}
            trigger={({ ...triggerProps }) => (
              <Button
                {...triggerProps}
                variant="link"
                testID="user-menu-trigger"
              >
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
        )}
      </View>
    </SafeAreaView>
  );
};

export default Header;
