import createDrillAutoTestAgent from '@drill4j/js-auto-test-agent';

const drillOptions = {
  adminUrl:  Cypress.env('DRILL_ADMIN_URL'),
  agentId: Cypress.env('DRILL_AGENT_ID'),
  groupId: Cypress.env('DRILL_GROUP_ID'), // alternative for the agentId
}

let drillAutotestAgent

before((done) => {
  // Create DrillAutoTestAgent instance to communicate with Drill4J
  createDrillAutoTestAgent(drillOptions)
  .then((data) => { drillAutotestAgent = data })
  // Enable coverage collection for current tab
  .then(() => Cypress.automation('remote:debugger:protocol', { command: 'Profiler.enable', params: {} }))
  .then(() => Cypress.automation('remote:debugger:protocol', { command: 'Profiler.startPreciseCoverage', params: {
    callCount: false,
    detailed: true
  }}))
  .then(()=>done());
});

after((done) => {
  if (drillAutotestAgent) {
    drillAutotestAgent.finish().then(() => done());
  } else {
    console.log(`%c No instance of @drill4j/js-auto-test-agent is created, data won't be sent`, 'background: red; color: white');
  }
});

// Inject "test-name" and "session-id" Drill4J headers for each request made during test
beforeEach(function () {
  const currentTest = this.currentTest;
  cy.intercept(
    {
      url: /^.*$/, // that can be tweaked to avoid injecting Drill4j headers to external resources
    },
    function (req) {
      req.headers['drill-test-name'] = getTestName(currentTest);
      req.headers['drill-session-id'] = drillAutotestAgent.sessionId;
    }
  );
});

// Take test coverage
afterEach(function (done) {
  const currentTest = this.currentTest;
  Cypress.automation('remote:debugger:protocol', { command: 'Profiler.takePreciseCoverage', params: {}})
    .then(async function (coverageData) {
      const testName = getTestName(currentTest);
      await drillAutotestAgent.addJsCoverage({ coverage: coverageData.result, testName });
      const { state, duration, wallClockStartedAt } = currentTest;
      drillAutotestAgent.addTest(testName, convertTestState(state), wallClockStartedAt.valueOf(), duration, {
        hash: testName, // FIXME once test name hashes for test2runs are implemented in Drill4J Backend
        data: {
          specFilePath: currentTest.invocationDetails.relativeFile
        },
      });
    })
    .then(()=>done());  
});

/**
 * Converts Cypress test status to Drill4J test status
 * 
 * [reference](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Test-statuses)
 * 
 * TBD: afterEach is not called for skipped & pending tests, might as well omit these?
 * TBD: UNKNOWN status
 */
function convertTestState(state) {
  switch (state) {
    case 'passed': return 'PASSED';
    case 'failed': return 'FAILED';
    case 'pending': return 'SKIPPED';
    case 'skipped': return 'SKIPPED';
    default: return 'UNKNOWN';
  }
}

function getTestName(currentTest) {
  // Cypress assumes test name separator to be ' '
  // one might change it to the desired character
  // e.g. with '/' to display "prettier" names in Drill4J Admin Panel
  // but then '/' __have__ to be replaced with ' ' in test2run.sh before feeding test names to cypress-grep
  const testNameSeparator = ' ';
  const parentName = getParentNameChain(currentTest)
    .filter(x => x)
    .reverse()
    .join(testNameSeparator);
  return `${parentName}${testNameSeparator}${currentTest.title}`
}

function getParentNameChain(currentTest) {
  const res = [];
  let ptr = currentTest.parent;
  res.push(ptr.title);
  while (ptr.parent) {
    ptr = ptr.parent;
    res.push(ptr.title)
  }
  return res;
}
