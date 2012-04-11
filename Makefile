all: spec test

test: always-run
	scripts/start-webdriver-writing-pid
	scripts/start-node-writing-pid 4242
	sleep 5  # make sure everything is ready for connections
	node_modules/jasmine-node/bin/jasmine-node test
	kill `cat tmp/node.pid`
	kill `cat tmp/selenium.pid`

spec: always-run
	node_modules/jasmine-node/bin/jasmine-node spec


always-run: ;
