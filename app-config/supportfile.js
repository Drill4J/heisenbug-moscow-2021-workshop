import './commands'
import './setup'

// ВНИМАНИЕ: порядок импортов важен!
// --- NEW
import './drill4j-integration'
// --- NEW

import agent from '../../src/agent'
window.appAgent = agent;

// --- NEW
import cypressGrep from 'cypress-grep'
cypressGrep()
// --- NEW

