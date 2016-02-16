BSWG.blasterList = new function () {

	this.list = [];
	this.clear = function () {
		this.list.length = 0;
	};

	this.updateRender = function (ctx, cam, dt) {

		for (var i=0; i<this.list.length; i++) {

			var B = this.list[i];
			var ox = B.p.x, oy = B.p.y;
			B.p.x += B.v.x * dt;
			B.p.y += B.v.y * dt;
			B.t -= dt;

			var comp = null;
			if (B.t <= 0.0 || (comp=BSWG.componentList.atPoint(B.p))) {
				if (B.t > 0.0) {
					BSWG.render.boom.add(
						cam.wrapToScreen(BSWG.render.viewport, {x: (ox+B.p.x)*0.5, y: (oy+B.p.y)*0.5}),
						cam.wrapToScreenSize(BSWG.render.viewport, 1.25),
						32,
						0.4,
						1.0,
						new b2Vec2(comp.obj.body.GetLinearVelocity().x, comp.obj.body.GetLinearVelocity().y)
					);
				}
				this.list.splice(i, 1);
				i -= 1;
				continue;
			}

			var t = Math.min(B.t * 4.0, 1.0);

			var p = cam.toScreen(BSWG.render.viewport, B.p);

			ctx.lineWidth = 2.5;
			ctx.globalAlpha = t * 0.75;
			ctx.strokeStyle = Math.random() < 0.5 ? '#fff' : '#f11';
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(p.x - B.v.x * dt * cam.z * 5000.0, p.y - B.v.y * dt * cam.z * 5000.0);
			ctx.stroke();
		}
		ctx.globalAlpha = 1.0;
		ctx.lineWidth = 1.0;

	};

	this.add = function (p, v) {

		this.list.push({

			p: p,
			v: v,
			t: 2.0

		});

	};

}();