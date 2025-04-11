import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

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

export default function KotDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { kot } = route.params as { kot: Kot };
  const PLACEHOLDER_IMAGE = 'https://picsum.photos/300';

  const screenWidth = Dimensions.get('window').width;

  const processImageUrl = (url: string | null | string[]): string => {
    try {
      // If the input is null or undefined, return placeholder
      if (!url) {
        return PLACEHOLDER_IMAGE;
      }

      // If it's a JSON string, try to parse it
      if (typeof url === 'string' && (url.startsWith('[') || url.startsWith('"'))) {
        try {
          const parsed = JSON.parse(url);
          url = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch (e) {
          console.log('JSON parse error:', e);
        }
      }

      // Handle array cases
      if (Array.isArray(url)) {
        url = url[0];
      }

      // Final string processing
      if (url && typeof url === 'string') {
        const cleanUrl = url.trim().replace(/^["']|["']$/g, '');
        if (cleanUrl.includes('supabase.co')) {
          return encodeURI(cleanUrl);
        }
        if (cleanUrl.startsWith('/')) {
          return encodeURI(`https://uabrniklevoi3rnyqogs.supabase.co${cleanUrl}`);
        }
        if (cleanUrl.startsWith('http')) {
          return encodeURI(cleanUrl);
        }
      }
      return PLACEHOLDER_IMAGE;
    } catch (error) {
      console.log('Error processing URL:', error);
      return PLACEHOLDER_IMAGE;
    }
  };

  // Process and validate the images array before using it
  const processedImages = React.useMemo(() => {
    try {
      let images = kot.images;
      
      // If images is a string (JSON), try to parse it
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          console.log('Error parsing images JSON:', e);
          images = [];
        }
      }

      // Ensure images is an array
      if (!Array.isArray(images)) {
        images = [images].filter(Boolean);
      }

      return images;
    } catch (error) {
      console.log('Error processing images:', error);
      return [];
    }
  }, [kot.images]);

  const mainImageUrl = processImageUrl(processedImages[0]);
  console.log('Main image URL:', mainImageUrl);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kot Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: mainImageUrl }}
            style={[styles.mainImage, { width: screenWidth, height: screenWidth }]}
            defaultSource={require('../../assets/placeholder.png')}
            onError={(e) => {
              console.log('Main image loading error:', e.nativeEvent.error);
            }}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{kot.title}</Text>
          
          <View style={styles.priceLocationContainer}>
            <Text style={styles.price}>€{kot.price}/month</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.location}>{kot.location}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{kot.description}</Text>
          </View>

          {kot.filters && kot.filters.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.filtersContainer}>
                {kot.filters.map((filter: string, index: number) => (
                  <View key={index} style={styles.filterChip}>
                    <Text style={styles.filterText}>{filter}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {processedImages.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>More Photos</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}
              >
                {processedImages.slice(1).map((image: string, index: number) => {
                  const thumbnailUrl = processImageUrl(image);
                  return (
                    <Image
                      key={index}
                      source={{ uri: thumbnailUrl }}
                      style={styles.thumbnail}
                      defaultSource={require('../../assets/placeholder.png')}
                      onError={(e) => {
                        console.log(`Thumbnail ${index} loading error:`, e.nativeEvent.error);
                      }}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contact Owner</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding for the footer
  },
  imageContainer: {
    width: '100%',
  },
  mainImage: {
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceLocationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  imageScrollView: {
    marginTop: 8,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 