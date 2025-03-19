import { Redirect } from "expo-router";
import { useSession } from "@/src/context/AuthContext";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Center } from "@/src/components/ui/center";
import { Spinner } from "@/src/components/ui/spinner";
import NewUserForm from "./(app)/(screens)/new-user";

export default function SignIn() {
  const { session, isLoading, signIn } = useSession();

  // if (isLoading) {
  //   return (
  //     <Center className="w-full h-full">
  //       <Spinner />
  //     </Center>
  //   );
  // }

  // if (session) {
  //   return <Redirect href="/(app)/(tabs)/mementos" />;
  // }

  // return (
  //   <Center className="w-full h-full">
  //     <Button onPress={signIn}>
  //       <ButtonText>Sign In</ButtonText>
  //     </Button>
  //   </Center>
  // );
  return <NewUserForm />;
}
