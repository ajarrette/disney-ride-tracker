import AppKit
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let inputURL = root.appending(path: "assets/images/icon.png")
let outputURL = root.appending(path: "assets/images/castle-splash.png")

guard let source = NSBitmapImageRep(data: try Data(contentsOf: inputURL)) else {
  fatalError("Could not read the castle app icon.")
}

guard let output = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: source.pixelsWide,
  pixelsHigh: source.pixelsHigh,
  bitsPerSample: 8,
  samplesPerPixel: 4,
  hasAlpha: true,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
) else {
  fatalError("Could not create the transparent castle image.")
}

for y in 0..<source.pixelsHigh {
  for x in 0..<source.pixelsWide {
    let color = source.colorAt(x: x, y: y)!.usingColorSpace(.deviceRGB)!
    let red = color.redComponent
    let green = color.greenComponent
    let blue = color.blueComponent
    let maximum = max(red, green, blue)
    let minimum = min(red, green, blue)
    let saturation = maximum == 0 ? 0 : (maximum - minimum) / maximum
    let edge = min(max((saturation - 0.22) / 0.70, 0), 1)
    let smoothEdge = edge * edge * (3 - 2 * edge)
    let alpha = 1 - smoothEdge

    output.setColor(
      NSColor(deviceRed: 1, green: 1, blue: 1, alpha: alpha),
      atX: x,
      y: y
    )
  }
}

let png = output.representation(using: .png, properties: [:])!
try png.write(to: outputURL, options: .atomic)
print("Wrote \(outputURL.path)")