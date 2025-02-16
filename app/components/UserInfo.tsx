import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { supabase } from "@/libs/supabase/config";
import { Image } from "@/components/ui/image";
import { User } from "@supabase/supabase-js";

export default function UserProfile() {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data?.user);
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || undefined);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!user) {
    return <Text>No user found.</Text>;
  }
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>User Info:</Text>
      <Text>ID: {user.id}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Provider: {user.app_metadata?.provider}</Text>
      <Text>Name: {user.user_metadata?.full_name}</Text>
      <Text>Avatar:</Text>
      {user.user_metadata?.avatar_url && (
        <Image size="md" source={{ uri: user.user_metadata.avatar_url }} />
      )}
    </View>
  );
}
