// Puntos de la cara (Vision, 76 puntos) y máscara de la persona para
// scripts/personas/morph.py. Usa solo frameworks de macOS.
//   swiftc -O scripts/personas/puntos.swift -o .next/puntos
//   .next/puntos g1.png g1.json g1-mascara.png
import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1])
guard let ci = CIImage(contentsOf: url) else { fatalError("no se pudo leer \(args[1])") }
let W = ci.extent.width, H = ci.extent.height
let handler = VNImageRequestHandler(ciImage: ci, options: [:])
let caras = VNDetectFaceLandmarksRequest()
caras.constellation = .constellation76Points
let persona = VNGeneratePersonSegmentationRequest()
persona.qualityLevel = .accurate
persona.outputPixelFormat = kCVPixelFormatType_OneComponent8
try handler.perform([caras, persona])

var salida: [String: Any] = ["ancho": W, "alto": H]
if let cara = caras.results?.first, let lm = cara.landmarks {
  let bb = cara.boundingBox
  var grupos: [String: [[Double]]] = [:]
  let nombres: [(String, VNFaceLandmarkRegion2D?)] = [
    ("contorno", lm.faceContour), ("ojoIzq", lm.leftEye), ("ojoDer", lm.rightEye),
    ("cejaIzq", lm.leftEyebrow), ("cejaDer", lm.rightEyebrow), ("nariz", lm.nose),
    ("crestaNariz", lm.noseCrest), ("lineaMedia", lm.medianLine), ("labiosExt", lm.outerLips),
    ("labiosInt", lm.innerLips), ("pupilaIzq", lm.leftPupil), ("pupilaDer", lm.rightPupil)]
  for (n, r) in nombres {
    guard let r = r else { continue }
    grupos[n] = r.normalizedPoints.map { p in
      let x = (bb.origin.x + Double(p.x) * bb.size.width) * W
      let y = (1 - (bb.origin.y + Double(p.y) * bb.size.height)) * H
      return [x, y]
    }
  }
  salida["puntos"] = grupos
  salida["giro"] = cara.yaw?.doubleValue ?? 0
  salida["caja"] = [bb.origin.x * W, (1 - bb.origin.y - bb.size.height) * H, bb.size.width * W, bb.size.height * H]
}
let json = try JSONSerialization.data(withJSONObject: salida, options: [.prettyPrinted])
try json.write(to: URL(fileURLWithPath: args[2]))

if let m = persona.results?.first?.pixelBuffer {
  var mask = CIImage(cvPixelBuffer: m)
  let sx = W / mask.extent.width, sy = H / mask.extent.height
  mask = mask.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
  let ctx = CIContext()
  if let cg = ctx.createCGImage(mask, from: CGRect(x: 0, y: 0, width: W, height: H)) {
    let rep = NSBitmapImageRep(cgImage: cg)
    try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[3]))
  }
}
print("ok", args[1])
