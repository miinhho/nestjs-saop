import { Injectable } from '@nestjs/common';
import { SAOPDecorator } from '../../src';

@Injectable()
export class PerformanceDecorator extends SAOPDecorator<any, Error> {
  private metrics = new Map<string, number[]>();

  around({ method, options }: { method: Function; options: any }): (...args: any[]) => any {
    return async (...args: any[]) => {
      const startTime = Date.now();
      const methodName = method.name || 'anonymous';

      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        this.recordMetric(methodName, duration);

        if (options?.logPerformance) {
          console.log(`⏱️ ${methodName} took ${duration}ms`);
        }

        // 성능 임계값 체크
        if (options?.threshold && duration > options.threshold) {
          console.warn(`🐌 ${methodName} is slow: ${duration}ms > ${options.threshold}ms`);
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`💥 ${methodName} failed after ${duration}ms:`, error);
        throw error;
      }
    };
  }

  private recordMetric(methodName: string, duration: number): void {
    if (!this.metrics.has(methodName)) {
      this.metrics.set(methodName, []);
    }

    const metrics = this.metrics.get(methodName)!;
    metrics.push(duration);

    // 최근 100개만 유지
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getMetrics(methodName?: string) {
    if (methodName) {
      const metrics = this.metrics.get(methodName) || [];
      const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
      const max = Math.max(...metrics);
      const min = Math.min(...metrics);

      return { count: metrics.length, avg, max, min };
    }

    const result: Record<string, any> = {};
    for (const [name, metrics] of this.metrics.entries()) {
      result[name] = {
        count: metrics.length,
        avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
        max: Math.max(...metrics),
        min: Math.min(...metrics),
      };
    }

    return result;
  }
}
