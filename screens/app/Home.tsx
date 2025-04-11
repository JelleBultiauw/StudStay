import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
          ? kot.images.map((url: string | null | string[]) => {
              if (Array.isArray(url)) {
                // If the URL is itself an array, take the first item
                url = url[0];
              }
              if (url && typeof url === 'string') {
                if (url.includes('supabase.co')) {
                  return url;
                }
                if (url.startsWith('/')) {
                  return `https://uabrniklevoi3rnyqogs.supabase.co${url}`;
                }
              }
              return 'https://via.placeholder.com/300';
            })
          : Array.isArray(kot.images[0]) 
            ? [kot.images[0][0]] // If the first item is an array, take its first element
            : [kot.images].map((url: string | null | string[]) => {
                if (Array.isArray(url)) {
                  url = url[0];
                }
                if (url && typeof url === 'string') {
                  if (url.includes('supabase.co')) {
                    return url;
                  }
                  if (url.startsWith('/')) {
                    return `https://uabrniklevoi3rnyqogs.supabase.co${url}`;
                  }
                }
                return 'https://via.placeholder.com/300';
              })
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
    // Use a reliable placeholder image URL
    const PLACEHOLDER_IMAGE = 'https://picsum.photos/300';
    let imageUrl = PLACEHOLDER_IMAGE;
    
    try {
      if (Array.isArray(item.images) && item.images.length > 0) {
        const firstImage = item.images[0];
        if (Array.isArray(firstImage)) {
          // If it's an array of arrays, get the first URL from the first array
          const potentialUrl = firstImage[0];
          if (typeof potentialUrl === 'string' && potentialUrl.trim()) {
            // Clean up the URL - remove any surrounding quotes or whitespace
            const cleanUrl = potentialUrl.trim().replace(/^["']|["']$/g, '');
            if (cleanUrl.startsWith('http')) {
              imageUrl = encodeURI(cleanUrl);
            }
          }
        } else if (typeof firstImage === 'string' && firstImage.trim()) {
          // Clean up the URL
          const cleanUrl = firstImage.trim().replace(/^["']|["']$/g, '');
          if (cleanUrl.startsWith('http')) {
            imageUrl = encodeURI(cleanUrl);
          }
        }
      }

      // Validate the URL
      new URL(imageUrl);
      console.log('Using image URL:', imageUrl);
    } catch (error) {
      console.log('Invalid URL, using placeholder:', imageUrl);
      imageUrl = PLACEHOLDER_IMAGE;
    }
    
    return (
      <TouchableOpacity 
        style={styles.kotCard} 
        onPress={() => handleKotPress(item)}
      >
        <Image 
          source={{ uri: imageUrl }}
          style={styles.kotImage}
          defaultSource={require('../../assets/placeholder.png')} // Add local fallback
          onError={(e) => {
            console.log('Image loading error for URL:', imageUrl);
            console.log('Error details:', e.nativeEvent.error);
          }}
        />
        <View style={styles.kotInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.kotTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.kotPrice}>€{item.price}/month</Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.kotLocation} numberOfLines={1}>{item.location}</Text>
          </View>
          <Text style={styles.kotDescription} numberOfLines={2}>{item.description}</Text>
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
