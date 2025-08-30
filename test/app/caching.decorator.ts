import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from '../../src';

@Injectable()
export class CachingDecorator extends SAOPDecorator<any, Error> {
  private cache = new Map<string, { value: any; expiry: number }>();

  around({ method, options }: { method: Function; options: any }): (...args: any[]) => any {
    return async (...args: any[]) => {
      const key = this.generateKey(method.name, args);
      const ttl = options?.ttl || 300000; // 기본 5분

      // 캐시된 값 확인
      const cached = this.cache.get(key);
      if (cached && cached.expiry > Date.now()) {
        console.log('🔄 Cache hit:', key);
        return cached.value;
      }

      // 캐시 만료 또는 없음
      console.log('📭 Cache miss:', key);
      const result = await method.apply(this, args);

      // 결과 캐싱
      this.cache.set(key, {
        value: result,
        expiry: Date.now() + ttl,
      });

      return result;
    };
  }

  private generateKey(methodName: string, args: any[]): string {
    return `${methodName}:${JSON.stringify(args)}`;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
}
