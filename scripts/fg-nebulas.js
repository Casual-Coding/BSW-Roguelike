// BSWR - Foreground Nebulas

BSWG.nebulas = function(map){

    var nebulaImg = [];
    for (var i=0; i<15; i++) {
        nebulaImg.push(BSWG.render.images['nebula_' + i]);
    }
    var nebula = BSWG.render.proceduralImage(1024, 1024, function(ctx, w, h){

        for (var i=0; i<400; i++) {
            var x = Math.random()*w, y = Math.random()*h;
            var img = nebulaImg[~~(Math.random()*nebulaImg.length)];
            var iw = img.width*0.5, ih = img.height*0.5;
            ctx.drawImage(img, x-iw, y-ih);
            ctx.drawImage(img, x-w-iw, y-ih);
            ctx.drawImage(img, x+w-iw, y-ih);
            ctx.drawImage(img, x-iw, y-h-ih);
            ctx.drawImage(img, x-iw, y+h-ih);
            ctx.drawImage(img, x-w-iw, y-h-ih);
            ctx.drawImage(img, x+w-iw, y+h-ih);
            ctx.drawImage(img, x-iw+w, y-h-ih);
            ctx.drawImage(img, x-iw-w, y+h-ih);

        }

    });

    /*var merge = function(imgList, iw, ih) { return function(ctx, w, h) {

        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = 1.0;

        for (var i=0; i<imgList.length; i++) {
            var x = i % (w/iw);
            var y = (i-x) / (w/ih);
            ctx.drawImage(imgList[i], x*iw, y*ih);
        }

    } };;*/

    //var nebulaImgMerge = BSWG.render.proceduralImage(2048, 2048, merge(nebulaImg, 512, 512));

    /*nebulaImgMerge.texture.wrapS = THREE.ClampToEdgeWrapping;
    nebulaImgMerge.texture.wrapT = THREE.ClampToEdgeWrapping;
    nebulaImgMerge.texture.magFilter = THREE.NearestFilter;
    nebulaImgMerge.texture.minFilter = THREE.LinearFilter;
    nebulaImgMerge.texture.needsUpdate = true;*/

    var edgeMap = BSWG.render.proceduralImage(map.size, map.size, function(ctx, w, h){
        ctx.globalAlpha = 1.0;
        map.renderEdgeMap(ctx, '#fff', false, 1);
    });

    edgeMap.texture.wrapS = THREE.ClampToEdgeWrapping;
    edgeMap.texture.wrapT = THREE.ClampToEdgeWrapping;
    edgeMap.texture.magFilter = THREE.LinearFilter;
    edgeMap.texture.minFilter = THREE.LinearFilter;
    edgeMap.texture.needsUpdate = true;

    var geom = new THREE.PlaneGeometry(2.0, 2.0, 1, 1);

    var mat = BSWG.render.newMaterial("bgVertex", "fgFragment", {
        cam: {
            type: 'v3',
            value: new THREE.Vector3(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z)
        },
        vp: {
            type: 'v2',
            value: new THREE.Vector2(BSWG.render.viewport.w, BSWG.render.viewport.h)
        },
        tPerlin: {
            type: 't',
            value: BSWG.render.images['grass_nm'].texture
        },
        tNebula: {
            type: 't',
            value: nebula.texture
        },
        tMap: {
            type: 't',
            value: edgeMap.texture
        },
        mapInfo: {
            type: 'v4',
            value: new THREE.Vector4(
                map.size,
                map.gridSize,
                map.zones.length,
                BSWG.render.time
            )
        },
        zpos: {
            type: 'f',
            value: 0.01
        }
    }, THREE.AdditiveBlending);

    var mesh = new THREE.Mesh( geom, mat );
    mesh.frustumCulled = false;
    mesh.position.set(-1.0, -1.0, 15.0);
    mesh.updateMatrix();
    
    mesh.needsUpdate = true;
    mat.needsUpdate = true;        
    
    BSWG.render.scene.add( mesh );

    this.render = function(ctx, cam, viewport) {

        mesh.position.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.render.cam3D.position.z-0.001);
        mesh.updateMatrix();

        mat.uniforms.cam.value.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z);
        mat.uniforms.vp.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);
        mat.uniforms.mapInfo.value.w = BSWG.render.time

    };

    this.destroy = function() {

        BSWG.render.scene.remove( mesh );

        mesh.geometry.dispose();
        mesh.material.dispose();
        mesh.geometry = null;
        mesh.material = null;
        mesh = null;
        mat = null;
        geom = null;

    };

};