import { BuilderCTX } from 'brynja/dist/builder';
import { sendDirection } from '../controls/generalControls';

export const arrowButtonRight = (onClick: () => void) => (_: BuilderCTX)=>_
  .child('div', _=>_
    .on('click', onClick)
    .on('click', () => {
      sendDirection('RIGHT');
    })
    .style({
      position: 'absolute',
      right: '10px',
      top: 'calc(50% - 50px)',
      width: '0',
      height: '0',
      borderTop: '60px solid transparent',
      borderBottom: '60px solid transparent',
      borderLeft: '60px solid orangered',
    })
  );
