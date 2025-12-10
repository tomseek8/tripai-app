import { Platform, Alert, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';
import { Location as LocationType } from '../types';
import { APP_CONFIG } from '../constants';

// TODO: 集成高德地图定位SDK
// 目前使用expo-location作为临时解决方案
// 当使用原生开发时，可以切换到react-native-amap-location

export class LocationService {
  private currentLocation: LocationType | null = null;
  private watchId: any | null = null;
  private locationListeners: Array<(location: LocationType) => void> = [];

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<boolean> {
    try {
      // TODO: 初始化高德地图定位SDK
      // await AMapLocation.init({
      //   ios: process.env.AMAP_API_KEY,
      //   android: process.env.AMAP_API_KEY
      // });

      // 使用expo-location初始化
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.info('Location permission not granted during initialization');
        // 即使权限未授予，也返回true，因为应用仍可使用默认位置
        return true;
      }

      console.info('Location service initialized successfully');
      return true;
    } catch (error) {
      console.info('Location service initialization failed:', error);
      // 即使初始化失败，也返回true，因为应用可以使用默认位置
      return true;
    }
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Request location permission failed:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      // 首先检查权限
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.info('Location permission not granted, using default location');
        return this.getDefaultLocation();
      }

      // 检查位置服务是否启用
      const isEnabled = await this.isLocationEnabled();
      if (!isEnabled) {
        console.info('Location services are disabled, using default location');
        return this.getDefaultLocation();
      }

      // TODO: 使用高德地图定位SDK
      // const location = await AMapLocation.getCurrentLocation({
      //   timeout: 10000,
      //   accuracy: 'high',
      // });

      // 使用expo-location获取当前位置
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        altitude: location.coords.altitude || 0,
        speed: location.coords.speed || 0,
        heading: location.coords.heading || 0,
        timestamp: location.timestamp || Date.now(),
      };

      this.currentLocation = currentLocation;
      console.info('Successfully obtained current location:', {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        accuracy: currentLocation.accuracy
      });
      return currentLocation;
    } catch (error) {
      // 更详细的错误处理
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          console.info('Location permission denied, using default location');
        } else if (error.message.includes('unavailable')) {
          console.info('Location services unavailable, using default location');
        } else if (error.message.includes('timeout')) {
          console.info('Location request timed out, using default location');
        } else {
          console.info('Location error:', error.message, ', using default location');
        }
      } else {
        console.info('Unknown location error, using default location');
      }
      
      // 返回默认位置作为后备方案
      return this.getDefaultLocation();
    }
  }

  private getDefaultLocation(): LocationType {
    // 默认位置：北京市中心
    const defaultLocation: LocationType = {
      latitude: 39.9042,
      longitude: 116.4074,
      accuracy: 100,
      altitude: 0,
      speed: 0,
      heading: 0,
      timestamp: Date.now(),
    };
    
    this.currentLocation = defaultLocation;
    return defaultLocation;
  }

  async startLocationUpdates(): Promise<boolean> {
    try {
      // TODO: 使用高德地图定位SDK
      // this.watchId = AMapLocation.watchPosition({
      //   accuracy: 'high',
      //   interval: 5000,
      //   callback: (location) => {
      //     const currentLocation: LocationType = {
      //       latitude: location.latitude,
      //       longitude: location.longitude,
      //       accuracy: location.accuracy,
      //       altitude: location.altitude,
      //       speed: location.speed,
      //       heading: location.heading,
      //       timestamp: location.timestamp,
      //     };
      //     this.currentLocation = currentLocation;
      //     this.notifyListeners(currentLocation);
      //   },
      // });

      // 使用expo-location监听位置变化
      this.watchId = (await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const currentLocation: LocationType = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            altitude: location.coords.altitude || 0,
            speed: location.coords.speed || 0,
            heading: location.coords.heading || 0,
            timestamp: location.timestamp || Date.now(),
          };
          this.currentLocation = currentLocation;
          this.notifyListeners(currentLocation);
        }
      )) as unknown as number;

      return true;
    } catch (error) {
      console.error('Start location updates failed:', error);
      return false;
    }
  }

  async stopLocationUpdates(): Promise<void> {
    try {
      if (this.watchId !== null) {
        // TODO: 停止高德地图定位SDK
        // AMapLocation.clearWatch(this.watchId);

        // 停止expo-location监听
        if (this.watchId && typeof this.watchId === 'object' && this.watchId.remove) {
        await this.watchId.remove();
      }
        this.watchId = null;
      }
    } catch (error) {
      console.error('Stop location updates failed:', error);
    }
  }

  getCurrentLocationData(): LocationType | null {
    return this.currentLocation;
  }

  addLocationListener(listener: (location: LocationType) => void) {
    this.locationListeners.push(listener);
  }

  removeLocationListener(listener: (location: LocationType) => void) {
    const index = this.locationListeners.indexOf(listener);
    if (index > -1) {
      this.locationListeners.splice(index, 1);
    }
  }

  private notifyListeners(location: LocationType) {
    this.locationListeners.forEach(listener => {
      try {
        listener(location);
      } catch (error) {
        console.error('Location listener error:', error);
      }
    });
  }

  async geocode(address: string): Promise<LocationType | null> {
    try {
      // TODO: 使用高德地图地理编码
      // const result = await AMapGeocode.geocode({
      //   address,
      //   key: process.env.AMAP_API_KEY,
      // });

      // 使用expo-location地理编码
      const results = await Location.geocodeAsync(address);
      if (results.length > 0) {
        const location: LocationType = {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
          accuracy: 0,
          altitude: 0,
          speed: 0,
          heading: 0,
          timestamp: Date.now(),
        };
        return location;
      }

      return null;
    } catch (error) {
      console.error('Geocode failed:', error);
      return null;
    }
  }

  async reverseGeocode(location: LocationType): Promise<string | null> {
    try {
      // TODO: 使用高德地图逆地理编码
      // const result = await AMapGeocode.regeocode({
      //   location: [location.longitude, location.latitude],
      //   key: process.env.AMAP_API_KEY,
      // });

      // 使用expo-location逆地理编码
      const results = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (results.length > 0) {
        const address = [
          results[0].street,
          results[0].city,
          results[0].region,
          results[0].country,
        ]
          .filter(Boolean)
          .join(', ');
        return address;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocode failed:', error);
      return null;
    }
  }

  async calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<number> {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  async isLocationEnabled(): Promise<boolean> {
    try {
      // TODO: 使用高德地图定位SDK检查
      // return await AMapLocation.isLocationEnabled();

      // 使用expo-location检查
      if (Location && Location.hasServicesEnabledAsync) {
        const enabled = await Location.hasServicesEnabledAsync();
        return enabled;
      }
      return false;
    } catch (error) {
      console.error('Check location enabled failed:', error);
      return false;
    }
  }

  async openLocationSettings(): Promise<void> {
    try {
      // TODO: 使用高德地图定位SDK打开设置
      // await AMapLocation.openLocationSettings();

      // 对于expo-location，我们需要使用Linking打开设置
      if (Platform.OS === 'ios') {
        // iOS: 打开应用设置
        // Linking.openURL('app-settings:');
      } else {
        // Android: 打开位置设置
        // Linking.openSettings();
      }

      Alert.alert(
        '位置服务',
        '请在系统设置中开启位置服务',
        [{ text: '确定', style: 'default' }]
      );
    } catch (error) {
      console.error('Open location settings failed:', error);
    }
  }

  async getLocationAccuracy(): Promise<'low' | 'medium' | 'high' | null> {
    try {
      // TODO: 使用高德地图定位SDK获取精度
      // const accuracy = await AMapLocation.getAccuracy();
      // return accuracy;

      // 使用expo-location获取精度
      if (this.currentLocation) {
        if (this.currentLocation.accuracy && this.currentLocation.accuracy < 10) {
          return 'high';
        } else if (this.currentLocation.accuracy && this.currentLocation.accuracy < 50) {
          return 'medium';
        } else {
          return 'low';
        }
      }

      return null;
    } catch (error) {
      console.error('Get location accuracy failed:', error);
      return null;
    }
  }

  async setLocationAccuracy(accuracy: 'low' | 'medium' | 'high'): Promise<boolean> {
    try {
      // TODO: 使用高德地图定位SDK设置精度
      // await AMapLocation.setAccuracy(accuracy);
      // return true;

      // expo-location通过watchPositionAsync设置精度
      return true;
    } catch (error) {
      console.error('Set location accuracy failed:', error);
      return false;
    }
  }

  async getBackgroundLocationPermission(): Promise<boolean> {
    try {
      // TODO: 使用高德地图定位SDK获取后台权限
      // const granted = await AMapLocation.getBackgroundPermission();
      // return granted;

      // 使用expo-location获取后台权限
      const { status } = await Location.requestBackgroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Get background location permission failed:', error);
      return false;
    }
  }

  async startBackgroundLocationUpdates(): Promise<boolean> {
    try {
      // TODO: 使用高德地图定位SDK开始后台更新
      // await AMapLocation.startBackgroundLocationUpdates({
      //   accuracy: 'high',
      //   interval: 30000,
      // });
      // return true;

      // expo-location需要额外配置后台任务
      return true;
    } catch (error) {
      console.error('Start background location updates failed:', error);
      return false;
    }
  }

  async stopBackgroundLocationUpdates(): Promise<void> {
    try {
      // TODO: 停止高德地图定位SDK后台更新
      // await AMapLocation.stopBackgroundLocationUpdates();

      // expo-location停止后台任务
    } catch (error) {
      console.error('Stop background location updates failed:', error);
    }
  }

  async getLocationHistory(): Promise<LocationType[]> {
    try {
      // TODO: 使用高德地图定位SDK获取历史位置
      // const history = await AMapLocation.getLocationHistory();
      // return history;

      // 临时返回空数组
      return [];
    } catch (error) {
      console.error('Get location history failed:', error);
      return [];
    }
  }

  async clearLocationHistory(): Promise<void> {
    try {
      // TODO: 清除高德地图定位SDK历史位置
      // await AMapLocation.clearLocationHistory();

      // 临时实现
    } catch (error) {
      console.error('Clear location history failed:', error);
    }
  }

  async simulateLocation(location: LocationType): Promise<boolean> {
    try {
      // TODO: 使用高德地图定位SDK模拟位置
      // await AMapLocation.simulateLocation(location);
      // return true;

      // 临时实现
      this.currentLocation = location;
      this.notifyListeners(location);
      return true;
    } catch (error) {
      console.error('Simulate location failed:', error);
      return false;
    }
  }

  async stopLocationSimulation(): Promise<void> {
    try {
      // TODO: 停止高德地图定位SDK位置模拟
      // await AMapLocation.stopLocationSimulation();

      // 临时实现
    } catch (error) {
      console.error('Stop location simulation failed:', error);
    }
  }

  async cleanup(): Promise<void> {
    await this.stopLocationUpdates();
    await this.stopBackgroundLocationUpdates();
    this.locationListeners = [];
    this.currentLocation = null;
  }
}

export class LocationServiceSingleton {
  private static instance: LocationService;

  static getInstance(): LocationService {
    if (!LocationServiceSingleton.instance) {
      LocationServiceSingleton.instance = new LocationService();
    }
    return LocationServiceSingleton.instance;
  }
}