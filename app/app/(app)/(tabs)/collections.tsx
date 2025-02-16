import CameraPicker from "@/components/CameraPicker";
import UserProfile from "@/components/UserInfo";
import { View } from "react-native";

export default function TabTwoScreen() {
  return (
    <View>
      <UserProfile />
      <CameraPicker />
    </View>
  );
}
