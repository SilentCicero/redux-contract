# redux-contract

A higher order web3 contract decorator for dApps using redux

Note** this module is highly experimental.

```
npm install --save redux-contract
```

## example

```
contract SimpleStore {
  event ValueSet(uint _value);
  uint store;

  function set(uint _value) {
    store = _value;
    ValueSet(_value);
  }

  function get() constant returns (uint _value) {
    return store;
  }
}
```

```js
import {Web3} from 'web3';
import {createStore, combineReducers} from 'redux';
import {configureReduxContract, contractsReducer} from 'redux-contract';

const web3 = new Web3();
const store = configureStore(combineReducers({Contracts: contractsReducer}));
const reduxContract = configureReduxContract(store, web3);

export default reduxContract;
```

```js
import {reduxContract} from './reduxContract';

const SimpleStore = reduxContract({
  abi: contractABI,
  bytecode: contractBytecode,
  contract: 'SimpleStore'
});

SimpleStore.new({from: web3.eth.accounts[0], gas: 3000000}, function(error, contract) {
  console.log(error, contract);

  if(contract.address) {
    contract.get(function(getError, getResult) {
      console.log('get stored value', getError, getResult);
    });
  }
});

// or

const simpleStore = SimpleStore.at("0xa69757298161b4fe815b80e3e17df5af7cc56cbf")

simpleStore.get(function(getError, getResult) {
  console.log('get stored value', getError, getResult);
});

```

will result in this redux state

```json
{
  "Contracts": {
    "SimpleStore": {
      "set": {
        "inputs": [],
        "txObject": {},
        "error": null,
        "result": null
      },
      "get": {
        "inputs": [],
        "txObject": {},
        "error": null,
        "result": "0"
      },
      "ValueSet": {
        "inputs": {},
        "error": null,
        "result": null
      },
      "new": {
        "inputs": [],
        "txObject": {
          "from": "0x283b664126619b1546066ff5e4589f1ff4a36924",
          "gas": "0x2dc6c0",
          "data": "606060405260ce8060106000396000f360606040526000357c01000000000000000000000000000000000000000000000000000000009004806360fe47b11460415780636d4ce63c14605757603f565b005b605560048080359060200190919050506078565b005b6062600480505060bd565b6040518082815260200191505060405180910390f35b806000600050819055507f012c78e2b84325878b1bd9d250d772cfe5bda7722d795f45036fa5e1e6e303fc816040518082815260200191505060405180910390a15b50565b6000600060005054905060cb565b9056"
        },
        "transactionHash": "0x99890ced0349a3721d50209250a2cd2c98d93d405e4a703bc9030e2f38a162ab"
      },
      "created": true,
      "address": "0xa69757298161b4fe815b80e3e17df5af7cc56cbf"
    }
  }
}
```

## About

This module creates a flat redux state of your web3 contract. It is not meant to replace all contract logic for your dApp, however, it does provide the basic state flat state of a contract, which can be useful for interacting with contracts for things like forms.

This module is based roughly off of the `redux-form` module.

Configure your redux contract factory with your pre-configured redux store and web3 object. Then use it as you would a `web3.eth.contract` object.

This module will keep your contract in sync with your redux state in a flat manor as you use and interact with your contract. Each contract is given a `contract` name identifier. This allows multiple contracts with the same ABI to be logged in the state.

## API

### (1) configureReduxContract

Builds a redux web3 contract factory method.

**Parameters**

-   `store` **Object** your pre-configured redux store object
-   `web3` **Object** your pre-configured web3 object

Returns **Function** a redux contract factory. Any contracts loaded into this factory will be mirrored in the redux state as they are used.

### (2) reduxContract

The method returned by `configureReduxContract`. Input a single contract properties object, and get a web3 contract factory back.

-   `props` **Object** your contract properties

Returns **Object** returns a web3 contract factory with the `at` and `new` methods. Note, the `contract`, and `abi` properties must be defined in the object.

Example Use:

```
const SimpleStore = reduxContract({
  abi: contractABI,
  bytecode: contractBytecode,
  contract: 'SimpleStore',
  methods: ['new', 'get'] // <-- optional.. only include certain methods in redux state
});

SimpleStore.new(...);
SimpleStore.at(...);
```

## Todo

 - better method and logic handling
 - more tests (this module is not heavily tested yet)

## Known Pitfalls
 
 - you must provide a filter object for events.. `so MyFilter({}, callback..)`

## Test

```
npm test
```

## Linting

This package follows the AirBNB linting style.

See: https://github.com/airbnb/javascript

```
npm run lint
```

## License

```
The MIT License (MIT)

Copyright (c) 2016 Nick Dodson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
