import { BuilderCTX } from 'brynja/dist/builder';
import { sendDirection } from '../controls/generalControls';

export const buildHome = (_: BuilderCTX) =>_
  .child('h1', _=>_
    .class([ 'heading' ])
    .text('Living Room')
  );
