import { AOP_CLASS_METADATA_KEY, Aspect } from './aspect';

describe('Aspect', () => {
  it('should set AOP_CLASS_METADATA_KEY to true', () => {
    @Aspect()
    class TestAspect {}

    const metadata = Reflect.getMetadata(AOP_CLASS_METADATA_KEY, TestAspect);
    expect(metadata).toBe(true);
  });
});
