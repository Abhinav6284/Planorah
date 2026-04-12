import TextBlock from './TextBlock';
import HeadingBlock from './HeadingBlock';
import BulletBlock from './BulletBlock';

export { TextBlock, HeadingBlock, BulletBlock };

export const BLOCK_TYPES = {
  TEXT: 'text',
  HEADING: 'heading',
  BULLET: 'bullet',
};

export const getBlockComponent = (type) => {
  const components = {
    [BLOCK_TYPES.TEXT]: TextBlock,
    [BLOCK_TYPES.HEADING]: HeadingBlock,
    [BLOCK_TYPES.BULLET]: BulletBlock,
  };
  return components[type] || TextBlock;
};

export const getBlockLabel = (type) => {
  const labels = {
    [BLOCK_TYPES.TEXT]: 'Text',
    [BLOCK_TYPES.HEADING]: 'Heading',
    [BLOCK_TYPES.BULLET]: 'Bullet',
  };
  return labels[type] || 'Text';
};
