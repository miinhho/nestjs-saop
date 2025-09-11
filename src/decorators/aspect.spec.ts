import { AOP_CLASS_METADATA_KEY, AOP_ORDER_METADATA_KEY, Aspect } from './aspect';

describe('Aspect', () => {
  it('should set AOP_CLASS_METADATA_KEY to true', () => {
    @Aspect()
    class TestAspect {}

    const metadata = Reflect.getMetadata(AOP_CLASS_METADATA_KEY, TestAspect);
    expect(metadata).toBe(true);
  });

  it('should set AOP_ORDER_METADATA_KEY to the specified order', () => {
    const order = 5;
    @Aspect({ order })
    class TestAspectWithOrder {}

    const metadata = Reflect.getMetadata(AOP_ORDER_METADATA_KEY, TestAspectWithOrder);
    expect(metadata).toBe(order);
  });

  it('should default AOP_ORDER_METADATA_KEY to 0 if not specified', () => {
    @Aspect()
    class TestAspectDefaultOrder {}

    const metadata = Reflect.getMetadata(AOP_ORDER_METADATA_KEY, TestAspectDefaultOrder);
    expect(metadata).toBe(0);
  });
});
