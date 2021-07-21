import { BoxGeometry, Color, Mesh, MeshBasicMaterial, ShaderMaterial } from 'three';


export const Shaders = {
  Overdraw: {
    vertex: '\
      varying vec2 vUv;\
      \
      void main() {\
        vUv = uv;\
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\
      }\
    ',
    fragment: '\
    #include <packing>\
    \
			varying vec2 vUv;\
			uniform sampler2D tDiffuse;\
			uniform sampler2D tDepth;\
			uniform float cameraNear;\
			uniform float cameraFar;\
\
\
			float readDepth( sampler2D depthSampler, vec2 coord ) {\
				float fragCoordZ = texture2D( depthSampler, coord ).x;\
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );\
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );\
			}\
\
			void main() {\
				float depth = readDepth( tDepth, vUv );\
\
        if(gl_FragCoord.z < depth)\
        {\
          discard;\
        }\
				gl_FragColor.rgb = vec3( gl_FragCoord.z );\
				gl_FragColor.a = 1.0;\
			}\
      ',
  }
}

export const Materials = {
  
}

export class Brick extends Mesh {
  constructor(size: number, color: Color, camera?: any, overdraw = false) {
    super();
    this.geometry = new BoxGeometry(size, size, size);
    if (overdraw === false) {
      this.material = new MeshBasicMaterial({ color });
    } else {
      this.material = new ShaderMaterial( {
        vertexShader: Shaders.Overdraw.vertex.trim(),
        fragmentShader: Shaders.Overdraw.fragment.trim(),
        uniforms: {
          cameraNear: { value: camera.near },
          cameraFar: { value: camera.far },
          tDiffuse: { value: null },
          tDepth: { value: null }
        }
      } );
    }

    
  }
}
