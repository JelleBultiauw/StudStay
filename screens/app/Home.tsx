import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  UploadKot: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UploadKot'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-8">Welcome to StudStay</Text>
        
        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-4 mb-4"
          onPress={() => navigation.navigate('UploadKot')}
        >
          <Text className="text-white text-center font-semibold">Upload a Kot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 