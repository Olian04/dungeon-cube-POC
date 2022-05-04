import { Machine } from 'xstate/es';
import { updateCube } from './updateCube';
import { Directions } from  './types/directions';

// Stateless machine definition
export const roomMachine = 
/** @xstate-layout N4IgpgJg5mDOIC5QCcD2qC2sB0ALTYAxAKoAKioADqrAJYAutqAdhSAB6IBMALAOzYADDwCsgvjx4A2LgA4AnIJkAaEAE9EARimbsAZhGa+SwbMGa9XKQF9rqtJhz4MRADIBRAGIAVNtTqMLGycCLwCwmIS0nKKKuqIslwCBpoiPLJ6-CJ8Unq29uhYeASEAEoAkgDiABK+SCD+DEys9SFhQqLikjIKSlyqGghSsiLYI6lSwmayPPLy+SAORc5EACIA8gDqAHJ+NE1Brdz8HZHdMX0DiIa645OKFvKSXAtLOABGAIawYC7M9CRyPVGoEWqA2rlsHw+Kk9KlFNI0norggeLwxoZcpYzLMLK9Ch9vr8wP9CBsdnsAs1gtcRFxsCJMbIZok0SJkfFUei7npscJ5Hi7IsCdgfgBjZBgegAAgANp93qhkJ96Eq1IDKQcwRxrlJ5NgkrJNKIdIIzYIOYMbhjtIIHnonmj8Y5RWAJVK5QqlSq1YQPD5NaCaQgRJC+KHWXoJDJhiiuGIbcNNEaDCMRM6iuLJTL5YrlarkOqKjU6lR9kGjghZHqxsn5FwrJoBfw+Ci0fS+Bko4I0pJmVIbEK3tgltLUAAzaUAN1on1lsDKVVqgeplcZ9MZ2mZ6V48ctiF5Aju2TSxj0GT4GZwlGQtFgLGlYrAsvnfq8pYa5dX4ISnf0UhEeRjCSYxoxRXlRk7XkniNTQLRPK9sGoZAxVwRcSxXQ4fxDRkDTtaEpBhAc5nkFF5AHfRDHZGRjT0QQ5EQ5DULfANgS-LCdRDMMI14KNoljTlJl0FIRBmCQ+AdS8hxFNRPmQCAWI-EFv04+NZANMQuDggwxHrcQUUA9TxlE-h+EkxDZPk9DlzYqkOJCdcGSZFld3ZFFhnUkTJnSUxZnmaSXRVRgxQ1WytWDRzNw8nc2X3BBtD0G1jEmMwLCsRCgtoELyV2MKK2w9oIi6aJejiQYJEoow6MyAc+HI-yChdBxxzJLZcrLOztQcuknK3FzYpRHIkuq6RCPq2whWYVAIDgNhhxWTCusQNEUTgngoSjJ49WrCTDBeAKii+H4-noRbgx4cQGSUHQLqbdkWzbNEGW0rpCK4YQpMazM3WzT08x9QszsrPguES8xLDkC1YnkERwITJ53uGOZoVmfavpwUcJ2nWd5yB7CLoEMQB2NcwYcyaE4wo8x4MmM0uHkBRGNve9mEfZ9cbylSQjgpJsBkUGJKeVIqrhxLniUBQgIketGKVVC8c4kGwbSyGHSUGHBvMbBJCbGF5DhUNxAsuSIAVkICau4nbrJh7BO0Z76NE-WeE0NaMvoYKzeWy6iZu0n7opzl6yENaIl5B04U0RDmq9hAlZDiGzDVvVYaD9bDGEMPoMjq9Y+TVbKoI0DMnMORZAm6wgA */
Machine(
  {
  context: {
    doAnimation: true,
    content: {
      FRONT: "home",
      LEFT: "",
      RIGHT: "",
      UP: "",
      DOWN: "",
    },
    rotate: {
      x: 0,
      y: 0,
    },
    resetInputStop: () => {},
  },
  id: "rooms",
  initial: "home",
  states: {
    home: {
      entry: "loadRoom",
      on: {
        UP: {
          actions: "transitionUp",
          target: "attic",
        },
        LEFT: {
          actions: "transitionLeft",
          target: "porch",
        },
        RIGHT: {
          actions: "transitionRight",
          target: "yard",
        },
        DOWN: {
          actions: "transitionDown",
          target: "basement",
        },
      },
    },
    basement: {
      entry: "loadRoom",
      on: {
        UP: {
          actions: "transitionUp",
          target: "home",
        },
        DOWN: {
          actions: "transitionDown",
          target: "secret laboratory",
        },
      },
    },
    "secret laboratory": {
      entry: "loadRoom",
      on: {
        UP: {
          actions: "transitionUp",
          target: "basement",
        },
        LEFT: {
          actions: "transitionLeft",
          target: "room of vials",
        },
        RIGHT: {
          actions: "transitionRight",
          target: "prison cells",
        },
      },
    },
    "room of vials": {
      entry: "loadRoom",
      on: {
        RIGHT: {
          actions: "transitionRight",
          target: "secret laboratory",
        },
      },
    },
    "prison cells": {
      entry: "loadRoom",
      on: {
        LEFT: {
          actions: "transitionLeft",
          target: "secret laboratory",
        },
      },
    },
    porch: {
      entry: "loadRoom",
      on: {
        RIGHT: {
          actions: "transitionRight",
          target: "home",
        },
        LEFT: {
          actions: "transitionLeft",
          target: "yard",
        },
      },
    },
    yard: {
      entry: "loadRoom",
      on: {
        LEFT: {
          actions: "transitionLeft",
          target: "home",
        },
        RIGHT: {
          actions: "transitionRight",
          target: "porch",
        },
      },
    },
    attic: {
      entry: "loadRoom",
      on: {
        UP: {
          actions: "transitionUp",
          target: "roof",
        },
        DOWN: {
          actions: "transitionDown",
          target: "home",
        },
      },
    },
    roof: {
      entry: "loadRoom",
      on: {
        DOWN: {
          actions: "transitionDown",
          target: "attic",
        },
      },
    },
  },
},
  {
    actions: {
      loadRoom: (context, event, meta) => {
        if (event.type === "xstate.init") {
          updateCube(context);
          return;
        }

        const target = event.type as Directions;

        context.content[target] = meta.state.value.toString();
        updateCube(context, () => {

          context.doAnimation = false;
          updateCube(context);
          context.content.FRONT = context.content[target];
          context.rotate.x = 0;
          context.rotate.y = 0;
          updateCube(context);

          setTimeout(() => {
            context.doAnimation = true;
            context.content[target] = '';
            updateCube(context);
            context.resetInputStop();
          }, 1)
        });
      },
      transitionUp: (context, event, meta) => {
        context.rotate.x = -90;
        updateCube(context);
      },
      transitionDown: (context, event, meta) => {
        context.rotate.x = 90;
        updateCube(context);
      },
      transitionLeft: (context, event, meta) => {
        context.rotate.y = 90;
        updateCube(context);
      },
      transitionRight: (context, event, meta) => {
        context.rotate.y = -90;
        updateCube(context);
      }
    }
  }
);