/*
  -----------------------------------

  控制首页的JS
  主要是3D 和 进度条两部分

  -----------------------------------
*/

	// 控制条
  var rgMax = 0;  // JSON中的最大时间戳
  var rgMin = 0;  // JSON中的最小时间戳 
  var rgTime = 0; // 从json中获取时间戳，计算时间轴的长度  > 多少秒
  var range = document.querySelector('.range-slider');
  var rgTrack = document.querySelector('.range-bar-active'); // 走过的轨迹
  var disX = 0; // 鼠标距离进度条最左端的距离
  var times = []; // 获取json中所有的时间戳
  var jsonData; // 获取的JSON信息
  var sysTime = 0;  // 系统时间
  var signal = false; // 是否重置当前的时间
  var currentWidth = 0; // 鼠标点击滚动条后的进度条的宽度
  var pastTime = 0;  // 已经走过的时间

  ///////////////////////////////////////////////////////////////////////
  var scene, renderer, render, light, camera, meshHelper;
  var models_arr = []; //定义储存全局模型变量对象
  var models;
  var tk1;
  //创建性能监视器
  function initstats() {
    stats = new Stats();

    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.getElementById("Stats-output").appendChild(stats.domElement);
  }

  function initScene() {
    scene = new THREE.Scene();
  }

  function initSkybox() {
    //创建天空盒
    //var path = '{{ url_for("static", filename="threelib/Bridge2/") }}'; //设置路径
    var path = "../threelib/Bridge2/"; //设置路径
    var directions = ["posx", "negx", "posy", "negy", "posz", "negz"]; //获取对象
    var format = ".jpg"; //格式
    //创建盒子，并设置盒子的大小为( 500, 500, 500 )
    var skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
    //设置盒子材质
    var materialArray = [];
    for (var i = 0; i < 6; i++)
      materialArray.push(new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(path + directions[i] + format), //将图片纹理贴上
        side: THREE.BackSide /*镜像翻转，如果设置镜像翻转，那么只会看到黑漆漆的一片，因为你身处在盒子的内部，所以一定要设置镜像翻转。*/
      }));
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial); //创建一个完整的天空盒，填入几何模型和材质的参数
    scene.add(skyBox); //在场景中加入天空盒
  }

  // TODO: 初始化模型函数
  function initModel(model_file, model_obj, posx, posy, posz, scalea, scaleb, scalec) {
    var mtlLoader = new THREE.MTLLoader();

    //mtlLoader.setPath('{{ url_for("static", filename="threelib/models/") }}');
    mtlLoader.setPath("../threelib/models/");
    //加载mtl文件
    mtlLoader.load(model_file+'.mtl', function (material) {
        var objLoader = new THREE.OBJLoader();
        //设置当前加载的纹理
        objLoader.setMaterials(material);
        //objLoader.setPath('{{ url_for("static", filename="threelib/models/") }}');

        mtlLoader.setPath("../threelib/models/");
        objLoader.load(model_file+'.obj', function (object) {
            models = object;
            object.position.x = posx;
            console.log(posx);
            console.log(object.position.x)
            object.position.y = posy;
            object.position.z = posz;
            object.scale.set(scalea, scaleb, scalec);
            scene.add(object);
            models_arr.push(object);
            setupTween();
        });
    });
    return models;
}

  function initLight() {
    //新建光源
    light = new THREE.PointLight(0xffffff);
    light.position.set(300, 400, 200);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff));
  }

  function initTools() {
    //新建坐标系
    var ax = new THREE.AxesHelper(100000);
    scene.add(ax);
  }

  // TODO: 控制模型运动
  function setupTween() {
    tk1 = models_arr[0];
    easing = TWEEN.Easing.Elastic.InOut;
    ground = models_arr[2];
		ground.rotation.x = -0.5*Math.PI;
		ground.scale.x = 10;
		ground.scale.y = 10;
		ground.scale.z = 10;
    //定义初始坐标
    current = {
      posx: 0,
      posy: 0,
      posz: 0
    };
    var update = function () {
      tk1.position.x = current.posx;
      tk1.position.y = current.posy;
      tk1.position.z = current.posz;
    }
    TWEEN.removeAll();

    //定义路径节点坐标
    sept1 = {
      posx: 1000,
      posy: 0,
      posz: 0
    };
    sept2 = {
      posx: 1000,
      posy: 0,
      posz: 1000
    };
    var tweenHead = new TWEEN.Tween(current)
      .to(sept1, 5000)
      .delay(100)
      .easing(easing)
      .onUpdate(update);
    var tween1 = new TWEEN.Tween(current)
      .to(sept2, 5000)
      .easing(easing)
      .onUpdate(update);

    var tweenBack = new TWEEN.Tween(current)
      .to({
        posx: 0,
        posy: 0,
        posz: 0
      }, 5000)
      .easing(easing)
      .onUpdate(update);

    tweenHead.chain(tween1);
    tween1.chain(tweenBack);
    tweenBack.chain(tweenHead);
    tweenHead.start();
  }


  function initCamera() {
    camera = new THREE.PerspectiveCamera(40, 800 / 600, 1, 6000);
    camera.position.set(500, 500, 500)
    camera.lookAt(scene.position)
    //新建渲染器
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("WebGl-output").appendChild(renderer.domElement);
  }

  function control() {
    //添加轨道控制器
    //新建一个轨道控制器
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.target = new THREE.Vector3(0, 0, 0); //控制焦点
    orbitControls.autoRotate = false; //将自动旋转关闭
    clock = new THREE.Clock(); //用于更新轨道控制器

    //创建gui控制栏
    var controls = new function () {
      this.tankpostationx = 0.00;
      this.tankpostationy = 0.00;
      this.tankpostationz = 0.00;
    };

    var gui = new dat.GUI();
    gui.add(controls, 'tankpostationx', -5, 5);
    gui.add(controls, 'tankpostationy', -5, 5);
    gui.add(controls, 'tankpostationz', -5, 5);
  }
  //  渲染3D界面
  function render() {
    requestAnimationFrame(render);
    TWEEN.update();
    stats.update();

    /*if (jsonData[sysTime]) { //如果这个时间点有数据，就更新小车位置参数
      tank_axisx = jsonData[sysTime].x;
      tank_axisy = jsonData[sysTime].y;
      tank_axisz = jsonData[sysTime].z;
    }
    console.log(sysTime);
    if (tank1.position.x > tank_axisx) {
      tank1.position.x -= 10;
    }
    if (tank1.position.x < tank_axisx) {
      tank1.position.x += 10;
    }
    if (tank1.position.y > tank_axisy) {
      tank1.position.y -= 10;
    }
    if (tank1.position.y < tank_axisy) {
      tank1.position.y += 10;
    }
    if (tank1.position.z > tank_axisz) {
      tank1.position.z -= 10;
    }
    if (tank1.position.z < tank_axisz) {
      tank1.position.z += 10;
    }*/

    renderer.render(scene, camera);

  }
  //定义json数据
  var models_json_test = '{"models" : [' +
    '{"model_file" : "k4" , "model_obj" : "tk1" , "posx" : "0" , "posy" : "0" , "posz" : "0" , "scalea" : "20" , "scaleb" : "20" , "scalec" : "20"},' +
    '{"model_file" : "terrain" , "model_obj" : "tk8" , "posx" : "0" , "posy" : "0" , "posz" : "-100" , "scalea" : "1" , "scaleb" : "1" , "scalec" : "1"},' +
    '{"model_file" : "k4" , "model_obj" : "tk9" , "posx" : "100" , "posy" : "0" , "posz" : "0" , "scalea" : "20" , "scaleb" : "20" , "scalec" : "20"},' +
    '{"model_file" : "tk2" , "model_obj" : "tk10" , "posx" : "0" , "posy" : "0" , "posz" : "0" , "scalea" : "20" , "scaleb" : "20" , "scalec" : "20"}]}'
  var models_json = JSON.parse(models_json_test);

  /**
   * [ 从.json文件中获取模型的坐标信息 ]
   * @ Author: 马瑞华 [ time: 2018-08-10 ]
   * @ Revision: name  [ desc ]
   * 
   * @ ascSort:    { func }  { 用sort()对数组进行升序排序 }
   * @ return:   { type }  { desc }
   */

  // 数组升序排序
  function ascSort(a, b) {
    return a - b;
  }

  //  获取数据，将str转化为 JS对象
  $.get("../static/threelib/models/position.json", function (data, status) {
    jsonData = JSON.parse(data);
    for (var i in jsonData) {
      times.push(i);
    }
    times.sort(ascSort);
    rgMax = times[times.length - 1];
    rgMin = times[0];
    sysTime = times[0] * 1;
    rgTime = Math.floor((rgMax - rgMin) / 1000);

    //  每1秒，控制条增加
    timer = setInterval(ctrlTrack, 1000);
  })

  /**
   * func: ctrlTrack
   * @ desc:  通过进度条的轨迹占总进度条的百分比，计算对应的时间戳
   * @ Author:   马瑞华 [ time: 2018-08-10 ]
   * @ Revision: name [ time: XX-XX-XX ] [ desc ]
   * 
   * @ param:    { type }  { desc }
   * @ return:   { type }  { desc }
   */
  function ctrlTrack() {
    // DONE: 实时刷新鼠标点击事件后的模型坐标
    pastTime = Math.floor((sysTime - rgMin) / 1000);
    currentWidth = pastTime / rgTime * 100;
    sysTime += 1000;
    if (sysTime - 1000 === parseInt(rgMax)) {
      rgTrack.style.right = 0 + '%';
      sysTime = parseInt(rgMax);
    }

    if (signal) {
      currentWidth = trackWidth / range.offsetWidth * 100;
      if (currentWidth >= 100) {
        currentWidth = 100;
      }
      if (currentWidth <= 0) {
        currentWidth = 0;
      }
      sysTime = rgMin * 1 + Math.floor(rgTime * (currentWidth / 100)) * 1000;
      signal = false;
    }
    rgTrack.style.right = 100 - currentWidth + '%';
  }

  /**
   * [ 进度条--功能实现 ]
   * @ Author: 马瑞华 [ time: 2018-08-10 ]
   * @ Revision: 马瑞华 [ time: 2018-08-10 ]  [ desc ]
   * @ Version: 1.0
   * 
   * @ func:  { mosDown }  { 鼠标点击事件 }
   * @ func:  { mosMove }  { 鼠标移动事件 }
   * @ func:  { mosUp }  { 鼠标抬起，清空点击和移动的事件 }
   * @ func:  { stopBubble }  { 阻止事件冒泡 }
   */
  range.addEventListener('mousedown', mosDown);

  function mosDown(ev) {
    var ev = ev || window.event;
    disX = ev.clientX - range.offsetLeft;
    document.onmousemove = mosMove;
    document.onmouseup = mosUp;
    rgTrack.style.transition = '0s';
    clearInterval(timer);
    stopBubble();
  }

  function mosMove(ev) {
    //var ev = ev || window.event;
    trackWidth = ev.clientX - range.offsetLeft + 400;
    currentWidth = trackWidth / range.offsetWidth * 100;
    if (currentWidth <= 0) {
      currentWidth = 0;
    } else if (currentWidth >= 100) {
      currentWidth = 100;
    }
    rgTrack.style.right = (100 - currentWidth) + '%'; // > **%
    if (trackWidth > range.offsetWidth) {
      rgTrack.style.right = 0 + '%';
    }

    sysTime = rgMin * 1 + Math.floor(rgTime * (currentWidth / 100)) * 1000;
  }

  function mosUp() {
    document.onmousemove = null;
    document.onmouseup = null;
    rgTrack.style.transition = '1s linear';
    signal = true;
    timer = setInterval(ctrlTrack, 1000);
  }

  function stopBubble(ev) {
    // 阻止事件冒泡
    var oEvent = ev || event;
    if (window.event) {
      oEvent.cancelBubble = true;
    } else {
      oEvent.stopPropagation();
    }
  }

  /**
   * func: init()
   * @ desc: 3D界面初始化
   * @ Author: 汤睿 [ time: 2018-08-10 ]
   * @ Revision: 马瑞华 [ time: 2018-08-13]  [ 增加了用tween.js驱动模型的函数 setupTween() ]
   * 
   * @ return:   none
   */

  // TODO:
  function init() {
    initScene();
    initCamera();
    initLight();
    initSkybox();
    initstats();
    initTools();
    //循环加载模型
    for (var i = 0; i < models_json.models.length; i++) {
      var model_file = models_json.models[i].model_file;
      var model_obj = models_json.models[i].model_obj,
        posx = models_json.models[i].posx,
        posy = models_json.models[i].posy,
        posz = models_json.models[i].posz,
        scalea = models_json.models[i].scalea,
        scaleb = models_json.models[i].scaleb,
        scalec = models_json.models[i].scalec;
      initModel(model_file, model_obj, posx, posy, posz, scalea, scaleb, scalec);
    }

    //initfbxmodels();
    // setupTween();
    control();
    render();
  }

  init();