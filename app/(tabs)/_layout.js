import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AudioRecorderApp from './index'; // Your main app component
import SettingsScreen from './settings'; // Import your settings screen
import ProfileScreen from './profile'; // Import your profile screen
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home"  
        component={AudioRecorderApp} 
        options={{ 
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )
        }} 
      />
    </Tab.Navigator>
  );
}