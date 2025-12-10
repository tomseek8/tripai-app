import AsyncStorage from '@react-native-async-storage/async-storage';
import { Attraction, AudioGuide, AttractionCategory } from '@/types';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Mock data for development
const mockAttractions: Attraction[] = [
  {
    id: '1',
    name: '故宫博物院',
    nameEn: 'Forbidden City',
    description: '中国明清两代的皇家宫殿，是世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
    descriptionEn: 'The imperial palace of the Ming and Qing dynasties in China, one of the largest and best-preserved wooden ancient buildings in the world.',
    category: AttractionCategory.HISTORICAL,
    location: {
      latitude: 39.9163,
      longitude: 116.3972,
      address: '北京市东城区景山前街4号'
    },
    rating: 4.8,
    reviewCount: 12543,
    images: ['https://example.com/forbidden-city-1.jpg', 'https://example.com/forbidden-city-2.jpg'],
    tags: ['世界遗产', '皇家建筑', '博物馆'],
    openingHours: {
      'Monday': '08:30-17:00',
      'Tuesday': '08:30-17:00',
      'Wednesday': '08:30-17:00',
      'Thursday': '08:30-17:00',
      'Friday': '08:30-17:00',
      'Saturday': '08:30-17:00',
      'Sunday': '08:30-17:00'
    },
    ticketPrice: {
      adult: 60,
      child: 30,
      student: 20
    },
    estimatedVisitTime: 180,
    facilities: ['停车场', '餐厅', '纪念品店', '无障碍通道'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-01'),
  },
  {
    id: '2',
    name: '长城',
    nameEn: 'Great Wall',
    description: '中国古代的军事防御工事，是世界文化遗产之一，被誉为世界七大奇迹之一。',
    descriptionEn: 'An ancient Chinese military defense project, one of the World Cultural Heritage sites, known as one of the Seven Wonders of the World.',
    category: AttractionCategory.HISTORICAL,
    location: {
      latitude: 40.4319,
      longitude: 116.5704,
      address: '北京市延庆区八达岭镇'
    },
    rating: 4.9,
    reviewCount: 18976,
    images: ['https://example.com/great-wall-1.jpg', 'https://example.com/great-wall-2.jpg'],
    tags: ['世界遗产', '军事建筑', '徒步'],
    openingHours: {
      'Monday': '07:30-18:00',
      'Tuesday': '07:30-18:00',
      'Wednesday': '07:30-18:00',
      'Thursday': '07:30-18:00',
      'Friday': '07:30-18:00',
      'Saturday': '07:30-18:00',
      'Sunday': '07:30-18:00'
    },
    ticketPrice: {
      adult: 45,
      child: 25,
      student: 22
    },
    estimatedVisitTime: 240,
    facilities: ['缆车', '餐厅', '纪念品店', '休息区'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-01'),
  },
  {
    id: '3',
    name: '天坛公园',
    nameEn: 'Temple of Heaven',
    description: '明清两代皇帝祭天、祈谷的场所，是中国古代建筑艺术的珍贵遗产。',
    descriptionEn: 'The place where emperors of the Ming and Qing dynasties worshipped heaven and prayed for grain, a precious heritage of ancient Chinese architectural art.',
    category: AttractionCategory.HISTORICAL,
    location: {
      latitude: 39.8822,
      longitude: 116.4066,
      address: '北京市东城区天坛路甲1号'
    },
    rating: 4.7,
    reviewCount: 8765,
    images: ['https://example.com/temple-of-heaven-1.jpg', 'https://example.com/temple-of-heaven-2.jpg'],
    tags: ['世界遗产', '皇家建筑', '公园'],
    openingHours: {
      'Monday': '06:00-22:00',
      'Tuesday': '06:00-22:00',
      'Wednesday': '06:00-22:00',
      'Thursday': '06:00-22:00',
      'Friday': '06:00-22:00',
      'Saturday': '06:00-22:00',
      'Sunday': '06:00-22:00'
    },
    ticketPrice: {
      adult: 15,
      child: 8,
      student: 10
    },
    estimatedVisitTime: 120,
    facilities: ['公园', '休息区', '纪念品店'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-01'),
  },
];

const mockAudioGuides: AudioGuide[] = [
  {
    id: 'audio-1-zh',
    attractionId: '1',
    language: 'zh',
    title: '故宫博物院中文导览',
    duration: 1800, // 30 minutes
    audioUrl: 'https://example.com/audio/forbidden-city-zh.mp3',
    transcript: '详细介绍故宫的历史、建筑和文化价值',
    speaker: '专业导游',
    fileSize: 15000000, // 15MB
  },
  {
    id: 'audio-1-en',
    attractionId: '1',
    language: 'en',
    title: 'Forbidden City English Guide',
    duration: 1800,
    audioUrl: 'https://example.com/audio/forbidden-city-en.mp3',
    transcript: 'Detailed introduction to the history, architecture and cultural value of the Forbidden City',
    speaker: 'Professional Guide',
    fileSize: 15000000,
  },
];

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.tripai.com';
    this.apiKey = process.env.EXPO_PUBLIC_API_KEY || '';
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // For development, return mock data instead of making real API calls
      console.log(`Mock API call: ${endpoint}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock response based on endpoint
      if (endpoint.includes('/attractions')) {
        if (endpoint.includes('/popular')) {
          return {
            data: mockAttractions.slice(0, 5) as T,
            success: true,
          };
        } else if (endpoint.includes('/nearby')) {
          return {
            data: mockAttractions.slice(0, 3) as T,
            success: true,
          };
        } else if (endpoint.includes('/search')) {
          return {
            data: mockAttractions.filter(a => 
              a.name.includes('search') || a.description.includes('search')
            ) as T,
            success: true,
          };
        } else {
          return {
            data: {
              items: mockAttractions,
              total: mockAttractions.length,
              page: 1,
              pageSize: 20,
              hasMore: false,
            } as T,
            success: true,
          };
        }
      }
      
      if (endpoint.includes('/audio-guides')) {
        return {
          data: mockAudioGuides as T,
          success: true,
        };
      }

      // Default mock response
      return {
        data: {} as T,
        success: true,
      };

    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 景点相关API
  async getAttractions(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      category?: string;
      tags?: string[];
      minRating?: number;
      search?: string;
    }
  ): Promise<PaginatedResponse<Attraction>> {
    let filteredAttractions = [...mockAttractions];
    
    // Apply filters
    if (filters?.category) {
      filteredAttractions = filteredAttractions.filter(a => a.category === filters.category);
    }
    if (filters?.minRating) {
      filteredAttractions = filteredAttractions.filter(a => a.rating >= filters.minRating!);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredAttractions = filteredAttractions.filter(a => 
        a.name.toLowerCase().includes(searchLower) || 
        a.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters?.tags && filters.tags.length > 0) {
      filteredAttractions = filteredAttractions.filter(a => 
        filters.tags!.some(tag => a.tags.includes(tag))
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredAttractions.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total: filteredAttractions.length,
      page,
      pageSize,
      hasMore: endIndex < filteredAttractions.length,
    };
  }

  async getAttractionById(id: string): Promise<Attraction | null> {
    try {
      const attraction = mockAttractions.find(a => a.id === id);
      return attraction || null;
    } catch (error) {
      console.error('Failed to get attraction:', error);
      return null;
    }
  }

  async getNearbyAttractions(
    latitude: number,
    longitude: number,
    radius: number = 5000
  ): Promise<Attraction[]> {
    // Simple distance calculation (in reality, you'd use more sophisticated geospatial queries)
    return mockAttractions.filter(attraction => {
      const distance = Math.sqrt(
        Math.pow(attraction.location.latitude - latitude, 2) + 
        Math.pow(attraction.location.longitude - longitude, 2)
      ) * 111000; // Rough conversion to meters
      return distance <= radius;
    }).slice(0, 5);
  }

  async getPopularAttractions(limit: number = 10): Promise<Attraction[]> {
    return mockAttractions
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // 音频导览相关API
  async getAudioGuides(attractionId: string): Promise<AudioGuide[]> {
    return mockAudioGuides.filter(guide => guide.attractionId === attractionId);
  }

  async getAudioGuideUrl(audioGuideId: string): Promise<string> {
    const guide = mockAudioGuides.find(g => g.id === audioGuideId);
    return guide?.audioUrl || '';
  }

  // 搜索相关API
  async searchAttractions(
    query: string,
    filters?: {
      category?: string;
      tags?: string[];
      minRating?: number;
    }
  ): Promise<Attraction[]> {
    return this.getAttractions(1, 20, { ...filters, search: query }).then(result => result.items);
  }

  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    const suggestions = mockAttractions
      .filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
      .map(a => a.name)
      .slice(0, limit);
    return suggestions;
  }

  // 用户相关API
  async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem(`favorites_${userId}`);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Failed to get user favorites:', error);
      return [];
    }
  }

  async addToFavorites(userId: string, attractionId: string): Promise<void> {
    try {
      const favorites = await this.getUserFavorites(userId);
      if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(userId: string, attractionId: string): Promise<void> {
    try {
      const favorites = await this.getUserFavorites(userId);
      const index = favorites.indexOf(attractionId);
      if (index > -1) {
        favorites.splice(index, 1);
        await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  }

  // 缓存管理
  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  private async setCachedData<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to set cached data:', error);
    }
  }

  private isCacheValid(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp < ttl;
  }

  // 带缓存的请求方法
  async getAttractionsWithCache(
    page: number = 1,
    pageSize: number = 20,
    useCache: boolean = true
  ): Promise<PaginatedResponse<Attraction>> {
    const cacheKey = `attractions_page_${page}_size_${pageSize}`;
    
    if (useCache) {
      const cached = await this.getCachedData<{
        data: PaginatedResponse<Attraction>;
        timestamp: number;
        ttl: number;
      }>(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp, cached.ttl)) {
        return cached.data;
      }
    }

    const data = await this.getAttractions(page, pageSize);
    
    if (useCache) {
      await this.setCachedData(cacheKey, { data, timestamp: Date.now(), ttl: 300000 }); // 5分钟缓存
    }
    
    return data;
  }
}

export default ApiService;