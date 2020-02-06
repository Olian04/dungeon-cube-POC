import { BuilderCTX } from 'brynja/dist/builder';
import { arrowButtonRight } from '../components/arrowButton';

export const buildHome = (_: BuilderCTX) =>_
  .child('h1', _=>_
    .class([ 'heading' ])
    .text('Living Room')
    )
    .do(arrowButtonRight(() => {
      console.log('Right Clicked');
    }));
