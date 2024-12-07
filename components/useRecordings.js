import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const RECORDINGS_KEY = '@audio_recordings';

export function useRecordings() {
  const [recordings, setRecordings] = useState([]);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    loadRecordings();
    setupAudio();
  }, []);

  async function setupAudio() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  }

  async function loadRecordings() {
    try {
      const storedRecordings = await AsyncStorage.getItem(RECORDINGS_KEY);
      if (storedRecordings) {
        setRecordings(JSON.parse(storedRecordings));
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  }

  async function saveRecordings(newRecordings) {
    try {
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(newRecordings));
      setRecordings(newRecordings);
    } catch (error) {
      console.error('Error saving recordings:', error);
    }
  }

  async function startRecording() {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;

      const { sound, status } = await recording.createNewLoadedSoundAsync();
      
      const newRecording = {
        id: Date.now().toString(),
        uri,
        name: `Recording ${recordings.length + 1}`,
        date: new Date().toISOString(),
        duration: status.durationMillis || 0,
      };

      const newRecordings = [...recordings, newRecording];
      await saveRecordings(newRecordings);
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  async function deleteRecording(id) {
    try {
      const recording = recordings.find(r => r.id === id);
      if (recording) {
        await FileSystem.deleteAsync(recording.uri);
        const newRecordings = recordings.filter(r => r.id !== id);
        await saveRecordings(newRecordings);
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  }

  function renameRecording(id, newName) {
    const newRecordings = recordings.map(recording =>
      recording.id === id ? { ...recording, name: newName } : recording
    );
    saveRecordings(newRecordings);
  }

  return {
    recordings,
    startRecording,
    stopRecording,
    deleteRecording,
    renameRecording,
  };
}