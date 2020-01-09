import { interpret } from 'xstate/es';
import Hammer from 'hammerjs';
import { roomMachine } from './stateMachine';

const inputDelay = 550;
let lastInputTime = 0;
const roomService = interpret(roomMachine)
  .onTransition(state => {
    if (state.changed) {
      lastInputTime = Date.now();
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
  if (Date.now() - lastInputTime < inputDelay) {
    return;
  }
  roomService.send('DOWN');
});
hammer.on("swipedown", (ev) => {
  if (ev.pointerType !== 'touch') { return; }
  if (Date.now() - lastInputTime < inputDelay) {
    return;
  }
  roomService.send('UP');
});
hammer.on("swipeleft", (ev) => {
  if (ev.pointerType !== 'touch') { return; }
  if (Date.now() - lastInputTime < inputDelay) {
    return;
  }
  roomService.send('RIGHT');
});
hammer.on("swiperight", (ev) => {
  if (ev.pointerType !== 'touch') { return; }
  if (Date.now() - lastInputTime < inputDelay) {
    return;
  }
  roomService.send('LEFT');
});

document.addEventListener("keydown", ev => {
  if (Date.now() - lastInputTime < inputDelay) {
    return;
  }
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