import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'expo-router';

interface Kot {
  id: number;
  title: string;
  price: number;
  location: string;
  created_at: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [kots, setKots] = useState<Kot[]>([]);
  const [isLoadingKots, setIsLoadingKots] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserKots();
    }
  }, [user]);

  const fetchUserKots = async () => {
    try {
      setIsLoadingKots(true);
      const { data, error } = await supabase
        .from('kots')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching kots:', error);
        return;
      }

      if (data) {
        setKots(data as Kot[]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoadingKots(false);
    }
  };

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

  const renderKot = ({ item }: { item: Kot }) => (
    <TouchableOpacity 
      style={styles.kotCard}
      onPress={() => router.push({
        pathname: '/EditKot',
        params: { 
          id: item.id,
          title: item.title,
          price: item.price,
          location: item.location,
          created_at: item.created_at
        }
      })}
    >
      <Text style={styles.kotTitle}>{item.title}</Text>
      <Text style={styles.kotPrice}>€{item.price}/month</Text>
      <Text style={styles.kotLocation}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Display Name</Text>
              <Text style={styles.value}>{user.user_metadata?.full_name || 'Not set'}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{user.user_metadata?.phone || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Kots</Text>
            {isLoadingKots ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : kots.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>You haven't uploaded any kots yet</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => router.push('/UploadKot')}
                >
                  <Text style={styles.uploadButtonText}>Upload a Kot</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={kots}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderKot}
                refreshing={isLoadingKots}
                onRefresh={fetchUserKots}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.logoutButtonText}>Logout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  kotCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  kotTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  kotPrice: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  kotLocation: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 