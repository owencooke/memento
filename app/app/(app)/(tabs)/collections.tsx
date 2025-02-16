import CameraPicker from "@/components/CameraPicker";
import { Button, ButtonText } from "@/components/ui/button";
import UserProfile from "@/components/UserInfo";
import { useSession } from "@/context/AuthContext";
import { View } from "react-native";

export default function TabTwoScreen() {
  const { signOut } = useSession();
  return (
    <View>
      <UserProfile />
      <CameraPicker />
      <Button onPress={signOut}>
        <ButtonText>Log Out</ButtonText>
      </Button>
    </View>
  );
}
