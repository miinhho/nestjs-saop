import { DiscoveryService } from '@nestjs/core';
import { AOP_CLASS_METADATA_KEY } from '../decorators';
import type { IAOPDecorator } from '../interfaces';
import { InstanceCollector } from './instance-collector.service';

describe('InstanceCollector', () => {
  let service: InstanceCollector;
  let mockDiscoveryService: jest.Mocked<DiscoveryService>;

  beforeEach(() => {
    mockDiscoveryService = {
      getControllers: jest.fn(),
      getProviders: jest.fn(),
    } as any;

    service = new InstanceCollector(mockDiscoveryService);
  });

  describe('collectAllInstances', () => {
    it('should collect all controllers and providers', () => {
      const mockControllers = [
        { instance: 'controller1' } as any,
        { instance: 'controller2' } as any,
      ];
      const mockProviders = [{ instance: 'provider1' } as any, { instance: 'provider2' } as any];

      mockDiscoveryService.getControllers.mockReturnValue(mockControllers);
      mockDiscoveryService.getProviders.mockReturnValue(mockProviders);

      const result = service.collectAllInstances();

      expect(result).toEqual([...mockControllers, ...mockProviders]);
      expect(mockDiscoveryService.getControllers).toHaveBeenCalled();
      expect(mockDiscoveryService.getProviders).toHaveBeenCalled();
    });
  });

  describe('collectAOPDecorators', () => {
    it('should collect AOP decorators from providers', () => {
      const mockAOPDecorator: IAOPDecorator = {
        before: jest.fn(),
        after: jest.fn(),
        afterReturning: jest.fn(),
        afterThrowing: jest.fn(),
        around: jest.fn(),
      };

      const mockProviders = [
        { instance: mockAOPDecorator } as any,
        { instance: 'nonAOPProvider' } as any,
      ];

      Reflect.hasMetadata = jest.fn();
      (Reflect.hasMetadata as jest.Mock)
        .mockReturnValueOnce(true) // First provider is AOP decorator
        .mockReturnValueOnce(false); // Second is not

      mockDiscoveryService.getProviders.mockReturnValue(mockProviders);

      const result = service.collectAOPDecorators();

      expect(result).toEqual([mockAOPDecorator]);
      expect(Reflect.hasMetadata).toHaveBeenCalledWith(
        AOP_CLASS_METADATA_KEY,
        mockAOPDecorator.constructor,
      );
    });
  });

  describe('isAOPDecorator', () => {
    it('should called with constructor of AOP decorator instance', () => {
      const mockInstance = {};
      const wrapper = { instance: mockInstance };

      Reflect.hasMetadata = jest.fn().mockReturnValue(true);

      (service as any).isAOPDecorator(wrapper);

      expect(Reflect.hasMetadata).toHaveBeenCalledWith(
        AOP_CLASS_METADATA_KEY,
        mockInstance.constructor,
      );
    });
  });
});
