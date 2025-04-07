import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useAuth } from '../../lib/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'login'>;

export default function Login() {
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
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
              <Text className="text-2xl font-bold text-center mb-6">Welcome Back</Text>
              
              {error ? (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              ) : null}

              <View className="space-y-4">
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
                  onPress={handleLogin}
                  disabled={loading}
                  className="bg-[#3D5AFE] p-4 rounded-lg shadow-sm"
                >
                  <Text className="text-white text-center font-semibold">
                    {loading ? 'Logging in...' : 'Login'}
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
                  <Text className="text-gray-600">Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                    <Text className="text-[#3D5AFE] font-semibold">Register</Text>
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