class MaterialsCalculator {
  constructor() {

  }

  static products = [
    {
      name: 'concrete',
      building: 'concrete factory',
      materials: {sand: 1, sulphur: 1},
    },
    {
      name: 'iron',
      building: 'iron mine (large)',
      materials: 'raw'
    },
    {
      name: 'sand',
      building: 'sand mine (large)',
      materials: 'raw'
    },
    {
      name: 'sulphur',
      building: 'sulphur mine (large)',
      materials: 'raw'
    },
    {
      name: 'copper',
      building: 'copper mine (large)',
      materials: 'raw'
    },
    {
      name: 'electronics',
      building: 'electronics factory',
      time: 32,
      output: 2,
      materials: {iron: 1, copper: 1},
    },
    {
      name: 'home-appliances',
      building: 'home appliances factory',
      time: 36,
      output: 2,
      materials: {iron: 1, electronics: 2},
    },
  ];

  getMaterials(product) {
    return product.materials;
  }

  calculateBuildingSupport(product, quantity) {
    return {[product.name]: quantity};
  }


};

module.exports = MaterialsCalculator;