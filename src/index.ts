import { interpret } from 'xstate/es';
import { roomMachine } from './stateMachine';
import { setupKeyboardControls } from './controls/keyboardControls';
import { setupSwipeControls } from './controls/swipeControls';
import { setupGeneralControls } from './controls/generalControls';

const ctx = {
  swallowInput: false,
  roomService: interpret(roomMachine
  .withContext({
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
    resetInputStop: () => {
      ctx.swallowInput = false;
    },
  })
).onTransition(state => {
    if (state.changed) {
      ctx.swallowInput = true;
    }
  })
  .start(),
};

export type RoomService = typeof ctx.roomService;

setupGeneralControls(ctx);
setupSwipeControls(ctx);
setupKeyboardControls(ctx);