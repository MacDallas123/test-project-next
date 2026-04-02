import * as React from "react";
import { X } from "lucide-react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

// Instead of TS type aliases, use plain JS/JSDoc for props documentation

// Toast props structure (for reference)
/*
  id: string,
  title: React.ReactNode,
  description: React.ReactNode,
  action: React.ReactNode,
  open: boolean,
  onOpenChange: (open: boolean) => void
*/

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

// Action values
const ADD_TOAST = "ADD_TOAST";
const UPDATE_TOAST = "UPDATE_TOAST";
const DISMISS_TOAST = "DISMISS_TOAST";
const REMOVE_TOAST = "REMOVE_TOAST";

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: REMOVE_TOAST,
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// Reducer works on a { toasts: [...] } state and handles action objects
export const reducer = (state, action) => {
  switch (action.type) {
    case ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };
    case DISMISS_TOAST: {
      const toastId = action.toastId;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t,
        ),
      };
    }
    case REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

const listeners = [];
let memoryState = { toasts: [] };

// Simulate React reducer dispatch and memory state
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Toast is like ToasterToast minus id, open, onOpenChange
function toast(props) {
  const id = genId();
  // Keep the update and dismiss functions stable
  const update = (newProps) =>
    dispatch({
      type: UPDATE_TOAST,
      toast: { ...newProps, id },
    });
  const dismiss = () => dispatch({ type: DISMISS_TOAST, toastId: id });

  dispatch({
    type: ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
    // eslint-disable-next-line
  }, []); // only on mount/unmount

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
