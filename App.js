import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, AppRegistry } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth }   from './src/context/AuthContext';

import LoginScreen     from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProductsScreen  from './src/screens/ProductsScreen';
import OrdersScreen    from './src/screens/OrdersScreen';
import ReviewsScreen   from './src/screens/ReviewsScreen';
import SettingsScreen  from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// ── Custom Toast Config ──
const toastConfig = (theme) => ({
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: theme.green,
        borderLeftWidth: 6,
        backgroundColor: theme.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.green + '55',
        marginHorizontal: 16,
        elevation: 10,
        shadowColor: theme.green,
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}
      text2Style={{ color: theme.muted, fontSize: 12 }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: theme.red,
        borderLeftWidth: 6,
        backgroundColor: theme.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.red + '55',
        marginHorizontal: 16,
        elevation: 10,
        shadowColor: theme.red,
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}
      text2Style={{ color: theme.muted, fontSize: 12 }}
    />
  ),
});

function AppTabs() {
  const { theme } = useTheme();

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
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Dashboard: focused ? 'grid'         : 'grid-outline',
            Products:  focused ? 'cube'         : 'cube-outline',
            Orders:    focused ? 'receipt'      : 'receipt-outline',
            Reviews:   focused ? 'chatbubbles'  : 'chatbubbles-outline',
            Settings:  focused ? 'settings'     : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Products"  component={ProductsScreen} />
      <Tab.Screen name="Orders"    component={OrdersScreen} />
      <Tab.Screen name="Reviews"   component={ReviewsScreen} />
      <Tab.Screen name="Settings"  component={SettingsScreen} />
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

function AppWithToast() {
  const { theme } = useTheme();
  return (
    <>
      <RootNavigator />
      <Toast config={toastConfig(theme)} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppWithToast />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent('main', () => App);
