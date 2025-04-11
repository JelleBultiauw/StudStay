// UploadKot.tsx

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert,
  StyleSheet, Image, SafeAreaView, Platform, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const availableFilters = ['Smoking Allowed', 'Dogs Allowed', 'Roommates'];

const filterCategories = [
  {
    title: '🏡 General Living',
    filters: [
      'Furnished', 'Unfurnished', 'Private Bathroom', 'Shared Bathroom',
      'Private Kitchen', 'Shared Kitchen', 'Balcony', 'Garden Access',
      'Wheelchair Accessible', 'Elevator in Building'
    ]
  },
  {
    title: '🧑‍🤝‍🧑 Roommate Preferences',
    filters: [
      'Only Girls', 'Only Boys', 'Mixed Gender', 'Couples Allowed',
      'No Roommates', 'Max 1 Roommate', 'Social Roommates', 'Quiet Roommates'
    ]
  },
  {
    title: '🐶 Lifestyle',
    filters: [
      'Smoking Allowed', 'No Smoking', 'Animals Allowed', 'No Animals',
      'Parties Allowed', 'No Parties'
    ]
  },
  {
    title: '💡 Utilities & Extras',
    filters: [
      'Wi-Fi Included', 'Bills Included', 'Washing Machine', 'Dryer',
      'Dishwasher', 'Cleaning Service Included'
    ]
  },
  {
    title: '📍 Location & Access',
    filters: [
      'Close to University', 'Close to Public Transport', 'City Center',
      'Quiet Neighborhood', 'Supermarket Nearby', '24/7 Access'
    ]
  }
];

export default function UploadKot() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

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
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeFilter = (filter: string) => {
    setSelectedFilters(prev => prev.filter(f => f !== filter));
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
      const imageUrls: string[] = [];

      for (const uri of images) {
        const fileName = uri.split('/').pop();
        const fileExt = fileName?.split('.').pop();
        const filePath = `${user.id}/${Date.now()}-${fileName}`;

        const response = await fetch(uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('kot-photos')
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase
          .storage
          .from('kot-photos')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error('Failed to get public URL');
        }

        imageUrls.push(publicUrlData.publicUrl);
      }

      const { error: dbError } = await supabase
        .from('kots')
        .insert({
          user_id: user.id,
          title,
          description,
          price: parseFloat(price),
          location,
          images: JSON.stringify(imageUrls),
          filters: selectedFilters,
          created_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      Alert.alert('Success', 'Kot uploaded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Upload Error', error.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload a Kot</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Price (€)</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} />
        </View>

        <View style={styles.formSection}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFiltersModalVisible(true)}>
            <Ionicons name="options" size={20} color="#444" />
            <Text style={{ marginLeft: 6 }}>Add Filters</Text>
          </TouchableOpacity>

          <View style={styles.filtersContainer}>
            {selectedFilters.map((filter) => (
              <View key={filter} style={styles.filterTag}>
                <Text style={styles.filterText}>{filter}</Text>
                <TouchableOpacity onPress={() => removeFilter(filter)}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Photos</Text>
          <TouchableOpacity style={styles.imageButton} onPress={pickImages} disabled={isUploading}>
            <Ionicons name="camera" size={24} color="#666" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Add Photos</Text>
          </TouchableOpacity>
          <View style={styles.imagePreviewContainer}>
            {images.map((uri, index) => (
              <View key={uri} style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeImageButton}>
                  <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.uploadButton, isUploading && styles.disabledButton]} onPress={uploadKot} disabled={isUploading}>
          <Text style={styles.buttonText}>{isUploading ? 'Uploading...' : 'Upload Kot'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for filter selection */}
      <Modal visible={filtersModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Filters</Text>
              <TouchableOpacity onPress={() => setFiltersModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {filterCategories.map((category) => (
                <View key={category.title} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <View style={styles.filtersGrid}>
                    {category.filters.map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        style={[
                          styles.filterChip,
                          selectedFilters.includes(filter) && styles.selectedFilterChip
                        ]}
                        onPress={() => toggleFilter(filter)}
                      >
                        <Text style={[
                          styles.filterChipText,
                          selectedFilters.includes(filter) && styles.selectedFilterChipText
                        ]}>
                          {filter}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.saveFiltersButton} 
                onPress={() => setFiltersModalVisible(false)}
              >
                <Text style={styles.saveFiltersButtonText}>Save Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  formSection: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100 },
  imageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, backgroundColor: '#f9f9f9' },
  buttonIcon: { marginRight: 8 },
  buttonText: { fontSize: 16 },
  imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  imagePreviewWrapper: { position: 'relative', width: '48%', aspectRatio: 16 / 9 },
  imagePreview: { width: '100%', height: '100%', borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: -10, right: -10, backgroundColor: '#fff', borderRadius: 12 },
  uploadButton: { backgroundColor: '#0066ff', padding: 16, borderRadius: 8 },
  disabledButton: { opacity: 0.6 },
  filterButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, backgroundColor: '#f2f2f2' },
  filtersContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  filterTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  filterText: { color: '#fff', marginRight: 6 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalScrollView: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedFilterChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveFiltersButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveFiltersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
