import * as THREE from 'three'

// Neutral studio cards provide broad glaze reflections without borrowing any
// colors or photographic detail from the ceramic references.
export function createCeramicEnvironment(renderer) {
  const studio = new THREE.Scene()
  studio.background = new THREE.Color(0.16, 0.16, 0.16)
  for (const [width, height, position, brightness] of [
    [4, 6, [-4, 5, 4], 4],
    [2, 4, [4, 1, 2], 1.5],
    [4, 3, [0, 6, -3], 2],
  ]) {
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(brightness, brightness, brightness), side: THREE.DoubleSide }),
    )
    card.position.set(...position)
    card.lookAt(0, 0, 0)
    studio.add(card)
  }
  const generator = new THREE.PMREMGenerator(renderer)
  const environment = generator.fromScene(studio, 0.06)
  generator.dispose()
  studio.children.forEach((card) => {
    card.geometry.dispose()
    card.material.dispose()
  })
  return environment
}

const surfaceFunctions = /* glsl */`
  varying vec3 vCeramicPosition;

  float ceramicHash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float ceramicNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(ceramicHash(cell), ceramicHash(cell + vec3(1, 0, 0)), f.x),
          mix(ceramicHash(cell + vec3(0, 1, 0)), ceramicHash(cell + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(ceramicHash(cell + vec3(0, 0, 1)), ceramicHash(cell + vec3(1, 0, 1)), f.x),
          mix(ceramicHash(cell + vec3(0, 1, 1)), ceramicHash(cell + vec3(1, 1, 1)), f.x), f.y), f.z);
  }

  // A surface gradient adds shallow relief without changing the silhouette.
  vec3 ceramicNormal(vec3 baseNormal, float height, float faceDirection) {
    vec3 dx = dFdx(-vViewPosition);
    vec3 dy = dFdy(-vViewPosition);
    vec3 r1 = cross(dy, baseNormal);
    vec3 r2 = cross(baseNormal, dx);
    float determinant = dot(dx, r1) * faceDirection;
    return normalize(abs(determinant) * baseNormal - sign(determinant) *
      (dFdx(height) * r1 + dFdy(height) * r2));
  }
`

export function createCeramicMaterial(color, environment) {
  const material = new THREE.MeshPhysicalMaterial({
    color,
    side: THREE.DoubleSide,
    metalness: 0,
    roughness: 0.38,
    ior: 1.48,
    clearcoat: 0.7,
    clearcoatRoughness: 0.24,
    envMap: environment,
    envMapIntensity: 0.6,
  })
  material.userData.isCeramic = true
  material.customProgramCacheKey = () => 'ceramic-glaze-v1'
  material.onBeforeCompile = (shader) => {
    // Object-space sampling avoids UV seams, stretched grain, and texture
    // swimming as the visitor rotates the lamp. Mesh scale is baked by addMesh.
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCeramicPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCeramicPosition = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${surfaceFunctions}`)
      .replace('#include <roughnessmap_fragment>', /* glsl */`
        #include <roughnessmap_fragment>
        float footprint = max(length(dFdx(vCeramicPosition)), length(dFdy(vCeramicPosition)));
        // Fade subpixel detail on distant/mobile views to avoid sparkling.
        float grainVisibility = 1.0 - smoothstep(0.35, 1.2, footprint * 110.0);
        float poreVisibility = 1.0 - smoothstep(0.4, 1.4, footprint * 55.0);
        float ceramicGlaze = ceramicNoise(vCeramicPosition * 2.6);
        float ceramicGrain = (ceramicNoise(vCeramicPosition * 110.0) - 0.5) * grainVisibility;
        float ceramicPores = smoothstep(0.72, 0.92, ceramicNoise(vCeramicPosition * 55.0 + 17.0)) * poreVisibility;
        float ceramicRelief = ceramicGlaze * 0.006 + ceramicGrain * 0.00085 - ceramicPores * 0.00065;
        roughnessFactor = clamp(roughnessFactor + (ceramicGlaze - 0.5) * 0.1 + ceramicGrain * 0.04 + ceramicPores * 0.04, 0.3, 0.52);
      `)
      .replace('#include <normal_fragment_maps>', /* glsl */`
        #include <normal_fragment_maps>
        normal = ceramicNormal(normal, ceramicRelief, faceDirection);
      `)
      .replace('#include <clearcoat_normal_fragment_maps>', /* glsl */`
        #include <clearcoat_normal_fragment_maps>
        #ifdef USE_CLEARCOAT
          clearcoatNormal = ceramicNormal(clearcoatNormal, ceramicGlaze * 0.006 + ceramicGrain * 0.00008, faceDirection);
        #endif
      `)
      .replace('#include <lights_physical_fragment>', /* glsl */`
        #include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoatRoughness = clamp(material.clearcoatRoughness + (ceramicGlaze - 0.5) * 0.06, 0.12, 0.3);
        #endif
      `)
    // Base color and emissive are intentionally untouched by the surface shader.
  }
  return material
}
