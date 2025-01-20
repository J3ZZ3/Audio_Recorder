import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to ProRec! 👋',
    description: 'Your professional voice recorder app',
    icon: 'mic',
  },
  {
    title: 'Record',
    description: 'Tap the record button to start recording. Tap again to stop.',
    icon: 'mic',
  },
  {
    title: 'Manage Recordings',
    description: 'Rename, share, or delete your recordings. Tap on the name to edit it.',
    icon: 'list',
  },
  {
    title: 'Backup & Restore',
    description: 'Keep your recordings safe by backing them up. Restore them anytime.',
    icon: 'cloud-upload',
  },
];

export default function Tutorial({ visible, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('has_used_app', 'true');
      onClose();
    } catch (error) {
      console.error('Error saving app usage status:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Ionicons 
              name={TUTORIAL_STEPS[currentStep].icon} 
              size={60} 
              color="#4285F4" 
            />
            
            <Text style={styles.title}>
              {TUTORIAL_STEPS[currentStep].title}
            </Text>
            
            <Text style={styles.description}>
              {TUTORIAL_STEPS[currentStep].description}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {TUTORIAL_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep && styles.activeDot
                  ]}
                />
              ))}
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSkip}
              >
                <Text style={styles.buttonText}>
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Skip'}
                </Text>
              </TouchableOpacity>

              {currentStep < TUTORIAL_STEPS.length - 1 && (
                <TouchableOpacity 
                  style={[styles.button, styles.nextButton]} 
                  onPress={handleNext}
                >
                  <Text style={[styles.buttonText, styles.nextButtonText]}>
                    Next
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#252321',
    borderRadius: 16,
    width: '85%',
    padding: 24,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    width: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4285F4',
    width: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  buttonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4285F4',
  },
  nextButtonText: {
    color: '#fff',
  },
}); 