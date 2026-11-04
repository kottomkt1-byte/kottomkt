"""Reproduce the local studio poster with Blender 4.3+.

  blender -b --python scripts/render-eyewear-poster.py -- final hero

Output: output/eyewear-render/hero-final.png (plus Blender scene and notes).
The CC BY 4.0 source model and attribution are in public/models/.
"""
import bpy, math, sys, json, time
from pathlib import Path
from mathutils import Vector

PROJECT=Path(__file__).resolve().parents[1]
ROOT=PROJECT/'output'/'eyewear-render'
ROOT.mkdir(parents=True,exist_ok=True)
MODEL=PROJECT/'public'/'models'/'eyewear-studio.glb'
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
quality='final' if 'final' in args else 'preview'
view=next((v for v in args if v in ('hero','profile','detail')), 'hero')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(MODEL))
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.device='CPU'
scene.cycles.samples=512 if quality=='final' else 24
scene.cycles.use_adaptive_sampling=True
scene.cycles.adaptive_threshold=.006 if quality=='final' else .05
scene.cycles.use_denoising=False
scene.cycles.max_bounces=10
scene.cycles.diffuse_bounces=3
scene.cycles.glossy_bounces=5
scene.cycles.transmission_bounces=8
scene.cycles.transparent_max_bounces=8
scene.cycles.sample_clamp_indirect=4
scene.cycles.caustics_reflective=False
scene.cycles.caustics_refractive=False
scene.cycles.blur_glossy=.5
scene.render.resolution_x=1200 if quality=='final' else 960
scene.render.resolution_y=1000 if quality=='final' else 800
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGB'
scene.render.image_settings.color_depth='8'
scene.render.film_transparent=False
scene.view_settings.view_transform='AgX'
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=-.3
scene.render.image_settings.compression=30
scene.render.threads_mode='FIXED';scene.render.threads=8

# Rebuild materials only. All manufactured geometry and imported custom normals
# are retained from Eric Chadwick / DGG's CC BY 4.0 Khronos sample asset.
def material(name,color,metal=0,rough=.2,transmission=0,ior=1.5,coat=0):
 mat=bpy.data.materials.new(name);mat.use_nodes=True
 nodes=mat.node_tree.nodes;nodes.clear()
 output=nodes.new('ShaderNodeOutputMaterial');shader=nodes.new('ShaderNodeBsdfPrincipled')
 shader.inputs['Base Color'].default_value=(*color,1)
 shader.inputs['Metallic'].default_value=metal
 shader.inputs['Roughness'].default_value=rough
 shader.inputs['Transmission Weight'].default_value=transmission
 shader.inputs['IOR'].default_value=ior
 shader.inputs['Coat Weight'].default_value=coat
 shader.inputs['Coat Roughness'].default_value=.08
 mat.node_tree.links.new(shader.outputs['BSDF'],output.inputs['Surface'])
 return mat
metal=material('Champagne gold, satin-polished',(.68,.52,.30),1,.18)
black=material('Plain black acetate, logos removed',(.006,.007,.006),0,.22,coat=.45)
glass=material('Smoke green-gray optical glass',(.045,.073,.055),0,.02,.98,1.47,.10)
# The source includes inner and outer optical surfaces. The exterior is a clear
# coating, so tint is applied only to the interior, avoiding doubled darkening.
coating=material('Clear exterior, no iridescence',(.94,.97,.95),0,.018,1,1.05,0)
pads=material('Clear silicone nose pads',(.77,.81,.77),0,.13,.88,1.41,0)
for ob in [o for o in scene.objects if o.type=='MESH']:
 low=ob.name.lower()
 mat=black if 'earhook' in low else pads if 'nosepad' in low else glass if 'lensesinterior' in low else coating if 'lensesexterior' in low else metal
 ob.data.materials.clear();ob.data.materials.append(mat)

# Soft matte cyclorama; no generated or composited imagery.
floor=material('Warm ivory studio sweep',(.75,.71,.64),0,.78)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.00015))
plane=bpy.context.object;plane.name='Ivory studio floor';plane.data.materials.append(floor)
world=bpy.data.worlds.new('Soft neutral studio environment');world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.74,.77,.79,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.48
scene.world=world

def aim(ob,target):ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
def softbox(name,location,target,energy,width,height,color):
 light=bpy.data.lights.new(name,'AREA');light.energy=energy;light.shape='RECTANGLE';light.size=width;light.size_y=height;light.color=color
 ob=bpy.data.objects.new(name,light);scene.collection.objects.link(ob);ob.location=location;aim(ob,target);return ob
softbox('Large key softbox',(-.24,-.18,.35),(0,.03,.015),1.4,.26,.36,(1,.93,.82))
softbox('Quiet cool fill',(.29,-.04,.21),(0,.03,.025),.45,.21,.32,(.84,.91,1))
softbox('Long edge strip',(.025,.25,.25),(0,.05,.025),1.3,.30,.055,(1,.96,.88))
softbox('Top diffusion',(-.015,.04,.48),(0,.04,0),.4,.27,.27,(1,1,1))

camera_data=bpy.data.cameras.new('Product camera');camera=bpy.data.objects.new('Product camera',camera_data);scene.collection.objects.link(camera);scene.camera=camera
views={
 'hero':{'position':(.245,-.365,.15),'target':(0,.056,.014),'lens':81},
 'profile':{'position':(.30,-.26,.145),'target':(0,.065,.023),'lens':70},
 'detail':{'position':(.145,-.225,.115),'target':(.022,.025,.027),'lens':76},
}
pose=views[view];camera.location=pose['position'];aim(camera,pose['target']);camera_data.lens=pose['lens'];camera_data.sensor_width=36
camera_data.clip_start=.001;camera_data.clip_end=100
camera_data.dof.use_dof=False
output=ROOT/(view+'-'+quality+'.png');scene.render.filepath=str(output)
scene.render.film_transparent=False
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/(view+'-studio.blend')))
start=time.time();bpy.ops.render.render(write_still=True)
(ROOT/(view+'-'+quality+'-notes.json')).write_text(json.dumps({'sourceAsset':'public/models/eyewear-studio.glb','sourceAttribution':'Sunglasses Khronos by Eric Chadwick, Darmstadt Graphics Group GmbH (DGG), 2024. CC BY 4.0 International.','modifications':'Unmodified product geometry. Rebuilt materials; removed logo texture from earhooks; champagne gold metal; neutral smoky green-gray lenses; studio lighting/camera.','view':view,'quality':quality,'camera':pose,'resolution':[scene.render.resolution_x,scene.render.resolution_y],'samples':scene.cycles.samples,'engine':'Cycles CPU','seconds':round(time.time()-start,2),'output':str(output)},ensure_ascii=False,indent=2))
print('RENDER_DONE='+str(output),flush=True)
