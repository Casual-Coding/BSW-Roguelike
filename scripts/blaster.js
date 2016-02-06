BSWG.blasterList = new function () {

	this.list = [];
	this.clear = function () {
		this.list.length = 0;
	};

	this.updateRender = function (ctx, cam, dt) {

		for (var i=0; i<this.list.length; i++) {

			var B = this.list[i];
			B.p.x += B.v.x * dt;
			B.p.y += B.v.y * dt;
			B.t -= dt;

			if (B.t <= 0.0 || BSWG.componentList.atPoint(B.p)) {
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