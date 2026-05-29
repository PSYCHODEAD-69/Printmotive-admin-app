import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, AppRegistry } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth }   from './src/context/AuthContext';

import LoginScreen    from './src/screens/LoginScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import OrdersScreen   from './src/screens/OrdersScreen';
import ReviewsScreen  from './src/screens/ReviewsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor:  theme.border,
          borderTopWidth:  1,
          height:          64,
          paddingBottom:   8,
          paddingTop:      8,
        },
        tabBarActiveTintColor:   theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Products: focused ? 'cube'         : 'cube-outline',
            Orders:   focused ? 'receipt'      : 'receipt-outline',
            Reviews:  focused ? 'chatbubbles'  : 'chatbubbles-outline',
            Settings: focused ? 'settings'     : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Orders"   component={OrdersScreen} />
      <Tab.Screen name="Reviews"  component={ReviewsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { theme, isDark } = useTheme();
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />
      {isLoggedIn ? (
        <NavigationContainer>
          <AppTabs />
        </NavigationContainer>
      ) : (
        <LoginScreen />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
          <Toast />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
AppRegistry.registerComponent('main', () => App);
