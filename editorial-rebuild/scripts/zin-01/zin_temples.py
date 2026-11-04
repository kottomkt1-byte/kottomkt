"""Photo-based ZIN 01 titanium temples. Blender coordinates, units in meters.

This module recreates the visible construction from front/angle/side references.
It is not manufacturer CAD. The long flat blade, tapered wire and silver ear tip
are one smoothly swept solid on each side. No logo or image texture is used.
"""
import bpy
import math
from mathutils import Vector

MM = 0.001

# x, y, z, transverse thickness, side-profile height, all in millimeters.
# Positive X describes the wearer's left arm; the opposite arm is mirrored.
_STATIONS = [
    (71.50, 7.00, 40.50, .94, 3.30),
    (72.10, 14.0, 40.55, .94, 3.28),
    (72.90, 27.0, 40.42, .90, 3.18),
    (73.55, 42.0, 40.13, .85, 3.00),
    (73.85, 49.0, 39.95, .81, 2.68),
    (74.00, 56.0, 39.68, .80, 1.50),
    (74.05, 67.0, 39.26, .80, 1.28),
    (73.75, 82.0, 38.30, .82, 1.20),
    (72.30, 96.0, 35.50, .85, 1.23),
    (70.60, 108., 30.25, .88, 1.37),
    (68.70, 119., 22.72, .95, 1.73),
    (66.60, 130., 13.25, 1.08, 2.17),
    (65.10, 138., 6.70, 1.17, 2.50),
    (64.20, 143.7, 2.95, 1.20, 2.30),
    (64.12, 144.2, 2.62, .78, 1.62),
    (64.09, 144.4, 2.49, .18, .38),
]


def _catmull(a, b, c, d, t):
    return tuple(.5 * ((2*b[i]) + (-a[i]+c[i])*t +
                      (2*a[i]-5*b[i]+4*c[i]-d[i])*t*t +
                      (-a[i]+3*b[i]-3*c[i]+d[i])*t*t*t)
                 for i in range(len(b)))


def _stations(samples_per_span=7):
    points=[]
    for j in range(len(_STATIONS)-1):
        a=_STATIONS[max(0,j-1)]; b=_STATIONS[j]
        c=_STATIONS[j+1]; d=_STATIONS[min(len(_STATIONS)-1,j+2)]
        for k in range(samples_per_span):
            points.append(_catmull(a,b,c,d,k/samples_per_span))
    points.append(_STATIONS[-1])
    return points


def _sample_y(y):
    for i in range(len(_STATIONS)-1):
        a,b=_STATIONS[i],_STATIONS[i+1]
        if a[1] <= y <= b[1]:
            t=(y-a[1])/(b[1]-a[1])
            return _catmull(_STATIONS[max(0,i-1)],a,b,
                            _STATIONS[min(len(_STATIONS)-1,i+2)],t)
    return _STATIONS[0] if y < _STATIONS[0][1] else _STATIONS[-1]


def _rounded_rectangle(width, height, radius):
    """16 vertices on a real flat-sided profile with rounded corners."""
    p=[]
    for cx,cy,a0 in [(width/2-radius,height/2-radius,0),
                     (-width/2+radius,height/2-radius,90),
                     (-width/2+radius,-height/2+radius,180),
                     (width/2-radius,-height/2+radius,270)]:
        for j in range(4):
            a=math.radians(a0+90*j/3)
            p.append((cx+radius*math.cos(a),cy+radius*math.sin(a)))
    return p


def _mesh(name, vertices, faces, material):
    data=bpy.data.meshes.new(name+'_mesh')
    data.from_pydata(vertices,[],faces); data.update()
    ob=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(ob)
    data.materials.append(material)
    for face in data.polygons: face.use_smooth=True
    ob['reconstruction']='Photo-based ZIN 01; not manufacturer CAD'
    return ob


def _arm(name, sign, material):
    points=_stations()
    vertices=[]; faces=[]; ring=16
    for i,p in enumerate(points):
        center=Vector((p[0]*sign,p[1],p[2]))
        prev=Vector(points[max(0,i-1)][:3]); nxt=Vector(points[min(len(points)-1,i+1)][:3])
        prev.x*=sign; nxt.x*=sign
        tangent=(nxt-prev).normalized()
        # Keep the broad polished face oriented laterally, parallel transport
        # through the down-swept tip rather than extruding a vertical tube.
        transverse=Vector((sign,0,0))
        transverse=(transverse-tangent*tangent.dot(transverse)).normalized()
        side=tangent.cross(transverse).normalized()
        if side.z<0: side=-side
        w,h=max(.08,p[3]),max(.1,p[4])
        radius=min(.24,w*.38,h*.30)
        for u,v in _rounded_rectangle(w,h,radius):
            vertices.append(tuple((center+transverse*u+side*v)*MM))
    for i in range(len(points)-1):
        for j in range(ring):
            a=i*ring+j;b=i*ring+(j+1)%ring
            c=(i+1)*ring+(j+1)%ring;d=(i+1)*ring+j
            faces.append((a,b,c,d))
    faces.append(tuple(reversed(range(ring))))
    faces.append(tuple((len(points)-1)*ring+j for j in range(ring)))
    ob=_mesh(name,vertices,faces,material)
    # Explicit consistent winding for both mirrored solids.
    import bmesh
    bm=bmesh.new();bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    bm.to_mesh(ob.data);bm.free()
    # Weighted corner normals keep the broad titanium face flat; no low-poly
    # faceting is introduced on its rounded edges.
    modifier=ob.modifiers.new('Polished broad-face normals','WEIGHTED_NORMAL')
    modifier.keep_sharp=True; modifier.weight=40
    ob['centerline_length_mm']=sum((Vector(a[:3])-Vector(b[:3])).length for a,b in zip(points,points[1:]))
    return ob


def _tube(name, points_mm, radius_mm, material, cyclic=False, sides=8):
    centers=[Vector(p) for p in points_mm]
    vertices=[];faces=[]
    for i,c in enumerate(centers):
        previous=centers[(i-1)%len(centers)] if cyclic else centers[max(0,i-1)]
        following=centers[(i+1)%len(centers)] if cyclic else centers[min(len(centers)-1,i+1)]
        t=(following-previous).normalized()
        a=Vector((1,0,0)); a=(a-t*t.dot(a)).normalized()
        b=t.cross(a).normalized()
        for j in range(sides):
            angle=2*math.pi*j/sides
            vertices.append(tuple((c+radius_mm*(a*math.cos(angle)+b*math.sin(angle)))*MM))
    for i in range(len(centers) if cyclic else len(centers)-1):
        n=(i+1)%len(centers)
        for j in range(sides):faces.append((i*sides+j,i*sides+(j+1)%sides,n*sides+(j+1)%sides,n*sides+j))
    if not cyclic:
        faces.append(tuple(reversed(range(sides))))
        faces.append(tuple((len(centers)-1)*sides+j for j in range(sides)))
    return _mesh(name,vertices,faces,material)


def _side_point(sign,y,zoffset,raised=.04):
    p=_sample_y(y)
    return (sign*(p[0]+p[3]/2+raised),y,p[2]+zoffset)


def _capsule_points(sign,start,end,zmid,height):
    # A hairline raised outline of the two elongated rounded details visible
    # on the outer titanium face. It is geometry, not a copied brand texture.
    r=height/2;points=[]
    for j in range(17):
        a=-math.pi/2+math.pi*j/16
        y=end-r+r*math.cos(a);z=zmid+r*math.sin(a)
        points.append(_side_point(sign,y,z,.07))
    for j in range(17):
        a=math.pi/2+math.pi*j/16
        y=start+r+r*math.cos(a);z=zmid+r*math.sin(a)
        points.append(_side_point(sign,y,z,.07))
    return points


def _screw(name,sign,y,material,darkmaterial):
    p=_sample_y(y)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=.40*MM,depth=.17*MM,
        end_fill_type='NGON',location=(sign*(p[0]-p[3]/2-.055)*MM,y*MM,p[2]*MM),
        rotation=(0,math.pi/2,0))
    ob=bpy.context.object;ob.name=name;ob.data.materials.append(material)
    bevel=ob.modifiers.new('Screw lip radius','BEVEL');bevel.width=.045*MM;bevel.segments=2
    ob.modifiers.new('Screw normals','WEIGHTED_NORMAL')
    for f in ob.data.polygons:f.use_smooth=True
    # A shallow, dark metallic slot on the inside face, at less than 0.1mm.
    x=sign*(p[0]-p[3]/2-.15)
    slot=_tube(name+'_slot',[(x,y-.235,p[2]),(x,y+.235,p[2])],.045,darkmaterial,sides=6)
    return [ob,slot]


def build_temples(materials):
    """Build two opened silver temples, return objects; no scene reset/export."""
    metal=materials['metal']; darkmetal=materials.get('darkmetal',metal)
    result=[]
    for sign,label in [(1,'left'),(-1,'right')]:
        prefix='temple_'+label
        result.append(_arm(prefix+'_titanium_swept',sign,metal))
        # Raised polished edges stand only 0.13mm proud of the broad blade.
        for index,zoffset in enumerate((-.90,.90)):
            points=[_side_point(sign,8.3+36.6*j/40,zoffset,.015) for j in range(41)]
            result.append(_tube(prefix+'_longitudinal_rail_'+str(index),points,.095,metal))
        for index,zoffset in enumerate((-.76,.76)):
            result.append(_tube(prefix+'_elongated_loop_'+str(index),
                _capsule_points(sign,21.0,32.5,zoffset,1.23),.105,metal,cyclic=True))
        # Two flush hardware heads are visible on the inner sides in angle.png.
        for index,y in enumerate((11.8,16.1)):
            result.extend(_screw(prefix+'_inner_screw_'+str(index),sign,y,metal,darkmetal))
    return result
