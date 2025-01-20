import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const supportEmail = "Jesse.mashoana@gmail.com";
  const githubUrl = "https://github.com/J3ZZ3";

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
      
      {}
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
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 15,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  contact: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    marginTop: 10,
    textAlign: 'center',
  },
  policy: {
    fontSize: 14,
    marginTop: 20,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  githubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    justifyContent: 'center',
  },
  githubText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});