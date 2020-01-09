import { interpret } from 'xstate/es';
import Hammer from 'hammerjs';
import { roomMachine } from './stateMachine';

let swallowInput = false;

const roomService = interpret(roomMachine
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
      swallowInput = false;
    },
  })
).onTransition(state => {
    if (state.changed) {
      swallowInput = true;
    }
  })
  .start();

const hammer = new Hammer(document.body);

hammer.get('swipe').set({
    direction: Hammer.DIRECTION_ALL
});

// listen to events...
hammer.on("swipeup", (ev) => {
  if (ev.pointerType !== 'touch') { return; }
  if (swallowInput) { return; }
  roomService.send('DOWN');
});
hammer.on("swipedown", (ev) => {
  if (ev.pointerType !== 'touch') { return; }
  if (swallowInput) { return; }
  roomService.send('UP');
});
hammer.on("swipeleft", (ev) => {
  if (ev.pointerType !== 'touch') { return; }
  if (swallowInput) { return; }
  roomService.send('RIGHT');
});
hammer.on("swiperight", (ev) => {
  if (ev.pointerType !== 'touch') { return; }
  if (swallowInput) { return; }
  roomService.send('LEFT');
});

document.addEventListener("keydown", ev => {
  if (swallowInput) { return; }
  const key = ev.code;
  if (key === "ArrowUp") {
    roomService.send("UP");
  } else if (key === "ArrowDown") {
    roomService.send("DOWN");
  } else if (key === "ArrowLeft") {
    roomService.send("LEFT");
  } else if (key === "ArrowRight") {
    roomService.send("RIGHT");
  }
});