import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4169E1', // Cor de fundo roxa
          shadowColor: 'transparent', // Remove a sombra (opcional)
        },
        headerTitleStyle: {
          fontWeight: 'bold', // Negrito no título
          fontSize: 22, // Tamanho da fonte do título
          color: '#fff', // Título com cor branca
        },
        headerTintColor: '#fff', // Cor dos ícones e botões do header
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Texto para áudio',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
          tabBarStyle: { display: 'none' }, 
        }}
      /> 
    </Tabs>
  );
}