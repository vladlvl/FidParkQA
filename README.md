# FidParkQA

I used VSCode IDE.

Get your project ready after cloning it from github.

From the terminal (to get dependencies and playwrigh)
1) npm install      
2) npx playwright install 

To run tests:
npx playwright test

To run individual tests:
npx playwright test -g "test title here"
for example: npx playwright test -g "GET all clients"

Test should also be found/discovered by the IDE and be able to ran from UI.

See the test report/results:
npx playwright show-report

P.S. in this set up the tests folder can be expanded for other objects like Account, Areas, Barriers and so on. Also, it can be expanded for adding UI end-to-end tests (that's why chosen playwright).