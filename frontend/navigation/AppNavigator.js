import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PinDetailScreen from '../screens/PinDetailScreen';
import CreatePinScreen from '../screens/CreatePinScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import BoardDetailScreen from '../screens/BoardDetailScreen';
import BoardScreen from '../screens/BoardScreen';
import CreateBoardScreen from '../screens/CreateBoardScreen';
import EditBoardScreen from '../screens/EditBoardScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import SearchScreen from '../screens/SearchScreen';
import SelectBoardScreen from '../screens/SelectBoardScreen';
import TrendingScreen from '../screens/TrendingScreen';
import UserBoardsScreen from '../screens/UserBoardsScreen';
import UserPinsScreen from '../screens/UserPinsScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login"
      screenOptions={({navigation}) => ({
        headerStyle: { backgroundColor: '#F9F9F9' },
        headerTintColor: '#111111',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="PinDetail" 
        component={PinDetailScreen}
        options={{
          title: 'Pin Details',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="CreatePin" 
        component={CreatePinScreen}
        options={{
          title: 'Create Pin',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="BoardDetail" 
        component={BoardDetailScreen}
        options={{
          title: 'Board Details',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="Board" 
        component={BoardScreen}
        options={{
          title: 'Board',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="CreateBoard" 
        component={CreateBoardScreen}
        options={{
          title: 'Create Board',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="EditBoard" 
        component={EditBoardScreen}
        options={{
          title: 'Edit Board',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="HomeFeed" 
        component={HomeFeedScreen}
        options={{
          title: 'Home Feed',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Search',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="SelectBoard" 
        component={SelectBoardScreen}
        options={{
          title: 'Select Board',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="Trending" 
        component={TrendingScreen}
        options={{
          title: 'Trending',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="UserBoards" 
        component={UserBoardsScreen}
        options={{
          title: 'User Boards',
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="UserPins" 
        component={UserPinsScreen}
        options={{
          title: 'User Pins',
          headerShown: true
        }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;