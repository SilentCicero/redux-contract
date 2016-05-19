const DEFAULT_CONTRACTS_STATE = {};

export default function CONTRACTS(state = DEFAULT_CONTRACTS_STATE, action) {
  switch (action.type) {
    case 'NEW_CONTRACT_ERROR': {
      return {
        ...state,
        [action.contract]: {
          ...state[action.contract],
          new: {
            error: action.methodError,
            inputs: action.methodInputs,
            txObject: action.methodTxObject
          },
          created: false
        }
      };
    }
    case 'NEW_CONTRACT_PENDING': {
      return {
        ...state,
        [action.contract]: {
          ...state[action.contract],
          new: {
            inputs: action.methodInputs,
            txObject: action.methodTxObject,
            transactionHash: action.methodTransactionHash
          },
          created: false
        }
      };
    }
    case 'NEW_CONTRACT_SUCCESS': {
      return {
        ...state,
        [action.contract]: {
          ...state[action.contract],
          address: action.contractAddress,
          created: true
        }
      };
    }
    case 'CONTRACT_AT': {
      return {
        ...state,
        [action.contract]: {
          ...state[action.contract],
          address: action.contractAddress,
          created: true
        }
      };
    }
    case 'CONSTRUCT_CONTRACT': {
      return {
        ...state,
        [action.contract]: {
          ...state[action.contract],
          ...action.contractMethods,
          created: false
        }
      };
    }
    case 'CONTRACT_METHOD_ERROR': {
      const errorStateObj = {
        ...state,
        [action.contract]: {
          ...state[action.contract],
          [action.methodName]: {
            inputs: action.methodInputs,
            error: action.methodError,
            result: null
          }
        }
      };

      if (action.methodType !== 'event') {
        errorStateObj[action.contract][action.methodName].txObject = action.methodTxObject;
      }

      return errorStateObj;
    }
    case 'CONTRACT_METHOD_SUCCESS': {
      const successStateObj = {
        ...state,
        [action.contract]: {
          ...state[action.contract],
          [action.methodName]: {
            error: null,
            inputs: action.methodInputs,
            result: action.methodResult
          }
        }
      };

      if (action.methodType !== 'event') {
        successStateObj[action.contract][action.methodName].txObject = action.methodTxObject;
      }

      return successStateObj;
    }
    default:
      return state;
  }
}
