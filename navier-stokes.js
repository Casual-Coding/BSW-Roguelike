// From: http://codepen.io/FWeinb/pen/JhzvI (Fabrice Weinberg)

// Based on http://www.dgp.toronto.edu/people/stam/reality/Research/pdf/GDC03.pdf
var NavierStokes = function(settings){
    this.init(settings);
};

NavierStokes.prototype = {

        init : function(settings){
         var defaultSettings = {
                  resolution     : 64,
                  iterations     : 10,
                  fract          : 1/4,
                  diffusion      : 1,
                  gridmodify     : 0,
                  dt             : 0.1
          };

          if (this.settings === undefined){
                this.settings = defaultSettings;
          }

          this._mergeRecursive(this.settings, settings);

          this.rows                 =    this.settings.resolution      + 2;
          this.arraySize            =   (this.settings.resolution+2)*(this.settings.resolution+2);


          this.U          = new Float32Array(this.arraySize);
          this.V          = new Float32Array(this.arraySize);
          this.D          = new Float32Array(this.arraySize);

          this.U_prev     = new Float32Array(this.arraySize);
          this.V_prev     = new Float32Array(this.arraySize);
          this.D_prev     = new Float32Array(this.arraySize);

          this.NullArray  = new Float32Array(this.arraySize);


          // Precalculate lookup table for 2D > 1D array.
          this.IX = new Array(this.rows);
          for (var i = 0; i < this.rows; i++){
              this.IX[i] = new Array(this.rows);
              for (var b = 0; b < this.rows; b++){
                  this.IX[i][b] = i+b*this.rows;
              }
          }
          // Init all Arrays.
          for (i = 0; i < this.arraySize; i++){
              this.D_prev[i] = this.U_prev[i] = this.V_prev[i] = this.D[i] = this.U[i] = this.V[i] = this.NullArray[i] = 0.0;
          }

          //Init some vars based on the Resolution settings:
          this.calculateSettings();
        },
        clear : function(){
            this.D.set(this.NullArray);
            this.U.set(this.NullArray);
            this.V.set(this.NullArray);
        },
        // Getter Setter
        getResolution : function(){
            return this.settings.resolution;
        },

        getSettings : function(){
            return this.settings;
        },

        update : function(callback1, callback2){
             // Add user Action
            this.userAction(callback1);

            // Cals velosity & density
            this.vel_step  (this.U, this.V, this.U_prev, this.V_prev, this.settings.dt );
            this.dens_step (this.D, this.D_prev, this.U, this.V, this.settings.dt );

            callback2(this.D, this.U, this.V, this.settings.resolution);
        },

        calculateSettings : function(){
            this.centerPos = (-0.5/this.settings.resolution) * (1 + this.settings.gridmodify);
            this.scale = this.settings.resolution * 0.5;
            this.dt0 = this.settings.dt * this.settings.resolution;
            this.p5 = this.settings.resolution + 0.5;
        },

        userAction : function (callback){
            this.D_prev.set(this.NullArray);
            this.U_prev.set(this.NullArray);
            this.V_prev.set(this.NullArray);
          
            callback(this.D_prev, this.U_prev, this.V_prev, this.settings.resolution);
        },
        vel_step : function (u, v, u0,  v0, dt ){
            var tmp;

            this.add_source(u, u0, dt );
            this.add_source(v, v0, dt );

            tmp = u0;
            u0 = u;
            u = tmp;
            this.diffuse ( 1, u, u0, dt );


            tmp = v0;
            v0 = v;
            v = tmp;
            this.diffuse ( 2, v, v0, dt );

            this.project(u, v, u0, v0);

            tmp = u0;
            u0 = u;
            u = tmp;

            tmp = v0;
            v0 = v;
            v = tmp;
            this.advect(1, u, u0, u0, v0, dt);
            this.advect(2, v, v0, u0, v0, dt);

            this.project(u, v, u0, v0 );
        },

        dens_step : function (x, x0, u, v,  dt){
            var tmp;
            this.add_source (x, x0, dt);
            //SWAP ( x0, x );
            this.diffuse (0, x0, x,  dt );
            //SWAP ( x0, x );
            this.advect ( 0, x, x0, u, v, dt );
        },

        add_source : function (x, s, dt){
            for (var i=0; i<this.arraySize ; i++ ){
                x[i] += dt * s[i];
            }
        },


        diffuse : function (b,  x,  x0,  dt){
            for (var i=1; i < this.arraySize;i++){
                x[i] = x0[i]*this.settings.diffusion;
            }
            this.set_bnd(b, x);
         },

        project : function ( u, v, p, div )  {
            var i, k,prevRow, thisRow, nextValue, nextRow, to, lastRow;
            for (i = 1 ; i <= this.settings.resolution; i++ ){
                prevRow   = this.IX[0][i-1];
                thisRow   = this.IX[0][i];
                nextRow   = this.IX[0][i+1];

                valueBefore  = thisRow - 1;
                valueNext    = thisRow + 1;

                to = this.settings.resolution + valueNext;
                for (k = valueNext; k < to; k++ ) {
                    p[k] = 0;
                    div[k] = (u[++valueNext] - u[++valueBefore] + v[++nextRow] - v[++prevRow]) * this.centerPos;
                }
            }

            this.set_bnd(0, div);
            this.set_bnd(0, p);

            for (k=0 ; k<this.settings.iterations; k++) {
                for (j=1 ; j<=this.settings.resolution; j++) {
                    lastRow = this.IX[0][j-1];
                    thisRow = this.IX[0][j];
                    nextRow = this.IX[0][j+1];
                    prevX = p[thisRow];
                    thisRow++;
                    for (i=1; i<=this.settings.resolution; i++){
                        p[thisRow] = prevX = (div[thisRow] + p[++lastRow] + p[++thisRow] + p[++nextRow] + prevX ) * this.settings.fract;
                    }
                }
                this.set_bnd(0, p);
            }

            for (j = 1; j <=  this.settings.resolution; j++ ) {
                lastRow =  this.IX[0][j-1];
                thisRow =  this.IX[0][j];
                nextRow =  this.IX[0][j+1];

                valueBefore  = thisRow - 1;
                valueNext    = thisRow + 1;

                for (i = 1; i <=  this.settings.resolution; i++) {
                    u[++thisRow] -= this.scale * (p[++valueNext] - p[++valueBefore]);
                    v[thisRow]   -= this.scale * (p[++nextRow]   - p[++lastRow]);
                }
            }
            this.set_bnd(1, u);
            this.set_bnd(2, v);
        },

        advect : function (b, d, d0, u, v, dt ){
            var to;
            for (var j = 1; j<= this.settings.resolution; j++) {
                var pos = j * this.rows;
                for (var k = 1; k <= this.settings.resolution; k++) {
                    var x = k - this.dt0 * u[++pos];
                    var y = j - this.dt0 * v[pos];

                    if (x < 0.5) x = 0.5
                    if (x > this.p5) x = this.p5;

                    var i0 = x | 0;
                    var i1 = i0 + 1;

                    if (y < 0.5) y = 0.5
                    if (y > this.p5) y = this.p5;

                    var j0 = y | 0;
                    var j1 = j0 + 1;
                    var s1 = x - i0;
                    var s0 = 1 - s1;
                    var t1 = y - j0;
                    var t0 = 1 - t1;
                    var toR1 = this.IX[0][j0];
                    var toR2 = this.IX[0][j1];
                    d[pos] = s0 * (t0 * d0[i0 + toR1] + t1 * d0[i0 + toR2]) + s1 * (t0 * d0[i1 + toR1] + t1 * d0[i1 + toR2]);
                }
            }
            this.set_bnd(b, d);
        },
        // Calculate Boundary's
        set_bnd : function (b, x ){
            var i, j;
            switch (b){
                case 1 :
                    for (i = 1; i <= this.settings.resolution; i++) {
                        x[i] =  x[i + this.rows];
                        x[this.IX[i][(this.settings.resolution+1)]] = x[this.IX[i][(this.settings.resolution)]];
                        x[this.IX[0][i]] = -x[this.IX[1][i]];
                        x[this.IX[(this.settings.resolution+1)][i]] = -x[this.IX[(this.settings.resolution)][i]];
                    }
                    break;
                case 2 :
                   for ( i = 1; i <= this.settings.resolution; i++) {
                        x[i] = -x[i + this.rows];
                        x[this.IX[i][(this.settings.resolution+1)]] = -x[this.IX[i][(this.settings.resolution)]];
                        x[this.IX[0][i]]                                            =  x[this.IX[1][i]];
                        x[this.IX[(this.settings.resolution+1)][i]] =  x[this.IX[(this.settings.resolution)][i]];
                    }
                    break;
                default :
                    for ( i = 1; i <= this.settings.resolution; i++) {
                        x[i] =  x[i + this.rows];
                        x[this.IX[i][(this.settings.resolution+1)]]       =   x[this.IX[i][(this.settings.resolution)]];
                        x[this.IX[0][i]]                                                        =   x[this.IX[1][i]];
                        x[this.IX[(this.settings.resolution+1)][i]]       =   x[this.IX[(this.settings.resolution)][i]];
                    }
            }
                        // Boundes of the Canvas
            var topPos                                    = this.IX[0][this.settings.resolution+1];
            x[0]                                            = (x[1] + x[this.rows]) / 2;
            x[topPos]                                       = (x[1 + topPos] + x[this.IX[this.settings.resolution][0]]) / 2;
            x[(this.settings.resolution+1)]           = (x[this.settings.resolution] + x[(this.settings.resolution + 1) + this.rows]) / 2;
            x[(this.settings.resolution+1)+topPos]    = (x[this.settings.resolution + topPos] + x[this.IX[this.settings.resolution+1][this.settings.resolution]]);

        },
        // Merge Settings.
         _mergeRecursive : function(obj1, obj2) {
              for (var p in obj2) {
                  if ( obj2[p].constructor==Object ) {
                    obj1[p] = this._mergeRecursive(obj1[p], obj2[p]);
                  } else {
                    obj1[p] = obj2[p];
                  }
              }
              return obj1;
        }
};

module.exports = {
  NavierStokes: NavierStokes
};