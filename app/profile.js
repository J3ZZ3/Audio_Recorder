import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Switch, Alert, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/auth/AuthContext';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../components/settings/SettingsContext';

export default function ProfileScreen() {
  const { user, signOut, updateUserProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [highQualityRecording, setHighQualityRecording] = useState(true);
  const insets = useSafeAreaInsets();
  const { toggleNotifications, toggleHighQualityRecording } = useSettings();

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      const savedBg = await AsyncStorage.getItem('backgroundImage');
      const savedName = await AsyncStorage.getItem('displayName');
      const savedBio = await AsyncStorage.getItem('bio');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedQuality = await AsyncStorage.getItem('highQualityRecording');

      if (savedImage) setProfileImage(savedImage);
      if (savedBg) setBackgroundImage(savedBg);
      if (savedName) setDisplayName(savedName);
      if (savedBio) setBio(savedBio);
      if (savedNotifications) setNotifications(savedNotifications === 'true');
      if (savedQuality) setHighQualityRecording(savedQuality === 'true');
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveUserPreferences = async () => {
    try {
      await AsyncStorage.setItem('profileImage', profileImage || '');
      await AsyncStorage.setItem('backgroundImage', backgroundImage || '');
      await AsyncStorage.setItem('displayName', displayName);
      await AsyncStorage.setItem('bio', bio);
      await AsyncStorage.setItem('notifications', notifications.toString());
      await AsyncStorage.setItem('highQualityRecording', highQualityRecording.toString());
      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'profile') {
        setProfileImage(result.assets[0].uri);
      } else {
        setBackgroundImage(result.assets[0].uri);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (!user) return null;

  return (
    <>
      <StatusBar style="light" />
      <ImageBackground
        source={backgroundImage ? { uri: backgroundImage } : require('../assets/images/bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView 
          style={[
            styles.container, 
            { paddingTop: insets.top }
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => pickImage('profile')} style={styles.imageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="person" size={60} color="#666" />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            
            {editing && (
              <TouchableOpacity 
                onPress={() => pickImage('background')} 
                style={styles.backgroundButton}
              >
                <Ionicons name="image" size={24} color="white" />
                <Text style={styles.backgroundButtonText}>Change Background</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              editable={editing}
            />
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              editable={editing}
            />
            <Text style={styles.email}>{user.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recording Settings</Text>
            <View style={styles.preference}>
              <Text style={styles.preferenceText}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={toggleNotifications}
                disabled={!editing}
              />
            </View>
            <View style={styles.preference}>
              <Text style={styles.preferenceText}>High Quality Recording</Text>
              <Switch
                value={highQualityRecording}
                onValueChange={toggleHighQualityRecording}
                disabled={!editing}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {editing ? (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={saveUserPreferences}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setEditing(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  backgroundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 133, 244, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  backgroundButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4285F4',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4285F4',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4285F4',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: 'white',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  email: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceText: {
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  signOutButton: {
    backgroundColor: '#dc2f2f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: '#666',
  },
}); 