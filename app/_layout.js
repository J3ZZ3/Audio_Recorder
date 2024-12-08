import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import TabsLayout from './(tabs)/_layout'; // Correct path

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensure this line ends with a comma
  },
});