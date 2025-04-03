import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Location Interface
interface Location {
  name: string;
  country: string;
}
// Weather Interface
interface Weather {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
}
//need to add key and need to create env file for this
const WEATHER_API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key

const App: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get location name
          const locationResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${WEATHER_API_KEY}`
          );
          const locationData = await locationResponse.json();
          setLocation(locationData[0]);

          // Get weather data
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
          );
          const weatherData = await weatherResponse.json();
          setWeather(weatherData);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch weather data');
          setLoading(false);
        }
      },
      err => {
        setError('Failed to get location so please try again');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.location}>
          {location?.name}, {location?.country}
        </Text>
        <Text style={styles.temperature}>
          {weather?.main?.temp ? Math.round(weather.main.temp) : '--'}°C
        </Text>
        <Text style={styles.description}>
          {weather?.weather[0]?.description}
        </Text>
        <View style={styles.details}>
          <Text>Humidity: {weather?.main?.humidity ?? '--'}%</Text>
          <Text>Wind: {weather?.wind?.speed ?? '--'} m/s</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  location: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  temperature: {
    fontSize: 46,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  details: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  error: {
    color: 'red',
    fontSize: 18,
  },
});

export default App;
