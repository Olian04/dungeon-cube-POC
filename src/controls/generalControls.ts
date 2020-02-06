import { RoomService } from '../index';
import { Directions } from '../types/directions';

let roomService: RoomService;

export const setupGeneralControls = (ctx: { roomService: RoomService, swallowInput: boolean })  => {
  roomService = ctx.roomService;
};

export const sendDirection = (direction: Directions) => {
  roomService.send(direction);
}