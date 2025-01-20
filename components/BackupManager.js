import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

export default function BackupManager({ recordings, onRestoreComplete }) {
  const [syncing, setSyncing] = useState(false);

  async function backupRecordings() {
    try {
      setSyncing(true);
      
      const zipFileName = `ProRec_Backup_${new Date().toISOString().split('T')[0]}.zip`;
      const zipUri = `${FileSystem.cacheDirectory}${zipFileName}`;
      
      const metadata = recordings.map(rec => ({
        id: rec.id,
        name: rec.name,
        date: rec.date,
      }));
      
      await FileSystem.writeAsStringAsync(
        `${FileSystem.cacheDirectory}metadata.json`,
        JSON.stringify(metadata)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipUri, {
          mimeType: 'application/zip',
          dialogTitle: 'Backup Recordings',
          UTI: 'public.zip-archive'
        });
      }
    } catch (error) {
      console.error('Backup error:', error);
    } finally {
      setSyncing(false);
    }
  }

  async function restoreRecordings() {
    try {
      setSyncing(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        const extractDir = `${FileSystem.cacheDirectory}restore/`;
        await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
        
        const metadata = JSON.parse(
          await FileSystem.readAsStringAsync(`${extractDir}metadata.json`)
        );
        
        const restoredRecordings = [];
        
        for (const meta of metadata) {
          const newUri = `${FileSystem.documentDirectory}${meta.id}.m4a`;
          await FileSystem.copyAsync({
            from: `${extractDir}${meta.id}.m4a`,
            to: newUri
          });
          
          restoredRecordings.push({
            id: meta.id,
            uri: newUri,
            name: meta.name,
            date: new Date(meta.date)
          });
        }
        
        await FileSystem.deleteAsync(extractDir, { idempotent: true });
        
        if (restoredRecordings.length > 0) {
          onRestoreComplete(restoredRecordings);
        }
      }
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <View style={styles.container}>
      {syncing ? (
        <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity 
            style={[styles.fab, { backgroundColor: '#000000' }]}
            onPress={backupRecordings}
            disabled={syncing}
          >
            <Ionicons name="cloud-upload" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.fab, { backgroundColor: '#000000' }]}
            onPress={restoreRecordings}
            disabled={syncing}
          >
            <Ionicons name="cloud-download" size={20} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 15,
    right: 90,
    top: 15
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  loader: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  }
}); 