import { Machine } from 'xstate/es';
import { updateCube } from './updateCube';

// Stateless machine definition
export const roomMachine = Machine(
  {
    id: "rooms",
    initial: "home",
    context: {
      doAnimation: true,
      content: {
        FRONT: 'home',
        LEFT: '',
        RIGHT: '',
        UP: '',
        DOWN: '',
      },
      rotate: {
        x: 0,
        y: 0,
      },
      resetInputStop: () => {},
    },
    states: {
      home: {
        entry: ["loadRoom"],
        on: {
          UP: {
            target: "attic",
            actions: ["transitionUp"]
          },
          LEFT: {
            target: "porch",
            actions: ["transitionLeft"]
          },
          RIGHT: {
            target: "yard",
            actions: ["transitionRight"]
          },
          DOWN: {
            target: "basement",
            actions: ["transitionDown"]
          }
        }
      },
      basement: {
        entry: ["loadRoom"],
        on: {
          UP: {
            target: "home",
            actions: ["transitionUp"]
          },
          DOWN: {
            target: "secret laboratory",
            actions: ["transitionDown"]
          }
        }
      },
      "secret laboratory": {
        entry: ["loadRoom"],
        on: {
          UP: {
            target: "basement",
            actions: ["transitionUp"]
          },
          LEFT: {
            target: "room of vials",
            actions: ["transitionLeft"]
          },
          RIGHT: {
            target: "prison cells",
            actions: ["transitionRight"]
          }
        }
      },
      "room of vials": {
        entry: ["loadRoom"],
        on: {
          RIGHT: {
            target: "secret laboratory",
            actions: ["transitionRight"]
          }
        }
      },
      "prison cells": {
        entry: ["loadRoom"],
        on: {
          LEFT: {
            target: "secret laboratory",
            actions: ["transitionLeft"]
          }
        }
      },
      porch: {
        entry: ["loadRoom"],
        on: {
          RIGHT: {
            target: "home",
            actions: ["transitionRight"]
          },
          LEFT: {
            target: "yard",
            actions: ["transitionLeft"]
          }
        }
      },
      yard: {
        entry: ["loadRoom"],
        on: {
          LEFT: {
            target: "home",
            actions: ["transitionLeft"]
          },
          RIGHT: {
            target: "porch",
            actions: ["transitionRight"]
          }
        }
      },
      attic: {
        entry: ["loadRoom"],
        on: {
          UP: {
            target: "roof",
            actions: ["transitionUp"]
          },
          DOWN: {
            target: "home",
            actions: ["transitionDown"]
          }
        }
      },
      roof: {
        entry: ["loadRoom"],
        on: {
          DOWN: {
            target: "attic",
            actions: ["transitionDown"]
          }
        }
      }
    }
  },
  {
    actions: {
      loadRoom: (context, event, meta) => {
        if (event.type === "xstate.init") {
          updateCube(context);
          return;
        }

        const target = event.type;

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