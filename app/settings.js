import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

export default function SettingsScreen() {
  const supportEmail = "Jesse.mashoana@gmail.com"; // Replace with your support email
  const githubUrl = "https://github.com/J3ZZ3"; // Replace with your GitHub URL

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}`);
  };

  const handleGithubPress = () => {
    Linking.openURL(githubUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Information</Text>
      <Text style={styles.info}>
        This app allows you to record audio and manage your recordings.
      </Text>
      <Text style={styles.info}>
        Version: 1.0.0
      </Text>
      <TouchableOpacity onPress={handleEmailPress}>
        <Text style={styles.contact}>Contact Support: {supportEmail}</Text>
      </TouchableOpacity>
      <Text style={styles.policy}>
        Your privacy is important to us. We are committed to protecting your personal information and your right to privacy. 
        We do not sell your personal information to third parties. 
        The information we collect is used solely to enhance your experience with our app and to provide you with the services you request. 
        We take appropriate security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
      </Text>
      
      {/* GitHub Support Section */}
      <TouchableOpacity style={styles.githubContainer} onPress={handleGithubPress}>
        <Ionicons name="logo-github" size={24} color="white" />
        <Text style={styles.githubText}> Support me on GitHub</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black', // Set background to black
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  title: {
    fontSize: 28,
    fontWeight: '600', // Use a lighter font weight for a modern feel
    marginBottom: 15,
    color: '#FFFFFF', // White color for contrast
    textAlign: 'center', // Center the title text
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: '#B0B0B0', // Softer grey for text
    textAlign: 'center', // Center the info text
  },
  contact: {
    fontSize: 16,
    color: '#1E90FF', // Bright blue for visibility
    textDecorationLine: 'underline',
    marginTop: 10,
    textAlign: 'center', // Center the contact text
  },
  policy: {
    fontSize: 14,
    marginTop: 20,
    color: '#B0B0B0', // Softer grey for text
    textAlign: 'center', // Center the policy text
  },
  githubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    justifyContent: 'center', // Center the GitHub section
  },
  githubText: {
    fontSize: 16,
    color: '#FFFFFF', // White color for contrast
    marginLeft: 8, // Space between icon and text
  },
});