import {
    StyleSheet,
    View,
    TextInput,
    FlatList,
    ImageBackground,
    TouchableOpacity,
    Image,
  } from "react-native";
  import { useState, useCallback, useEffect } from "react";
  import { StatusBar } from "expo-status-bar";
  import { useRecordings } from "../components/useRecordings";
  import RecordingItem from "../components/RecordingItem";
  import RecordButton from "../components/RecordButton";
  import BackupManager from "../components/BackupManager";
  import { Ionicons } from '@expo/vector-icons';
  import { useRouter } from 'expo-router';
  import { useSafeAreaInsets } from 'react-native-safe-area-context';
  
  export default function AudioRecorderApp() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const {
      recordings,
      startRecording,
      stopRecording,
      deleteRecording,
      renameRecording,
      setRecordings,
    } = useRecordings();
    const [profileImage, setProfileImage] = useState(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
      loadProfileImage();
    }, []);

    const handleRestoreComplete = (restoredRecordings) => {
      setRecordings([...recordings, ...restoredRecordings]);
    };
  
    const filteredRecordings = recordings.filter((recording) =>
      recording.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    const renderItem = useCallback(
      ({ item }) => (
        <RecordingItem
          recording={item}
          onDelete={() => deleteRecording(item.id)}
          onRename={(newName) => renameRecording(item.id, newName)}
        />
      ),
      [deleteRecording, renameRecording]
    );

    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    return (
      <>
        <StatusBar style="light" />
        <ImageBackground
          source={require("../assets/images/bg.jpg")}
          style={styles.backgroundImage}
        >
          <View style={[
            styles.container,
            { paddingTop: insets.top }
          ]}>
            <View style={styles.header}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search recordings..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImage} 
                  />
                ) : (
                  <Ionicons name="person" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredRecordings}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
            
            <View style={styles.controlsContainer}>
              <BackupManager recordings={recordings} onRestoreComplete={handleRestoreComplete} />
              <RecordButton
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
              />
            </View>
            
            <View style={styles.fabContainer}>
              <TouchableOpacity 
                style={styles.fab}
                onPress={() => router.push('/settings')}
              >
                <Ionicons name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </>
    );
  }
  
  const styles = StyleSheet.create({
    backgroundImage: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    container: {
      flex: 1,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingTop: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingTop: 20,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      padding: 10,
      borderRadius: 8,
      borderColor: "#ddd",
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    list: {
      flex: 1,
      paddingHorizontal: 12,
    },
    controlsContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      alignItems: 'center',
    },
    fabContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      gap: 10,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });