export function construct(contractName, methods) {
  return {
    type: 'CONSTRUCT_CONTRACT',
    contract: contractName,
    contractMethods: methods
  };
}

export function at(contractName, methods, address) {
  return {
    type: 'CONTRACT_AT',
    contract: contractName,
    contractMethods: methods,
    contractAddress: address
  };
}

export function newPending(contractName, methods, inputs, txObject, transactionHash) {
  return {
    type: 'NEW_CONTRACT_PENDING',
    contract: contractName,
    contractMethods: methods,
    methodInputs: inputs,
    methodTxObject: txObject,
    methodTransactionHash: transactionHash
  };
}

export function newError(contractName, inputs, txObject, error) {
  return {
    type: 'NEW_CONTRACT_ERROR',
    contract: contractName,
    methodError: error,
    methodInputs: inputs,
    methodTxObject: txObject
  };
}

export function newSuccess(contractName, address) {
  return {
    type: 'NEW_CONTRACT_SUCCESS',
    contract: contractName,
    contractAddress: address
  };
}

export function methodSuccess(contractName, name, type, inputs, txObject, result) {
  return {
    type: 'CONTRACT_METHOD_SUCCESS',
    contract: contractName,
    methodName: name,
    methodInputs: inputs,
    methodType: type,
    methodTxObject: txObject,
    methodResult: result
  };
}

export function methodError(contractName, name, type, inputs, txObject, error) {
  return {
    type: 'CONTRACT_METHOD_ERROR',
    contract: contractName,
    methodName: name,
    methodType: type,
    methodInputs: inputs,
    methodTxObject: txObject,
    methodError: error
  };
}
