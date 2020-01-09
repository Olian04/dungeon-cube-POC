import { render } from 'brynja';

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
        .text(state.content.FRONT)
      )
      .child('div', _=>_
        .id('left')
        .text(state.content.LEFT)
      )
      .child('div', _=>_
        .id('right')
        .text(state.content.RIGHT)
      )
      .child('div', _=>_
        .id('top')
        .text(state.content.UP)
      )
      .child('div', _=>_
        .id('bottom')
        .text(state.content.DOWN)
      )
    )
  )
}