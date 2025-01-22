import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth/AuthContext';

const RECORDINGS_KEY = '@audio_recordings';

export function useRecordings() {
  const [recordings, setRecordings] = useState([]);
  const [recording, setRecording] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecordings();
    } else {
      clearLocalRecordings();
    }
  }, [user]);

  const clearLocalRecordings = async () => {
    try {
      await AsyncStorage.removeItem(RECORDINGS_KEY);
      setRecordings([]);
      
      const recordingsDir = FileSystem.documentDirectory;
      const files = await FileSystem.readDirectoryAsync(recordingsDir);
      
      for (const file of files) {
        if (file.endsWith('.m4a')) {
          await FileSystem.deleteAsync(`${recordingsDir}${file}`);
        }
      }
    } catch (error) {
      console.error('Error clearing local recordings:', error);
    }
  };

  async function loadRecordings() {
    try {
      if (!user) return;

      setSyncing(true);
      
      await clearLocalRecordings();

      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loadedRecordings = [];

      for (const record of data) {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('recordings')
          .download(record.file_path);

        if (downloadError) continue;

        const localUri = `${FileSystem.documentDirectory}${record.id}.m4a`;
        await FileSystem.writeAsStringAsync(localUri, fileData, {
          encoding: FileSystem.EncodingType.Base64,
        });

        loadedRecordings.push({
          id: record.id,
          uri: localUri,
          name: record.name || `Recording ${loadedRecordings.length + 1}`,
          date: new Date(record.created_at),
        });
      }

      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(loadedRecordings));
      setRecordings(loadedRecordings);
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setSyncing(false);
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

  async function backupToCloud(recordingUri, recordingId) {
    try {
      const filePath = `${user.id}/${recordingId}.m4a`;
      const { error } = await supabase.storage
        .from('recordings')
        .upload(filePath, {
          uri: recordingUri,
          type: 'audio/m4a',
          name: `${recordingId}.m4a`,
        });
      
      if (error) throw error;
      
      const { error: dbError } = await supabase
        .from('recordings')
        .insert([
          {
            id: recordingId,
            user_id: user.id,
            file_path: filePath,
            created_at: new Date().toISOString(),
          },
        ]);
      
      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error backing up recording:', error);
    }
  }

  async function syncFromCloud() {
    if (!user) return;
    
    try {
      setSyncing(true);
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;

      for (const record of data) {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('recordings')
          .download(record.file_path);
        
        if (downloadError) throw downloadError;

        const localUri = FileSystem.documentDirectory + record.id + '.m4a';
        await FileSystem.writeAsStringAsync(localUri, fileData, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const newRecording = {
          id: record.id,
          uri: localUri,
          name: record.name || `Recording ${recordings.length + 1}`,
          date: new Date(record.created_at),
        };

        setRecordings(prev => {
          const exists = prev.some(r => r.id === record.id);
          if (!exists) {
            return [...prev, newRecording];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error syncing from cloud:', error);
    } finally {
      setSyncing(false);
    }
  }

  async function startRecording() {
    try {
      if (!user) {
        throw new Error('Please login to record');
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async function stopRecording() {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const id = Date.now().toString();
      
      const newRecording = {
        id,
        uri,
        name: `Recording ${recordings.length + 1}`,
        date: new Date(),
      };

      const newRecordings = [...recordings, newRecording];
      await saveRecordings(newRecordings);
      
      if (user) {
        await backupToCloud(uri, id);
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  async function deleteRecording(id) {
    try {
      if (!user) return;

      const recording = recordings.find(r => r.id === id);
      if (recording) {
        await FileSystem.deleteAsync(recording.uri);
        const newRecordings = recordings.filter(r => r.id !== id);
        await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(newRecordings));
        setRecordings(newRecordings);

        await supabase.storage
          .from('recordings')
          .remove([`${user.id}/${id}.m4a`]);
        
        await supabase
          .from('recordings')
          .delete()
          .match({ id, user_id: user.id });
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  }

  async function renameRecording(id, newName) {
    try {
      const newRecordings = recordings.map(recording =>
        recording.id === id ? { ...recording, name: newName } : recording
      );
      await saveRecordings(newRecordings);

      if (user) {
        await supabase
          .from('recordings')
          .update({ name: newName })
          .match({ id, user_id: user.id });
      }
    } catch (error) {
      console.error('Error renaming recording:', error);
    }
  }

  return {
    recordings,
    setRecordings,
    startRecording,
    stopRecording,
    deleteRecording,
    renameRecording,
    syncing,
    syncFromCloud: loadRecordings,
    clearLocalRecordings,
  };
}