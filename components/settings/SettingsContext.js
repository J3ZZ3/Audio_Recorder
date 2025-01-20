import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [notifications, setNotifications] = useState(true);
  const [highQualityRecording, setHighQualityRecording] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedQuality = await AsyncStorage.getItem('highQualityRecording');

      if (savedNotifications) setNotifications(savedNotifications === 'true');
      if (savedQuality) setHighQualityRecording(savedQuality === 'true');

      if (savedNotifications === 'true') {
        await enableNotifications();
      }

      await updateAudioQuality(savedQuality === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleNotifications = async (value) => {
    try {
      setNotifications(value);
      await AsyncStorage.setItem('notifications', value.toString());
      
      if (value) {
        await enableNotifications();
      } else {
        await Notifications.setNotificationHandler(null);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const enableNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      setNotifications(false);
      await AsyncStorage.setItem('notifications', 'false');
      return;
    }

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  };

  const toggleHighQualityRecording = async (value) => {
    try {
      setHighQualityRecording(value);
      await AsyncStorage.setItem('highQualityRecording', value.toString());
      await updateAudioQuality(value);
    } catch (error) {
      console.error('Error toggling recording quality:', error);
    }
  };

  const updateAudioQuality = async (isHighQuality) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const quality = isHighQuality ? {
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      } : Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY;

      await Audio.setAudioModeAsync({
        ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
        ...quality,
      });
    } catch (error) {
      console.error('Error updating audio quality:', error);
    }
  };

  const value = {
    notifications,
    highQualityRecording,
    toggleNotifications,
    toggleHighQualityRecording,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 