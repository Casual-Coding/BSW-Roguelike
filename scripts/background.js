// BSWR - Starfield/Background

BSWG.starfield = function(){

    var dustCount = 16;
    var dustImageSize = 512;
    var dustImages = [];

    var starImg = [];
    for (var i=0; i<15; i++) {
        starImg.push(BSWG.render.images['stars_' + i]);
    }
    var nebulaImg = [];
    for (var i=0; i<15; i++) {
        nebulaImg.push(BSWG.render.images['nebula_' + i]);
    }

    Math.seedrandom(666);

    for (var i=0; i<dustCount; i++) {
        dustImages.push(BSWG.render.proceduralImage(dustImageSize, dustImageSize, function(ctx, w, h){

            ctx.clearRect(0, 0, w, h);

            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#fff';

            for (var k=0; k<90; k++) {
                ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2);
            }

        }));
    }

    var merge = function(imgList, iw, ih) { return function(ctx, w, h) {

        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = 1.0;

        for (var i=0; i<imgList.length; i++) {
            var x = i % (w/iw);
            var y = (i-x) / (w/ih);
            ctx.drawImage(imgList[i], x*iw, y*ih);
        }

    } };; 

    var starImgMerge = BSWG.render.proceduralImage(2048, 2048, merge(starImg, 512, 512));
    var nebulaImgMerge = BSWG.render.proceduralImage(2048, 2048, merge(nebulaImg, 512, 512));
    var dustImgMerge = BSWG.render.proceduralImage(2048, 2048, merge(dustImages, 512, 512));

    nebulaImgMerge.texture.wrapS = THREE.ClampToEdgeWrapping;
    nebulaImgMerge.texture.wrapT = THREE.ClampToEdgeWrapping;
    nebulaImgMerge.texture.magFilter = THREE.NearestFilter;
    nebulaImgMerge.texture.minFilter = THREE.LinearFilter;
    nebulaImgMerge.texture.needsUpdate = true;

    var bgGeom = new THREE.PlaneGeometry(2.0, 2.0, 1, 1);

    var bgMat = BSWG.render.newMaterial("bgVertex", "bgFragmentOptimized", {
        cam: {
            type: 'v3',
            value: new THREE.Vector3(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z)
        },
        vp: {
            type: 'v2',
            value: new THREE.Vector2(BSWG.render.viewport.w, BSWG.render.viewport.h)
        },
        tStars: {
            type: 't',
            value: starImgMerge.texture
        },
        tNebula: {
            type: 't',
            value: nebulaImgMerge.texture
        },
        tDust: {
            type: 't',
            value: dustImgMerge.texture
        }
    });

    var bgMesh = new THREE.Mesh( bgGeom, bgMat );
    bgMesh.frustumCulled = false;
    bgMesh.position.set(-1.0, -1.0, -0.5);
    bgMesh.updateMatrix();
    
    bgMesh.needsUpdate = true;
    bgMat.needsUpdate = true;        
    
    BSWG.render.scene.add( bgMesh );

    this.render = function(ctx, cam, viewport) {

        bgMat.uniforms.cam.value.set(BSWG.game.cam.x, BSWG.game.cam.y, BSWG.game.cam.z);
        bgMat.uniforms.vp.value.set(BSWG.render.viewport.w, BSWG.render.viewport.h);

    };

};