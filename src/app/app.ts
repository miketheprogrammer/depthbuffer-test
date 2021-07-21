import { Color, DepthFormat, PerspectiveCamera, Scene, UnsignedShortType, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { Brick } from './brick';

export class App {
  private readonly scene = new Scene();
  private readonly scene2 = new Scene();
  private readonly camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10000);
  private readonly renderer = new WebGLRenderer({
    antialias: true,
    canvas: document.getElementById('main-canvas') as HTMLCanvasElement,
  });
  private readonly composer = new EffectComposer(this.renderer);
  private readonly orbit = new OrbitControls(this.camera, this.renderer.domElement);
  private readonly control = new TransformControls( this.camera, this.renderer.domElement )

  private brick: Brick;
  private brick2: Brick;

  private target = new WebGLRenderTarget( window.innerWidth, window.innerHeight );

  constructor() {
    

    this.camera.position.set(200, 200, 200);
    this.camera.lookAt(new Vector3(0, 0, 0));

    console.log('whasts up', this.camera.near, this.camera.far);
    this.camera.far = 1000;
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(new Color('rgb(0,0,0)'));

    this.orbit.update();
    this.orbit.addEventListener( 'change', () => this.render() );

    this.control.addEventListener( 'change', () => this.render() );

    this.control.addEventListener( 'dragging-changed', (event) => {

      this.orbit.enabled = ! event.value;

    } );



    this.brick = new Brick(100, new Color('rgb(0,255,0)'));
    this.brick2 = new Brick(100, new Color('rgb(255,0,0)'), this.camera, true);
    this.scene.add(this.brick);
    this.scene2.add(this.brick2);
		this.scene2.add( this.control );

    this.control.attach( this.brick2 );

    console.log('should setup render target');
    this.setupRenderTarget();
    this.onWindowResize();
		window.addEventListener( 'resize', () => this.onWindowResize() );
    

    this.render();
  }

  private adjustCanvasSize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    const dpr = this.renderer.getPixelRatio();
    this.target.setSize( window.innerWidth * dpr, window.innerHeight * dpr );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }

  private setupRenderTarget() {
    if ( this.target ) this.target.dispose();

    const format = DepthFormat;
    const type = UnsignedShortType;

    this.target = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
    this.target.texture.format = THREE.RGBFormat;
    this.target.texture.minFilter = THREE.NearestFilter;
    this.target.texture.magFilter = THREE.NearestFilter;
    this.target.texture.generateMipmaps = false;
    this.target.stencilBuffer = ( format === THREE.DepthStencilFormat ) ? true : false;
    this.target.depthBuffer = true;
    this.target.depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight);
    this.target.depthTexture.format = format;
    this.target.depthTexture.type = type;

  }

  private render() {
    this.renderer.clearDepth();
    this.renderer.autoClear = false;
    this.renderer.render(this.scene, this.camera);
    this.setupRenderTarget();
    this.renderer.setRenderTarget( this.target );
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget( null );
    ((this.brick2.material as THREE.ShaderMaterial ).uniforms as any).tDepth = this.target.depthTexture;
    // console.log('txx', this.target);
    // this.renderer.clearDepth();
    this.renderer.render(this.scene2, this.camera);
    requestAnimationFrame(() => this.render());

    
    this.adjustCanvasSize();
    // this.brick.rotateY(0.03);

    // render scene into target

    // render post FX
    // postMaterial.uniforms.tDiffuse.value = target.texture;
    // postMaterial.uniforms.tDepth.value = target.depthTexture;

  }
}
