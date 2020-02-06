import { BuilderCTX } from 'brynja/dist/builder';
import { render, extend } from 'brynja';
import { buildHome } from './rooms/home';

interface IState {
  doAnimation: boolean;
  content: {
    FRONT: string;
    LEFT: string;
    RIGHT: string;
    UP: string;
    DOWN: string;
  };
  rotate: {
    x: number;
    y: number;
  };
};

const rooms = {
  'home': buildHome
}

const setContent = (contentKey: string) => (_: BuilderCTX)=> {
  if (contentKey in rooms) {
    const roomName = contentKey as keyof typeof rooms;
    return rooms[roomName](_);
  } else {

    // Default fallback builder
    return _
      .child('h1', _=>_
        .class([ 'heading' ])
        .text(contentKey)
      );
  }
};

export const updateCube = (state: IState, onTransitioned: (ev: Event) => void = () => {}) => {
  render(_=>_
    .prop('style', `
      --rotationX: ${state.rotate.x}deg;
      --rotationY: ${state.rotate.y}deg;
    `)
    .id('wrapper')
    .child('div', _=>_
      .class([ 'cube' ])
      .when(state.doAnimation, _=>_
        .class([ 'animate' ])
      )
      .on('transitionend', onTransitioned)
      .child('div', _=>_
        .id('front')
        .do(setContent(state.content.FRONT))
      )
      .child('div', _=>_
        .id('left')
        .do(setContent(state.content.LEFT))
      )
      .child('div', _=>_
        .id('right')
        .do(setContent(state.content.RIGHT))
      )
      .child('div', _=>_
        .id('top')
        .do(setContent(state.content.UP))
      )
      .child('div', _=>_
        .id('bottom')
        .do(setContent(state.content.DOWN))
      )
    )
  )
}