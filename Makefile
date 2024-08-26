test:
	$(MAKE) test-ios
	$(MAKE) test-android

test-ios:
	xcodebuild -quiet \
		-workspace example/ios/ExampleAppExample.xcworkspace \
		-scheme ExampleAppExample \
		-sdk iphonesimulator \
		-destination 'platform=iOS Simulator,name=iPhone 15,OS=17.4' \
		test || exit 1

test-android:
	cd example/android && ./gradlew :evva-sfw_abrevva-react-native:testDebugUnitTest || exit 1
