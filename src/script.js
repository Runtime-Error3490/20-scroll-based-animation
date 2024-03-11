import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'  

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor').onChange(()=>{
        material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const textureLoader=new THREE.TextureLoader()
const graidentTexture=textureLoader.load('/textures/gradients/5.jpg');
graidentTexture.magFilter=THREE.NearestFilter
/**  
 * Test cube
 */
const directionalLight=new THREE.DirectionalLight(0xffffff,1);
directionalLight.position.set(1,1,0);
scene.add(directionalLight);
const material=new THREE.MeshToonMaterial({color:parameters.materialColor,gradientMap:graidentTexture})
const objectDistance=4
const mesh1=new THREE.Mesh(
    new THREE.TorusGeometry(1,0.4,16,60),
    material
)
const mesh2=new THREE.Mesh(
    new THREE.ConeGeometry(1,2,32),
    material
)
const mesh3=new THREE.Mesh(
    new THREE.TorusGeometry(0.8,0.35,100,16),
    material
)
mesh1.position.y=-objectDistance*0;
mesh2.position.y=-objectDistance*1;
mesh3.position.y=-objectDistance*2;
mesh1.position.x=2
mesh2.position.x=-2
mesh3.position.x=2
scene.add(mesh1,mesh2,mesh3)
const sectionMeshes=[mesh1,mesh2,mesh3]
const particleCount=200
const position=new Float32Array(particleCount*3)
const colors=new Float32Array(particleCount*3)
let particleMesh;
for(let i=0;i<particleCount;i++){
    let i3=i*3
    position[i3+0]=(Math.random()-0.5)*10
    position[i3+1]=objectDistance*0.5-(Math.random())*objectDistance*sectionMeshes.length
    position[i3+2]=(Math.random()-0.5)*10
    colors[i3+0]=Math.random()
    colors[i3+1]=Math.random()
    colors[i3+2]=Math.random()
    const particleGeometry=new THREE.BufferGeometry()
    particleGeometry.setAttribute('position',new THREE.BufferAttribute(position,3))
    particleGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3))
    const particleMaterial=new THREE.PointsMaterial({size:0.03,sizeAttenuation:true,vertexColors:true})
    particleMesh=new THREE.Points(particleGeometry,particleMaterial)
    scene.add(particleMesh)
}
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const cameraGroup=new THREE.Group()
scene.add(cameraGroup)
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


let scrollY=window.scrollY;
let scrollX=window.scrollX;
let currentSection=0;
window.addEventListener('scroll',()=>{
    scrollY=window.scrollY;
    const newSection=Math.round(scrollY/sizes.height)
    if(newSection!=currentSection)
    {
        currentSection=newSection
        gsap.to(
            sectionMeshes[currentSection].rotation,{
                duration:1.5,
                ease:'power2.inOut',
                x:'+=6',
                y:'+=3'
            }
        )
    }
})
const cursor={}
cursor.x=0
cursor.y=0
window.addEventListener('mousemove',(event)=>{
    cursor.x=event.clientX/sizes.width-0.5
    cursor.y=event.clientY/sizes.height-0.5
})
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime=0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime=elapsedTime-previousTime
    previousTime=elapsedTime
    camera.position.y=(-scrollY/sizes.height)*objectDistance
    let parallaxX=cursor.x-0.5
    let parallaxY=-cursor.y-0.5
    cameraGroup.position.x+=(parallaxX-cameraGroup.position.x)*3*deltaTime
    cameraGroup.position.y+=(parallaxY-cameraGroup.position.y)*3*deltaTime
    for(const mesh of sectionMeshes){
        mesh.rotation.x+=deltaTime*Math.sin(0.5)
        mesh.rotation.y+=deltaTime*Math.cos(0.55)
    }
    particleMesh.rotation.x=elapsedTime*0.1
    particleMesh.rotation.y=elapsedTime*0.1
    particleMesh.rotation.z=elapsedTime*0.1
    // Render
    renderer.render(scene, camera)


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()