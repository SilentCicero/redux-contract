import * as Actions from './actions';
import bigNumberToString from 'bignumber-to-string';

// setup ReduxContract object
function ReduxContract(opts) {
  // setup contract factory
  const Contract = opts._web3.eth.contract(opts.abi);

  // build methods object
  const methods = {};

  // handle/set constructor if any
  const ConstructorMethod = Contract.abi.filter((method) => {
    let methodName = method.name;

    // if method type is constructor
    if (method.type === 'constructor') {
      methodName = 'new';
    }

    // setup default method reducer
    methods[methodName] = {
      inputs: [],
      error: null,
      result: null
    };

    // is method type
    if (method.type !== 'event') {
      methods[methodName].txObject = {};
    } else {
      methods[methodName].inputs = {};
    }

    if (method.type === 'constructor') {
      return method;
    }

    // return default
    return undefined;
  })[0];

  // fire contract construction
  opts._store.dispatch(Actions.construct(opts.contract, methods));

  // set eth property
  this.eth = Contract.eth;

  // set the abi property
  this.abi = Contract.abi;

  // setup the at prototype property
  this.at = (address) => {
    const contract = Contract.at(address);
    const newContract = Contract.at(address);

    // rebuild contract methods
    Contract.abi.forEach((method, methodIndex) => {
      // if the method is a constructor halt
      if (method.type === 'constructor') return;

      // override method
      newContract[method.name] = (..._args) => {
        // convert the method arguments to an array
        const args = Array.prototype.slice.call(_args);

        // get the number of inputs for the method
        let inputsLength = Contract.abi[methodIndex].inputs.length || 0;

        // if is event inputs length is zero
        if (method.type === 'event') inputsLength = 0;

        // gather inputs (could overflow -->)
        let inputs = inputsLength && bigNumberToString(args.slice(0, inputsLength)) || [];

        // if first method is a callback
        if (typeof args[0] === 'function') inputs = [];

        // setup method defaults and callbacks
        if (typeof args[inputsLength] === 'function') {
          // args[inputsLength + 1] = _args[inputsLength];
          args[inputsLength] = {};
        }

        // if no tx or filter object is present
        if (typeof args[inputsLength] === 'undefined') args[inputsLength] = {};

        // if no callback function is present
        if (typeof args[inputsLength + 1] === 'undefined') {
          args[inputsLength + 1] = () => {};
        }

        // get tx object
        const txObject = bigNumberToString(args[inputsLength]);

        // get callback
        const callback = args[inputsLength + 1];

        // setup callback override
        args[inputsLength + 1] = (methodError, _methodResult) => {
          const methodResult = _methodResult;

          // if an error occured fire method error action
          if (methodError) {
            opts._store.dispatch(Actions.methodError(opts.contract,
                method.name, method.type, inputs, txObject, methodError));
          }

          // if event result
          if (methodResult.block) {
            delete methodResult.block;
          }

          // if result, fire method success action
          if (!methodError && methodResult) {
            opts._store.dispatch(Actions.methodSuccess(opts.contract,
              method.name, method.type, inputs, txObject, bigNumberToString(methodResult)));
          }

          // passthrough callback with error and result
          return callback(methodError, methodResult);
        };

        // passthrough with new arguments
        return contract[method.name].apply(contract, args);
      };
    });

    // dispatch contract at event
    opts._store.dispatch(Actions.at(opts.contract, methods, address));

    // return new contract object
    return newContract;
  };

  // setup at method context
  const atMethod = this.at;

  // setup new contract method
  this.new = (..._args) => {
    // convert new arguments to an array
    const args = Array.prototype.slice.call(_args);

    // get the total length of the Contract constructor inputs
    const inputsLength = ConstructorMethod && ConstructorMethod.inputs.length || 0;

    // gather contract constructor inputs if any
    const inputs = inputsLength && bigNumberToString(args.slice(0, inputsLength)) || [];

    // get the transaction object
    const txObject = bigNumberToString(args[inputsLength]) || {};

    // check for data bytecode
    if (typeof txObject.data === 'undefined') {
      txObject.data = opts.bytecode;
      args[inputsLength].data = opts.bytecode;
    }

    // get the callback method
    const callback = args[inputsLength + 1];

    // override the callback and add in state management
    args[inputsLength + 1] = (error, result) => {
      // if an error occurs, dispatch new contract error
      if (error) {
        opts._store.dispatch(Actions.newError(opts.contract, inputs, txObject, error));
        return callback(error, result);
      }

      // handle result
      if (typeof result !== 'undefined') {
        if (typeof result.address !== 'undefined') {
          opts._store.dispatch(Actions.newSuccess(opts.contract, result.address));
          const newResult = atMethod(result.address);
          newResult.address = result.address;
          newResult.transactionHash = result.transactionHash;
          callback(error, newResult);
        } else {
          opts._store.dispatch(Actions.newPending(opts.contract,
              methods, inputs, txObject, result.transactionHash));
          callback(error, result);
        }
      }

      return undefined;
    };

    // return the contract object
    return Contract.new.apply(Contract, args);
  };
}

// setup configure redux contract object
export default function configureReduxContract(store, web3) {
  return (args) => {
    const props = args || {};
    props._store = store;
    props._web3 = web3;

    // throw errors if need be
    if (!store) throw new Error('You must provide a redux store');
    if (!web3) throw new Error('You must provide a web3 object');
    if (!props.abi) throw new Error('You must provide a contract abi array');
    if (!props.contract) {
      throw new Error('Provide contract instance ID in' +
                      'your redux contract config');
    }

    // return new ReduxContract
    return new ReduxContract(props);
  };
}
