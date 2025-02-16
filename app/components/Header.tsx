import React from "react";
import { View, Text, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Image } from "@/components/ui/image";
import { useSession } from "@/context/AuthContext";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  navigate: (route: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, navigate }) => {
  const { session } = useSession();

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
          source={require("@/assets/images/react-logo.png")}
          alt="Memento Logo"
          className="mr-2"
        />
        <Text className="text-xl font-semibold">{title}</Text>
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
      </View>
    </SafeAreaView>
  );
};

export default Header;
