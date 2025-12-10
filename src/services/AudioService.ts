import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { AudioGuide } from '@/types';
import { APP_CONFIG } from '@/constants';
import OfflineStorageService from './OfflineStorageService';

export class AudioService {
  private static instance: AudioService;
  private currentSound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private currentAudioGuide: AudioGuide | null = null;
  private playbackPosition: number = 0;
  private playbackCallbacks: Map<string, ((status: any) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Audio service initialization failed:', error);
    }
  }

  async playAudioGuide(audioGuide: AudioGuide): Promise<void> {
    try {
      // 如果有正在播放的音频，先停止
      if (this.currentSound && this.isPlaying) {
        await this.stopAudio();
      }

      let audioUrl = audioGuide.audioUrl;

      // 检查是否有本地缓存文件
      const storageService = OfflineStorageService.getInstance();
      const localPath = await storageService.getOfflineFilePath(
        audioGuide.attractionId || '',
        audioGuide.id,
        'audio'
      );
      
      if (localPath && await FileSystem.getInfoAsync(localPath)) {
        audioUrl = localPath;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.currentSound = sound;
      this.currentAudioGuide = audioGuide;
      this.isPlaying = true;
      this.playbackPosition = 0;

      this.notifyCallbacks('playbackStarted', { audioGuide });
    } catch (error) {
      console.error('Error playing audio guide:', error);
      throw error;
    }
  }

  async pauseAudio(): Promise<void> {
    if (this.currentSound && this.isPlaying) {
      await this.currentSound.pauseAsync();
      this.isPlaying = false;
      this.notifyCallbacks('playbackPaused', { audioGuide: this.currentAudioGuide });
    }
  }

  async resumeAudio(): Promise<void> {
    if (this.currentSound && !this.isPlaying) {
      await this.currentSound.playAsync();
      this.isPlaying = true;
      this.notifyCallbacks('playbackResumed', { audioGuide: this.currentAudioGuide });
    }
  }

  async stopAudio(): Promise<void> {
    if (this.currentSound) {
      await this.currentSound.stopAsync();
      await this.currentSound.unloadAsync();
      this.currentSound = null;
      this.isPlaying = false;
      this.currentAudioGuide = null;
      this.playbackPosition = 0;
      this.notifyCallbacks('playbackStopped', {});
    }
  }

  async seekToPosition(position: number): Promise<void> {
    if (this.currentSound) {
      await this.currentSound.setPositionAsync(position);
      this.playbackPosition = position;
      this.notifyCallbacks('playbackSeeked', { position });
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (this.currentSound) {
      await this.currentSound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      this.notifyCallbacks('volumeChanged', { volume });
    }
  }

  private onPlaybackStatusUpdate(status: any): void {
    if (status.isLoaded) {
      this.playbackPosition = status.positionMillis || 0;
      
      if (status.didJustFinish) {
        this.isPlaying = false;
        this.notifyCallbacks('playbackCompleted', { audioGuide: this.currentAudioGuide });
      }

      this.notifyCallbacks('playbackStatusUpdate', {
        position: status.positionMillis,
        duration: status.durationMillis,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
      });
    }
  }

  async downloadAudioGuide(audioGuide: AudioGuide, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const fileName = `audio_${audioGuide.id}_${audioGuide.language}.mp3`;
      const localPath = `${FileSystem.documentDirectory || ''}${fileName}`;

      // 检查文件是否已存在
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        return localPath;
      }

      // 创建下载
      const downloadResumable = FileSystem.createDownloadResumable(
        audioGuide.audioUrl,
        localPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress?.(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result) {
        return result.uri;
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading audio guide:', error);
      throw error;
    }
  }

  async deleteCachedAudio(audioPath: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(audioPath);
      }
    } catch (error) {
      console.error('Error deleting cached audio:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const audioDir = FileSystem.documentDirectory || '';
      if (!audioDir) return 0;

      const files = await FileSystem.readDirectoryAsync(audioDir);
      let totalSize = 0;

      for (const file of files) {
        if (file.startsWith('audio_')) {
          const fileInfo = await FileSystem.getInfoAsync(`${audioDir}${file}`);
          if (fileInfo.exists && fileInfo.size) {
            totalSize += fileInfo.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const audioDir = FileSystem.documentDirectory || '';
      if (!audioDir) return;

      const files = await FileSystem.readDirectoryAsync(audioDir);
      
      for (const file of files) {
        if (file.startsWith('audio_')) {
          await FileSystem.deleteAsync(`${audioDir}${file}`);
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // 事件监听器管理
  addEventListener(event: string, callback: (status: any) => void): void {
    if (!this.playbackCallbacks.has(event)) {
      this.playbackCallbacks.set(event, []);
    }
    this.playbackCallbacks.get(event)?.push(callback);
  }

  removeEventListener(event: string, callback: (status: any) => void): void {
    const callbacks = this.playbackCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyCallbacks(event: string, data: any): void {
    const callbacks = this.playbackCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Getters
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentAudioGuide(): AudioGuide | null {
    return this.currentAudioGuide;
  }

  getPlaybackPosition(): number {
    return this.playbackPosition;
  }

  async getPlaybackDuration(): Promise<number> {
    if (this.currentSound) {
      const status = await this.currentSound.getStatusAsync();
      return status.isLoaded ? status.durationMillis || 0 : 0;
    }
    return 0;
  }

  // 新增播放控制方法
  async playFromPosition(position: number): Promise<void> {
    if (this.currentSound && !this.isPlaying) {
      await this.currentSound.setPositionAsync(position);
      await this.currentSound.playAsync();
      this.isPlaying = true;
      this.notifyCallbacks('playbackResumed', { audioGuide: this.currentAudioGuide });
    }
  }

  async fastForward(seconds: number = 10): Promise<void> {
    if (this.currentSound) {
      const currentPosition = this.playbackPosition;
      const duration = await this.getPlaybackDuration();
      const newPosition = Math.min(currentPosition + seconds * 1000, duration);
      await this.seekToPosition(newPosition);
      this.notifyCallbacks('playbackSeeked', { position: newPosition });
    }
  }

  async rewind(seconds: number = 10): Promise<void> {
    if (this.currentSound) {
      const currentPosition = this.playbackPosition;
      const newPosition = Math.max(currentPosition - seconds * 1000, 0);
      await this.seekToPosition(newPosition);
      this.notifyCallbacks('playbackSeeked', { position: newPosition });
    }
  }

  async setPlaybackSpeed(speed: number): Promise<void> {
    if (this.currentSound) {
      try {
        // expo-av 可能不支持播放速度控制
        console.log(`Playback speed control not supported: ${speed}`);
      } catch (error) {
        console.log(`Playback speed control failed: ${error}`);
      }
    }
  }

  getPlaybackProgress(): number {
    if (this.currentSound && this.currentAudioGuide) {
      return this.playbackPosition / (this.currentAudioGuide.duration * 1000);
    }
    return 0;
  }
}

export default AudioService;