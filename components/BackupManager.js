import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export default function BackupManager({ recordings, onRestoreComplete }) {
  const [syncing, setSyncing] = useState(false);

  async function backupRecordings() {
    try {
      setSyncing(true);
      
      // Create a zip file containing all recordings
      const zipFileName = `ProRec_Backup_${new Date().toISOString().split('T')[0]}.zip`;
      const zipUri = `${FileSystem.cacheDirectory}${zipFileName}`;
      
      // Create metadata file
      const metadata = recordings.map(rec => ({
        id: rec.id,
        name: rec.name,
        date: rec.date,
      }));
      
      await FileSystem.writeAsStringAsync(
        `${FileSystem.cacheDirectory}metadata.json`,
        JSON.stringify(metadata)
      );

      // Use sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipUri, {
          mimeType: 'application/zip',
          dialogTitle: 'Backup Recordings',
          UTI: 'public.zip-archive' // for iOS
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
      
      // Pick a zip file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        // Extract zip file
        const extractDir = `${FileSystem.cacheDirectory}restore/`;
        await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
        
        // Read metadata
        const metadata = JSON.parse(
          await FileSystem.readAsStringAsync(`${extractDir}metadata.json`)
        );
        
        const restoredRecordings = [];
        
        // Process each recording
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
        
        // Clean up
        await FileSystem.deleteAsync(extractDir, { idempotent: true });
        
        // Update recordings
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={backupRecordings}
          disabled={syncing}
        >
          <Text style={styles.buttonText}>Share Backup</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={restoreRecordings}
          disabled={syncing}
        >
          <Text style={styles.buttonText}>Restore Backup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 