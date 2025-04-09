import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Image, SafeAreaView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function UploadKot() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...uris]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const uploadKot = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to upload a kot');
      return;
    }

    if (!title || !description || !price || !location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please select at least one image');
      return;
    }

    setIsUploading(true);

    try {
      // Upload images to Supabase storage
      const imageUrls: string[] = [];

      for (const uri of images) {
        const fileName = uri.split('/').pop();
        if (!fileName) {
          throw new Error('Invalid file name');
        }
        
        const fileExt = fileName.split('.').pop();
        const filePath = `${user.id}/${Date.now()}-${fileName}`;
        
        // Convert URI to blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Upload to Supabase storage
        const { error: uploadError, data } = await supabase.storage
          .from('kot-photos')
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            upsert: true
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }

        if (!data) {
          throw new Error('No data returned from storage upload');
        }

        // Get public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('kot-photos')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error('Failed to get public URL');
        }

        imageUrls.push(publicUrlData.publicUrl);
      }

      // Insert kot data into the database
      const kotData = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        location: location.trim(),
        images: JSON.stringify(imageUrls),
        created_at: new Date().toISOString(),
      };

      console.log('Attempting to insert kot data:', kotData);

      const { data: insertData, error: dbError } = await supabase
        .from('kots')
        .insert(kotData)
        .select();

      if (dbError) {
        console.error('Database insert error:', dbError);
        console.error('Error details:', {
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          code: dbError.code
        });
        throw new Error(`Database error: ${dbError.message}`);
      }

      Alert.alert('Success', 'Kot uploaded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error uploading kot:', error);
      Alert.alert('Error', error.message || 'Failed to upload kot. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload a Kot</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formSection}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Cozy Studio in City Center"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your kot: amenities, rules, etc."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Price per month (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Naamsestraat 81, 3000 Leuven"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Photos</Text>
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={pickImages}
            disabled={isUploading}
          >
            <Ionicons name="camera" size={24} color="#666" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { color: '#666' }]}>Add Photos</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => (
                <View key={uri} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.uploadButton, isUploading && styles.disabledButton]} 
          onPress={uploadKot}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>
            {isUploading ? 'Uploading...' : 'Upload Kot'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
      android: {
        paddingTop: 12,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 32,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  imagePreviewWrapper: {
    width: '48%',
    aspectRatio: 16/9,
    marginBottom: 8,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  uploadButton: {
    backgroundColor: '#0066ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 