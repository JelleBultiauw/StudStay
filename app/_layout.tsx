import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from '../lib/auth';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootLayout() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Stack.Navigator 
          initialRouteName="login"
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen 
            name="login" 
            component={Login}
            options={{ title: 'Login' }}
          />
          <Stack.Screen 
            name="register" 
            component={Register}
            options={{ title: 'Register' }}
          />
        </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>
  );
} 