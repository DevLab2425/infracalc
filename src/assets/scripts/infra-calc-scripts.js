window.InfraCalc = window.InfraCalc || {
  timeFrame: [1, 60],

  init: () => {
    // call on window.onload
    console.debug('InfraCalc::Init');
    const { data, calculateResourceRate, calculateBuildingRequirements } = window.InfraCalc;
    
    const resourceSelector = document.getElementById("resource-selector");
    const buildings = document.getElementById("building");

    Object.keys(data)
      .forEach((key) => {
        const optResource = document.createElement("option");
        optResource.text = key;
        resourceSelector.options.add(optResource);

        const optBuilding = document.createElement("option");
        optBuilding.text = data[key].building;
        buildings.options.add(optBuilding);

        data[key].rate = data[key].output / data[key].time;
      });

    window.InfraCalc.setupToggleButtons();
    
    document.getElementById("prod-rate-form").addEventListener("submit", (ev) => calculateResourceRate(ev));
    document.getElementById("build-calc-form").addEventListener("submit", (ev) => calculateBuildingRequirements(ev));
  },

  setupToggleButtons: () => {
    console.debug('InfraCalc::Setting up toggle buttons');
    const { toggleMode } = window.InfraCalc;

    document.querySelectorAll('input[name="mode"]')
      .forEach(element => element.addEventListener("change", ev => toggleMode(ev)));
  },

  toggleMode: (ev) => {
    const { target : { value } } = ev;
    
    console.debug('InfraCalc::Toggle Mode ->', value);

    const calcs = document.querySelectorAll('.calculator');
    
    // dirty way to toggle between 2;
    // any more items, will require a refactor
    calcs[0].classList.remove('active');
    calcs[1].classList.remove('active');
    console.log({value});
    document.getElementById(`${value}-calculation`).classList.add('active');

    window.InfraCalc.hideResults();
  },

  validateAmount: (amount, messageElement, table, message) => {
    if (!amount.checkValidity()) {
      messageElement.innerText = "aborting calculation due to bad input";
    } else {
      messageElement.innerText = message;
      table.innerHTML = "";
    }
  
    return amount.checkValidity();
  },

  calculateBuildingRequirements: (ev) => {
    console.debug('InfraCalc::Calculating building requirements');
    
    ev.preventDefault();
    
    const { data, itemCosts, populateResults, validateAmount } = window.InfraCalc;
    
    const itemKey = Object.keys(data)[document.getElementById("building").selectedIndex];
    const item = data[itemKey];
    const amount = document.getElementById("building-amount")
    const table = document.getElementById("calculator-results");
    const messageElement = document.getElementById("results-message");
  
    const plural = amount.value > 1 ? "s" : "";
    const message = `Requirements to satisfy ${amount.value} ${item.building} building${plural}`
    if (!validateAmount(amount, messageElement, table, message)) {
      return;
    }
  
    const results = {};
    
    itemCosts(itemKey, results, parseInt(amount.value));
    populateResults(itemKey, table, results);
  },

  calculateResourceRate: (ev) => {
    console.debug('InfraCalc::Calculating resource rate');

    ev.preventDefault();
    
    const { data, displayResults, itemCosts, populateResults, timeFrame, validateAmount } = window.InfraCalc;
    const time = timeFrame[document.getElementById("time-frame").selectedIndex];
    const item = Object.keys(data)[document.getElementById("resource-selector").selectedIndex];
    const amount = document.getElementById("rate-amount");
    const table = document.getElementById("calculator-results");
    const messageElement = document.getElementById("results-message");
  
    if (!validateAmount(amount, messageElement, table, "Required buildings for " + item)) {
      return;
    }
  
    const requiredRate = amount.value / time;
    const results = {};
  
    itemCosts(item, results, requiredRate / data[item].rate);
    populateResults(item, table, results);
    displayResults();
  
    console.debug('InfraCalc::Resource rate results:',{results});
  },

  itemCosts: (item, costs, requiredRate) => {
    const { data, itemCosts } = window.InfraCalc;

    // if (!costs.hasOwnProperty(item)) {
      costs[item] = [];
    // }
  

    costs[item].push(requiredRate > 1 ? Math.round(requiredRate) : 1);
  
    for (const [i, v] of data[item].inputs.entries()) {
      // required rate * ingredient amount  / building process time / ingredient production rate
      itemCosts(v, costs, (requiredRate * data[item].input_vals[i] / data[item].time) / data[v].rate);
    }
  },
  
  populateResults: (item, table, results) => {
    const { data, sumRequired, } = window.InfraCalc;
    const list = Object.keys(data).reverse();
    let html = "<tr><th>Building</th><th>Number required</th></tr>";
  
    html += `<tr><td>${data[item].building}</td><td>${sumRequired(item, results)}</td><tr>`;
  
  
    for (const i of list) {
      if (i === item || !results[i]) {
        continue;
      }
      html += `<tr><td>${data[i].building}</td><td>${sumRequired(i, results)}</td><tr>`
    }
  
    table.innerHTML = html;

    window.InfraCalc.displayResults()
  },

  sumRequired: (item, results) => {
    let origSum = 0;
    for (const i of results[item]) {
      origSum += i;
    }

    const sum = results[item].reduce((count, amount) => {
      return count + amount;
    }, 0);

    console.log('final', origSum === sum);
    return sum;
  },

  displayResults: () => {
    document.getElementById('results').classList.add('ready');
  },

  hideResults: () => {
    document.getElementById('results').classList.remove('ready');
  },

  data: {
    "Sand": {
      "building": "Large Sand Mine",
      "time": 6,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Copper": {
      "building": "Large Copper Mine",
      "time": 3.2,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Iron": {
      "building": "Large Iron Mine",
      "time": 1.6,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Sulpher": {
      "building": "Large Sulpher Mine",
      "time": 1.2,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Aluminium": {
      "building": "Large Aluminium Mine",
      "time": 5.4,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Uranium": {
      "building": "Large Uranium Mine",
      "time": 20,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Iridium": {
      "building": "Large Iridium Mine",
      "time": 5.4,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Carbon": {
      "building": "Carbon Processor",
      "time": 8,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Steel": {
      "building": "Steel Mill",
      "time": 16,
      "output": 2,
      "inputs": ["Iron", "Carbon", "Water"],
      "input_vals": [1, 1, 1],
    },
    "Concrete": {
      "building": "Concrete Factory",
      "time": 9.6,
      "output": 4,
      "inputs": ["Sand", "Sulpher"],
      "input_vals": [1, 2],
    },
    "Electronics": {
      "building": "Electronics Factory",
      "time": 32,
      "output": 2,
      "inputs": ["Iron", "Copper"],
      "input_vals": [1, 1],
    },
    "Microchips": {
      "building": "Microchips Factory",
      "time": 60,
      "output": 1,
      "inputs": ["Sand", "Electronics"],
      "input_vals": [1, 2],
    },
    "Nanotubes": {
      "building": "Nanotubes Factory",
      "time": 50,
      "output": 2,
      "inputs": ["Sand", "Carbon", "Water"],
      "input_vals": [2, 5, 2],
    },
    "Neural Processors": {
      "building": "Neural Processor Factory",
      "time": 90,
      "output": 1,
      "inputs": ["Sand", "Nanotubes", "Microchips"],
      "input_vals": [2, 3, 2],
    },
    "Motors": {
      "building": "Motor Factory",
      "time": 24,
      "output": 1,
      "inputs": ["Copper", "Steel"],
      "input_vals": [1, 2],
    },
    "Iridium Alloy": {
      "building": "Iridium Alloy Factory",
      "time": 26,
      "output": 1,
      "inputs": ["Iridium", "Nanotubes"],
      "input_vals": [2, 2],
    },
    "Holo-Display": {
      "building": "Holo-Display Factory",
      "time": 26,
      "output": 1,
      "inputs": ["Sand", "Iridium", "Nanotubes"],
      "input_vals": [2, 1, 2],
    },
    "Radiation Core": {
      "building": "Radiation Core Factory",
      "time": 20,
      "output": 1,
      "inputs": ["Uranium", "Iridium Alloy"],
      "input_vals": [2, 2],
    },
    "Home Appliances": {
      "building": "Home Appliances Factory",
      "time": 36,
      "output": 2,
      "inputs": ["Iron", "Electronics"],
      "input_vals": [1, 2],
    },
    "Computer": {
      "building": "Computer Factory",
      "time": 80,
      "output": 4,
      "inputs": ["Aluminium", "Electronics", "Microchips"],
      "input_vals": [1, 2, 1],
    },
    "Home Robot": {
      "building": "Home Robot Factory",
      "time": 60,
      "output": 10,
      "inputs": ["Aluminium", "Electronics", "Motors", "Neural Processors"],
      "input_vals": [2, 2, 1, 1],
    },
    "Industrial Robot": {
      "building": "Industrial Robot Factory",
      "time": 60,
      "output": 4,
      "inputs": ["Aluminium", "Electronics", "Motors", "Neural Processors"],
      "input_vals": [2, 2, 1, 1],
    },
    "High Tech": {
      "building": "High Tech Factory",
      "time": 40,
      "output": 4,
      "inputs": ["Aluminium", "Neural Processors", "Iridium Alloy", "Methane"],
      "input_vals": [4, 1, 1, 6],
    },
    "VR Edutainment": {
      "building": "VR Edutainment Factory",
      "time": 20,
      "output": 5,
      "inputs": ["Holo-Display", "Microchips", "Neural Processors"],
      "input_vals": [1, 1, 1],
    },
    "Iridium Propellant": {
      "building": "Iridium Propellant Factory",
      "time": 26,
      "output": 1,
      "inputs": ["Sulpher", "Iridium"],
      "input_vals": [10, 10],
    },
    "AI Control Unit": {
      "building": "AI Control Unit Factory",
      "time": 26,
      "output": 1,
      "inputs": ["Aluminium", "Neural Processors"],
      "input_vals": [4, 2],
    },
    "Blue Science": {
      "building": "Blue Science Pack Factory",
      "time": 20,
      "output": 1,
      "inputs": ["Iron", "Carbon"],
      "input_vals": [2, 1],
    },
    "Green Science": {
      "building": "Green Science Pack Factory",
      "time": 60,
      "output": 1,
      "inputs": ["Sulpher", "Electronics", "Blue Science"],
      "input_vals": [4, 4, 3],
    },
    "Yellow Science": {
      "building": "Yellow Science Pack Factory",
      "time": 120,
      "output": 1,
      "inputs": ["Motors", "Neural Processors", "Green Science", "Methane"],
      "input_vals": [10, 4, 1, 5],
    },
    "Red Science": {
      "building": "Red Science Pack Factory",
      "time": 160,
      "output": 1,
      "inputs": ["Radiation Core", "AI Control Unit", "Yellow Science"],
      "input_vals": [8, 3, 2],
    },
    "Fertilizer": {
      "building": "Fertilizer Factory",
      "time": 10,
      "output": 1,
      "inputs": ["Sulpher"],
      "input_vals": [1],
    },
    "Vegetables": {
      "building": "Vegetable farm",
      "time": 14,
      "output": 2,
      "inputs": ["Fertilizer"],
      "input_vals": [1],
    },
    "Meat": {
      "building": "Meat Lab",
      "time": 16,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Good Meal": {
      "building": "Meal Factory",
      "time": 6,
      "output": 2,
      "inputs": ["Vegetables", "Meat"],
      "input_vals": [1, 1],
    },
    "Water": {
      "building": "Ground Water Extractor",
      "time": 2,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
    "Methane": {
      "building": "Methane Drill",
      "time": 10,
      "output": 1,
      "inputs": [],
      "input_vals": [],
    },
  }
}

window.onload = window.InfraCalc.init();
