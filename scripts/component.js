// BlockShip Wars Component

BSWG.compActiveConfMenu = null;

BSWG.component_minJMatch = Math.pow(0.15, 2.0);
BSWG.component_jMatchClickRange = Math.pow(0.15, 2.0);

BSWG.maxJPointsRender = 512;
BSWG.jpointRenderer = new function() {

    var baseLen, geom, len, posArray, clrArray, mat, mesh, vertices, faces;
    var hasInit = false;

    this.init = function () {

	    hasInit = true;

		baseLen = 5;

		len = BSWG.maxJPointsRender * baseLen * 3;
		vertices = new Float32Array(len);
		var k = 0;
		for (var i=0; i<BSWG.maxJPointsRender; i++) {
			vertices[k++] =  0.0; vertices[k++] =  0.0; vertices[k++] =  0.5;
			vertices[k++] = -1.0; vertices[k++] =  0.0; vertices[k++] =  0.0;
			vertices[k++] =  0.0; vertices[k++] =  1.0; vertices[k++] =  0.0;
			vertices[k++] =  1.0; vertices[k++] =  0.0; vertices[k++] =  0.0;
			vertices[k++] =  0.0; vertices[k++] = -1.0; vertices[k++] =  0.0;
		}

		len = BSWG.maxJPointsRender * baseLen * 4;
		posArray = new Float32Array(len);
		clrArray = new Float32Array(len);
		for (var i=0; i<len; i++) {
			posArray[i] = 0.0; // x,y,angle,radius
			clrArray[i] = 0.0; // r,g,b,a
		}

		len = BSWG.maxJPointsRender * 4 * 3;
		faces = new Uint32Array(len);
		var k = 0;
		for (var i=0; i<BSWG.maxJPointsRender; i++) {
			var j = i * baseLen;
			faces[k++] = j+0; faces[k++] = j+1; faces[k++] = j+2;
			faces[k++] = j+0; faces[k++] = j+2; faces[k++] = j+3;
			faces[k++] = j+0; faces[k++] = j+3; faces[k++] = j+4;
			faces[k++] = j+0; faces[k++] = j+4; faces[k++] = j+1;
		}

		geom = new THREE.BufferGeometry();
		geom.setIndex( new THREE.BufferAttribute( faces, 1 ) );
		geom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geom.addAttribute( 'pos',      new THREE.BufferAttribute( posArray, 4 ) );
		geom.addAttribute( 'clr',      new THREE.BufferAttribute( clrArray, 4 ) );

		mat = BSWG.render.newMaterial("jpointsVertex", "jpointsFragment");
	    mesh = new THREE.Mesh( geom, mat );
	    mesh.position.z = 0.05;

	    geom.needsUpdate = true;
		mat.needsUpdate = true;
	    mesh.needsUpdate = true;

	    BSWG.render.scene.add( mesh );

    };

	this.render = function () {

		if (!hasInit) {
			this.init();
		}

		var pos = new THREE.Vector4(0,0,0,0);
		var clr = new THREE.Vector4(0,0,0,0);

		var posAttr = geom.getAttribute('pos');
		var clrAttr = geom.getAttribute('clr');

		posArray = posAttr.array;
		clrArray = clrAttr.array;

		var compList = new Array();
		for (var i=0; i<BSWG.componentList.compList.length; i++) {
			compList.push(BSWG.componentList.compList[i]);
		}
		var comp0center = new b2Vec2(BSWG.game.cam.x, BSWG.game.cam.y);
		compList.sort(function(a, b){

			var diff = Math.distSqVec2(comp0center, a.obj.body.GetWorldCenter()) - 
				       Math.distSqVec2(comp0center, b.obj.body.GetWorldCenter());

			if (diff < 0) {
				return -1;
			}
			else if (diff > 0) {
				return 1;
			}
			return 0;

		});

		mesh.position.x = comp0center.x;
		mesh.position.y = comp0center.y;
		mesh.updateMatrix();

		var idx = 0;
		var idxWidth = baseLen * 4;
		for (var i=0; i<compList.length && idx<BSWG.maxJPointsRender; i++) {
			var comp = compList[i];
			if (comp.jpointsw) {
				var map = {};
				for (var j=0; j<comp.jmatch.length; j++) {
					map[comp.jmatch[j][0]] = comp.jmatch[j][1].jpointsw[comp.jmatch[j][2]];
				}

				var jp = comp.jpointsw;
				for (var j=0; j<jp.length; j++) {
					if (!BSWG.game.editMode && !comp.welds[j]) {
						continue;
					}

					var r = map[j]?(comp.jmhover===j?160:110):80;
					if (comp.welds[j] && comp.jmhover !== j) {
						r = 110;
					}

		        	if (comp.welds[j]) {
		        		if (comp.jmhover === j) {
		        			clr.set(1.0, 0.1, 0.1, 1.0);
		        		}
		        		else {
		        			clr.set(0.75, 0.75, 1.0, 1.0);
		        		}
		        	}
		        	else {
		        		if (map[j]) {
		        			if (comp.jmhover === j) {
		        				clr.set(0.1, 1.0, 0.1, 1.0);
		        			}
		        			else {
		        				clr.set(0.4, 1.0, 0.4, 1.0);
		        			}
		        		}
		        		else {
		        			clr.set(0.8, 0.8, 0.8, 1.0);
		        		}
		        	}

					pos.set(
						jp[j].x - comp0center.x,
						jp[j].y - comp0center.y,
						comp.obj.body.GetAngle(),
						r/1250.0
					);

					for (var k=0; k<baseLen; k++) {
						var k2 = k*4 + idx*idxWidth;
						var f = k<2 ? 1.0 : 0.65;
						clrArray[k2+0] = clr.x * f;
						clrArray[k2+1] = clr.y * f;
						clrArray[k2+2] = clr.z * f;
						clrArray[k2+3] = clr.w;
						posArray[k2+0] = pos.x;
						posArray[k2+1] = pos.y;
						posArray[k2+2] = pos.z;
						posArray[k2+3] = pos.w;
					}
					idx += 1;
				}
			}
		}
		for (; idx<BSWG.maxJPointsRender; idx++) {
			var k = idx*idxWidth;
			for (var i=0; i<idxWidth; i++) {
				clrArray[k+i] = 0.0;
				posArray[k+i] = 0.0;
			}
		}

		clrAttr.needsUpdate = true;
		posAttr.needsUpdate = true;
	};

}();

BSWG.componentHoverFn = function(self) {
	if (BSWG.componentList.mouseOver !== self || !BSWG.game.editMode || (self.onCC && self.onCC !== BSWG.game.ccblock)) {
		return false;
	}
	if (self.onCC && !self.hasConfig) {
		return false;
	}
	return true;
};

BSWG.polyMesh_baseHeight = 0.5;
BSWG.blockPolySmooth = null;

BSWG.generateBlockPolyMesh = function(obj, iscale, zcenter, zoffset, depth) {

	var ret = new Object();

	var body  = obj.body,
		verts = obj.verts;

	if (BSWG.blockPolySmooth) {
		verts = Math.smoothPoly(verts, BSWG.blockPolySmooth);
	}

	var len = verts.length;

	var offset = null;

	if (!zcenter) {
		zcenter = body.GetLocalCenter();
	}
	else {
		var bc = body.GetLocalCenter()
		offset = new b2Vec2(zcenter.x-bc.x, zcenter.y-bc.y);
	}

	if (!zoffset) {
		zoffset = 0.0;
	}

	zoffset *= BSWG.polyMesh_baseHeight;

	if (!depth) {
		var total = 1000.0;
		for (var i=0; i<len; i++) {
			total = Math.min(total, Math.distVec2(verts[i], zcenter));
		}
		depth = total * 0.3;
	}

	depth *= BSWG.polyMesh_baseHeight;

	var overts = new Array(len),
	    iverts = new Array(len),
	    mverts = new Array(len);
	for (var i=0; i<len; i++) {
		overts[i] = new THREE.Vector3(
			verts[i].x - zcenter.x + (offset?offset.x:0),
			verts[i].y - zcenter.y + (offset?offset.y:0),
			0.0
		);
		mverts[i] = new THREE.Vector3(
			(verts[i].x - zcenter.x) * (iscale*0.1+0.9) + (offset?offset.x:0),
			(verts[i].y - zcenter.y) * (iscale*0.1+0.9) + (offset?offset.y:0),
			depth*0.35
		);
		iverts[i] = new THREE.Vector3(
			(verts[i].x - zcenter.x) * iscale + (offset?offset.x:0),
			(verts[i].y - zcenter.y) * iscale + (offset?offset.y:0),
			depth
		);
	}
	var cvert = new THREE.Vector3(
		(offset?offset.x:0),
		(offset?offset.y:0),
		depth
	);

    var INNER = function(idx) { return idx+len*2+1; };
    var MIDDLE = function(idx) { return idx+len+1; };
    var OUTER = function(idx) { return idx+1; };

    ret.geom = new THREE.Geometry();

    var vertices = ret.geom.vertices;
    vertices.length = len*3 + 1;
    vertices[0] = cvert;
    for (var i=0; i<len; i++) {
    	vertices[OUTER(i)] = overts[i];
    	vertices[MIDDLE(i)] = mverts[i];
    	vertices[INNER(i)] = iverts[i];
    }

	var faces = ret.geom.faces;
    var cf = 0;
    faces.length = len*5;
    for (var i=0; i<len; i++) {
    	var j = (i+1) % len;
    	faces[cf++] = new THREE.Face3(INNER(i), INNER(j), 0);
    	faces[cf++] = new THREE.Face3(MIDDLE(i), MIDDLE(j), INNER(j));
    	faces[cf++] = new THREE.Face3(MIDDLE(i), INNER(j), INNER(i));
    	faces[cf++] = new THREE.Face3(OUTER(i), OUTER(j), MIDDLE(j));
    	faces[cf++] = new THREE.Face3(OUTER(i), MIDDLE(j), MIDDLE(i));
    }

    ret.geom.computeFaceNormals();
    //ret.geom.computeVertexNormals();
    ret.geom.computeBoundingSphere();

    ret.mat = BSWG.render.newMaterial("basicVertex", "basicFragment", {
    	clr: {
    		type: 'v4',
    		value: new THREE.Vector4(0.2, 0.2, 0.2, 1.0)
    	},
    	light: {
    		type: 'v4',
    		value: new THREE.Vector4(BSWG.game.cam.x, BSWG.game.cam.y, 20.0, 1.0)
    	},
    	map: {
    		type: 't',
    		value: BSWG.render.images['test_nm'].texture
    	},
    	extra: {
    		type: 'v4',
    		value: new THREE.Vector4(1,0,0,0)
    	}
    });
    ret.mesh = new THREE.Mesh( ret.geom, ret.mat );

    ret.geom.needsUpdate = true;
	ret.mat.needsUpdate = true;
    ret.mesh.needsUpdate = true;

    BSWG.render.scene.add( ret.mesh );

    var self = ret;

	ret.update = function(clr, texScale) {

		var matrix = self.mesh.matrix;

		var center = body.GetWorldCenter(),
			angle  = body.GetAngle();

		var offset = BSWG.drawBlockPolyOffset || null;

		self.mesh.position.x = center.x + (offset?offset.x:0);
		self.mesh.position.y = center.y + (offset?offset.y:0);
		self.mesh.position.z = zoffset;

		self.mesh.rotation.z = angle;

		self.mesh.updateMatrix();

		var lp = BSWG.render.unproject3D(new b2Vec2(BSWG.render.viewport.w*3.0, BSWG.render.viewport.h*0.5), 0.0);

		self.mat.uniforms.light.value.x = lp.x;
		self.mat.uniforms.light.value.y = lp.y;
		self.mat.uniforms.light.value.z = BSWG.render.cam3D.position.z * 7.0;

		self.mat.uniforms.extra.value.x = texScale || 1.0;

		if (clr) {
			self.mat.uniforms.clr.value.set(clr[0], clr[1], clr[2], clr[3]);
		}

		self.mat.needsUpdate = true;
	};

	ret.destroy = function() {

		BSWG.render.scene.remove( self.mesh );

	};

	ret.update();

	return ret;

};

BSWG.genereteBlockPolyOutline = function(obj, zcenter, oscale) {

	oscale = 0.1;

	var ret = new Object();

	var body  = obj.body,
		verts = obj.verts;

	/*if (BSWG.blockPolySmooth) {
		verts = Math.smoothPoly(verts, BSWG.blockPolySmooth);
	}*/

	var len = verts.length;

	var offset = null;

	if (!zcenter) {
		zcenter = body.GetLocalCenter();
	}
	else {
		var bc = body.GetLocalCenter();
		offset = new b2Vec2(zcenter.x-bc.x, zcenter.y-bc.y);
	}

	var overts = new Array(len*2),
		cf = 0;
	for (var i=0; i<len; i++) {
		var j = (i+1) % len;
		var edgeLen = Math.distVec2(verts[i], verts[j]);
		var dx = (verts[j].x - verts[i].x) / edgeLen;
		var dy = (verts[j].y - verts[i].y) / edgeLen;
		overts[cf++] = new THREE.Vector3(
			verts[i].x + dy * oscale + (offset ? offset.x : 0) - zcenter.x,
			verts[i].y - dx * oscale + (offset ? offset.y : 0) - zcenter.y, 
			0.001
		);
		overts[cf++] = new THREE.Vector3(
			verts[j].x + dy * oscale + (offset ? offset.x : 0) - zcenter.x,
			verts[j].y - dx * oscale + (offset ? offset.y : 0) - zcenter.y, 
			0.001
		);
	}
	var cvert = new THREE.Vector3(
		(offset?offset.x:0),
		(offset?offset.y:0),
		-0.001
	);
	len *= 2;

    var OUTER = function(idx) { return idx+1; };

    ret.geom = new THREE.Geometry();

    var vertices = ret.geom.vertices;
    vertices.length = len + 1;
    vertices[0] = cvert;
    for (var i=0; i<len; i++) {
    	vertices[OUTER(i)] = overts[i];
    }

	var faces = ret.geom.faces;
    faces.length = len;
    for (var i=0; i<len; i++) {
    	var j = (i+1) % len;
    	faces[i] = new THREE.Face3(OUTER(i), OUTER(j), 0);
    }

    ret.geom.computeFaceNormals();
    ret.geom.computeBoundingSphere();

    ret.mat = BSWG.render.newMaterial("basicVertex", "selectionFragment", {
    	clr: {
    		type: 'v4',
    		value: new THREE.Vector4(0.5, 1.0, 0.5, 0.0)
    	},
    }, THREE.NormalBlending, false);
    ret.mesh = new THREE.Mesh( ret.geom, ret.mat );

    ret.geom.needsUpdate = true;
	ret.mat.needsUpdate = true;
    ret.mesh.needsUpdate = true;

    BSWG.render.scene.add( ret.mesh );

    var self = ret;

	ret.update = function(clr) {

		var matrix = self.mesh.matrix;

		var center = body.GetWorldCenter(),
			angle  = body.GetAngle();

		var offset = BSWG.drawBlockPolyOffset || null;

		self.mesh.position.x = center.x + (offset?offset.x:0);
		self.mesh.position.y = center.y + (offset?offset.y:0);
		self.mesh.position.z = 0.0;

		self.mesh.rotation.z = angle;

		self.mesh.updateMatrix();

		if (clr) {
			self.mat.uniforms.clr.value.set(clr[0], clr[1], clr[2], clr[3]);
			if (clr[3] > 0) {
				self.mesh.visible = true;
			}
			else {
				self.mesh.visible = false;
			}
		}

		self.mat.needsUpdate = true;
	};

	ret.destroy = function() {

		BSWG.render.scene.remove( self.mesh );

	};

	ret.update();

	return ret;

};

BSWG.drawBlockPolyOffset = null;
BSWG.drawBlockPoly = function(ctx, obj, iscale, zcenter, outline) {

	var body = obj.body, verts = obj.verts;
	if (!zcenter) zcenter = body.GetLocalCenter();

	var overts = BSWG.physics.localToWorld(verts, body);
	var iverts = new Array(verts.length),
		len = verts.length;
	for (var i=0; i<len; i++) {
		var vec = new b2Vec2(
			(verts[i].x - zcenter.x) * iscale + zcenter.x,
			(verts[i].y - zcenter.y) * iscale + zcenter.y
		);
		iverts[i] = BSWG.physics.localToWorld(vec, body);
		if (BSWG.drawBlockPolyOffset) {
			iverts[i].x += BSWG.drawBlockPolyOffset.x;
			iverts[i].y += BSWG.drawBlockPolyOffset.y;
			overts[i].x += BSWG.drawBlockPolyOffset.x;
			overts[i].y += BSWG.drawBlockPolyOffset.y;
		}
	}

	ctx.save();

	overts = BSWG.render.project3D(overts, 0.0);
	iverts = BSWG.render.project3D(iverts, 0.0);

	ctx.beginPath();
	ctx.moveTo(overts[0].x, overts[0].y);
	for (var i=1; i<len; i++) {
		ctx.lineTo(overts[i].x, overts[i].y);
	}
	ctx.closePath();
	ctx.fill();

	if (outline) {
		ctx.strokeStyle = 'rgba(155,255,155,0.65)';
		ctx.lineWidth = 3.0;
		ctx.stroke();
		ctx.lineWidth = 1.0;
	}

	var oAlpha = parseFloat(ctx.globalAlpha);
	ctx.fillStyle = '#fff';

	for (var i=0; i<len; i++) {
		var j = (i+1) % len;

		var a = overts[i], b = overts[j],
			c = iverts[j], d = iverts[i];

		var angle = Math.atan2(b.y - a.y, b.x - a.x);
		var alpha = Math.sin(angle) * 0.5 + 0.5;
		ctx.globalAlpha = oAlpha * alpha * 0.6;

		ctx.beginPath();
		ctx.moveTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
		ctx.lineTo(c.x, c.y);
		ctx.lineTo(d.x, d.y);
		ctx.closePath();
		ctx.fill();
	}

	ctx.beginPath();
	ctx.globalAlpha = 0.65;
	ctx.moveTo(iverts[0].x, iverts[0].y);
	for (var i=1; i<len; i++) {
		ctx.lineTo(iverts[i].x, iverts[i].y);
	}
	ctx.closePath();
	ctx.fill();

	ctx.restore();

};

BSWG.addJPointsForSeg = function(jp, a, b, boxMethod) {

	var dx = b.x - a.x;
	var dy = b.y - a.y;
	var len = Math.sqrt(dx*dx + dy*dy);
	dx /= len;
	dy /= len;

	if (boxMethod) {
		if (!(Math.floor(len)%2)) {
			jp.push(new b2Vec2(a.x + dx * len * 0.5, a.y + dy * len * 0.5));
		}
		for (var i=0; i<len; i++) {
			jp.push(new b2Vec2(a.x + dx * 0.5 + i * dx, a.y + dy * 0.5 + i * dy));
		}
	}
	else {
		for (var i=0; i<Math.max(0.9, len*0.5-0.5); i+=1.0) {
			if (i === 0) {
				jp.push(new b2Vec2(a.x + dx * len * 0.5, a.y + dy * len * 0.5));
			}
			else {
				jp.push(new b2Vec2(a.x + dx * len * 0.5 - i * dx, a.y + dy * len * 0.5 - i * dy));
				jp.push(new b2Vec2(a.x + dx * len * 0.5 + i * dx, a.y + dy * len * 0.5 + i * dy));
			}
		}
	}

};

BSWG.createPolyJPoints = function(verts, exclude, boxMethod) {

	var jp = new Array();
	var ex = {};

	if (exclude) {
		for (var i=0; i<exclude.length; i++) {
			ex[exclude[i]] = true;
		}
	}

	for (var i=0; i<verts.length; i++) {
		if (ex[i]) {
			continue;
		}
		BSWG.addJPointsForSeg(jp, verts[i], verts[(i+1)%verts.length], boxMethod);
	}

	return jp;

};

BSWG.createBoxJPoints = function(w, h, t) {

	var jp = new Array();

	if (t) {

		for (var y=0; y<h; y++) {
			jp.push(new b2Vec2(t*-w * 0.5, y - h * 0.5 + 0.5));
		}

		if (!(h%2)) {
			jp.push(new b2Vec2(t*-w * 0.5, 0.0));
		}

		for (var x=0; x<w; x++) {
			jp.push(new b2Vec2(x - w * 0.5 + 0.5,  h * 0.5));
		}

		if (!(w%2)) {
			jp.push(new b2Vec2(0.0,  h * 0.5));
		}

		var l = Math.sqrt(w*w + h*h);
		var dx = w/l, dy = h/l;
		var x0 = dx * 0.5 * l - w * 0.5, 
			y0 = dy * 0.5 * l - h * 0.5;
		if (t === -1) {
			x0 = -x0;
			dx = -dx;
		}

		jp.push(new b2Vec2(
			x0, y0
		));

		for (var i=1.0; i<l*0.5 - 0.5; i+=1.0) {
			jp.push(new b2Vec2(
				x0 - dx * i,
				y0 - dy * i
			));
			jp.push(new b2Vec2(
				x0 + dx * i,
				y0 + dy * i
			));
		}

		return jp;

	};

	for (var y=0; y<h; y++) {
		jp.push(new b2Vec2(-w * 0.5, y - h * 0.5 + 0.5));
		jp.push(new b2Vec2( w * 0.5, y - h * 0.5 + 0.5));
	}

	if (!(h%2)) {
		jp.push(new b2Vec2(-w * 0.5, 0.0));
		jp.push(new b2Vec2( w * 0.5, 0.0));
	}

	for (var x=0; x<w; x++) {
		jp.push(new b2Vec2(x - w * 0.5 + 0.5, -h * 0.5));
		jp.push(new b2Vec2(x - w * 0.5 + 0.5,  h * 0.5));
	}

	if (!(w%2)) {
		jp.push(new b2Vec2(0.0, -h * 0.5));
		jp.push(new b2Vec2(0.0,  h * 0.5));
	}

	return jp;

};

BSWG.updateOnCC = function (a, b) {

	var cc = a.onCC || b.onCC;

	var scan = function(n, u) {

		if (!n)
			return false;

		if (!u) u = {};
		if (u[n.id])
			return false;
		u[n.id] = true;

		if (cc === n) {
			return true;
		}

		if (n.welds) {
			for (var key in n.welds) {
				if (n.welds[key]) {
					if (scan(n.welds[key].other, u)) {
						return true;
					}
				}
			}
		}

		return false;

	};

	var mark = function(n, flag, u) {

		if (!n)
			return false;

		if (!u) u = {};
		if (u[n.id])
			return false;
		u[n.id] = true;

		n.onCC = flag ? cc : null;

		if (n.welds) {
			for (var key in n.welds) {
				if (n.welds[key]) {
					mark(n.welds[key].other, flag, u);
				}
			}
		}

		return false;

	};

	mark(a, scan(a));
	mark(b, scan(b));

};

BSWG.component_CommandCenter = {

	type: 'cc',

	sortOrder: 2,

	hasConfig: false,

	init: function(args) {

		this.width  = 2;
		this.height = 3;

		this.moveT = 0.0;

		this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
			width:  this.width,
			height: this.height
		});

		this.dispKeys = {
			'left': [ 'Left', new b2Vec2(-0.3 * this.width, 0.0) ],
			'right': [ 'Right', new b2Vec2(0.3 * this.width, 0.0) ],
			'forward': [ 'Up', new b2Vec2(0.0, -this.height * 0.4) ],
			'reverse': [ 'Down', new b2Vec2(0.0, this.height * 0.4) ]
		};

		this.jpoints = BSWG.createBoxJPoints(this.width, this.height);

		BSWG.blockPolySmooth = 0.02;

		this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.8);
		this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
		BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

		BSWG.blockPolySmooth = 0.1;

		var poly = [
			new b2Vec2(-this.width * 0.5 * 0.75, -this.height * 0.5 * 0.0),
			new b2Vec2( this.width * 0.5 * 0.75, -this.height * 0.5 * 0.0),
			new b2Vec2( this.width * 0.3 * 0.75, -this.height * 0.5 * 0.75),
			new b2Vec2(-this.width * 0.3 * 0.75, -this.height * 0.5 * 0.75)
		].reverse();
		this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: poly, body: this.obj.body }, 0.8, new b2Vec2(0, -this.height * 0.5 * 0.75 * 0.5), 0.7);
		BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);
		
		var poly = [
			new b2Vec2(-this.width * 0.5 * 0.7, this.height * 0.5 * 0.75),
			new b2Vec2( this.width * 0.5 * 0.7, this.height * 0.5 * 0.75),
			new b2Vec2( this.width * 0.5 * 0.7, this.height * 0.5 * 0.05),
			new b2Vec2(-this.width * 0.5 * 0.7, this.height * 0.5 * 0.05)
		].reverse();

		this.meshObj3 = BSWG.generateBlockPolyMesh({ verts: poly, body: this.obj.body }, 0.8, new b2Vec2(0, this.height * 0.5 * 0.8 * 0.5), 0.7);
		BSWG.componentList.makeQueryable(this, this.meshObj3.mesh);

		BSWG.blockPolySmooth = null;
	},

	render: function(ctx, cam, dt) {

		if (this.moveT >= 0) {
			this.moveT -= dt;
		}
		else {
			this.moveT = 0.0;
		}

		if (this.grabT >= 0) {
			this.grabT -= dt;
		}
		else {
			this.grabT = 0.0;
		}

		this.meshObj.update([0.85, 0.85, 0.85, 1]);
		var l = (this.grabT/0.3) * 0.25 + 0.5;
		this.meshObj3.update([l, l, 0.68, 1], 3.0);
		var l = (this.moveT/0.3) * 0.25 + 0.35;
		this.meshObj2.update([l, 0.8, 0.9, 1], 3.0);

		this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
	},

	update: function(dt) {

		this.dispKeys['left'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.LEFT);
		this.dispKeys['right'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.RIGHT);
		this.dispKeys['forward'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.UP);
		this.dispKeys['reverse'][2] = BSWG.input.KEY_DOWN(BSWG.KEY.DOWN);

	},

	handleInput: function(keys) {

		var rot = 0;
		var accel = 0;

		if (keys[BSWG.KEY.LEFT]) rot -= 1;
		if (keys[BSWG.KEY.RIGHT]) rot += 1;

		if (keys[BSWG.KEY.UP]) accel -= 1;
		if (keys[BSWG.KEY.DOWN]) accel += 1;

		if (rot) {
			this.obj.body.SetAwake(true);
			this.obj.body.ApplyTorque(-rot*7.0);
			this.moveT = 0.21;
		}
		
		if (accel) {
			var a = this.obj.body.GetAngle() + Math.PI/2.0;
			accel *= 5.0;
			this.obj.body.SetAwake(true);
			var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
			this.obj.body.ApplyForceToCenter(force);
			this.moveT = 0.21;
		}

	},

};

BSWG.component_Blaster = {

	type: 'blaster',

	sortOrder: 2,

	hasConfig: true,

	init: function(args) {

		var offsetAngle = this.offsetAngle = 0.0;

		var verts = [
			Math.rotVec2(new b2Vec2(-0.225,  -0.3), offsetAngle),
			Math.rotVec2(new b2Vec2(-0.05,  1.0), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.05,  1.0), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.225,  -0.3), offsetAngle)
		].reverse();

		this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
			verts: verts
		});

		this.fireKey = args.fireKey || BSWG.KEY.SPACE;
		this.dispKeys = {
			'fire': [ '', new b2Vec2(0.0, 0.0) ],
		};

		this.jpoints = [ new b2Vec2(0.0, -0.3) ];

		this.thrustT = 0.0;
		this.kickBack = 0.0;

		this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.6, new b2Vec2((verts[0].x+verts[3].x)*0.5, -0.21));
		this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
		BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

	},

	render: function(ctx, cam, dt) {

		ctx.fillStyle = '#600';

		if (this.kickBack > 0.0) {
			BSWG.drawBlockPolyOffset = Math.rotVec2(new b2Vec2(0.0, -this.kickBack*0.1), this.obj.body.GetAngle());
			this.kickBack *= 0.65;
		}
		else {
			this.kickBack = 0.0;
		}

		this.meshObj.update([1.0, 0.6, 0.05, 1], 4);
		this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
		
		//BSWG.drawBlockPoly(ctx, this.obj, 0.5, null, BSWG.componentHoverFn(this));
		BSWG.drawBlockPolyOffset = null;

	},

	update: function(dt) {

		if (this.dispKeys) {
			this.dispKeys['fire'][0] = BSWG.KEY_NAMES[this.fireKey].toTitleCase();
			this.dispKeys['fire'][2] = BSWG.input.KEY_DOWN(this.fireKey);
		}

		if (this.fireT) {
			this.fireT -= dt;
			if (this.fireT <= 0)
				this.fireT = 0.0;
		}

	},

	openConfigMenu: function() {

		if (BSWG.compActiveConfMenu)
			BSWG.compActiveConfMenu.remove();

		var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

		var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 350, h: 50+32,
            key: this.fireKey,
            title: 'Blaster fire',
            close: function (key) {
            	if (key)
                	self.fireKey = key;
            }
        });

	},

	closeConfigMenu: function() {

	},

	handleInput: function(keys) {

		var accel = 0;

		if (keys[this.fireKey] && !this.fireT) {

			var a = this.obj.body.GetAngle() - Math.PI/2.0;
			var v = this.obj.body.GetLinearVelocity();

			var pl = new b2Vec2(0.0,  1.5);
			var p = BSWG.physics.localToWorld([pl], this.obj.body);

			BSWG.blasterList.add(p[0], new b2Vec2(-Math.cos(a)*15.0 + v.x, -Math.sin(a)*15.0 + v.y));
			accel = 1;

			this.fireT = 0.5;
			this.kickBack = 1.0;
		}
		
		if (accel)
		{
			var a = this.obj.body.GetAngle() + Math.PI/2.0;
			accel *= -8.0;
			this.obj.body.SetAwake(true);
			var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
			this.obj.body.ApplyForceToCenter(force);	
			this.thrustT = 0.3;
		}

	},

};

BSWG.component_Thruster = {

	type: 'thruster',

	sortOrder: 2,

	hasConfig: true,

	init: function(args) {

		var offsetAngle = this.offsetAngle = 0.0;

		var verts = [
			Math.rotVec2(new b2Vec2(-0.2, -0.5), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.2, -0.5), offsetAngle),
			Math.rotVec2(new b2Vec2( 0.4,  0.5), offsetAngle),
			Math.rotVec2(new b2Vec2(-0.4,  0.5), offsetAngle)
		];

		this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
			verts: verts
		});

		this.dispKeys = {
			'thrust': [ '', new b2Vec2(0.0, 0.0) ],
		};

		this.jpoints = [ new b2Vec2(0.0, 0.5) ];

		this.thrustKey = args.thrustKey || BSWG.KEY.UP;
		this.thrustT = 0.0;

		BSWG.blockPolySmooth = 0.1;

		this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.65, new b2Vec2((this.obj.verts[2].x + this.obj.verts[3].x) * 0.5,
														   					 (this.obj.verts[2].y + this.obj.verts[3].y) * 0.5 - 0.25));
		this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
		BSWG.blockPolySmooth = null;
		BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

	},

	render: function(ctx, cam, dt) {

		//ctx.fillStyle = '#282';
		//BSWG.drawBlockPoly(ctx, this.obj, 0.65, new b2Vec2((this.obj.verts[2].x + this.obj.verts[3].x) * 0.5,
		//												   (this.obj.verts[2].y + this.obj.verts[3].y) * 0.5 - 0.25),
		//				   BSWG.componentHoverFn(this));
		this.meshObj.update([0.1, 0.75, 0.8, 1], 1/0.75);
		this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
	},

	renderOver: function(ctx, cam, dt) {

		if (this.thrustT > 0) {

			var tpl = [
				Math.rotVec2(new b2Vec2(-0.15, -0.4), this.offsetAngle),
				Math.rotVec2(new b2Vec2( 0.0, -0.5 - this.thrustT * (2.0 + Math.random())), this.offsetAngle),
				Math.rotVec2(new b2Vec2( 0.15, -0.4), this.offsetAngle)
			];

			ctx.globalAlpha = Math.min(this.thrustT / 0.3, 1.0);

			var r = Math.random();
			if (r<0.5)
				ctx.fillStyle = '#f40';
			else if (r<0.75)
				ctx.fillStyle = '#ff0';
			else
				ctx.fillStyle = '#fff';

			BSWG.drawBlockPoly(ctx, {
				body: this.obj.body,
				verts: tpl
			}, 0.5, new b2Vec2(
				(tpl[0].x + tpl[2].x) * 0.5,
				(tpl[0].y + tpl[2].y) * 0.5
			));

			ctx.globalAlpha = 1.0;

			this.thrustT -= dt;

		}
		else
			this.thrustT = 0.0;

	},

	update: function(dt) {

		if (this.dispKeys) {
			this.dispKeys['thrust'][0] = BSWG.KEY_NAMES[this.thrustKey].toTitleCase();
			this.dispKeys['thrust'][2] = BSWG.input.KEY_DOWN(this.thrustKey);
		}

	},

	openConfigMenu: function() {

		if (BSWG.compActiveConfMenu)
			BSWG.compActiveConfMenu.remove();

		var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

		var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 350, h: 50+32,
            key: this.thrustKey,
            title: 'Thruster fire',
            close: function (key) {
            	if (key)
                	self.thrustKey = key;
            }
        });

	},

	closeConfigMenu: function() {

	},

	handleInput: function(keys) {

		var accel = 0;

		if (keys[this.thrustKey]) accel += 1;
		
		if (accel)
		{
			var a = this.obj.body.GetAngle() + Math.PI/2.0;
			accel *= 20.0;
			this.obj.body.SetAwake(true);
			var force = new b2Vec2(Math.cos(a)*accel, Math.sin(a)*accel);
			this.obj.body.ApplyForceToCenter(force);
			this.thrustT = 0.3;
		}

	},

};

BSWG.component_Block = {

	type: 'block',

	sortOrder: 3,

	hasConfig: false,

	init: function(args) {

		this.width    = args.width || 1;
		this.height   = args.height || 1;
		this.armour   = args.armour || false;
		this.triangle = args.triangle || 0;

		this.obj = BSWG.physics.createObject('box', args.pos, args.angle || 0, {
			width:    this.width,
			height:   this.height,
			triangle: this.triangle
		});

		this.jpoints = BSWG.createBoxJPoints(this.width, this.height, this.triangle);

		BSWG.blockPolySmooth = 0.03;
		this.meshObj = BSWG.generateBlockPolyMesh(this.obj, 0.7);
		this.selMeshObj = BSWG.genereteBlockPolyOutline(this.obj);
		BSWG.blockPolySmooth = null;
		BSWG.componentList.makeQueryable(this, this.meshObj.mesh);

	},

	render: function(ctx, cam, dt) {

		//ctx.fillStyle = '#444';
		//BSWG.drawBlockPoly(ctx, this.obj, 0.7, null, BSWG.componentHoverFn(this));
		this.meshObj.update([0.6,0.6,0.6,1]);
		this.selMeshObj.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);

	},

	update: function(dt) {

	},

};

BSWG.component_HingeHalf = {

	type: 'hingehalf',

	sortOrder: 1,

	hasConfig: true,

	init: function(args) {

		this.size   = args.size || 1;
		this.motor  = args.motor || false;
		this.rotKey = args.rotKey || (this.motor ? BSWG.KEY.A : BSWG.KEY.D);

		var verts = [
			//new b2Vec2(this.size * -0.5, this.size * -0.5),
			new b2Vec2(this.size *  0.5, this.size * -0.5),
			new b2Vec2(this.size *  0.95,             0.0),
			new b2Vec2(this.size *  0.5, this.size *  0.5),
			//new b2Vec2(this.size * -0.5, this.size *  0.5)
		];

		this.motorC = new b2Vec2(this.size * 1.0, 0.0);

		this.obj = BSWG.physics.createObject('polygon', args.pos, args.angle || 0, {
			verts: verts
		});

		this.jpoints = BSWG.createPolyJPoints(this.obj.verts, [0, 1], true);

		this.dispKeys = {
			'rotate': [ '', new b2Vec2(this.size * 0.75, 0.0) ],
		};

		var cjp = new b2Vec2(this.motorC.x, this.motorC.y);
		cjp.motorType = (this.motor ? 1 : 2) * 10 + this.size;
		this.jpoints.push(cjp)

		var len = Math.floor(this.size * 5 * (this.motor ? 2 : 1.5));
		this.cverts = new Array(len);
		var r = this.size * (this.motor ? 0.6 : 0.45) * 0.3;
		for (var i=0; i<len; i++) {
			var a = (i/len)*Math.PI*2.0;
			this.cverts[i] = new b2Vec2(
				this.motorC.x + Math.cos(a) * r,
				this.motorC.y + Math.sin(a) * r
			);
		}
		
		BSWG.blockPolySmooth = 0.05;
		this.meshObj1 = BSWG.generateBlockPolyMesh(this.obj, 0.7);
		this.selMeshObj1 = BSWG.genereteBlockPolyOutline(this.obj);
		BSWG.blockPolySmooth = null;
		BSWG.componentList.makeQueryable(this, this.meshObj1.mesh);
		this.meshObj2 = BSWG.generateBlockPolyMesh({ verts: this.cverts, body: this.obj.body }, 0.7, this.motorC, !this.motor ? 0.05 : 0.0, 0.05);
		this.selMeshObj2 = BSWG.genereteBlockPolyOutline({ verts: this.cverts, body: this.obj.body }, this.motorC);
		BSWG.componentList.makeQueryable(this, this.meshObj2.mesh);

	},

	render: function(ctx, cam, dt) {

		//ctx.fillStyle = '#353';
		//BSWG.drawBlockPoly(ctx, this.obj, 0.7, null, BSWG.componentHoverFn(this));

		if (this.motor) {
			//ctx.fillStyle = this.motor ? '#080' : '#aaa';
			//BSWG.drawBlockPoly(ctx, { verts: this.cverts, body: this.obj.body }, 0.7, this.motorC, BSWG.componentHoverFn(this));
		}

		this.selMeshObj1.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);
		this.selMeshObj2.update([0.5, 1.0, 0.5, BSWG.componentHoverFn(this) ? 0.4 : 0.0]);

		this.meshObj1.update([0.5, 0.6, 0.5, 1], 2);
		this.meshObj2.update(this.motor ? [0.1, 0.7, 0.8, 1] : [0.5, 0.5, 0.5, 1], 4);

	},

	renderOver: function(ctx, cam, dt) {

		if (!this.motor) {
			//ctx.fillStyle = this.motor ? '#080' : '#aaa';
			//BSWG.drawBlockPoly(ctx, { verts: this.cverts, body: this.obj.body }, 0.7, this.motorC, BSWG.componentHoverFn(this));
		}

	},

	openConfigMenu: function() {

		if (BSWG.compActiveConfMenu)
			BSWG.compActiveConfMenu.remove();

		var p = BSWG.game.cam.toScreen(BSWG.render.viewport, this.obj.body.GetWorldCenter());

		var self = this;
        BSWG.compActiveConfMenu = this.confm = new BSWG.uiControl(BSWG.control_KeyConfig, {
            x: p.x-150, y: p.y-25,
            w: 350, h: 50+32,
            key: this.rotKey,
            title: this.motor ? 'Hinge rotate' : 'Hinge rotate reverse',
            close: function (key) {
            	if (key)
                	self.rotKey = key;
            }
        });

	},

	closeConfigMenu: function() {

	},

	update: function(dt) {

		//if (this.dispKeys) {
			this.dispKeys['rotate'][0] = BSWG.KEY_NAMES[this.rotKey].toTitleCase();
			this.dispKeys['rotate'][2] = BSWG.input.KEY_DOWN(this.rotKey);
		//}

	},

	handleInput: function(keys) {

		var robj = null;
		for (var k in this.welds) {
			if (this.welds[k] && this.welds[k].obj.revolute) {
				robj = this.welds[k].obj;
				break;
			}
		}

		if (robj) {
			if (keys[this.rotKey]) {
				robj.joint.SetMotorSpeed(this.motor ? 1 : -1);
			}
		}

	},

};

BSWG.nextCompID = 1;
BSWG.component = function (desc, args) {

	this.handleInput = function(key) {};

	for (var key in desc)
		this[key] = desc[key];

	this.id = BSWG.nextCompID++;
	this.jpoints = new Array();
	this.jmatch = new Array();
	this.jmatch = -1;
	this.welds = new Object();
	this.onCC = null;
	if (this.type === 'cc')
		this.onCC = this;

	this.init(args);

	if (this.jpoints && this.jpoints.length && this.obj) {

		for (var i=0; i<this.jpoints.length; i++) {
			this.jpoints[i].x *= 1.0005;
			this.jpoints[i].y *= 1.0005;
		}

		this.jpointsNormals = new Array(this.jpoints.length);
		for (var i=0; i<this.jpointsNormals.length; i++) {
			this.jpointsNormals[i] = BSWG.physics.getNormalAt(this.obj, this.jpoints[i]);
		}

	}

	this.remove = function() {

		BSWG.componentList.remove(this);

	};

	this.removeSafe = function() {

		BSWG.componentList.compRemove.push(this);

	};

	this.baseRenderOver = function(ctx, cam, dt) {

		if (this.renderOver) {
			this.renderOver(ctx, cam, dt);
		}

		if (!this.jpointsw) {
			return;
		}

		/*var jp = BSWG.render.project3D(this.jpointsw, 0.0);

		var map = {};
		for (var i=0; i<this.jmatch.length; i++) {
			map[this.jmatch[i][0]] = this.jmatch[i][1].jpointsw[this.jmatch[i][2]];
		}

		for (var i=0; i<jp.length; i++) {

			if (!BSWG.game.editMode && !this.welds[i])
				continue;

			ctx.beginPath();
			var r = map[i]?(this.jmhover===i?160:110):80;
			if (this.welds[i] && this.jmhover !== i) {
				r = 110;
			}
        	ctx.arc(jp[i].x, jp[i].y, r * cam.z, 0, 2*Math.PI);
        	ctx.fillStyle = map[i]?(this.jmhover===i?'#2f2':'#8f8'):'#aaa';
            ctx.globalAlpha = 0.7;
        	if (this.welds[i])
        	{
        		ctx.fillStyle = '#ccf';
        		ctx.globalAlpha = 0.4;
        		if (this.jmhover === i) {
        			ctx.fillStyle = '#f22';
        		}
        	}
            ctx.fill();
            if (map[i]) {
            	ctx.strokeStyle = ctx.fillStyle;
            	ctx.lineWidth = 2.0;
            	ctx.globalAlpha = 0.25;
            	var p2s = cam.toScreen(BSWG.render.viewport, map[i]);
            	ctx.beginPath();
            	ctx.moveTo(jp[i].x, jp[i].y);
            	ctx.lineTo(p2s.x, p2s.y);
            	ctx.closePath();
            	ctx.stroke();
            	ctx.lineWidth = 1.0;
            }

	   		ctx.globalAlpha = 1.0;
	   	}*/

	   	if (this.dispKeys && BSWG.game.showControls && this.onCC === BSWG.game.ccblock) {
	   		for (var key in this.dispKeys) {
	   			var info = this.dispKeys[key];
	   			if (info) {
	   				var text = info[0];
	   				var rot = 0.0;
	   				/*if (text === 'Left') {
	   					text = '<-';
	   				}
	   				else if (text === 'Right') {
	   					text = '->';
	   				}
	   				else if (text === 'Up') {
	   					text = '<-';
	   					rot = Math.PI/2.0;
	   				}
	   				else if (text === 'Down') {
	   					text = '->';
	   					rot = Math.PI/2.0;
	   				}*/

	   				var p = BSWG.render.project3D(BSWG.physics.localToWorld(info[1], this.obj.body), 0.0);
	   				var w = Math.floor(8 * 2 + ctx.textWidthB(text)+1.0);
	   				ctx.globalAlpha = 0.25;
	   				ctx.fillStyle = '#444';
	   				BSWG.draw3DRect(ctx, p.x - w * 0.5, p.y - 10, w, 20, 3, info[2] || false);

	   				ctx.save();

	   				ctx.translate(Math.floor(p.x), Math.floor(p.y));
	   				ctx.rotate(rot);
	   				ctx.translate(0, 3);

	   				ctx.font = '11px Orbitron';
	   				ctx.globalAlpha = 1.0;
	   				ctx.fillStyle = info[2] ? '#fff' : '#000';
	   				ctx.textAlign = 'center';
	   				ctx.fillText(text, 0, 0);
	   				ctx.textAlign = 'left';

	   				ctx.restore();
	   			}
	   		}
	   	}

	};

	this.cacheJPW = function() {
		if (this.jpointsw) {
			this.jpointsw = null;
		}
		this.jpointsw = BSWG.physics.localToWorld(this.jpoints, this.obj.body);
		for (var i=0; i<this.jpoints.length; i++) {
			this.jpointsw[i].motorType = this.jpoints[i].motorType || 0;
		}
		this.jmhover = -1;
	};

	this.updateJCache = function() {

		if (!BSWG.game.editMode) {
			return;
		}

		if (!this.jpointsw) {
			return;
		}

		this.jmatch = new Array();
		this.jmhover = -1;

		var _p = this.obj.body.GetWorldCenter();
		var p = new b2Vec2(_p.x, _p.y);
		var cl = BSWG.componentList.withinRadius(p, this.obj.radius+0.5);

		var jpw = this.jpointsw;

        var mps = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
        var mp = BSWG.render.unproject3D(mps, 0.0);

        var mind = 10.0;
        for (var i=0; i<jpw.length; i++) {
        	var tp = jpw[i];
        	var d = Math.pow(tp.x - mp.x, 2.0) +
        			Math.pow(tp.y - mp.y, 2.0);
        	if (d < mind)
        	{
        		this.jmhover = i;
        		mind = d;
        	}
        }
        if (mind > BSWG.component_jMatchClickRange || BSWG.compActiveConfMenu) {
        	this.jmhover = -1;
        }

		for (var i=0; i<cl.length; i++) {
			if (cl[i] !== this && BSWG.physics.bodyDistance(this.obj.body, cl[i].obj.body) < 1.0) {
				var jpw2 = cl[i].jpointsw;

				for (var k1=0; k1<jpw.length; k1++)
					for (var k2=0; k2<jpw2.length; k2++)
					{
						var p1 = jpw[k1];
						var p2 = jpw2[k2];
						var d2 = Math.pow(p1.x - p2.x, 2.0) +
								 Math.pow(p1.y - p2.y, 2.0);
						if ((p1.motorType && !p2.motorType) || (p2.motorType && !p1.motorType) ||
							(p1.motorType && p1.motorType === p2.motorType) ||
							(p1.motorType && (p1.motorType%10) != (p2.motorType%10))) {
							continue;
						}
						if (d2 < BSWG.component_minJMatch) {
							this.jmatch.push([
								k1, cl[i], k2, p1.motorType || 0, p2.motorType || 0
							]);
							if (cl[i].jmhover === k2) {
								this.jmhover = k1;
							}
							else if (this.jmhover === k1) {
								cl[i].jmhover = k2;
							}
							break;
						}
					}
			}
		}		
	}	

	this.baseUpdate = function(dt) {

		if (!BSWG.game.editMode) {
			return;
		}

		if (!this.jpointsw || !this.jmatch) {
			return;
		}

		if (this.jmhover >= 0 && BSWG.input.MOUSE_PRESSED('left') && !BSWG.input.MOUSE('shift')) {
			for (var i=0; i<this.jmatch.length; i++) {
				if (this.jmatch[i][0] === this.jmhover && this.jmatch[i][1].id > this.id) {
					if (!this.welds[this.jmatch[i][0]]) {
						var obj = BSWG.physics.createWeld(this.obj.body, this.jmatch[i][1].obj.body,
														  this.jpoints[this.jmatch[i][0]],
														  this.jmatch[i][1].jpoints[this.jmatch[i][2]],
														  true,
														  this.jpointsNormals[this.jmatch[i][0]],
														  this.jmatch[i][1].jpointsNormals[this.jmatch[i][2]],
														  this.jmatch[i][3],
														  this.jmatch[i][4]
														  );

						if (this.onCC && !this.jmatch[i][1].onCC) {
							this.jmatch[i][1].onCC = this.onCC;
						}
						if (!this.onCC && this.jmatch[i][1].onCC) {
							this.onCC = this.jmatch[i][1].onCC;
						}

						this.welds[this.jmatch[i][0]] = { obj: obj, other: this.jmatch[i][1] };
						this.jmatch[i][1].welds[this.jmatch[i][2]] = { obj: obj, other: this };

						BSWG.updateOnCC(this, this.jmatch[i][1]);

						var p2 = this.jmatch[i][1].jpointsw[this.jmatch[i][2]];
						var p1 = this.jpointsw[this.jmatch[i][0]];

						BSWG.render.blueBoom.add(
							BSWG.game.cam.wrapToScreen(BSWG.render.viewport, {x: (p1.x+p2.x)*0.5, y: (p1.y+p2.y)*0.5}),
							BSWG.game.cam.wrapToScreenSize(BSWG.render.viewport, 0.75),
							32,
							0.4,
							1.0
						);

						BSWG.input.EAT_MOUSE('left');
					}
					else {
						BSWG.physics.removeWeld(this.welds[this.jmatch[i][0]].obj);
						this.welds[this.jmatch[i][0]].other = null;
						this.welds[this.jmatch[i][0]] = null;
						this.jmatch[i][1].welds[this.jmatch[i][2]].other = null;
						this.jmatch[i][1].welds[this.jmatch[i][2]] = null;	

						BSWG.updateOnCC(this, this.jmatch[i][1]);

						BSWG.render.boom.add(
							BSWG.game.cam.wrapToScreen(BSWG.render.viewport, this.jpointsw[this.jmatch[i][0]]),
							BSWG.game.cam.wrapToScreenSize(BSWG.render.viewport, 1.25),
							32,
							0.4,
							1.0
						);

						BSWG.input.EAT_MOUSE('left');
					}
				}
			}
		}

		for (var k in this.welds) {
			if (this.welds[k] && this.welds[k].obj.broken) {
				var other = this.welds[k].other;
				var k2;
				for (k2 in other.welds) {
					if (other.welds[k2] && other.welds[k2].obj === this.welds[k].obj) {
						BSWG.physics.removeWeld(this.welds[k].obj);
						this.welds[k].other = null;
						this.welds[k] = null;
						other.welds[k2].other = null;
						other.welds[k2] = null;	
						BSWG.updateOnCC(this, other);
						break;
					}
				}
			}
		}

	};

	this.pointIn = function(p) {

		return !!this.obj.fixture.TestPoint(p);

	};

	this.getLocalPoint = function(p) {

		var p2 = this.obj.body.GetLocalPoint(p);
		return new b2Vec2(p2.x, p2.y);

	};

	this.getWorldPoint = function(p) {

		var p2 = this.obj.body.GetWorldPoint(p);
		return new b2Vec2(p2.x, p2.y);

	};

	this.addForce = function (f, p) {

		if (!p)
			this.obj.body.ApplyForceToCenter(f);
		else
			this.obj.body.ApplyForce(f, p);

	};

	BSWG.componentList.add(this);

};

BSWG.componentList = new function () {

	this.compList = new Array();
	this.compRemove = new Array();

	this.clear = function () {

		while (this.compList.length) {
			this.compList[0].remove();
		}

		this.compRemove.length = 0;

	};

	this.add = function (comp) {

		this.compList.push(comp);
		this.compList.sort(function(a,b){

			return a.sortOrder - b.sortOrder;

		});
		return true;

	};

	this.remove = function (comp) {

		for (var i=0; i<this.compList.length; i++)
			if (this.compList[i] === comp) {
				this.compList.splice(i, 1);
				return true;
			}
		return false;

	};

	this.handleInput = function (cc, keys) {

		var len = this.compList.length;
		for (var i=0; i<len; i++) {
			if (!cc || this.compList[i].onCC === cc) {
				this.compList[i].handleInput(keys);
			}
		}

		if (this.mouseOver && this.mouseOver.openConfigMenu && this.mouseOver.onCC && BSWG.game.editMode) {
			if (BSWG.input.MOUSE_PRESSED('left') && BSWG.input.MOUSE('shift')) {
				BSWG.input.EAT_MOUSE('left');
		 		this.mouseOver.openConfigMenu();
		 	}
		 	else if (BSWG.input.MOUSE_PRESSED('right')) {
				BSWG.input.EAT_MOUSE('right');
		 		this.mouseOver.openConfigMenu();
		 	}

		}

	};

	this.update = function (dt) {

		var len = this.compList.length;
		for (var i=0; i<len; i++) {
			this.compList[i].cacheJPW();
		}
		for (var i=0; i<len; i++) {
			this.compList[i].updateJCache();
		}
		for (var i=0; i<len; i++) {
			this.compList[i].baseUpdate(dt);
			this.compList[i].update(dt);
		}

		len = this.compRemove.length;
		for (var i=0; i<len; i++) {
			this.remove(this.compRemove[i]);
		}
		this.compRemove.length = 0;

	};

	this.render = function (ctx, cam, dt) {

		var p = new b2Vec2(BSWG.input.MOUSE('x'), BSWG.input.MOUSE('y'));
		var pw = BSWG.render.unproject3D(p, 0.0);
		var len = this.compList.length;

		this.mouseOver = null;
		for (var i=0; i<len; i++) {
			if (this.compList[i].confm && this.compList[i].confm === BSWG.compActiveConfMenu) {
				this.mouseOver = this.compList[i];
				break;
			}
			if (BSWG.game.grabbedBlock === this.compList[i]) {
				this.mouseOver = this.compList[i];
				break;
			}
		}
		if (!this.mouseOver) {
			this.mouseOver = this.atPoint(pw);
		}

		for (var i=0; i<len; i++) {
			this.compList[i].render(ctx, cam, dt);
		}
		for (var i=0; i<len; i++) {
			this.compList[i].baseRenderOver(ctx, cam, dt);
		}

		BSWG.jpointRenderer.render();
	};

	this.atPoint = function (p) {

		var raycaster = BSWG.render.raycaster;

		raycaster.set(new THREE.Vector3(p.x, p.y, 0.4), new THREE.Vector3(0.0, 0.0, -1.0));

		var len = this.compList.length;
		for (var i=0; i<len; i++) {
			if (raycaster.intersectObjects(this.compList[i].queryMeshes).length > 0) {
				return this.compList[i];
			}
		}
		return null;

	};

	this.makeQueryable = function (comp, mesh) {

		mesh.__compid = comp.id;
		comp.queryMeshes = comp.queryMeshes || new Array();
		comp.queryMeshes.push(mesh);
		return true;

	};

	this.removeQueryable = function (comp, mesh) {

		if (!comp.queryMeshes) {
			return false;
		}
		for (var i=0; i<comp.queryMeshes.length; i++) {
			if (comp.queryMeshes[i].__compid === comp.id) {
				comp.queryMeshes.splice(i, 1);
				return true;
			}
		}
		return false;

	};

	this.withinRadius = function (p, r) {
		var ret = new Array();
		var len = this.compList.length;
		for (var i=0; i<len; i++) {
			var p2 = this.compList[i].obj.body.GetWorldCenter();
			var dist = Math.pow(p2.x - p.x, 2.0) +
					   Math.pow(p2.y - p.y, 2.0);
			if (dist < Math.pow(r+this.compList[i].obj.radius, 2.0))
				ret.push(this.compList[i]);
		}
		return ret;
	}

}();