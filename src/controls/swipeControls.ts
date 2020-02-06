import Hammer from 'hammerjs';
import { sendDirection } from './generalControls';

export const setupSwipeControls = (ctx: { swallowInput: boolean })  => {
  const hammer = new Hammer(document.body);
  
  hammer.get('swipe').set({
      direction: Hammer.DIRECTION_ALL
  });
  
  // listen to events...
  hammer.on("swipeup", (ev) => {
    if (ev.pointerType !== 'touch') { return; }
    if (ctx.swallowInput) { return; }
    sendDirection('DOWN');
  });
  hammer.on("swipedown", (ev) => {
    if (ev.pointerType !== 'touch') { return; }
    if (ctx.swallowInput) { return; }
    sendDirection('UP');
  });
  hammer.on("swipeleft", (ev) => {
    if (ev.pointerType !== 'touch') { return; }
    if (ctx.swallowInput) { return; }
    sendDirection('RIGHT');
  });
  hammer.on("swiperight", (ev) => {
    if (ev.pointerType !== 'touch') { return; }
    if (ctx.swallowInput) { return; }
    sendDirection('LEFT');
  });
}