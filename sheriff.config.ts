import { SheriffConfig, sameTag } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'src/app': {
      'shared/<type>': 'shared:<type>',
      'shared/ui/layout': ['shared:ui', 'type:<type>'],
      '<domain>/<type>': ['domain:<domain>', 'type:<type>'],
    },
  },
  depRules: {
    root: ['type:containers', 'shared:*', 'domain:*'],
    'domain:*': [sameTag, 'shared'],
    'type:data': ['shared:data'],
    'type:containers': ['type:*', 'shared:data', 'shared:ui'],
    shared: 'shared',
  },
};
