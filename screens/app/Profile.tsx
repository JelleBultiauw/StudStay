import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Profile</Text>
      {user && (
        <View className="space-y-4">
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-lg font-semibold">Display Name</Text>
            <Text className="text-lg">{user.displayname}</Text>
          </View>

          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-lg font-semibold">Email</Text>
            <Text className="text-lg">{user.email}</Text>
          </View>

          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-lg font-semibold">Phone</Text>
            <Text className="text-lg">{user.phone}</Text>
          </View>

          <TouchableOpacity
            className="bg-red-500 rounded-lg p-4 mt-8"
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">Logout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
} 