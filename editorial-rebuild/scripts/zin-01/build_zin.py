"""Photo-based ZIN 01 recreation. No manufacturer CAD or source photos embedded.
Blender: X across frame, Y back, Z up. glTF export: X across, Y up, front +Z.
"""
import bpy, bmesh, math, json, sys, time, hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
OUTPUT=ROOT.parents[1]/'output'/'zin-01'
MODEL=OUTPUT/'model'; LOOK=OUTPUT/'lookdev'; M=.001
MODEL.mkdir(parents=True,exist_ok=True); LOOK.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(ROOT))
from zin_temples import build_temples
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
final='final' in args; render='render' in args
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene

def material(name,color,metal=0,rough=.2,transmission=0,ior=1.5,coat=0):
 mat=bpy.data.materials.new(name);mat.use_nodes=True
 bs=mat.node_tree.nodes.get('Principled BSDF')
 for key,value in [('Base Color',(*color,1)),('Metallic',metal),('Roughness',rough),('Transmission Weight',transmission),('IOR',ior),('Coat Weight',coat),('Coat Roughness',.09)]:bs.inputs[key].default_value=value
 return mat
materials={
 'frame':material('frame_black_acetate',(.002,.0024,.003),rough=.13,coat=.3),
 'metal':material('temple_silver_titanium',(.63,.66,.69),metal=1,rough=.2),
 'darkmetal':material('hinge_recess_dark_metal',(.06,.065,.07),metal=1,rough=.3),
 'lens':material('lenses_clear_optical_glass',(.985,.993,.995),rough=.008,transmission=1,ior=1.49),
 'pad':material('nosepads_clear_silicone',(.82,.86,.85),rough=.12,transmission=.83,ior=1.41),
}

def mesh_object(name,verts,faces,mat,smooth=True):
 data=bpy.data.meshes.new(name+'_mesh');data.from_pydata(verts,[],faces);data.update()
 ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);data.materials.append(mat)
 for p in data.polygons:p.use_smooth=smooth
 bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(data);bm.free()
 return ob

def apply_modifier(ob,mod):
 bpy.context.view_layer.objects.active=ob;ob.select_set(True)
 bpy.ops.object.modifier_apply(modifier=mod.name);ob.select_set(False)

def rounded_box(name,loc,size,mat,radius=.18):
 bpy.ops.mesh.primitive_cube_add(size=1,location=tuple(v*M for v in loc));ob=bpy.context.object;ob.name=name
 ob.scale=tuple(v*M for v in size);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ob.data.materials.append(mat)
 bev=ob.modifiers.new('Rounded machined edges','BEVEL');bev.width=radius*M;bev.segments=5
 apply_modifier(ob,bev)
 for p in ob.data.polygons:p.use_smooth=True
 wn=ob.modifiers.new('Face weighted normals','WEIGHTED_NORMAL');wn.keep_sharp=True;apply_modifier(ob,wn)
 return ob

def tube(name,points,radius,mat):
 curve=bpy.data.curves.new(name+'_curve','CURVE');curve.dimensions='3D';curve.resolution_u=12
 sp=curve.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for p,co in zip(sp.bezier_points,points):p.co=tuple(v*M for v in co);p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 curve.bevel_depth=radius*M;curve.bevel_resolution=4;curve.resolution_u=10;curve.use_fill_caps=True
 ob=bpy.data.objects.new(name,curve);scene.collection.objects.link(ob);curve.materials.append(mat)
 return ob

def cylinder(name,loc,radius,depth,mat,axis='Z'):
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=radius*M,depth=depth*M,location=tuple(v*M for v in loc));ob=bpy.context.object;ob.name=name
 if axis=='Y':ob.rotation_euler.x=math.pi/2
 if axis=='X':ob.rotation_euler.y=math.pi/2
 ob.data.materials.append(mat)
 bevel=ob.modifiers.new('Screw edge fillet','BEVEL');bevel.width=.07*M;bevel.segments=3
 for p in ob.data.polygons:p.use_smooth=True
 return ob

source=json.loads((ROOT/'contours.json').read_text())
def coords(item):
 if isinstance(item,dict):
  for key in ('mmSmooth','smoothedMm','mm','pointsMm','points_mm'):
   if key in item:return item[key]
 raise ValueError('No mm coordinates in contour')
def resample_closed(points, limit):
 lengths=[math.dist(a,b) for a,b in zip(points,points[1:]+points[:1])]
 perimeter=sum(lengths);result=[];edge=0;before=0
 for i in range(limit):
  distance=i*perimeter/limit
  while edge<len(points)-1 and before+lengths[edge]<distance:before+=lengths[edge];edge+=1
  t=(distance-before)/max(lengths[edge],1e-9);a=points[edge];b=points[(edge+1)%len(points)]
  result.append((a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))
 return result
def manufactured_contour(points, output_count, sigma_mm=1.0):
 # Pixel extraction is an image measurement, not a manufactured surface normal.
 # Equal arc spacing + a 1mm Gaussian removes subpixel tangent noise while
 # preserving the measured overall X/Y extents of each traced contour.
 perimeter=sum(math.dist(a,b) for a,b in zip(points,points[1:]+points[:1]))
 n=max(output_count,math.ceil(perimeter/.24));dense=resample_closed(points,n)
 spacing=perimeter/n;sigma=sigma_mm/spacing;radius=math.ceil(3*sigma)
 kernel=[math.exp(-.5*(i/sigma)**2) for i in range(-radius,radius+1)];total=sum(kernel)
 smooth=[tuple(sum(dense[(j+i-radius)%n][axis]*w for i,w in enumerate(kernel))/total for axis in range(2)) for j in range(n)]
 limits=[(min(p[a] for p in points),max(p[a] for p in points)) for a in range(2)]
 sm_limits=[(min(p[a] for p in smooth),max(p[a] for p in smooth)) for a in range(2)]
 smooth=[tuple(limits[a][0]+(p[a]-sm_limits[a][0])/(sm_limits[a][1]-sm_limits[a][0])*(limits[a][1]-limits[a][0]) for a in range(2)) for p in smooth]
 return resample_closed(smooth,output_count)
outer=manufactured_contour(coords(source['outer']),256);holes=[manufactured_contour(coords(h),128) for h in source['holes']]
(MODEL/'contours-smoothed.json').write_text(json.dumps({'method':'Uniform arc spacing, cyclic Gaussian sigma1.0mm, source XY extents retained','source':'scripts/zin-01/contours.json','outer':outer,'holes':holes},indent=2))
minz=min(v[1] for v in outer);maxz=max(v[1] for v in outer)
outer=[(p[0],p[1]-minz) for p in outer];holes=[[(p[0],p[1]-minz) for p in hole] for hole in holes]
# Force conventional winding for the 2D solid fill.
def area(loop):return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(loop,loop[1:]+loop[:1]))*.5
if area(outer)<0:outer.reverse()
for hole in holes:
 if area(hole)>0:hole.reverse()

def wrap(x):return 3.0*(x/73.6)**2
curve=bpy.data.curves.new('Traced ZIN front outer and optical apertures','CURVE');curve.dimensions='2D';curve.fill_mode='BOTH';curve.resolution_u=6;curve.extrude=1.9*M;curve.offset=-.7*M;curve.bevel_depth=.7*M;curve.bevel_resolution=6
for loop in [outer,*holes]:
 sp=curve.splines.new('BEZIER');sp.bezier_points.add(len(loop)-1)
 for p,co in zip(sp.bezier_points,loop):
  p.co=(co[0]*M,co[1]*M,0);p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 sp.use_cyclic_u=True
frame=bpy.data.objects.new('frame_acetate_traced',curve);scene.collection.objects.link(frame);curve.materials.append(materials['frame'])
frame.rotation_euler.x=math.pi/2;frame.location.y=2.6*M
bpy.ops.object.select_all(action='DESELECT');frame.select_set(True);bpy.context.view_layer.objects.active=frame
bpy.ops.object.convert(target='MESH');bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
# Blender's 2D-curve conversion emits duplicate cap/side boundary vertices.
# Weld those boundaries before a true solid edge roundover can be formed.
bm=bmesh.new();bm.from_mesh(frame.data)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
assert not any(e.is_boundary for e in bm.edges), 'Frame must be watertight before bevel'
bm.to_mesh(frame.data);bm.free();frame.data.update()
for p in frame.data.polygons:p.use_smooth=True
# Keep the native smooth roundover normals; area-weighting cap triangles
# introduces false stripes into a constant-radius manufactured surface.
# Transform split normals analytically through the subtle front wrap, avoiding
# broad faceted highlights on the filled front surface.
frame.data.update();normals=[n.vector.copy() for n in frame.data.corner_normals]
for vertex in frame.data.vertices:vertex.co.y+=wrap(vertex.co.x/M)*M
adjusted=[]
for li,loop in enumerate(frame.data.loops):
 n=normals[li];x=frame.data.vertices[loop.vertex_index].co.x/M
 adjusted.append(tuple(Vector((n.x-6*x/(73.6**2)*n.y,n.y,n.z)).normalized()))
frame.data.normals_split_custom_set(adjusted);frame.data.update()
frame['source']='Silhouette traced from official ZIN 01 front photo; depth/wrap reconstructed from angle/side photos'

# Thin, mildly convex transparent lenses fit into the actual traced apertures.
for index,boundary in enumerate(holes):
 if area(boundary)<0:boundary=list(reversed(boundary))
 cx=sum(p[0] for p in boundary)/len(boundary);cz=sum(p[1] for p in boundary)/len(boundary)
 boundary=[(cx+(x-cx)*1.018,cz+(z-cz)*1.018) for x,z in boundary]
 count=len(boundary);rings=9;verts=[];faces=[]
 for side in (0,1):
  verts.append((cx*M,(wrap(cx)+1.3+side*.85)*M,cz*M))
  for ring in range(1,rings+1):
   r=ring/rings
   for x,z in boundary:
    xx=cx+(x-cx)*r;zz=cz+(z-cz)*r
    yy=wrap(xx)+1.3+.85*r*r+side*.85
    verts.append((xx*M,yy*M,zz*M))
 layer=1+count*rings
 for side in (0,1):
  base=side*layer
  for j in range(count):faces.append((base,base+1+j,base+1+(j+1)%count))
  for ring in range(rings-1):
   a=base+1+ring*count;b=a+count
   for j in range(count):faces.append((a+j,b+j,b+(j+1)%count,a+(j+1)%count))
 for j in range(count):
  a=1+(rings-1)*count+j;b=1+(rings-1)*count+(j+1)%count
  faces.append((a,b,b+layer,a+layer))
 mesh_object('lenses_clear_'+('left' if cx<0 else 'right'),verts,faces,materials['lens'])

build_temples(materials)
# Hinge knuckles behind each endpiece; front accents are a pair of silver bars.
for sign,label in [(-1,'left'),(1,'right')]:
 x=sign*71.3
 rounded_box('hinge_'+label,(x,7.7,40.4),(2.0,4.6,3.2),materials['metal'],.24)
 cylinder('hinge_pivot_'+label,(sign*71.4,8.6,40.5),.8,3.65,materials['metal'])
 cylinder('hinge_screw_'+label,(sign*71.4,8.6,42.37),.65,.18,materials['metal'])
 rounded_box('hinge_screw_slot_'+label,(sign*71.4,8.6,42.48),(.86,.14,.035),materials['darkmetal'],.035)
 for k,z in enumerate((40.4,41.45)):
  rounded_box('rivets_front_'+label+'_'+str(k),(sign*67.3,wrap(67.3)-.10,z),(4.6,.42,.56),materials['metal'],.18)
 # True adjustable pad arm and a transparent oblong silicone cushion.
 tube('nosepad_adjustment_arm_'+label,[(sign*14.4,5.0,27.0),(sign*12.3,8.3,27.0),(sign*11.8,11.6,23.6),(sign*12.3,11.7,21.5)],.56,materials['metal'])
 bpy.ops.mesh.primitive_uv_sphere_add(segments=28,ring_count=16,location=(sign*12.5*M,12.2*M,21.4*M))
 pad=bpy.context.object;pad.name='nosepads_silicone_'+label;pad.scale=(2.5*M,1.0*M,5.6*M);pad.rotation_euler=(0,sign*math.radians(-16),sign*math.radians(20));pad.data.materials.append(materials['pad'])
 for p in pad.data.polygons:p.use_smooth=True
 holder=rounded_box('nosepad_mount_'+label,(sign*12.4,11.0,21.5),(1.45,.65,4.5),materials['metal'],.32);holder.rotation_euler.y=sign*math.radians(-16)
 cylinder('nosepad_screw_'+label,(sign*12.4,10.55,21.5),.65,.3,materials['metal'],'Y')

model_objects=list(scene.objects)
# Convert all swept curves; export evaluated bevels/weighted normals as meshes.
for ob in model_objects:
 if ob.type=='CURVE':
  bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
for ob in model_objects:
 if ob.type=='MESH':
  ob['asset_role']='Photo-based 3D recreation of Gentle Monster ZIN 01; not manufacturer CAD'
  for mod in list(ob.modifiers):apply_modifier(ob,mod)
bpy.ops.object.select_all(action='DESELECT')
for ob in model_objects:ob.select_set(True)
scene['provenance']='Created from dimensions and traced silhouette of official ZIN 01 reference photos. Official photos are not embedded or redistributed.'
scene['units']='meters; glTF front +Z, temples -Z'
bpy.ops.wm.save_as_mainfile(filepath=str(MODEL/'zin-01-recreation.blend'))
bpy.ops.export_scene.gltf(filepath=str(MODEL/'zin-01-recreation.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_extras=True)
triangles=sum(len(ob.data.loop_triangles) for ob in model_objects if ob.type=='MESH' and not ob.data.calc_loop_triangles())
points=[ob.matrix_world@Vector(corner) for ob in model_objects if ob.type=='MESH' for corner in ob.bound_box]
metadata={'identity':'ZIN 01 photo-based 3D recreation','manufacturerCAD':False,'sourcePhotosEmbedded':False,'dimensionsReferenceMm':{'front':147.2,'lensWidth':52.7,'lensHeight':40.9,'bridge':21,'temple':149.1},'tracedFrontHeightMm':maxz-minz,'bboxBlenderMm':{'min':[min(p[i] for p in points)/M for i in range(3)],'max':[max(p[i] for p in points)/M for i in range(3)]},'triangles':triangles,'meshCount':len(model_objects),'coordinateSystem':'glTF meters, front+Z, temples-Z','modelFile':'zin-01-recreation.glb','contoursSha256':hashlib.sha256((ROOT/'contours.json').read_bytes()).hexdigest(),'referencePhotoSha256':{'front':'9437f64cfa04f080f505ca83fd6611433bd369a5c249b68ce4612b05830e11e6','angle':'292d2159922e30225871f18c9d91c0485fc143e8d149c907c10d351c698bdc1b','side':'b18e4b0c6c886110a16db60bd287360f08ab5413743687d9a376d33e9a7eea93'},'limitations':'Photo-based reconstruction. Front silhouette traced; depth, optical curvature, hinge and pad construction inferred from photos. Not official CAD or manufacturing tolerances.'}
(MODEL/'model-notes.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2));print('MODEL_DONE',json.dumps(metadata),flush=True)
if not render:sys.exit(0)

# Editorial studio, arranged at the object's real size rather than artificial mm lights.
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=512 if final else 64
scene.cycles.use_adaptive_sampling=True;scene.cycles.adaptive_threshold=.008 if final else .04;scene.cycles.use_denoising=False
scene.cycles.max_bounces=10;scene.cycles.transmission_bounces=8;scene.cycles.glossy_bounces=5;scene.cycles.diffuse_bounces=3
scene.cycles.caustics_reflective=False;scene.cycles.caustics_refractive=False;scene.cycles.blur_glossy=.5
scene.cycles.sample_clamp_indirect=4
scene.render.resolution_x=1200 if final else 960;scene.render.resolution_y=1000 if final else 800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.color_depth='8';scene.render.image_settings.compression=30
scene.render.threads_mode='FIXED';scene.render.threads=8
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.3
floor=material('studio_warm_ivory',(.76,.72,.65),rough=.78)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.00015));bpy.context.object.name='Studio sweep';bpy.context.object.data.materials.append(floor)
# A studio negative-fill card controls the floor reflected in polished black
# acetate. Its camera visibility is disabled as in a product-render light rig;
# it changes lighting/reflection only, not the reconstructed product geometry.
flag_material=material('studio_negative_fill',(.001,.001,.001),rough=.8)
bpy.ops.mesh.primitive_plane_add(size=1,location=(-.03,-.10,.001))
flag=bpy.context.object;flag.name='Low studio negative fill';flag.scale=(.32,.22,1);flag.data.materials.append(flag_material)
flag.visible_camera=False;flag.visible_diffuse=False;flag.visible_shadow=False;flag.visible_transmission=False
bpy.ops.mesh.primitive_plane_add(size=1,location=(.115,.19,.0015))
metal_flag=bpy.context.object;metal_flag.name='Narrow titanium reflection strip';metal_flag.scale=(.075,.22,1);metal_flag.data.materials.append(flag_material)
metal_flag.visible_camera=False;metal_flag.visible_diffuse=False;metal_flag.visible_shadow=False;metal_flag.visible_transmission=False
world=bpy.data.worlds.new('Neutral soft studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.77,.79,.82,1);world.node_tree.nodes['Background'].inputs[1].default_value=.4;scene.world=world

def aim(ob,target):ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
def softbox(name,position,target,energy,size,size_y,color):
 light=bpy.data.lights.new(name,'AREA');light.energy=energy;light.shape='RECTANGLE';light.size=size;light.size_y=size_y;light.color=color
 ob=bpy.data.objects.new(name,light);scene.collection.objects.link(ob);ob.location=position;aim(ob,target)
softbox('Large front key',(-.22,-.22,.34),(0,.035,.024),1.6,.24,.33,(1,.96,.89))
softbox('Gentle fill',(.30,-.03,.20),(0,.045,.022),.35,.21,.30,(.87,.93,1))
softbox('Top rim strip',(.01,.24,.25),(0,.05,.025),1.3,.30,.045,(1,.97,.91))
softbox('Quiet top diffusion',(-.015,.04,.48),(0,.04,0),.35,.27,.27,(1,1,1))
camdata=bpy.data.cameras.new('ZIN studio camera');camera=bpy.data.objects.new('ZIN studio camera',camdata);scene.collection.objects.link(camera);scene.camera=camera
camera.location=(.245,-.36,.153);aim(camera,(0,.052,.017));camdata.lens=80;camdata.sensor_width=36;camdata.clip_start=.001;camdata.clip_end=100
if 'front' in args:camera.location=(0,-.44,.04);aim(camera,(0,.015,.023));camdata.lens=84
if 'side' in args:camera.location=(.41,-.025,.07);aim(camera,(0,.066,.025));camdata.lens=85
view='front' if 'front' in args else 'side' if 'side' in args else 'hero'
quality='final' if final else 'preview';output=LOOK/(view+'-'+quality+'.png');scene.render.filepath=str(output)
bpy.ops.wm.save_as_mainfile(filepath=str(LOOK/'zin-studio.blend'))
start=time.time();bpy.ops.render.render(write_still=True)
(LOOK/(view+'-'+quality+'-notes.json')).write_text(json.dumps({'resolution':[scene.render.resolution_x,scene.render.resolution_y],'samples':scene.cycles.samples,'seconds':round(time.time()-start,2),'source':'Photo-based ZIN 01 recreation, not manufacturer CAD','model':'../model/zin-01-recreation.glb','output':str(output)},indent=2))
print('RENDER_DONE='+str(output),flush=True)
