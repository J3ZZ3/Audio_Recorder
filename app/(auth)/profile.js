import { useUser } from '@clerk/clerk-expo';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useState } from 'react';

const Profile = () => {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumbers?.[0]?.phoneNumber || '');
  const [emailAddress, setEmailAddress] = useState(user?.primaryEmailAddress?.emailAddress || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!user) return;

    setIsUpdating(true);

    try {
      await user.update({
        first_name: firstName,
        last_name: lastName,
        username: username,
        phone_number: phoneNumber, // Clerk automatically manages phone number verifications
        email_address: emailAddress, // Clerk handles email verifications
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return <Text>Loading...</Text>;

  return (
    <ImageBackground
        source={require("./assets/bg.jpg")} // Adjusted path
        style={styles.backgroundImage}
      >
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Welcome, {user.firstName} {user.lastName}!</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={emailAddress}
        onChangeText={setEmailAddress}
        keyboardType="email-address"
      />

      <Button
        title={isUpdating ? 'Updating...' : 'Update Profile'}
        onPress={handleUpdate}
        disabled={isUpdating}
        color="#000000"
      />
    </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  header: {
    color:"#BDBDBD",
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    color: "#BDBDBD",
    borderColor: '#BDBDBD',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#000000',
  },
});

export default Profile;
