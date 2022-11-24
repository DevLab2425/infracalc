type InfraCalcResource = {
    building: string,
    time: number,
    output: number,
    inputs: any[],
    input_vals: any[],
    rate?: any,
}
type InfraCalcGlobalData = {
  [key: string]: InfraCalcResource
};

type InfraCostsArray = {
  [index: string]: number
};

export type InfraCalcApp = {
  timeFrame: number[],
  init: () => {},
  setupSelectors: () => {},
  setupFormHandlers: () => {},
  setupToggleButtons: () => {},
  toggleMode: (ev: Event) => {},
  validateAmount: (amount: HTMLInputElement, messageElement: HTMLParagraphElement, table: HTMLTableElement, message: string) => {},
  calculateBuildingRequirements: (ev: SubmitEvent) => {},
  calculateResourceRate: (ev: SubmitEvent) => {},
  itemCosts: (item: string, costs: any, requiredRate: number) => {},
  populateResults: (item: string, table: HTMLTableElement, results: any) => {},
  sumRequired: (item: string, results: any) => {},
  displayResults: () => {},
  hideResults: () => {},
  data: InfraCalcGlobalData,
};

window.InfraCalc = window.InfraCalc || {
  timeFrame: [1, 60],

  init: () => {
    // call on window.onload
    console.debug('InfraCalc::Initializing application');
    const {
      setupSelectors,
      setupToggleButtons,
      setupFormHandlers,
    }: InfraCalcApp = window.InfraCalc;

    setupSelectors();
    setupToggleButtons();
    setupFormHandlers();
  },

  setupSelectors: () => {
    console.debug('InfraCalc::Setting up resource selectors');

    const { data } = window.InfraCalc as InfraCalcApp;

    const resourceSelector = document.getElementById('resource-selector') as HTMLSelectElement;
    const buildings = document.getElementById('building') as HTMLSelectElement;

    Object.keys(data).forEach((key) => {
      const resource: InfraCalcResource = data[key];

      const optResource = document.createElement('option') as HTMLOptionElement;
      optResource.text = key;
      resourceSelector.options.add(optResource);

      const optBuilding = document.createElement('option');
      optBuilding.text = resource.building;
      buildings.options.add(optBuilding);

      resource.rate = resource.output / resource.time;
    });
  },

  setupFormHandlers: () => {
    console.debug('InfraCalc::Setting up form submit handlers');
    const { calculateResourceRate, calculateBuildingRequirements } = window.InfraCalc;

    const productForm = document.getElementById('prod-rate-form') as HTMLFormElement;
    const buildForm = document.getElementById('build-calc-form') as HTMLFormElement;
    
    productForm.addEventListener('submit', calculateResourceRate);
    buildForm.addEventListener('submit', calculateBuildingRequirements);
  },

  setupToggleButtons: () => {
    console.debug('InfraCalc::Setting up toggle buttons');
    const { toggleMode } = window.InfraCalc;

    document
      .querySelectorAll('input[name="mode"]')
      .forEach((element) => element.addEventListener('change', (ev) => toggleMode(ev)));
  },

  toggleMode: (ev: SubmitEvent) => {
    const { value } = ev.target as HTMLFormElement;

    console.debug('InfraCalc::Toggle Mode ->', value);

    const calcs = document.querySelectorAll('.calculator');
    const activeRadioWrapper = document.getElementById(`${value}-calculation`) as HTMLDivElement;

    // dirty way to toggle between 2;
    // any more items, will require a refactor
    calcs[0].classList.remove('active');
    calcs[1].classList.remove('active');
    
    activeRadioWrapper.classList.add('active');

    window.InfraCalc.hideResults();
  },

  validateAmount: (amount: HTMLInputElement, messageElement: HTMLParagraphElement, table: HTMLTableElement, message: string) => {
    if (!amount.checkValidity()) {
      messageElement.innerText = 'aborting calculation due to bad input';
    } else {
      messageElement.innerText = message;
      table.innerHTML = '';
    }

    return amount.checkValidity();
  },

  calculateBuildingRequirements: (ev: SubmitEvent) => {
    console.debug('InfraCalc::Calculating building requirements');

    ev.preventDefault();

    const { data, itemCosts, populateResults, validateAmount } =
      window.InfraCalc;

    const buildingSelector = document.getElementById('building') as HTMLSelectElement;

    const itemKey =
      Object.keys(data)[buildingSelector.selectedIndex];
    const resource = data[itemKey];
    const amount = document.getElementById('building-amount') as HTMLInputElement;
    const table = document.getElementById('calculator-results') as HTMLTableElement;
    const messageElement = document.getElementById('results-message') as HTMLParagraphElement;

    const message = `Requirements to satisfy ${amount.value} ${resource.building} building(s)`;
    if (!validateAmount(amount, messageElement, table, message)) {
      return;
    }

    const results = {};

    itemCosts(itemKey, results, parseInt(amount.value));
    populateResults(itemKey, table, results);
  },

  calculateResourceRate: (ev: SubmitEvent) => {
    console.debug('InfraCalc::Calculating resource rate');

    ev.preventDefault();

    const {
      data,
      displayResults,
      itemCosts,
      populateResults,
      timeFrame,
      validateAmount,
    } = window.InfraCalc as InfraCalcApp;

    const timeFrameSelector = document.getElementById('time-frame') as HTMLSelectElement;
    const resourceSelector = document.getElementById('resource-selector') as HTMLSelectElement;
    
    const time = timeFrame[timeFrameSelector.selectedIndex];
    const item =
      Object.keys(data)[resourceSelector.selectedIndex];
    const amount = document.getElementById('rate-amount') as HTMLInputElement;
    const table = document.getElementById('calculator-results') as HTMLTableElement;
    const messageElement = document.getElementById('results-message') as HTMLParagraphElement;

    if (
      !validateAmount(
        amount,
        messageElement,
        table,
        `Required buildings for ${item}`
      )
    ) {
      return;
    }

    const requiredRate = Number(amount.value) / time;
    const results: any = {};

    itemCosts(item, results, requiredRate / data[item].rate);
    populateResults(item, table, results);
    displayResults();

    console.debug('InfraCalc::Resource rate results:', { results });
  },

  
  itemCosts: (item: string, costs: {[key: string]: number[]}, requiredRate: number) => {
    const { data, itemCosts } = window.InfraCalc;

    costs[item] = [ Math.ceil(requiredRate) ];

    const getItemCost = (item: string, index: number, val: string) => {
      // required rate * ingredient amount  / building process time / ingredient production rate
      return ( requiredRate * data[item].input_vals[index] / data[item].time ) / data[val].rate; // eslint-disable-line prettier/prettier
    };

    for (const [i, v] of data[item].inputs.entries()) {
      itemCosts(v, costs, getItemCost(item, i, v));
    }
  },

  populateResults: (item: string, table: HTMLTableElement, results: InfraCalcGlobalData) => {
    const { data, sumRequired, displayResults } = window.InfraCalc as InfraCalcApp;
    const resources = Object.keys(data).reverse();
    const baseHtml = `
    <tr>
      <th>Building</th>
      <th>Number required</th>
    </tr>
    <tr>
      <td>${data[item].building}</td>
      <td>${sumRequired(item, results)}</td>
    </tr>`;

    const resourceHtml = resources
      .filter((resource: string) => {
        return resource !== item && results[resource];
      })
      .map((resource) => {
        return `<tr>
          <td>${data[resource].building}</td>
          <td>${sumRequired(resource, results)}</td>
        <tr/>`;
      })
      .join('');

    table.innerHTML = `${baseHtml}${resourceHtml}`;

    displayResults();
  },

  sumRequired: (item: string, results: any) => {
    const sum = results[item].reduce((count: number, amount: number) => {
      return count + amount;
    }, 0);

    return sum;
  },

  displayResults: () => {
    const resultsDisplay = document.getElementById('results') as HTMLDivElement;

    resultsDisplay.classList.add('ready');
  },

  hideResults: () => {
    const resultsDisplay = document.getElementById('results') as HTMLDivElement;

    resultsDisplay.classList.remove('ready');
  },

  data: {
    Sand: {
      building: 'Large Sand Mine',
      time: 6,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Copper: {
      building: 'Large Copper Mine',
      time: 3.2,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Iron: {
      building: 'Large Iron Mine',
      time: 1.6,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Sulpher: {
      building: 'Large Sulpher Mine',
      time: 1.2,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Aluminium: {
      building: 'Large Aluminium Mine',
      time: 5.4,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Uranium: {
      building: 'Large Uranium Mine',
      time: 20,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Iridium: {
      building: 'Large Iridium Mine',
      time: 5.4,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Carbon: {
      building: 'Carbon Processor',
      time: 8,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Steel: {
      building: 'Steel Mill',
      time: 16,
      output: 2,
      inputs: ['Iron', 'Carbon', 'Water'],
      input_vals: [1, 1, 1],
    },
    Concrete: {
      building: 'Concrete Factory',
      time: 9.6,
      output: 4,
      inputs: ['Sand', 'Sulpher'],
      input_vals: [1, 2],
    },
    Electronics: {
      building: 'Electronics Factory',
      time: 32,
      output: 2,
      inputs: ['Iron', 'Copper'],
      input_vals: [1, 1],
    },
    Microchips: {
      building: 'Microchips Factory',
      time: 60,
      output: 1,
      inputs: ['Sand', 'Electronics'],
      input_vals: [1, 2],
    },
    Nanotubes: {
      building: 'Nanotubes Factory',
      time: 50,
      output: 2,
      inputs: ['Sand', 'Carbon', 'Water'],
      input_vals: [2, 5, 2],
    },
    'Neural Processors': {
      building: 'Neural Processor Factory',
      time: 90,
      output: 1,
      inputs: ['Sand', 'Nanotubes', 'Microchips'],
      input_vals: [2, 3, 2],
    },
    Motors: {
      building: 'Motor Factory',
      time: 24,
      output: 1,
      inputs: ['Copper', 'Steel'],
      input_vals: [1, 2],
    },
    'Iridium Alloy': {
      building: 'Iridium Alloy Factory',
      time: 26,
      output: 1,
      inputs: ['Iridium', 'Nanotubes'],
      input_vals: [2, 2],
    },
    'Holo-Display': {
      building: 'Holo-Display Factory',
      time: 26,
      output: 1,
      inputs: ['Sand', 'Iridium', 'Nanotubes'],
      input_vals: [2, 1, 2],
    },
    'Radiation Core': {
      building: 'Radiation Core Factory',
      time: 20,
      output: 1,
      inputs: ['Uranium', 'Iridium Alloy'],
      input_vals: [2, 2],
    },
    'Home Appliances': {
      building: 'Home Appliances Factory',
      time: 36,
      output: 2,
      inputs: ['Iron', 'Electronics'],
      input_vals: [1, 2],
    },
    Computer: {
      building: 'Computer Factory',
      time: 80,
      output: 4,
      inputs: ['Aluminium', 'Electronics', 'Microchips'],
      input_vals: [1, 2, 1],
    },
    'Home Robot': {
      building: 'Home Robot Factory',
      time: 60,
      output: 10,
      inputs: ['Aluminium', 'Electronics', 'Motors', 'Neural Processors'],
      input_vals: [2, 2, 1, 1],
    },
    'Industrial Robot': {
      building: 'Industrial Robot Factory',
      time: 60,
      output: 4,
      inputs: ['Aluminium', 'Electronics', 'Motors', 'Neural Processors'],
      input_vals: [2, 2, 1, 1],
    },
    'High Tech': {
      building: 'High Tech Factory',
      time: 40,
      output: 4,
      inputs: ['Aluminium', 'Neural Processors', 'Iridium Alloy', 'Methane'],
      input_vals: [4, 1, 1, 6],
    },
    'VR Edutainment': {
      building: 'VR Edutainment Factory',
      time: 20,
      output: 5,
      inputs: ['Holo-Display', 'Microchips', 'Neural Processors'],
      input_vals: [1, 1, 1],
    },
    'Iridium Propellant': {
      building: 'Iridium Propellant Factory',
      time: 26,
      output: 1,
      inputs: ['Sulpher', 'Iridium'],
      input_vals: [10, 10],
    },
    'AI Control Unit': {
      building: 'AI Control Unit Factory',
      time: 26,
      output: 1,
      inputs: ['Aluminium', 'Neural Processors'],
      input_vals: [4, 2],
    },
    'Blue Science': {
      building: 'Blue Science Pack Factory',
      time: 20,
      output: 1,
      inputs: ['Iron', 'Carbon'],
      input_vals: [2, 1],
    },
    'Green Science': {
      building: 'Green Science Pack Factory',
      time: 60,
      output: 1,
      inputs: ['Sulpher', 'Electronics', 'Blue Science'],
      input_vals: [4, 4, 3],
    },
    'Yellow Science': {
      building: 'Yellow Science Pack Factory',
      time: 120,
      output: 1,
      inputs: ['Motors', 'Neural Processors', 'Green Science', 'Methane'],
      input_vals: [10, 4, 1, 5],
    },
    'Red Science': {
      building: 'Red Science Pack Factory',
      time: 160,
      output: 1,
      inputs: ['Radiation Core', 'AI Control Unit', 'Yellow Science'],
      input_vals: [8, 3, 2],
    },
    Fertilizer: {
      building: 'Fertilizer Factory',
      time: 10,
      output: 1,
      inputs: ['Sulpher'],
      input_vals: [1],
    },
    Vegetables: {
      building: 'Vegetable farm',
      time: 14,
      output: 2,
      inputs: ['Fertilizer'],
      input_vals: [1],
    },
    Meat: {
      building: 'Meat Lab',
      time: 16,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    'Good Meal': {
      building: 'Meal Factory',
      time: 6,
      output: 2,
      inputs: ['Vegetables', 'Meat'],
      input_vals: [1, 1],
    },
    Water: {
      building: 'Ground Water Extractor',
      time: 2,
      output: 1,
      inputs: [],
      input_vals: [],
    },
    Methane: {
      building: 'Methane Drill',
      time: 10,
      output: 1,
      inputs: [],
      input_vals: [],
    },
  },
};

window.onload = window.InfraCalc.init;
