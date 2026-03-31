import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes
} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

const Login = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setIsSubmitting(true);
            await GoogleSignin.hasPlayServices()
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)) {
                const { idToken, user} = response.data;
                console.log("google sign in response",response.data , user);
                const { name, email, photo } = user;
                router.navigate({
                    pathname: '/(tabs)/profile',
                    params: {
                        name,
                        email,
                        photo
                    }
                })
            } else {
                Alert.alert("Sign in", "Sign in was cancelled")
            }
            setIsSubmitting(false);
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        Alert.alert("Sign in", "Sign in was cancelled")
                        break;
                    case statusCodes.IN_PROGRESS:
                        Alert.alert("Sign in", "Sign in is already in progress")
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        Alert.alert("Sign in", "Play services not available")
                        break;
                    default:
                        Alert.alert("Sign in", "Something went wrong")
                        break;
                }
            }
            setIsSubmitting(false);
        }
    }
    return (
        <View>
            <Text>Login</Text>
            <Button title="Sign in with Google" disabled={isSubmitting} onPress={handleGoogleSignIn} />
        </View>
    );
};

export default Login;