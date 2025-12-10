import { Location } from '../types';

// TODO: 集成高德地图POI搜索API
// 目前使用模拟数据作为临时解决方案
// 当使用原生开发时，可以切换到高德地图POI搜索

export interface POIResult {
  id: string;
  name: string;
  address: string;
  location: Location;
  distance: number;
  type: string;
  rating: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  images?: string[];
  description?: string;
  tags?: string[];
}

export interface SearchSuggestion {
  id: string;
  name: string;
  address: string;
  type: string;
  location: Location;
}

export class SearchService {
  private mockPOIData: POIResult[] = [
    // 北京景点
    {
      id: 'beijing_1',
      name: '故宫博物院',
      address: '北京市东城区景山前街4号',
      location: { latitude: 39.9163, longitude: 116.3972, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.8,
      phone: '010-85007421',
      website: 'https://www.dpm.org.cn',
      openingHours: '8:30-17:00',
      description: '明清两朝的皇家宫殿，现为故宫博物院，是中国最大的古代文化艺术博物馆。',
      tags: ['历史', '文化', '博物馆', '世界遗产'],
    },
    {
      id: 'beijing_2',
      name: '天安门广场',
      address: '北京市东城区长安街',
      location: { latitude: 39.9055, longitude: 116.3976, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.7,
      description: '世界上最大的城市广场之一，是中国的象征性建筑。',
      tags: ['广场', '历史', '地标'],
    },
    {
      id: 'beijing_3',
      name: '颐和园',
      address: '北京市海淀区新建宫门路19号',
      location: { latitude: 39.9999, longitude: 116.2755, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.9,
      phone: '010-62881144',
      openingHours: '6:30-18:00',
      description: '中国清朝时期皇家园林，是世界文化遗产。',
      tags: ['园林', '历史', '世界遗产'],
    },
    {
      id: 'beijing_4',
      name: '天坛公园',
      address: '北京市东城区天坛东里甲1号',
      location: { latitude: 39.8822, longitude: 116.4066, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.6,
      phone: '010-67028866',
      openingHours: '6:00-22:00',
      description: '明清两朝皇帝祭天、祈谷的场所。',
      tags: ['历史', '建筑', '公园'],
    },
    {
      id: 'beijing_5',
      name: '八达岭长城',
      address: '北京市延庆区八达岭镇',
      location: { latitude: 40.4319, longitude: 116.5704, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.8,
      phone: '010-69121383',
      openingHours: '6:30-19:00',
      description: '万里长城的重要组成部分，是明长城的一个隘口。',
      tags: ['长城', '历史', '世界遗产'],
    },
    // 上海景点
    {
      id: 'shanghai_1',
      name: '外滩',
      address: '上海市黄浦区中山东一路',
      location: { latitude: 31.2401, longitude: 121.4909, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.7,
      description: '上海的标志性景观，展现了上海的历史文化风貌。',
      tags: ['江景', '历史', '夜景'],
    },
    {
      id: 'shanghai_2',
      name: '东方明珠塔',
      address: '上海市浦东新区世纪大道1号',
      location: { latitude: 31.2397, longitude: 121.4998, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.5,
      phone: '021-58791888',
      openingHours: '8:00-21:30',
      description: '上海的标志性文化景观之一，是亚洲第一高塔。',
      tags: ['塔', '观景', '地标'],
    },
    {
      id: 'shanghai_3',
      name: '豫园',
      address: '上海市黄浦区豫园老街279号',
      location: { latitude: 31.2272, longitude: 121.4920, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.4,
      phone: '021-63260830',
      openingHours: '8:30-17:30',
      description: '江南古典园林，明代私家园林的代表作。',
      tags: ['园林', '历史', '文化'],
    },
    // 广州景点
    {
      id: 'guangzhou_1',
      name: '广州塔',
      address: '广州市海珠区阅江西路222号',
      location: { latitude: 23.1066, longitude: 113.3245, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.6,
      phone: '020-89338222',
      openingHours: '9:00-23:00',
      description: '广州的标志性建筑，是中国第一高塔。',
      tags: ['塔', '观景', '地标'],
    },
    {
      id: 'guangzhou_2',
      name: '陈家祠',
      address: '广州市荔湾区中山七路恩龙里34号',
      location: { latitude: 23.1252, longitude: 113.2455, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.5,
      phone: '020-81814559',
      openingHours: '8:30-17:30',
      description: '清代广东民间工艺博物馆，是岭南建筑艺术的代表。',
      tags: ['历史', '建筑', '博物馆'],
    },
    // 深圳景点
    {
      id: 'shenzhen_1',
      name: '世界之窗',
      address: '深圳市南山区深南大道9037号',
      location: { latitude: 22.5315, longitude: 113.9754, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.3,
      phone: '0755-26608000',
      openingHours: '9:00-22:30',
      description: '以世界名胜古迹为主题的公园。',
      tags: ['主题公园', '娱乐', '家庭'],
    },
    {
      id: 'shenzhen_2',
      name: '深圳湾公园',
      address: '深圳市南山区深圳湾',
      location: { latitude: 22.4847, longitude: 113.9310, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.4,
      openingHours: '全天开放',
      description: '深圳的海滨公园，是休闲运动的好去处。',
      tags: ['公园', '海滨', '休闲'],
    },
    // 成都景点
    {
      id: 'chengdu_1',
      name: '宽窄巷子',
      address: '成都市青羊区宽窄巷子',
      location: { latitude: 30.6698, longitude: 104.0599, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.5,
      description: '成都的历史文化街区，展现了老成都的生活风貌。',
      tags: ['历史', '文化', '美食'],
    },
    {
      id: 'chengdu_2',
      name: '锦里',
      address: '成都市武侯区武侯祠大街231号',
      location: { latitude: 30.6459, longitude: 104.0476, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.4,
      description: '成都著名的古街，以三国文化和四川民俗为主题。',
      tags: ['历史', '文化', '美食'],
    },
    {
      id: 'chengdu_3',
      name: '大熊猫繁育研究基地',
      address: '成都市成华区外北熊猫大道1375号',
      location: { latitude: 30.7327, longitude: 104.1446, accuracy: 0, altitude: 0, speed: 0, heading: 0, timestamp: Date.now() },
      distance: 0,
      type: '景点',
      rating: 4.7,
      phone: '028-83507114',
      openingHours: '7:30-18:00',
      description: '中国著名的大熊猫保护研究基地。',
      tags: ['动物', '自然', '家庭'],
    },
  ];

  private cityKeywords: { [key: string]: string[] } = {
    '北京': ['故宫', '天安门', '颐和园', '天坛', '长城', '北海', '景山'],
    '上海': ['外滩', '东方明珠', '豫园', '南京路', '新天地', '田子坊'],
    '广州': ['广州塔', '陈家祠', '白云山', '越秀公园', '沙面'],
    '深圳': ['世界之窗', '深圳湾', '大梅沙', '小梅沙', '莲花山'],
    '成都': ['宽窄巷子', '锦里', '大熊猫', '武侯祠', '杜甫草堂'],
    '杭州': ['西湖', '灵隐寺', '雷峰塔', '千岛湖', '西溪湿地'],
    '西安': ['兵马俑', '大雁塔', '古城墙', '回民街', '华清池'],
    '重庆': ['洪崖洞', '解放碑', '磁器口', '长江索道', '南山'],
  };

  async searchPOI(
    keywords: string,
    location?: Location,
    radius: number = 10000,
    city?: string
  ): Promise<POIResult[]> {
    try {
      // TODO: 集成高德地图POI搜索API
      // const response = await fetch(
      //   `https://restapi.amap.com/v3/place/text?key=${process.env.AMAP_API_KEY}&keywords=${keywords}&location=${location?.longitude},${location?.latitude}&radius=${radius}&city=${city || '全国'}&datatype=all&output=json`
      // );
      // const data = await response.json();
      // return this.parseAMapPOIResponse(data);

      // 临时使用模拟数据
      return this.searchMockPOI(keywords, location, radius);
    } catch (error) {
      console.error('Search POI failed:', error);
      return [];
    }
  }

  async searchNearby(
    location: Location,
    keywords: string = '',
    radius: number = 5000
  ): Promise<POIResult[]> {
    try {
      // TODO: 集成高德地图周边搜索API
      // const response = await fetch(
      //   `https://restapi.amap.com/v3/place/around?key=${process.env.AMAP_API_KEY}&location=${location.longitude},${location.latitude}&keywords=${keywords}&radius=${radius}&datatype=all&output=json`
      // );
      // const data = await response.json();
      // return this.parseAMapPOIResponse(data);

      // 临时使用模拟数据
      return this.searchMockPOI(keywords, location, radius);
    } catch (error) {
      console.error('Search nearby failed:', error);
      return [];
    }
  }

  async getSearchSuggestions(
    keywords: string,
    city?: string
  ): Promise<SearchSuggestion[]> {
    try {
      // TODO: 集成高德地图输入提示API
      // const response = await fetch(
      //   `https://restapi.amap.com/v3/assistant/inputtips?key=${process.env.AMAP_API_KEY}&keywords=${keywords}&city=${city || '全国'}&output=json`
      // );
      // const data = await response.json();
      // return this.parseAMapSuggestionsResponse(data);

      // 临时使用模拟数据
      return this.getMockSuggestions(keywords);
    } catch (error) {
      console.error('Get search suggestions failed:', error);
      return [];
    }
  }

  async getPOIDetail(poiId: string): Promise<POIResult | null> {
    try {
      // TODO: 集成高德地图地点详情API
      // const response = await fetch(
      //   `https://restapi.amap.com/v3/place/detail?key=${process.env.AMAP_API_KEY}&id=${poiId}&output=json`
      // );
      // const data = await response.json();
      // return this.parseAMapDetailResponse(data);

      // 临时使用模拟数据
      return this.mockPOIData.find(poi => poi.id === poiId) || null;
    } catch (error) {
      console.error('Get POI detail failed:', error);
      return null;
    }
  }

  private searchMockPOI(
    keywords: string,
    location?: Location,
    radius: number = 10000
  ): POIResult[] {
    let results = this.mockPOIData;

    // 根据关键词过滤
    if (keywords) {
      results = results.filter(poi =>
        poi.name.includes(keywords) ||
        poi.address.includes(keywords) ||
        poi.type.includes(keywords) ||
        poi.tags?.some(tag => tag.includes(keywords))
      );
    }

    // 计算距离
    if (location) {
      results = results.map(poi => ({
        ...poi,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          poi.location.latitude,
          poi.location.longitude
        ),
      }));

      // 根据距离过滤
      results = results.filter(poi => poi.distance <= radius / 1000); // 转换为公里

      // 按距离排序
      results.sort((a, b) => a.distance - b.distance);
    }

    return results.slice(0, 20); // 限制返回数量
  }

  private getMockSuggestions(keywords: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    
    this.mockPOIData.forEach(poi => {
      if (poi.name.includes(keywords) || poi.address.includes(keywords)) {
        suggestions.push({
          id: poi.id,
          name: poi.name,
          address: poi.address,
          type: poi.type,
          location: poi.location,
        });
      }
    });

    // 添加城市建议
    Object.entries(this.cityKeywords).forEach(([city, cityKeywords]) => {
      if (city.includes(keywords)) {
        cityKeywords.forEach(keyword => {
          const matchingPOI = this.mockPOIData.find(poi => poi.name.includes(keyword));
          if (matchingPOI) {
            suggestions.push({
              id: `city_${city}_${keyword}`,
              name: `${city}${keyword}`,
              address: matchingPOI.address,
              type: '城市推荐',
              location: matchingPOI.location,
            });
          }
        });
      }
    });

    return suggestions.slice(0, 10);
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
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

  // TODO: 实现高德地图API响应解析
  private parseAMapPOIResponse(data: any): POIResult[] {
    // 解析高德地图POI搜索响应
    return [];
  }

  private parseAMapSuggestionsResponse(data: any): SearchSuggestion[] {
    // 解析高德地图输入提示响应
    return [];
  }

  private parseAMapDetailResponse(data: any): POIResult | null {
    // 解析高德地图地点详情响应
    return null;
  }

  // 获取热门景点推荐
  async getPopularAttractions(city?: string, limit: number = 10): Promise<POIResult[]> {
    try {
      let results = this.mockPOIData;

      // 根据城市过滤
      if (city) {
        results = results.filter(poi => {
          const cityKeywords = this.cityKeywords[city];
          return cityKeywords && cityKeywords.some(keyword => poi.name.includes(keyword));
        });
      }

      // 按评分排序
      results.sort((a, b) => b.rating - a.rating);

      return results.slice(0, limit);
    } catch (error) {
      console.error('Get popular attractions failed:', error);
      return [];
    }
  }

  // 获取分类景点
  async getAttractionsByCategory(
    category: string,
    city?: string,
    limit: number = 10
  ): Promise<POIResult[]> {
    try {
      let results = this.mockPOIData;

      // 根据分类过滤
      results = results.filter(poi =>
        poi.tags?.includes(category) || poi.type.includes(category)
      );

      // 根据城市过滤
      if (city) {
        const cityKeywords = this.cityKeywords[city];
        results = results.filter(poi => {
          return cityKeywords && cityKeywords.some(keyword => poi.name.includes(keyword));
        });
      }

      // 按评分排序
      results.sort((a, b) => b.rating - a.rating);

      return results.slice(0, limit);
    } catch (error) {
      console.error('Get attractions by category failed:', error);
      return [];
    }
  }

  // 获取城市列表
  getAvailableCities(): string[] {
    return Object.keys(this.cityKeywords);
  }

  // 获取分类列表
  getAvailableCategories(): string[] {
    const categories = new Set<string>();
    this.mockPOIData.forEach(poi => {
      poi.tags?.forEach(tag => categories.add(tag));
      categories.add(poi.type);
    });
    return Array.from(categories);
  }

  // 搜索景点（用于 ExploreScreen）
  async searchAttractions(
    query: string,
    filters?: {
      category?: string;
      tags?: string[];
      minRating?: number;
    },
    page: number = 1
  ): Promise<{ attractions: POIResult[]; hasMore: boolean; total: number }> {
    try {
      // 使用现有的 searchPOI 方法
      const results = await this.searchPOI(query);
      
      // 应用过滤器
      let filteredResults = results;
      
      if (filters?.category) {
        filteredResults = filteredResults.filter(poi => poi.type === filters.category);
      }
      
      if (filters?.minRating) {
        filteredResults = filteredResults.filter(poi => poi.rating >= filters.minRating!);
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        filteredResults = filteredResults.filter(poi =>
          filters.tags!.some((tag: string) => poi.tags?.includes(tag))
        );
      }

      // 分页处理
      const pageSize = 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);

      return {
        attractions: paginatedResults,
        hasMore: endIndex < filteredResults.length,
        total: filteredResults.length,
      };
    } catch (error) {
      console.error('Search attractions failed:', error);
      return {
        attractions: [],
        hasMore: false,
        total: 0,
      };
    }
  }

  // 获取最近搜索（从 AsyncStorage）
  async getRecentSearches(): Promise<string[]> {
    try {
      // TODO: 实现真实的最近搜索存储
      // const searches = await AsyncStorage.getItem('recent_searches');
      // return searches ? JSON.parse(searches) : [];
      return [];
    } catch (error) {
      console.error('Get recent searches failed:', error);
      return [];
    }
  }

  // 保存最近搜索
  async saveRecentSearch(query: string): Promise<void> {
    try {
      // TODO: 实现真实的最近搜索存储
      // const searches = await this.getRecentSearches();
      // const updatedSearches = [query, ...searches.filter(s => s !== query)].slice(0, 10);
      // await AsyncStorage.setItem('recent_searches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Save recent search failed:', error);
    }
  }

  // 清除最近搜索
  async clearRecentSearches(): Promise<void> {
    try {
      // TODO: 实现真实的最近搜索存储
      // await AsyncStorage.removeItem('recent_searches');
    } catch (error) {
      console.error('Clear recent searches failed:', error);
    }
  }

  // 获取搜索建议（使用现有的 getSearchSuggestions 方法）
  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    return this.getSearchSuggestions(query);
  }
}

export const searchService = new SearchService();