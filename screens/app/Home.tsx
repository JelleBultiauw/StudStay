import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const PLACEHOLDER_IMAGE = 'https://picsum.photos/300';

interface Kot {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  filters: string[];
  created_at: string;
}

type RootStackParamList = {
  Main: undefined;
  UploadKot: undefined;
  KotDetails: { kot: Kot };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Home() {
  const navigation = useNavigation<NavigationProp>();
  const [kots, setKots] = useState<Kot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchKots();
  }, []);

  const fetchKots = async () => {
    try {
      const { data, error } = await supabase
        .from('kots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the images to ensure they're in the correct format and valid URLs
      const processedKots = (data || []).map(kot => ({
        ...kot,
        images: Array.isArray(kot.images) 
          ? kot.images
              .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0)
              .map((url: string) => {
                if (url.includes('supabase.co')) {
                  return url;
                }
                if (url.startsWith('/')) {
                  return `https://uabrniklevoi3rnyqogs.supabase.co${url}`;
                }
                return url;
              })
          : []
      }));
      
      setKots(processedKots);
    } catch (error) {
      console.error('Error fetching kots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPress = () => {
    navigation.navigate('UploadKot');
  };

  const handleKotPress = (kot: Kot) => {
    navigation.navigate('KotDetails', { kot });
  };

  const renderKot = ({ item }: { item: Kot }) => {
    // Get the first valid image URL or use placeholder
    const imageUrl = item.images && item.images.length > 0 
      ? item.images[0]
      : PLACEHOLDER_IMAGE;

    return (
      <TouchableOpacity 
        style={styles.kotCard}
        onPress={() => handleKotPress(item)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.kotImage}
          onError={(e) => {
            console.log('Image loading error:', e.nativeEvent.error);
          }}
        />
        <View style={styles.kotInfo}>
          <Text style={styles.kotTitle}>{item.title}</Text>
          <Text style={styles.kotPrice}>€{item.price}/month</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.kotLocation}>{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>StudStay</Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleUploadPress}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload a Kot</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading kots...</Text>
        </View>
      ) : kots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No kots available yet</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUploadPress}
          >
            <Text style={styles.uploadButtonText}>Upload your first Kot</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={kots}
          renderItem={renderKot}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.kotList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchKots}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  kotList: {
    padding: 16,
  },
  kotCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  kotImage: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  kotInfo: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kotTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  kotPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kotLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  kotDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
