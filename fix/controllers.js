'use strict';

angular.module('VGG')

  .controller('MainController', function($rootScope, $state, $window, $modal, $scope, Comercio, Categoria  ) {

    /**
     * Clasificados modal
     */

    $scope.irClasificados = function() {

      $modal.open({
        templateUrl: 'views/clasificados/intro.html',
        controller: function($scope) {

        }
      });

    };

    var entered = $window.sessionStorage['entered'];

    if (!entered) {

      $modal.open({

        templateUrl: 'views/like.html',
        size: 'md',
        controller: function($scope) {

          $scope.message = "Seguinos en facebook!";

          $scope.seguir = function() {

            $window.sessionStorage['entered'] = true;
            $scope.$close();

          };

        }

      });

    }

    $scope.rubros = [];

    Categoria.find(function(data) {

      $scope.rubros = data;

    });

    $scope.comercios = [];

    function shuffle(array) {

      var currentIndex = array.length, temporaryValue, randomIndex ;

        while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;

      }

      return array;

    }

    Comercio.find(function(data) {

      $scope.comercios = shuffle(data);

      console.log($scope.comercios);

    });

    $scope.buscar = function() {

      var query = $scope.consulta.toLowerCase();

      var nameQuery = $scope.consulta.toUpperCase();

      console.log(query);

      Comercio.find({

        filter: {

          where: {

            or:

              [

                {

                  nombre: {

                    like: nameQuery

                  }

                },

                {

                  descripcion: {

                    like: query

                  }

                },

                {

                  promocion: {

                    like: query

                  }

                }

              ]

          }

        }

      }, function(data) {

        $scope.resultados = data;

        console.log($scope.resultados);

        $state.go('app.busqueda', {
          params: {
            consulta: $scope.consulta
          }
        });

      }, function(err) {

        console.log(err);

      });

    }

  })

  .controller('AdminController', function($scope) {


  })

  .controller('ComercioController', function($scope, $http, $modal, $stateParams, Comercio, Categoria, Mail) {

    if ($stateParams.consulta) {

      $scope.merca = $stateParams.consulta;

    }

    if ($stateParams.rubroId) {

      $scope.rubro = Categoria.findById({id: $stateParams.rubroId});

      $scope.resultados = [];

      Comercio.find({
        filter: {
          where: {
            categoriaId: $stateParams.rubroId
          }
        }
      }, function(data) {

        $scope.resultados = data;

      });

    }

    if ($stateParams.comercioId) {

      $scope.comercio = [];

      $scope.rubro = null;

      Comercio.findById({

        id: $stateParams.comercioId

      }, function(comercio) {

        $scope.comercio = comercio;
        console.log($scope.comercio);

        $http.get('http://200.58.96.197:3000/api/Categoria/' + $scope.comercio.categoriaId)
          .success(function(cat) {
            console.log(cat);

            $scope.rubro = cat;
          })
          .error(function(err) {
            console.log(err);
          });

      }, function(err) {

        console.log(err);

      });

      $scope.rubro = undefined;

    } else {

      $scope.visitante = undefined;

      $scope.comercio = {

        nombre: "",
        categoria: "",

        direccion: "",
        metaDireccion: "",
        localidad: "",
        horarios: "",
        telefono: "",
        email: "",
        pagina: "",
        fanPage: "",

        descripcion: "",
        promocion: "",

        imagenComercio: "",
        imagenes: []

      };

    }

    $scope.rubros = [];

    function cargarCategorias() {

      Categoria.find(

        function(data) {

          $scope.rubros = data;

        }

      );

    }

    cargarCategorias();

    $scope.eliminarComercio = function(id) {

      Comercio.deleteById({id: id}, function(data) {
        console.log(success);
      });

    };

    $scope.agregarComercio = function() {

      Comercio.create({

        nombre: $scope.comercio.nombre,
        categoriaId: $scope.comercio.categoriaId,
        
        direccion: $scope.comercio.direccion,
        metaDireccion: $scope.comercio.metaDireccion,
        localidad: $scope.comercio.localidad,
        telefono: $scope.comercio.telefono,
        horarios: $scope.comercio.horarios,
        email: $scope.comercio.email,
        pagina: $scope.comercio.pagina,
        fanPage: $scope.comercio.fanPage,
        

        descripcion: $scope.comercio.descripcion,
        promocion: $scope.comercio.promocion,

        imagenComercio: $scope.file[0].name,
        imagenes: $scope.files

      }, function(comercio) {

        console.log(comercio);
        upload();

      }, function(error) {

        console.log(error);

      });

    };

   $scope.editarComercio = function(comercioId) {

     $modal.open({
       templateUrl: 'views/comercios/editar.html',
       size: 'lg',
       resolve: {

         comercio: function(Comercio) {

           return Comercio.findById({id: comercioId});

         }

       },
       controller: function($scope, $http, comercio, Categoria, $timeout) {

         $scope.comercio = comercio;

         $scope.rubros = [];

         Categoria.find(function(data) {
           $scope.rubros = data;
         });

         var upload = function() {

           var fd = new FormData();

           angular.forEach($scope.file, function(file) {
             fd.append('file', file);
           });

           angular.forEach($scope.slider, function(file) {
             fd.append('file', file);
           });

           console.log($scope.slider);

           console.log(fd);

           $http.post('/api/containers/images/upload',
             fd, {
               transformRequest: angular.identity,
               headers: {'Content-Type': undefined}
             }
           ).success(function(d){
               console.log(d);
               console.log($scope.files);
             })
             .error(function(e) {
               console.log(e);
             });
         };

        $scope.submitEdition = function() {

          if ($scope.file) {
            $http.put('/api/comercios/' + comercioId, {

              nombre: $scope.comercio.nombre,
              categoriaId: $scope.comercio.categoriaId,

              direccion: $scope.comercio.direccion,
              metaDireccion: $scope.comercio.metaDireccion,
              localidad: $scope.comercio.localidad,
              telefono: $scope.comercio.telefono,
              horarios: $scope.comercio.horarios,
              email: $scope.comercio.email,
              pagina: $scope.comercio.pagina,
              fanPage: $scope.comercio.fanPage,

              descripcion: $scope.comercio.descripcion,
              promocion: $scope.comercio.promocion,

              imagenComercio: $scope.file[0].name
            })
              .success(function(data) {
                console.log(data);
                upload();
              })
              .error(function(err) {
                console.log(err);
              });

          } else if ($scope.files) {

            $http.put('/api/comercios/' + comercioId, {

              nombre: $scope.comercio.nombre,
              categoriaId: $scope.comercio.categoriaId,

              direccion: $scope.comercio.direccion,
              metaDireccion: $scope.comercio.metaDireccion,
              localidad: $scope.comercio.localidad,
              telefono: $scope.comercio.telefono,
              horarios: $scope.comercio.horarios,
              email: $scope.comercio.email,
              pagina: $scope.comercio.pagina,
              fanPage: $scope.comercio.fanPage,

              descripcion: $scope.comercio.descripcion,
              promocion: $scope.comercio.promocion,

              imagenes: $scope.files
            })
              .success(function(data) {
                console.log(data);
                upload();
              })
              .error(function(err) {
                console.log(err);
              });

          } else {

            $http.put('/api/comercios/' + comercioId, {

              nombre: $scope.comercio.nombre,
              categoriaId: $scope.comercio.categoriaId,

              direccion: $scope.comercio.direccion,
              metaDireccion: $scope.comercio.metaDireccion,
              localidad: $scope.comercio.localidad,
              telefono: $scope.comercio.telefono,
              horarios: $scope.comercio.horarios,
              email: $scope.comercio.email,
              pagina: $scope.comercio.pagina,
              fanPage: $scope.comercio.fanPage,

              descripcion: $scope.comercio.descripcion,
              promocion: $scope.comercio.promocion
            })
              .success(function(data) {
                console.log(data);
              })
              .error(function(err) {
                console.log(err);
              });

          }

        };

         $timeout(function() {
           $('#rubros').on('input', function() {

             var x = $('#rubros').val();
             var z = $('#rubro');

             var val = $(z).find('option[value="' + x + '"]');
             var endVal = val.attr('id');

             console.log(endVal);
             console.log('sabe');
             $scope.comercio.categoriaId = endVal;

           });
         }, 3000);

       }
     });

   } ;

   $scope.enviarEmail = function() {

     Mail.sendMail({
         data: {
           nombre: $scope.visitante.nombre,
           email: $scope.visitante.email,
           text: $scope.visitante.query
         }
       },
       function(data) {
         console.log(1, data.message);
       },
       function(err) {
         console.log(2, err);
       }
     );

   };

   // upload private method
   var upload = function() {

      var fd = new FormData();

      angular.forEach($scope.file, function(file) {
        fd.append('file', file);
      });

      angular.forEach($scope.slider, function(file) {
        fd.append('file', file);
      });

     console.log($scope.slider);

     console.log(fd);

      $http.post('/api/containers/images/upload',
        fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }
      ).success(function(d){
          console.log(d);
          console.log($scope.files);
        })
        .error(function(e) {
          console.log(e);
        });
    };

  // get categoryId
  $('#rubros').on('input', function() {

    var x = $('#rubros').val();
    var z = $('#rubro');

    var val = $(z).find('option[value="' + x + '"]');
    var endVal = val.attr('id');

    console.log(endVal);
    $scope.comercio.categoriaId = endVal;

  });


  // tinyMCE options
  $scope.tinyMCEOptions = {
    onChange: function(e) {

    },
    inline: false,
    plugins : 'advlist autolink link image lists charmap print preview',
    skin: 'lightgray',
    theme : 'modern'
  };

})

.controller('ClasificadoController', function($scope, $stateParams, $http, Clasificado, Rubro, $modal) {

    if ($stateParams.rubro == "compraVenta") {

      $scope.area = "Compra/Venta";

      Clasificado.find({
        filter: {
          where: {
            compraVenta: true
          }
        }
      }, function(data) {
          $scope.clasificados = data;
      });

      Rubro.find(function(data) {
        $scope.rubros = data;
      });

    } else {

      $scope.area = "Oferta laboral";

      Clasificado.find({
        filter: {
          where: {
            compraVenta: false
          }
        }
      }, function(data) {
        $scope.clasificados = data;
        console.log(data);
      });

      Rubro.find(function(data) {
        $scope.rubros = data;
      });


    }

    $scope.clasificado = {};

    $scope.clasificado.compraVenta = false;

    $scope.agregarClasificado = function() {

      Clasificado.create({
        titulo: $scope.clasificado.titulo,
        descripcion: $scope.clasificado.descripcion,
        rubroId: $scope.clasificado.rubroId,
        compraVenta: $scope.clasificado.compraVenta,
        imagenes: $scope.files

      }, function(success) {
        console.log(success);
        upload();
      }, function(err) {
        console.log(err);
      });

    };

    $('#rubros').on('input', function() {

      var x = $('#rubros').val();
      var z = $('#rubro');

      var val = $(z).find('option[value="' + x + '"]');
      var endVal = val.attr('id');

      console.log(endVal);
      $scope.clasificado.rubroId = endVal;

    });

    var upload = function() {

      var fd = new FormData();

      angular.forEach($scope.slider, function(file) {
        fd.append('file', file);
      });

      $http.post('/api/containers/images/upload',
        fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }
      ).success(function(d){
          console.log(d);
          console.log($scope.files);
        })
        .error(function(e) {
          console.log(e);
        });
    };

    $scope.mostrarFotos = function(id) {

      $modal.open({
        templateUrl: 'views/clasificados/detalle.html',
        controller: function($scope, Clasificado) {

          $scope.clasificado = Clasificado.findById({id: id});

        }

      });

    }

  })
  .controller('RubroController', function($scope, $modal, $stateParams, Clasificado, Rubro) {

    console.log($stateParams);

    $scope.area = "Compra/Venta";

    Rubro.find(function(data) {
      $scope.rubros = data;
    });

    if ($stateParams.categoria) {

      Clasificado.find({
        filter: {
          where: {
            rubroId: $stateParams.categoria
          }
        }
      }, function(data) {
        $scope.clasificados = data;
      });

      Rubro.findById({id: $stateParams.categoria}, function(data) {
        $scope.rubro = data;
      });

    }

    $scope.mostrarFotos = function(id) {

      $modal.open({
        templateUrl: 'views/clasificados/detalle.html',
        controller: function($scope, Clasificado) {

          $scope.clasificado = Clasificado.findById({id: id});

        }

      });

    }

  });


