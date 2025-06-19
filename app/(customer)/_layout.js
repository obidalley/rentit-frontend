import React from 'react'
import { Tabs } from 'expo-router'
import { Platform, TouchableOpacity, View, StyleSheet, Image, Alert } from 'react-native'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'

import { images } from '@/constants'
import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useLogoutMutation } from '@/apis/authApi'
import { setSpinner, } from '@/store/slices/spinnerSlice'

import Rents from '@/screens/Rents/Rents'
import DamagesListing from '@/screens/Damages/DamageListing'
import Payments from '@/screens/Payments/Payments'
/* import NotificationsScreen from '@/screens/NotificationsScreen' */

const Drawer = createDrawerNavigator()

const CustomDrawerContent = (props) => {
    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.drawerTopSection}>
                <Image source={images.logo} style={styles.logo} />
            </View>
            <View style={styles.drawerMidSection}>
                <DrawerItemList {...props} />
            </View>
            <View style={styles.drawerBottomSection}>
                <DrawerItem
                    label='Logout'
                    onPress={props.logout}
                />
            </View>
        </DrawerContentScrollView>
    )
}

const TabLayout = () => {
    const colorScheme = useColorScheme()
    const navigation = useNavigation()

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: true,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Dashboard',
                    headerShown: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                            style={{ marginLeft: 15 }}>
                            <IconSymbol size={32} name='line.horizontal.3' color={Colors[colorScheme ?? 'light'].tint} />
                        </TouchableOpacity>
                    ),
                    tabBarIcon: ({ color }) => <IconSymbol size={32} name='house.fill' color={color} />,
                }}
            />
            <Tabs.Screen
                name='feeds'
                options={{
                    title: 'Feeds',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <IconSymbol size={32} name='feed' color={color} />,
                }}
            />
        </Tabs>
    )
}

const Layout = () => {
    const navigation = useNavigation()
    const [logout] = useLogoutMutation()
    const dispatch = useDispatch()

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes', onPress: async () => {
                        dispatch(setSpinner({ visibility: true }))
                        await logout()
                        setTimeout(() => {
                            dispatch(setSpinner({ visibility: false }))
                            navigation.reset({
                                index: 0,
                                routes: [{ name: '(auths)' }],
                            })
                        }, 1000)
                    }
                },
            ]
        )
    }

    return (
        <>
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawerContent logout={handleLogout} {...props} />}
                screenOptions={{
                    headerShown: true,
                }}>
                <Drawer.Screen name='Home' options={{ title: 'Dashboard' }} component={TabLayout} />
                <Drawer.Screen name='Rents' component={Rents} />
                <Drawer.Screen name='Payments' component={Payments} />
                <Drawer.Screen name='Damages' component={DamagesListing} />
                {/* <Drawer.Screen name='Notifications' component={NotificationsScreen} /> */}
            </Drawer.Navigator>
        </>
    )
}

const styles = StyleSheet.create({
    drawerTopSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
    },
    drawerMidSection: {
        flex: 1,
        marginTop: 10,
    },
    drawerBottomSection: {
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingVertical: 10,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        borderRadius: 50
    },
})

export default Layout
