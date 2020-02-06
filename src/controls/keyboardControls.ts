import { sendDirection } from './generalControls';

export const setupKeyboardControls = (ctx: { swallowInput: boolean })  => {
  document.addEventListener("keydown", ev => {
    if (ctx.swallowInput) { return; }
    const key = ev.code;
    if (key === "ArrowUp") {
      sendDirection("UP");
    } else if (key === "ArrowDown") {
      sendDirection("DOWN");
    } else if (key === "ArrowLeft") {
      sendDirection("LEFT");
    } else if (key === "ArrowRight") {
      sendDirection("RIGHT");
    }
  });
}