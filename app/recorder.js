import {
    StyleSheet,
    View,
    TextInput,
    FlatList,
    ImageBackground,
    TouchableOpacity,
  } from "react-native";
  import { useState, useCallback } from "react";
  import { StatusBar } from "expo-status-bar";
  import { useRecordings } from "../components/useRecordings";
  import RecordingItem from "../components/RecordingItem";
  import RecordButton from "../components/RecordButton";
  import BackupManager from "../components/BackupManager";
  import { Ionicons } from '@expo/vector-icons';
  import { useRouter } from 'expo-router';
  
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
  
    return (
      <>
        <StatusBar style="dark" translucent={true} />
        <ImageBackground
          source={require("../assets/images/bg.jpg")}
          style={styles.backgroundImage}
        >
          <View style={styles.container}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search recordings..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <BackupManager 
              recordings={recordings}
              onRestoreComplete={handleRestoreComplete}
            />

            <FlatList
              data={filteredRecordings}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
            
            <RecordButton
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
            />
            
            <View style={styles.fabContainer}>
              <TouchableOpacity 
                style={styles.fab}
                onPress={() => router.push('/profile')}
              >
                <Ionicons name="person" size={24} color="white" />
              </TouchableOpacity>
              
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
    searchInput: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      borderRadius: 8,
      borderColor: "#ddd",
    },
    list: {
      flex: 1,
      paddingHorizontal: 12,
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