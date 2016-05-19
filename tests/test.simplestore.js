import test from 'tape';
import TestRPC from 'ethereumjs-testrpc';
import Web3 from 'web3';
import { createStore, combineReducers } from 'redux';
import CONTRACTS from '../reducer';
import { configureReduxContract } from '../index';

const web3 = new Web3(TestRPC.provider());
const reducers = {
  Contracts: CONTRACTS
};

const store = createStore(combineReducers(reducers));
const reduxContract = configureReduxContract(store, web3);

test('test base reducer', (t) => {
  t.plan(1);

  const state = store.getState();
  t.ok(state.Contracts, 'Contracts state is defined');
});

test('test new simple store contract', (t) => {
  t.plan(35);

  web3.eth.getAccounts((accountsError, accounts) => {
    t.notOk(accountsError, 'get web3 accounts with no errors');
    const txObject = {
      from: accounts[0],
      gas: 3000000
    };
    const SimpleStore = reduxContract({
      abi: JSON.parse('[{"constant":false,"inputs":[{"name":"_value","type":"uint256"}]' +
      ',"name":"set","outputs":[],"type":"function"},{"constant":true,"inputs":[],' +
      '"name":"get","outputs":[{"name":"_value","type":"uint256"}],"type":"function"},' +
      '{"anonymous":false,"inputs":[{"indexed":false,"name":"_value","type":"uint256"}],' +
      '"name":"ValueSet","type":"event"}]'),
      bytecode: '606060405260ce8060106000396000f360606040526000357c010' +
      '0000000000000000000000000000000000000000000000000000000900480636' +
      '0fe47b11460415780636d4ce63c14605757603f565b005b60556004808035906' +
      '0200190919050506078565b005b6062600480505060bd565b604051808281526' +
      '0200191505060405180910390f35b806000600050819055507f012c78e2b8432' +
      '5878b1bd9d250d772cfe5bda7722d795f45036fa5e1e6e303fc8160405180828' +
      '15260200191505060405180910390a15b50565b6000600060005054905060cb56' +
      '5b9056',
      contract: 'SimpleStore'
    });

    store.subscribe(() => {
      const state = store.getState();

      if (state.Contracts.SimpleStore.new.created !== true) {
        t.ok(state.Contracts.SimpleStore, 'simplestore contract added to state');
        t.ok(state.Contracts.SimpleStore.new, 'simplestore new method added to state');
        t.ok(state.Contracts.SimpleStore.new.inputs, 'simplestore new inputs added to state');
        t.ok(state.Contracts.SimpleStore.new.txObject, 'simplestore tx object added to state');
        t.ok(state.Contracts.SimpleStore.new.transactionHash, 'simplestore tx hash added to state');
      }

      if (state.Contracts.SimpleStore.new.created === true) {
        t.ok(state.Contracts.SimpleStore.new.address, 'simplestore address present');
        t.ok(state.Contracts.SimpleStore.new.created, 'simplestore contract created');
      }
    });

    SimpleStore.new(txObject, (error, contract) => {
      t.notOk(error, 'no errors while deploying new SimpleStore contract');

      if (contract.address) {
        t.comment('simple store contract deployed');
        t.comment('setting value...');
        contract.set(100, txObject, (setError, setResult) => {
          t.notOk(setError, 'no errors while setting value');
          t.ok(setResult, 'set result is okay');
          t.equal(typeof setResult, 'string', 'set result is a string');
        });
        t.comment('starting value set event');
        contract.ValueSet({ _value: 100 }, (valueSetError, valueSetResult) => {
          t.notOk(valueSetError, 'no error while filtering set events');
          t.ok(valueSetResult, 'filter object is not null');
        });
      } else {
        t.ok(contract.transactionHash, 'simplestore contract deploying with tx hash');
      }
    });
  });
});
