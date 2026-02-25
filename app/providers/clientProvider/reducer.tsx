import { handleActions, Action } from "redux-actions";
import { IClientStateContext, INITIAL_STATE } from "./context";
import { ClientActionEnums } from "./actions";

export const clientReducer = handleActions<IClientStateContext, any>(
  {
    [ClientActionEnums.SetPending]: (state) => ({ 
      ...state, 
      isPending: true, 
      isSuccess: false, 
      isError: false 
    }),
    [ClientActionEnums.SetClients]: (state, action: Action<Partial<IClientStateContext>>) => ({
      ...state,
      ...action.payload,
      isPending: false,
      isSuccess: true,
    }),
    [ClientActionEnums.SetFilters]: (state, action: Action<any>) => ({
      ...state,
      // Ensure your context has a filters property if you use this, 
      // otherwise store filters in local page state
      filters: { ...state.filters, ...action.payload.filters },
    }),
    [ClientActionEnums.SetError]: (state) => ({ 
      ...state, 
      isPending: false, 
      isError: true, 
      isSuccess: false 
    }),
  },
  INITIAL_STATE
);