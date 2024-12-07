import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function RecordButton({ onStartRecording, onStopRecording }) {
  const [isRecording, setIsRecording] = useState(false);

  const handlePress = async () => {
    if (isRecording) {
      await onStopRecording();
    } else {
      await onStartRecording();
    }
    setIsRecording(!isRecording);
  };

  return (
    <TouchableOpacity
      style={[
        styles.recordButton,
        isRecording && styles.recording
      ]}
      onPress={handlePress}
    >
      <Ionicons
        name={isRecording ? "stop" : "mic"}
        size={24}
        color="white"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recordButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2f95dc',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recording: {
    backgroundColor: '#dc2f2f',
  },
});