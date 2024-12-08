import {
    StyleSheet,
    View,
    TextInput,
    FlatList,
    ImageBackground,
  } from "react-native";
  import { useState, useCallback } from "react";
  import { StatusBar } from "expo-status-bar";
  import { useRecordings } from "../../components/useRecordings"; // Adjusted path
  import RecordingItem from "../../components/RecordingItem"; // Adjusted path
  import RecordButton from "../../components/RecordButton"; // Adjusted path
  
  export default function AudioRecorderApp() {
    const [searchQuery, setSearchQuery] = useState("");
    const {
      recordings,
      startRecording,
      stopRecording,
      deleteRecording,
      renameRecording,
    } = useRecordings();
  
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
          source={require("./assets/bg.jpg")} // Adjusted path
          style={styles.backgroundImage}
        >
          <View style={styles.container}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search recordings..."
              value={searchQuery}
              onChangeText={setSearchQuery}
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
      paddingTop: 20, // Add padding to avoid overlap with the status bar
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
  });