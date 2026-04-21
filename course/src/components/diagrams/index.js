import { sharedNodeTypes } from './shared.jsx';
import { engineMain } from './engineMain.jsx';
import { pluck } from './pluck.jsx';
import { bridgeWrap } from './bridgeWrap.jsx';
import { modulationPatch } from './modulationPatch.jsx';
import { languageSpine } from './languageSpine.jsx';
import { languageEvaluator } from './languageEvaluator.jsx';

export const diagrams = {
  'engine-main': engineMain,
  'pluck': pluck,
  'bridge-wrap': bridgeWrap,
  'modulation-patch': modulationPatch,
  'language-spine': languageSpine,
  'language-evaluator': languageEvaluator,
};

export const nodeTypes = sharedNodeTypes;
