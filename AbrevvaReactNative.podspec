require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "AbrevvaReactNative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => '16' }
  s.source       = { :git => "https://github.com/.git", :tag => "#{s.version}" }

  s.source_files = [
    "ios/**/*.{swift}",
    "ios/**/*.{m,mm}",
    "cpp/**/*.{hpp,cpp}",
  ]

  s.dependency "CocoaMQTT"
  s.dependency "CryptoSwift"
  s.dependency "AbrevvaSDK", '3.4.2'

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'

  load 'nitrogen/generated/ios/AbrevvaReactNative+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
