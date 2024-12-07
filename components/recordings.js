export const RECORDING_OPTIONS = {
  android: {
    extension: '.m4a',
    outputFormat: 'mpeg_4',
    audioEncoder: 'aac',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'mpeg_4',
    audioQuality: 'medium',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export const recordingUtils = {
  formatDuration: (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  },

  generateFileName: (index) => {
    return `Recording ${index + 1}`;
  },

  generateId: () => {
    return Date.now().toString();
  },

  isValidRecording: (recording) => {
    return !!(
      recording.id &&
      recording.uri &&
      recording.name &&
      recording.date &&
      typeof recording.duration === 'number'
    );
  },
};

export const STORAGE_KEY = '@audio_recordings';

export const RECORDING_ERRORS = {
  PERMISSION_DENIED: 'Microphone permission was denied',
  INIT_FAILED: 'Failed to initialize recording',
  RECORDING_FAILED: 'Failed to record audio',
  PLAYBACK_FAILED: 'Failed to play audio',
  STORAGE_FAILED: 'Failed to access storage',
};