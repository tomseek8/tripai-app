import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export interface OfflineContent {
  id: string;
  type: 'audio' | 'image' | 'data';
  url: string;
  localPath?: string;
  size: number;
  downloadedAt: Date;
  lastAccessed: Date;
  expiresAt?: Date;
}

export interface OfflineAttraction {
  id: string;
  attractionData: any;
  audioGuides: OfflineContent[];
  images: OfflineContent[];
  downloadedAt: Date;
  lastUpdated: Date;
  lastAccessed?: Date;
}

export interface CacheStats {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  itemCount: number;
}

class OfflineStorageService {
  private static instance: OfflineStorageService;
  private readonly STORAGE_KEYS = {
    OFFLINE_ATTRACTIONS: 'offline_attractions',
    CACHE_STATS: 'cache_stats',
    DOWNLOAD_QUEUE: 'download_queue',
    SETTINGS: 'offline_settings',
  };
  private readonly CACHE_DIR = `${(FileSystem as any).documentDirectory || ''}offline_cache/`;

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  constructor() {
    this.initializeCacheDirectory();
  }

  private async initializeCacheDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize cache directory:', error);
    }
  }

  async saveOfflineAttraction(attractionId: string, attractionData: any): Promise<void> {
    try {
      const existingData = await this.getOfflineAttraction(attractionId);
      const offlineAttraction: OfflineAttraction = {
        id: attractionId,
        attractionData,
        audioGuides: existingData?.audioGuides || [],
        images: existingData?.images || [],
        downloadedAt: existingData?.downloadedAt || new Date(),
        lastUpdated: new Date(),
      };

      const allOfflineAttractions = await this.getAllOfflineAttractions();
      const index = allOfflineAttractions.findIndex(item => item.id === attractionId);
      
      if (index >= 0) {
        allOfflineAttractions[index] = offlineAttraction;
      } else {
        allOfflineAttractions.push(offlineAttraction);
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.OFFLINE_ATTRACTIONS,
        JSON.stringify(allOfflineAttractions)
      );

      await this.updateCacheStats();
    } catch (error) {
      console.error('Failed to save offline attraction:', error);
      throw error;
    }
  }

  async getOfflineAttraction(attractionId: string): Promise<OfflineAttraction | null> {
    try {
      const allOfflineAttractions = await this.getAllOfflineAttractions();
      const attraction = allOfflineAttractions.find(item => item.id === attractionId);
      
      if (attraction) {
        attraction.lastAccessed = new Date();
        await this.saveOfflineAttraction(attractionId, attraction.attractionData);
      }
      
      return attraction || null;
    } catch (error) {
      console.error('Failed to get offline attraction:', error);
      return null;
    }
  }

  async getAllOfflineAttractions(): Promise<OfflineAttraction[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_ATTRACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get all offline attractions:', error);
      return [];
    }
  }

  async removeOfflineAttraction(attractionId: string): Promise<void> {
    try {
      const attraction = await this.getOfflineAttraction(attractionId);
      if (attraction) {
        const allFiles = [...attraction.audioGuides, ...attraction.images];
        for (const file of allFiles) {
          if (file.localPath) {
            try {
              await FileSystem.deleteAsync(file.localPath);
            } catch (error) {
              console.error('Failed to delete file:', file.localPath, error);
            }
          }
        }
      }

      const allOfflineAttractions = await this.getAllOfflineAttractions();
      const filtered = allOfflineAttractions.filter(item => item.id !== attractionId);
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.OFFLINE_ATTRACTIONS,
        JSON.stringify(filtered)
      );

      await this.updateCacheStats();
    } catch (error) {
      console.error('Failed to remove offline attraction:', error);
      throw error;
    }
  }

  async downloadAndSaveFile(
    url: string,
    type: 'audio' | 'image',
    attractionId: string,
    contentId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const fileName = `${type}_${contentId}_${Date.now()}.${this.getFileExtension(url)}`;
      const localPath = `${this.CACHE_DIR}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        (downloadProgressInfo) => {
          if (onProgress) {
            const progress = downloadProgressInfo.totalBytesWritten / downloadProgressInfo.totalBytesExpectedToWrite;
            onProgress(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error('Download failed');
      }

      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      const offlineContent: OfflineContent = {
        id: contentId,
        type,
        url,
        localPath: result.uri,
        size: (fileInfo as any).size || 0,
        downloadedAt: new Date(),
        lastAccessed: new Date(),
      };

      await this.saveContentToAttraction(attractionId, offlineContent);
      await this.updateCacheStats();

      return result.uri;
    } catch (error) {
      console.error('Failed to download and save file:', error);
      throw error;
    }
  }

  private async saveContentToAttraction(attractionId: string, content: OfflineContent): Promise<void> {
    const attraction = await this.getOfflineAttraction(attractionId);
    if (!attraction) return;

    if (content.type === 'audio') {
      const existingIndex = attraction.audioGuides.findIndex(item => item.id === content.id);
      if (existingIndex >= 0) {
        attraction.audioGuides[existingIndex] = content;
      } else {
        attraction.audioGuides.push(content);
      }
    } else if (content.type === 'image') {
      const existingIndex = attraction.images.findIndex(item => item.id === content.id);
      if (existingIndex >= 0) {
        attraction.images[existingIndex] = content;
      } else {
        attraction.images.push(content);
      }
    }

    await this.saveOfflineAttraction(attractionId, attraction.attractionData);
  }

  private getFileExtension(url: string): string {
    const extension = url.split('.').pop();
    return extension || 'tmp';
  }

  async getCacheStats(): Promise<CacheStats> {
    try {
      const statsData = await AsyncStorage.getItem(this.STORAGE_KEYS.CACHE_STATS);
      if (statsData) {
        return JSON.parse(statsData);
      }

      return await this.calculateCacheStats();
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalSize: 100 * 1024 * 1024,
        usedSize: 0,
        availableSize: 100 * 1024 * 1024,
        itemCount: 0,
      };
    }
  }

  private async calculateCacheStats(): Promise<CacheStats> {
    try {
      const attractions = await this.getAllOfflineAttractions();
      let totalSize = 0;
      let itemCount = 0;

      for (const attraction of attractions) {
        const allFiles = [...attraction.audioGuides, ...attraction.images];
        for (const file of allFiles) {
          totalSize += file.size;
          itemCount++;
        }
      }

      const maxCacheSize = 100 * 1024 * 1024;
      const stats: CacheStats = {
        totalSize: maxCacheSize,
        usedSize: totalSize,
        availableSize: maxCacheSize - totalSize,
        itemCount,
      };

      await AsyncStorage.setItem(this.STORAGE_KEYS.CACHE_STATS, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Failed to calculate cache stats:', error);
      throw error;
    }
  }

  private async updateCacheStats(): Promise<void> {
    await this.calculateCacheStats();
  }

  async cleanExpiredCache(): Promise<void> {
    try {
      const attractions = await this.getAllOfflineAttractions();
      const now = new Date();

      for (const attraction of attractions) {
        let hasChanges = false;

        attraction.audioGuides = attraction.audioGuides.filter(audio => {
          if (audio.expiresAt && audio.expiresAt < now) {
            if (audio.localPath) {
              FileSystem.deleteAsync(audio.localPath).catch(console.error);
            }
            hasChanges = true;
            return false;
          }
          return true;
        });

        attraction.images = attraction.images.filter(image => {
          if (image.expiresAt && image.expiresAt < now) {
            if (image.localPath) {
              FileSystem.deleteAsync(image.localPath).catch(console.error);
            }
            hasChanges = true;
            return false;
          }
          return true;
        });

        if (hasChanges) {
          await this.saveOfflineAttraction(attraction.id, attraction.attractionData);
        }
      }

      await this.updateCacheStats();
    } catch (error) {
      console.error('Failed to clean expired cache:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      const attractions = await this.getAllOfflineAttractions();
      for (const attraction of attractions) {
        await this.removeOfflineAttraction(attraction.id);
      }

      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.OFFLINE_ATTRACTIONS,
        this.STORAGE_KEYS.CACHE_STATS,
        this.STORAGE_KEYS.DOWNLOAD_QUEUE,
      ]);

      await this.initializeCacheDirectory();
    } catch (error) {
      console.error('Failed to clear all cache:', error);
      throw error;
    }
  }

  async isContentOffline(attractionId: string, contentId: string, type: 'audio' | 'image'): Promise<boolean> {
    try {
      const attraction = await this.getOfflineAttraction(attractionId);
      if (!attraction) return false;

      const contentList = type === 'audio' ? attraction.audioGuides : attraction.images;
      return contentList.some(item => item.id === contentId && item.localPath);
    } catch (error) {
      console.error('Failed to check if content is offline:', error);
      return false;
    }
  }

  async getOfflineFilePath(attractionId: string, contentId: string, type: 'audio' | 'image'): Promise<string | null> {
    try {
      const attraction = await this.getOfflineAttraction(attractionId);
      if (!attraction) return null;

      const contentList = type === 'audio' ? attraction.audioGuides : attraction.images;
      const content = contentList.find(item => item.id === contentId);
      return content?.localPath || null;
    } catch (error) {
      console.error('Failed to get offline file path:', error);
      return null;
    }
  }

  async getStorageStats(): Promise<CacheStats> {
    try {
      const stats = await AsyncStorage.getItem(this.STORAGE_KEYS.CACHE_STATS);
      if (stats) {
        return JSON.parse(stats);
      }

      const attractions = await this.getAllOfflineAttractions();
      const totalSize = attractions.reduce((sum, attraction) => {
        const audioSize = attraction.audioGuides.reduce((sum, audio) => sum + audio.size, 0);
        const imageSize = attraction.images.reduce((sum, image) => sum + image.size, 0);
        return sum + audioSize + imageSize;
      }, 0);

      const calculatedStats: CacheStats = {
        totalSize: 100 * 1024 * 1024,
        usedSize: totalSize,
        availableSize: 100 * 1024 * 1024 - totalSize,
        itemCount: attractions.length,
      };

      await this.setCacheStats(calculatedStats);
      return calculatedStats;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalSize: 100 * 1024 * 1024,
        usedSize: 0,
        availableSize: 100 * 1024 * 1024,
        itemCount: 0,
      };
    }
  }

  async clearAllOfflineContent(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEYS.OFFLINE_ATTRACTIONS);
      
      const cacheDir = this.CACHE_DIR;
      if (await FileSystem.getInfoAsync(cacheDir)) {
        await FileSystem.deleteAsync(cacheDir, { idempotent: true });
      }
      
      await this.initializeCacheDirectory();
      
      const defaultStats: CacheStats = {
        totalSize: 100 * 1024 * 1024,
        usedSize: 0,
        availableSize: 100 * 1024 * 1024,
        itemCount: 0,
      };
      await this.setCacheStats(defaultStats);
    } catch (error) {
      console.error('Failed to clear all offline content:', error);
      throw error;
    }
  }

  private async setCacheStats(stats: CacheStats): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.CACHE_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to set cache stats:', error);
    }
  }
}

export default OfflineStorageService;