import { runHarness } from "../lib/skill-harness";

const result = runHarness();

console.log("Skill Harness");
console.log(`Test Cases: ${result.testCases}`);
console.log(`Passed: ${result.passed}`);
console.log(`Failed: ${result.failed}`);
console.log(`Coverage: ${result.coverage}%`);
console.log(JSON.stringify(result.cases, null, 2));

if (result.failed > 0) {
  process.exit(1);
}
