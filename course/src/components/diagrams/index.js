import { sharedNodeTypes } from './shared.jsx';
import { engineMain } from './engineMain.jsx';
import { pluck } from './pluck.jsx';
import { bridgeWrap } from './bridgeWrap.jsx';
import { modulationPatch } from './modulationPatch.jsx';
import { languageSpine } from './languageSpine.jsx';

export const diagrams = {
  'engine-main': engineMain,
  'pluck': pluck,
  'bridge-wrap': bridgeWrap,
  'modulation-patch': modulationPatch,
  'language-spine': languageSpine,
};

export const nodeTypes = sharedNodeTypes;
