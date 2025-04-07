import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useAuth } from '../../lib/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'register'>;

export default function Register() {
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name || !phone) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signUp(email, password, name, phone);
      if (error) throw error;
      setVerificationSent(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const { error } = await signInWithApple();
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (verificationSent) {
    return (
      <View className="flex-1 bg-white justify-center px-4">
        <View className="bg-white p-6 rounded-lg shadow-sm">
          <View className="items-center mb-6">
            <Ionicons name="mail" size={48} color="#3D5AFE" />
          </View>
          <Text className="text-2xl font-bold text-center mb-4">Check Your Email</Text>
          <Text className="text-gray-600 text-center mb-6">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
            className="bg-[#3D5AFE] p-4 rounded-lg shadow-sm"
          >
            <Text className="text-white text-center font-semibold">Continue to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center px-4 py-8">
            <View className="bg-white p-6 rounded-lg shadow-sm">
              <Text className="text-2xl font-bold text-center mb-6">Create Account</Text>
              
              {error ? (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              ) : null}

              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 mb-1">Full Name</Text>
                  <TextInput
                    className="bg-gray-100 p-4 rounded-lg"
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View>
                  <Text className="text-gray-700 mb-1">Email</Text>
                  <TextInput
                    className="bg-gray-100 p-4 rounded-lg"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 mb-1">Phone Number</Text>
                  <TextInput
                    className="bg-gray-100 p-4 rounded-lg"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 mb-1">Password</Text>
                  <TextInput
                    className="bg-gray-100 p-4 rounded-lg"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}
                  className="bg-[#3D5AFE] p-4 rounded-lg shadow-sm"
                >
                  <Text className="text-white text-center font-semibold">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center justify-center space-x-2 my-4">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="text-gray-500 px-2">or</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  className="flex-row items-center justify-center bg-white border border-gray-300 p-4 rounded-lg shadow-sm"
                >
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                  <Text className="text-gray-700 ml-2 font-medium">Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  className="flex-row items-center justify-center bg-black p-4 rounded-lg shadow-sm"
                >
                  <Ionicons name="logo-apple" size={20} color="white" />
                  <Text className="text-white ml-2 font-medium">Continue with Apple</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-4">
                  <Text className="text-gray-600">Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                    <Text className="text-[#3D5AFE] font-semibold">Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 