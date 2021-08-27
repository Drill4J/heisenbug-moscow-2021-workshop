import './commands'
import './prepare-db'
import './drill4j-integration' // DRILL4J - uncomment to enable coverage collection
import '../../src/agent'
import cypressGrep from 'cypress-grep' // DRILL4J - uncomment to utilize test2runs
cypressGrep()
