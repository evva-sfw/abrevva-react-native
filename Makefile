test:
	$(MAKE) test-ios

test-ios:
	xcodebuild \
      -workspace example/ios/ExampleAppExample.xcworkspace \
      -scheme ExampleAppExample \
      -sdk iphonesimulator \
      -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.4' \
      test
