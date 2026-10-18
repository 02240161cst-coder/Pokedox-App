
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

import PokedexScreen from '../screens/PokedexScreen';
import TeamScreen from '../screens/TeamScreen';
import GameScreen from '../screens/GameScreen';
import DetailScreen from '../screens/DetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

 

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4263EB',
        tabBarInactiveTintColor: '#8A94A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopColor: '#E5EAF5',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Pokédex"
        component={PokedexScreen}
      />
      <Tab.Screen
        name="My Team"
        component={TeamScreen}
      />
      <Tab.Screen
        name="Game"
        component={GameScreen}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{
            title: 'Pokémon Details',
            headerTintColor: '#4263EB',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#172554',
  },
  subtitle: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 15,
  },
});