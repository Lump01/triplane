require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name          = 'ScannerKit'
  s.version       = package['version']
  s.summary       = package['description'] || '3D object scanning components for React Native and Web.'
  s.description   = <<-DESC
Cross-platform 3D object scanning components for React Native (ARKit/ARCore) and Web (WebXR/photogrammetry capture).
                   DESC
  s.homepage      = 'https://github.com/your-org/scanner-kit'
  s.license       = { :type => package['license'] || 'MIT' }
  s.authors       = { 'ScannerKit' => 'info@example.com' }

  s.platform      = :ios, '12.0'

  # This spec will usually be consumed via `:path` from node_modules, so source is informational
  s.source        = { :git => 'https://github.com/your-org/scanner-kit.git', :tag => s.version.to_s }

  s.source_files  = 'ios/**/*.{h,m,mm,swift}'
  s.requires_arc  = true

  # React Native core dependency
  s.dependency 'React-Core'

  # Link ARKit weakly so builds work on devices/simulators without ARKit capability
  s.weak_frameworks = 'ARKit'

  # UIKit is part of iOS SDK; no explicit dependency required, but you can uncomment if preferred
  # s.frameworks = 'UIKit'
end
