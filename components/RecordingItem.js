import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Sharing from 'expo-sharing';

export default function RecordingItem({ recording, onDelete, onRename }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(recording.name);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function playSound() {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recording.uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handleRename = () => {
    if (newName.trim()) {
      onRename(newName.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this recording?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete }
      ]
    );
  };

  const handleBackup = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(recording.uri, {
          mimeType: 'audio/m4a',
          dialogTitle: `Share ${recording.name}`,
          UTI: 'public.audio' // for iOS
        });
      }
    } catch (error) {
      console.error('Error sharing recording:', error);
      Alert.alert('Error', 'Failed to share recording');
    }
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={newName}
            onChangeText={setNewName}
            onBlur={handleRename}
            onSubmitEditing={handleRename}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.name}>{recording.name}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.date}>
          {format(new Date(recording.date), 'MMM d, yyyy HH:mm')}
        </Text>
      </View>

      <View style={styles.playbackInfo}>
        <Text style={styles.duration}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progress, 
              { width: `${(position / duration) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playSound} style={styles.button}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="#2f95dc" 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBackup} style={styles.button}>
          <Ionicons name="share" size={24} color="#4CBB17" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.button}>
          <Ionicons name="trash" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#252321',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',  
  },
  nameInput: {
    fontSize: 16,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#2f95dc',
    paddingVertical: 4,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  playbackInfo: {
    marginVertical: 8,
  },
  duration: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginTop: 4,
  },
  progress: {
    height: '100%',
    backgroundColor: '#2f95dc',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  button: {
    padding: 8,
  },
});