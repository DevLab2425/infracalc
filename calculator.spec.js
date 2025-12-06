const Calculator = require('./calculator');

describe('Calculator', () => {
  let instance;

  beforeEach(() => {
    instance = new Calculator();
  });

  afterEach(() => {
    instance = undefined;
  });

  it('should expose a static `products` array', () => {
    expect(Calculator.products).toBeDefined();
    expect(Calculator.products).toEqual(expect.any(Array));
  });

  describe('getMaterials', () => {
    it('should return the materials for a product', () => {
      const expected = {mockMaterial: 1, anotherMaterial: 2};
      const mockProduct = { name: 'mockProduct', materials: expected };

      const materials = instance.getMaterials(mockProduct);

      expect(materials).toEqual(expected);
    });
  });

  describe('calculateBuildingSupport', () => {
    it('should be 1:1 buildings for raw materials', () => {
      const mockCount = 5;
      const expected = { mockProduct: mockCount};
      const product = {
        name: 'mockProduct',
        materials: 'raw',
      }

      const results = instance.calculateBuildingSupport(product, mockCount);

      expect(results).toEqual(expected);
    });

    it('should return the product building for "simple" compounds', () => {
      const mockCount = 5;
      const expected = { mockProduct: mockCount};
      const product = {
        name: 'mockProduct',
        materials: {},
      }

      const results = instance.calculateBuildingSupport(product, mockCount);

      expect(results).toEqual(expected);
    });
  });
}); 