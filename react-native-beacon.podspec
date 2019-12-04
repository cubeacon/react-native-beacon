require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-beacon"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
  React Native plugin for scanning beacon (iBeacon platform) devices on Android and iOS.
                   DESC
  s.homepage     = "https://github.com/cubeacon/react-native-beacon"
  s.license      = "MIT"
  s.license      = { :type => "MIT", :file => "../LICENSE" }
  s.authors      = { "Alann Maulana" => "maulana@cubeacon.com" }
  s.platforms    = { :ios => "8.0" }
  s.source       = { :git => "https://github.com/github_account/react-native-beacon.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  
  s.ios.framework = 'CoreLocation','CoreBluetooth'
end

